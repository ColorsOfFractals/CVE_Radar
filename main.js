const {app,BrowserWindow,ipcMain,shell}=require('electron');
const path=require('node:path');
const KEV='https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json';
let win;
function create(){win=new BrowserWindow({
    icon: path.join(__dirname, 'assets', 'CVE_Radar.ico'),width:1440,height:900,minWidth:980,minHeight:640,backgroundColor:'#050508',title:'CVE RADAR // BLACKSITE',autoHideMenuBar:true,frame:false,webPreferences:{preload:path.join(__dirname,'preload.js'),contextIsolation:true,nodeIntegration:false,sandbox:true,webSecurity:true}});win.loadFile(path.join(__dirname,'src','index.html'));win.webContents.setWindowOpenHandler(()=>({action:'deny'}));win.webContents.on('will-navigate',(event)=>event.preventDefault());}
app.whenReady().then(()=>{create();app.on('activate',()=>{if(BrowserWindow.getAllWindows().length===0)create()})});app.on('window-all-closed',()=>{if(process.platform!=='darwin')app.quit()});
ipcMain.handle('kev:fetch',async()=>{const ctrl=new AbortController();const timeout=setTimeout(()=>ctrl.abort(),12000);try{const response=await fetch(KEV,{signal:ctrl.signal,headers:{'Accept':'application/json'}});if(!response.ok)throw new Error('HTTP '+response.status);const data=await response.json();if(!Array.isArray(data.vulnerabilities))throw new Error('Invalid KEV response');return {ok:true,updated:data.dateReleased||null,items:data.vulnerabilities.slice(-500).reverse().map(v=>({id:String(v.cveID||''),vendor:String(v.vendorProject||''),product:String(v.product||''),name:String(v.vulnerabilityName||''),date:String(v.dateAdded||''),action:String(v.requiredAction||''),due:String(v.dueDate||''),notes:String(v.shortDescription||'')}))}}catch(err){return {ok:false,error:String(err.message||err)}}finally{clearTimeout(timeout)}});
const fs = require('node:fs');
const registryPath = path.join(__dirname, 'src', 'data', 'intelligence-registry.json');

const legacyLinks = new Set([
  'https://www.cisa.gov/known-exploited-vulnerabilities-catalog',
  'https://nvd.nist.gov/',
  'https://github.com/advisories',
  'https://isc.sans.edu/'
]);

function loadDirectory() {
  const data = JSON.parse(fs.readFileSync(registryPath, 'utf8'));

  if (!data || data.schemaVersion !== 1 || !Array.isArray(data.resources)) {
    throw new Error('Invalid intelligence registry');
  }

  const ids = new Set();
  const resources = [];

  for (const item of data.resources) {
    if (!item || typeof item.id !== 'string' ||
        !/^[a-z0-9-]+$/.test(item.id) || ids.has(item.id)) {
      throw new Error('Invalid or duplicate resource ID');
    }

    ids.add(item.id);

    if (item.mode !== 'external-https' ||
        typeof item.url !== 'string' ||
        typeof item.name !== 'string' ||
        typeof item.category !== 'string' ||
        typeof item.description !== 'string' ||
        typeof item.enabled !== 'boolean') {
      throw new Error('Invalid directory resource');
    }

    const parsed = new URL(item.url);

    if (parsed.protocol !== 'https:' ||
        !parsed.hostname || parsed.username || parsed.password) {
      throw new Error('Unsafe directory URL');
    }

    resources.push({
      id: item.id,
      name: item.name,
      category: item.category,
      description: item.description,
      url: item.url,
      mode: item.mode,
      enabled: item.enabled,
      favorite: item.favorite === true
    });
  }

  return resources;
}

ipcMain.handle('directory:list', async (event) => {
  if (event.sender !== win?.webContents) return {ok:false, error:'Unauthorized sender'};

  try {
    return {ok:true, resources:loadDirectory()};
  } catch (error) {
    return {ok:false, error:String(error.message || error)};
  }
});

ipcMain.handle('link:open', async (event, url) => {
  if (event.sender !== win?.webContents || typeof url !== 'string') return false;

  try {
    const parsed = new URL(url);

    if (parsed.protocol !== 'https:' ||
        !parsed.hostname || parsed.username || parsed.password) return false;

    const allowed = legacyLinks.has(url) ||
      loadDirectory().some(item => item.enabled && item.url === url);

    if (!allowed) return false;

    await shell.openExternal(url);
    return true;
  } catch {
    return false;
  }
});

if (process.platform === 'win32') {
  app.setAppUserModelId('com.colorsoffractals.cveradar');
}

/* RING 12 | Window controls */
const radarWindow = event => {
  const target = BrowserWindow.fromWebContents(event.sender);
  return target && target === win && !target.isDestroyed() ? target : null;
};

ipcMain.handle('window:minimize', event => {
  const target = radarWindow(event);
  if (target) target.minimize();
});

ipcMain.handle('window:toggle-maximize', event => {
  const target = radarWindow(event);
  if (target) {
    if (target.isMaximized()) target.unmaximize();
    else target.maximize();
  }
});

ipcMain.handle('window:close', event => {
  const target = radarWindow(event);
  if (target) target.close();
});

ipcMain.handle('window:is-maximized', event => {
  const target = radarWindow(event);
  return target ? target.isMaximized() : false;
});