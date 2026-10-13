const sources=[{id:'CISA',label:'KNOWN EXPLOITED VULNERABILITIES',desc:'Confirmed exploitation in the wild. Real-world threats. Actionable intelligence.',color:'#ff3049',glyph:'◎',url:'https://www.cisa.gov/known-exploited-vulnerabilities-catalog'},{id:'NVD',label:'NATIONAL VULNERABILITY DATABASE',desc:'CVE records, severity analysis, product references and research.',color:'#65d5f8',glyph:'◇',url:'https://nvd.nist.gov/'},{id:'GITHUB',label:'ADVISORY DATABASE',desc:'Dependency intelligence. Package ecosystem vulnerabilities.',color:'#b18aff',glyph:'⌘',url:'https://github.com/advisories'},{id:'SANS',label:'INTERNET STORM CENTER',desc:'Community research, emerging campaigns, defender observations.',color:'#e7e6e4',glyph:'◈',url:'https://isc.sans.edu/'}];
let selected=0,kevItems=[],lastUpdated='',kevLoaded=false;const $=id=>document.getElementById(id);const carousel=$('carousel');
sources.forEach((s,i)=>{const b=document.createElement('button');b.className='panel';b.style.setProperty('--accent',s.color);b.dataset.glyph=s.glyph;b.innerHTML=`<small>INTELLIGENCE CHANNEL 0${i+1}</small><h3>${s.id}</h3><p>${s.label}</p><small>CLICK TO ENTER ↗</small>`;b.addEventListener('click',()=>{if(selected===i)open(i);else{selected=i;renderCarousel()}});carousel.appendChild(b)});
function renderCarousel(){[...carousel.children].forEach((p,i)=>{let d=(i-selected+4)%4;if(d===3)d=-1;const a=Math.abs(d);p.style.transform=`translateX(${d*245}px) translateZ(${-a*175}px) rotateY(${-d*25}deg) scale(${1-a*.09})`;p.style.opacity=a===2?'.36':'1';p.style.zIndex=String(10-a);p.style.filter=a===0?'none':'brightness(.58)';p.classList.toggle('selected',a===0)});$('indicator').textContent=`0${selected+1} / 04`}
$('prev').onclick=()=>{selected=(selected+3)%4;renderCarousel()};$('next').onclick=()=>{selected=(selected+1)%4;renderCarousel()};document.addEventListener('keydown',e=>{if(!$('orbitView').classList.contains('hidden')){if(e.key==='ArrowLeft')$('prev').click();if(e.key==='ArrowRight')$('next').click();if(e.key==='Enter')open(selected)}else if(e.key==='Escape')$('back').click()});
function open(i){selected=i;const s=sources[i];$('orbitView').classList.add('hidden');$('detailView').classList.remove('hidden');$('channelCode').textContent=`CHANNEL // 0${i+1}`;$('detailEyebrow').textContent=`INTELLIGENCE SOURCE 0${i+1} // AUTHORIZED ACCESS`;$('detailTitle').textContent=s.id;$('detailTitle').style.color=s.color;$('detailDesc').textContent=s.desc;$('search').value='';renderData();}
$('back').onclick=()=>{$('detailView').classList.add('hidden');$('orbitView').classList.remove('hidden');renderCarousel()};$('sourceLink').onclick=()=>window.radar.openLink(sources[selected].url);$('refresh').onclick=()=>refresh();$('search').addEventListener('input',renderData);
async function refresh(){if(selected!==0){$('placeholder').textContent='THIS SOURCE ADAPTER IS SCHEDULED FOR A LATER RING. OPEN ORIGINAL SOURCE FOR NOW.';return}const btn=$('refresh');btn.disabled=true;btn.textContent='RETRIEVING...';$('status').textContent='COLLECTING KEV INTEL';try{const result=await window.radar.fetchKev();if(!result.ok)throw new Error(result.error);kevItems=result.items;kevLoaded=true;lastUpdated=new Date().toLocaleString();$('status').textContent='CISA KEV ONLINE';renderData()}catch(err){$('status').textContent='SOURCE ERROR';$('placeholder').textContent=`FEED ERROR: ${err.message}`;$('placeholder').style.display='block'}finally{btn.disabled=false;btn.textContent='↻ REFRESH INTEL'}}
function renderData(){const tbody=$('rows');tbody.replaceChildren();if(selected!==0){$('recordCount').textContent='SOURCE ADAPTER NOT YET CONNECTED';$('updated').textContent='VISIT ORIGINAL SOURCE';$('placeholder').textContent='INTELLIGENCE TERMINAL READY. LIVE FEED ADAPTER COMING IN A FUTURE RING.';$('placeholder').style.display='block';return}const q=$('search').value.toLowerCase();const items=kevItems.filter(x=>[x.id,x.vendor,x.product,x.name,x.notes].some(v=>v.toLowerCase().includes(q))).slice(0,150);$('recordCount').textContent=kevLoaded?`${items.length} SHOWN // ${kevItems.length} CACHED (LATEST 500)`:'NO FEED DATA YET';$('updated').textContent=lastUpdated?`LAST FETCH ${lastUpdated}`:'AWAITING REFRESH';$('placeholder').textContent=kevLoaded?'NO MATCHING RECORDS':'SELECT REFRESH TO RETRIEVE LIVE CISA KEV INTELLIGENCE';$('placeholder').style.display=items.length?'none':'block';for(const item of items){const tr=document.createElement('tr');for(const value of [item.id,`${item.vendor} / ${item.product}`,item.name,item.date]){const td=document.createElement('td');td.textContent=value;tr.appendChild(td)}const td=document.createElement('td');const btn=document.createElement('button');btn.className='detail-toggle';btn.textContent='INSPECT +';btn.onclick=()=>{const extra=td.querySelector('.extra');if(extra){extra.remove();btn.textContent='INSPECT +'}else{const div=document.createElement('div');div.className='extra';div.textContent=`${item.notes} | Required action: ${item.action} | Due: ${item.due}`;td.appendChild(div);btn.textContent='CLOSE −'}};td.appendChild(btn);tr.appendChild(td);tbody.appendChild(tr)}}
function tick(){$('clock').textContent=new Date().toLocaleTimeString('en-US',{hour12:false})}tick();setInterval(tick,1000);renderCarousel();


