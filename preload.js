const {contextBridge,ipcRenderer}=require('electron');
contextBridge.exposeInMainWorld('radar',{
  fetchKev:()=>ipcRenderer.invoke('kev:fetch'),
  openLink:(url)=>ipcRenderer.invoke('link:open',url),
  listResources:()=>ipcRenderer.invoke('directory:list'),
  windowControls:Object.freeze({
    minimize:()=>ipcRenderer.invoke('window:minimize'),
    toggleMaximize:()=>ipcRenderer.invoke('window:toggle-maximize'),
    close:()=>ipcRenderer.invoke('window:close'),
    isMaximized:()=>ipcRenderer.invoke('window:is-maximized')
  })
});