// BLACKSITE DIRECTORY CONTROLLER // RING 4.2B
(() => {
    'use strict';

    const el = id => document.getElementById(id);
    const state = {
        resources: [],
        category: 'ALL',
        favoritesOnly: false,
        favorites: new Set(),
        view: 'orbit'
    };

    const favoriteKey = 'blacksite-directory-favorites-v1';

    try {
        const saved = JSON.parse(localStorage.getItem(favoriteKey) || '[]');
        if (Array.isArray(saved)) {
            state.favorites = new Set(
                saved.filter(id => typeof id === 'string')
            );
        }
    } catch {
        state.favorites = new Set();
    }

    function showView(view) {
        state.view = view;
        const network = view === 'network';

        el('networkView').classList.toggle('hidden', !network);
        el('orbitView').classList.toggle('hidden', network);
        el('detailView').classList.add('hidden');

        el('bsOrbitTab').classList.toggle('bs-active', !network);
        el('bsNetworkTab').classList.toggle('bs-active', network);

        if (network) {
            renderDirectory();
        } else {
            renderCarousel();
        }
    }

    el('bsOrbitTab').addEventListener('click', () => showView('orbit'));
    el('bsNetworkTab').addEventListener('click', () => showView('network'));

    // Intercept Escape only while the directory is visible.
    document.addEventListener('keydown', event => {
        if (state.view === 'network' && event.key === 'Escape') {
            event.stopImmediatePropagation();
            if (document.activeElement === el('bsSearch')) {
                el('bsSearch').blur();
            } else {
                showView('orbit');
            }
        }
    }, true);

    function renderCategories() {
        const host = el('bsCategories');
        host.replaceChildren();

        const categories = [
            'ALL',
            ...new Set(state.resources.map(r => r.category))
        ];

        for (const category of categories) {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'bs-category';
            button.textContent = category;

            button.classList.toggle(
                'bs-selected',
                category === state.category
            );

            button.addEventListener('click', () => {
                state.category = category;
                renderCategories();
                renderDirectory();
            });

            host.appendChild(button);
        }
    }

    function saveFavorites() {
        try {
            localStorage.setItem(
                favoriteKey,
                JSON.stringify([...state.favorites])
            );
            return true;
        } catch {
            return false;
        }
    }

    function makeCard(resource) {
        const card = document.createElement('article');
        card.className = 'bs-card';

        const top = document.createElement('div');
        top.className = 'bs-card-top';

        const category = document.createElement('span');
        category.className = 'bs-card-category';
        category.textContent = resource.category;

        const star = document.createElement('button');
        star.type = 'button';
        star.className = 'bs-star';
        star.setAttribute('aria-label', 'Toggle favorite');

        function updateStar() {
            const active = state.favorites.has(resource.id);
            star.textContent = active ? '★' : '☆';
            star.classList.toggle('bs-starred', active);
            star.setAttribute('aria-pressed', String(active));
        }

        updateStar();

        star.addEventListener('click', () => {
            if (state.favorites.has(resource.id)) {
                state.favorites.delete(resource.id);
            } else {
                state.favorites.add(resource.id);
            }

            if (!saveFavorites()) {
                el('bsResultCount').textContent =
                    'WARNING: FAVORITES COULD NOT BE SAVED';
            }

            renderDirectory();
        });

        top.append(category, star);

        const title = document.createElement('h3');
        title.textContent = resource.name;

        const description = document.createElement('p');
        description.textContent = resource.description;

        const open = document.createElement('button');
        open.type = 'button';
        open.className = 'bs-open';
        open.textContent = resource.enabled
            ? 'OPEN RESOURCE ↗'
            : 'RESOURCE DISABLED';

        open.disabled = !resource.enabled;

        open.addEventListener('click', async () => {
            open.disabled = true;
            open.textContent = 'OPENING...';

            try {
                const success = await window.radar.openLink(resource.url);
                open.textContent = success
                    ? 'OPENED IN BROWSER ✓'
                    : 'LAUNCH BLOCKED';
            } catch {
                open.textContent = 'LAUNCH FAILED';
            } finally {
                setTimeout(() => {
                    open.disabled = !resource.enabled;
                    open.textContent = resource.enabled
                        ? 'OPEN RESOURCE ↗'
                        : 'RESOURCE DISABLED';
                }, 1800);
            }
        });

        card.append(top, title, description, open);
        return card;
    }

    function renderDirectory() {
        const query = el('bsSearch').value.trim().toLowerCase();

        const filtered = state.resources.filter(resource => {
            if (state.category !== 'ALL' &&
                resource.category !== state.category) return false;

            if (state.favoritesOnly &&
                !state.favorites.has(resource.id)) return false;

            if (!query) return true;

            return [
                resource.id,
                resource.name,
                resource.category,
                resource.description
            ].some(value => String(value).toLowerCase().includes(query));
        });

        const grid = el('bsGrid');
        grid.replaceChildren();

        const fragment = document.createDocumentFragment();

        for (const resource of filtered) {
            fragment.appendChild(makeCard(resource));
        }

        grid.appendChild(fragment);

        el('bsResultCount').textContent =
            `${filtered.length} MATCHES // ${state.resources.length} TOTAL`;

        el('bsEmpty').classList.toggle('hidden', filtered.length !== 0);
        el('bsTotal').textContent = state.resources.length;
    }

    el('bsSearch').addEventListener('input', renderDirectory);

    el('bsFavorites').addEventListener('change', event => {
        state.favoritesOnly = event.target.checked;
        renderDirectory();
    });

    async function initializeDirectory() {
        try {
            const result = await window.radar.listResources();

            if (!result.ok || !Array.isArray(result.resources)) {
                throw new Error(result.error || 'Registry unavailable');
            }

            state.resources = result.resources;
            renderCategories();
            renderDirectory();

            el('bsNetworkTab').querySelector('span').textContent =
                state.resources.length;

        } catch (error) {
            el('bsResultCount').textContent =
                'DIRECTORY ERROR: ' + error.message;
            el('bsEmpty').textContent = 'REGISTRY COULD NOT BE LOADED';
            el('bsEmpty').classList.remove('hidden');
        }
    }

    initializeDirectory();
})();

// BLACKSITE FIRST-RUN ONBOARDING // RING 5.5D
(() => {
    'use strict';

    const key = 'blacksite-onboarding-complete-v1';
    const overlay = document.getElementById('bsWelcome');
    const enter = document.getElementById('bsEnterBlacksite');

    if (!overlay || !enter) return;

    let completed = false;

    try {
        completed = localStorage.getItem(key) === 'true';
    } catch {
        // Storage may be unavailable; welcome can still be dismissed.
    }

    function openWelcome() {
        overlay.hidden = false;
        enter.focus();
    }

    function closeWelcome() {
        overlay.hidden = true;
        try {
            localStorage.setItem(key, 'true');
        } catch {
            // Non-persistent fallback.
        }
    }

    enter.addEventListener('click', closeWelcome);

    // Prevent matrix keyboard shortcuts while the modal is active.
    document.addEventListener('keydown', event => {
        if (overlay.hidden) return;

        if (event.key === 'Tab') {
            event.preventDefault();
            enter.focus();
            return;
        }

        if (event.key === 'Enter' && document.activeElement === enter) {
            event.stopImmediatePropagation();
            event.preventDefault();
            closeWelcome();
            return;
        }

        if (['ArrowLeft', 'ArrowRight', 'Escape'].includes(event.key)) {
            event.stopImmediatePropagation();
            event.preventDefault();
        }
    }, true);

    // Available for a future Help/About button.
    window.addEventListener('blacksite:show-welcome', openWelcome);

    if (!completed) openWelcome();
})();