// ===== APP.JS =====
let editingRoom = null;
let deferredInstallPrompt = null;
const COLLAB_COLORS = [
  {bg:'#f2e4e8',border:'#d4a0b0',text:'#7d4f57',av:'#b5838d'},
  {bg:'#d4eaf5',border:'#8ab8d4',text:'#2d5f80',av:'#7bafd4'},
  {bg:'#d4e8d6',border:'#8ab89a',text:'#3d6641',av:'#7a9e7e'},
  {bg:'#f5e8d4',border:'#d4b08a',text:'#7a5530',av:'#d4a96a'},
  {bg:'#ede8f5',border:'#b0a0d4',text:'#4a3d7a',av:'#9b8dcc'},
  {bg:'#f5e8e8',border:'#d4a0a0',text:'#7a3d3d',av:'#cc8d8d'},
  {bg:'#e8f5e8',border:'#a0d4a0',text:'#3d7a3d',av:'#8dcc8d'},
  {bg:'#f5f0e8',border:'#d4c4a0',text:'#7a6a3d',av:'#ccbb8d'},
];
function collabColor(id) {
  const i = state.collabs.findIndex(c => c.id == id);
  return i >= 0 ? COLLAB_COLORS[i % COLLAB_COLORS.length] : null;
}
function initials(n) { return (n||'?').split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase(); }

window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault(); deferredInstallPrompt = e;
  const b = document.getElementById('pwa-btn'); if(b) b.style.display='block';
});
function triggerInstall() { if(deferredInstallPrompt){ deferredInstallPrompt.prompt(); deferredInstallPrompt=null; } }

// ===== LOGIN =====
function doLogin() {
  const val = document.getElementById('login-input').value;
  if (val === state.code) {
    document.getElementById('login-err').style.display = 'none';
    document.getElementById('screen-login').classList.remove('active');
    document.getElementById('screen-main').classList.add('active');
    updateTopbarGov(); renderAll();
  } else {
    document.getElementById('login-err').style.display = 'block';
  }
}
function doLogout() {
  document.getElementById('screen-main').classList.remove('active');
  document.getElementById('screen-login').classList.add('active');
  document.getElementById('login-input').value = '';
}
document.getElementById('login-input').addEventListener('keydown', e => { if(e.key==='Enter') doLogin(); });

function openSetupCode() {
  document.getElementById('setup-in').value = '';
  document.getElementById('setup-in2').value = '';
  document.getElementById('setup-err').style.display = 'none';
  openModal('modal-setup');
}
function saveSetupCode() {
  const a = document.getElementById('setup-in').value.trim();
  const b = document.getElementById('setup-in2').value.trim();
  const err = document.getElementById('setup-err');
  if (!a) { err.textContent='Ingresa un código.'; err.style.display='block'; return; }
  if (a!==b) { err.textContent='Los códigos no coinciden.'; err.style.display='block'; return; }
  state.code = a; saveState(); closeModal('modal-setup');
  alert('Código configurado correctamente.');
}

function updateTopbarGov() {
  const s = getTodaySchedule();
  const el = document.getElementById('topbar-gov');
  el.textContent = s.gouvernante ? 'Gouvernante: ' + s.gouvernante : '';
}

// ===== TABS =====
function showTab(tab) {
  ['vista','lista','distribucion','horario','colaboradores','config'].forEach(t => {
    document.getElementById('tab-'+t).style.display = t===tab ? 'block' : 'none';
    document.getElementById('tab-btn-'+t).classList.toggle('active', t===tab);
  });
  if (tab==='lista')          renderList();
  if (tab==='colaboradores')  renderCollabTab();
  if (tab==='distribucion')   renderDist();
  if (tab==='horario')        renderHorario();
}

function renderAll() { renderSummary(); renderFloors(); }

// ===== SUMMARY =====
function renderSummary() {
  const counts = {}; Object.keys(TYPES).forEach(t => counts[t]=0);
  ALL_ROOMS.forEach(r => { const t=state.rooms[r].type||'vacant'; if(counts[t]!==undefined) counts[t]++; });
  const inspected = ALL_ROOMS.filter(r=>state.rooms[r].inspected).length;

  document.getElementById('summary-bar').innerHTML = [
    ['DN',   counts['depart'],        '#b5838d'],
    ['RN',   counts['rest-normal'],   '#7a9e7e'],
    ['RE',   counts['rest-especial'], '#7bafd4'],
    ['RS',   counts['rest-super'],    '#d4a96a'],
    ['DND',  counts['dnd'],           '#7c5cbf'],
    ['RET',  counts['retouche'],      '#e07b3a'],
    ['OK',   inspected,               '#4caf6e'],
    ['Vacía',counts['vacant'],        '#aaa'],
  ].map(([l,n,c]) => `<div class="sum-chip"><div class="sn" style="color:${c};">${n}</div><div class="sl">${l}</div></div>`).join('');

  document.getElementById('legend-vista').innerHTML = Object.entries(TYPES).map(([k,v]) =>
    `<div class="legend-item"><span class="ldot" style="background:${v.color};"></span>${v.label}</div>`
  ).join('') + `<div class="legend-item"><span class="ldot" style="background:#4caf6e;border-radius:50%;"></span>Inspeccionada</div>`;
}

// ===== FLOORS =====
function renderFloors() {
  const c = document.getElementById('floors-container'); c.innerHTML='';
  FLOORS.forEach(floor => {
    const sec = document.createElement('div'); sec.className='floor-section';
    const assigned = floor.rooms.filter(r=>state.rooms[r].collab).length;
    const inspected = floor.rooms.filter(r=>state.rooms[r].inspected).length;
    const title = document.createElement('div'); title.className='floor-title';
    title.innerHTML = `<b>${floor.label}</b><span>${assigned} asig. · ${inspected} OK</span>`;
    sec.appendChild(title);
    const grid = document.createElement('div'); grid.className='rooms-grid';
    floor.rooms.forEach(r => {
      const rd = state.rooms[r]; const ti = TYPES[rd.type]||TYPES['vacant'];
      const col = rd.collab ? collabColor(rd.collab) : null;
      const div = document.createElement('div');
      div.className = 'room-card ' + ti.cls;
      if (col) div.style.cssText=`background:${col.bg};border-color:${col.border};color:${col.text};`;
      div.innerHTML =
        (ti.alert ? '<div class="alert-dot"></div>' : '') +
        (rd.inspected ? '<div class="inspect-check">✓</div>' : '') +
        `<div class="rnum">${r}</div>` +
        `<div class="rtype">${ti.short!=='—'?ti.short:'Vacía'}</div>` +
        `<div class="rbed">${rd.bed||''}</div>`;
      div.onclick = () => openRoomModal(r);
      grid.appendChild(div);
    });
    sec.appendChild(grid); c.appendChild(sec);
  });
}

// ===== LIST =====
function renderList() {
  const c = document.getElementById('list-container');
  const ab = document.getElementById('alert-banner');
  c.innerHTML = '';
  const groups = {};
  Object.keys(TYPES).forEach(t => groups[t]=[]);
  ALL_ROOMS.forEach(r => { const t=state.rooms[r].type||'vacant'; if(groups[t]) groups[t].push(r); });

  const alerts = [...groups['rest-super'],...groups['rest-especial'],...groups['dnd'],...groups['retouche']];
  if (alerts.length) {
    ab.style.display='block';
    ab.textContent = 'Atención: '+alerts.length+' hab. requieren atención especial — '+alerts.join(', ');
  } else { ab.style.display='none'; }

  const order = ['dnd','retouche','rest-super','rest-especial','depart','rest-normal','propre','vacant'];
  order.forEach(tp => {
    const rooms = groups[tp]; if(!rooms.length) return;
    const ti = TYPES[tp];
    const lbl = document.createElement('p'); lbl.className='section-label'; lbl.textContent=ti.label.toUpperCase();
    c.appendChild(lbl);
    rooms.forEach(r => {
      const rd = state.rooms[r];
      const col = rd.collab ? (state.collabs.find(x=>x.id==rd.collab)||{}).name : '';
      const div = document.createElement('div'); div.className='list-item';
      div.innerHTML =
        `<span class="list-num">${r}</span>` +
        `<span class="list-bed">${rd.bed||''}</span>` +
        `<span class="list-badge ${ti.lb}">${ti.label}</span>` +
        (col ? `<span class="collab-name-sm">${col}</span>` : '') +
        (rd.inspected ? '<span class="ok-pill">OK</span>' : '') +
        (ti.alert ? '<span class="alert-pill">AVISO</span>' : '');
      div.onclick = () => openRoomModal(r);
      c.appendChild(div);
    });
  });

  // Resumen al pie estilo feuille d'inspection
  const total = ALL_ROOMS.length;
  const depart = groups['depart'].length;
  const reste = groups['rest-normal'].length+groups['rest-especial'].length+groups['rest-super'].length;
  const dnd = groups['dnd'].length;
  const propres = ALL_ROOMS.filter(r=>state.rooms[r].inspected).length;
  const foot = document.createElement('div');
  foot.style.cssText='margin-top:1.5rem;padding:1rem;background:var(--warm-white);border:1px solid var(--border);border-radius:var(--radius-lg);display:flex;gap:1rem;flex-wrap:wrap;';
  foot.innerHTML=[
    ['Depart',depart,'#b5838d'],['Reste',reste,'#7bafd4'],
    ['DND',dnd,'#7c5cbf'],['Propres',propres,'#4caf6e'],['Total',total,'#aaa']
  ].map(([l,n,c])=>`<div style="text-align:center;"><div style="font-size:20px;font-weight:500;color:${c};">${n}</div><div style="font-size:11px;color:var(--text-soft);">${l}</div></div>`).join('');
  c.appendChild(foot);
}

// ===== MODAL HABITACIÓN =====
function openRoomModal(r) {
  editingRoom = r;
  const rd = state.rooms[r]; const ti = TYPES[rd.type]||TYPES['vacant'];
  document.getElementById('mroom-title').textContent = 'Habitación ' + r;
  document.getElementById('mroom-sub').textContent = (rd.bed||'') + ' · ' + (parseInt(rd.nights)||0) + ' noche(s)';
  document.getElementById('mroom-type').value = rd.type;
  document.getElementById('mroom-bed').value = rd.bed||'Q';
  document.getElementById('mroom-nights').value = rd.nights||0;
  document.getElementById('mroom-notes').value = rd.notes||'';
  document.getElementById('mroom-inspected').checked = !!rd.inspected;
  const cs = document.getElementById('mroom-collab');
  cs.innerHTML = '<option value="">Sin asignar</option>';
  state.collabs.forEach(col => {
    const o = document.createElement('option'); o.value=col.id; o.textContent=col.name;
    if (rd.collab==col.id) o.selected=true; cs.appendChild(o);
  });
  openModal('modal-room');
}
function saveRoom() {
  const r = editingRoom;
  state.rooms[r] = {
    type: document.getElementById('mroom-type').value,
    bed:  document.getElementById('mroom-bed').value,
    nights: parseInt(document.getElementById('mroom-nights').value)||0,
    collab: document.getElementById('mroom-collab').value,
    notes: document.getElementById('mroom-notes').value,
    inspected: document.getElementById('mroom-inspected').checked,
  };
  saveState(); closeModal('modal-room');
  renderAll();
  if (document.getElementById('tab-lista').style.display!=='none') renderList();
  if (document.getElementById('tab-distribucion').style.display!=='none') renderDist();
}

// ===== AVANZAR DÍA =====
function openAdvanceDay() { openModal('modal-advance'); }
function doAdvanceDay() {
  ALL_ROOMS.forEach(r => {
    const rd = state.rooms[r];
    if (rd.type==='vacant'||rd.type==='dnd'||rd.type==='propre') return;
    if (rd.type==='depart') { state.rooms[r].type='vacant'; state.rooms[r].nights=0; state.rooms[r].inspected=false; return; }
    if (rd.type==='retouche') { state.rooms[r].type='propre'; return; }
    if (rd.type.startsWith('rest')) {
      const n=(parseInt(rd.nights)||0)+1;
      state.rooms[r].nights=n;
      state.rooms[r].inspected=false;
      if(n>=3)       state.rooms[r].type='rest-super';
      else if(n===2) state.rooms[r].type='rest-especial';
      else           state.rooms[r].type='rest-normal';
    }
  });
  saveState(); closeModal('modal-advance'); renderAll();
  if (document.getElementById('tab-lista').style.display!=='none') renderList();
}

// ===== BÚSQUEDA =====
function openSearch() {
  document.getElementById('search-input').value='';
  document.getElementById('search-result').innerHTML='';
  openModal('modal-search');
  setTimeout(()=>document.getElementById('search-input').focus(),100);
}
function doSearch() {
  const q = document.getElementById('search-input').value.trim().padStart(3,'0');
  const el = document.getElementById('search-result');
  if (!state.rooms[q]) { el.innerHTML='<p style="font-size:13px;color:var(--text-soft);padding:0.5rem 0;">No encontrada.</p>'; return; }
  const rd=state.rooms[q]; const ti=TYPES[rd.type]||TYPES['vacant'];
  const col=rd.collab?(state.collabs.find(x=>x.id==rd.collab)||{}).name||'—':'Sin asignar';
  el.innerHTML=`<div class="search-result-card">
    <p style="font-size:16px;font-weight:500;margin-bottom:6px;">Hab. ${q} — ${rd.bed||'Q'}</p>
    <p style="font-size:13px;color:var(--text-mid);">Estado: <strong>${ti.label}</strong></p>
    <p style="font-size:13px;color:var(--text-mid);">Noches: ${rd.nights||0} · Inspección: ${rd.inspected?'OK':'Pendiente'}</p>
    <p style="font-size:13px;color:var(--text-mid);">Colaboradora: ${col}</p>
    ${rd.notes?`<p style="font-size:13px;color:var(--text-mid);">Notas: ${rd.notes}</p>`:''}
  </div>
  <button class="btn-save" style="width:100%;" onclick="closeModal('modal-search');openRoomModal('${q}')">Editar habitación</button>`;
}
document.getElementById('search-input').addEventListener('keydown', e=>{if(e.key==='Enter')doSearch();});

// ===== EQUIPO =====
function renderCollabTab() {
  const c = document.getElementById('collab-list'); c.innerHTML='';
  state.collabs.forEach((col,i) => {
    const cl = COLLAB_COLORS[i%COLLAB_COLORS.length];
    const assigned = ALL_ROOMS.filter(r=>state.rooms[r].collab==col.id);
    const div = document.createElement('div'); div.className='collab-card';
    div.innerHTML=`<div class="collab-header">
      <div style="display:flex;align-items:center;gap:8px;">
        <div style="width:30px;height:30px;border-radius:50%;background:${cl.av};color:white;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:500;">${initials(col.name)}</div>
        <div><div class="collab-nm">${col.name}</div><div class="collab-ct">${assigned.length} hab. asignadas</div></div>
      </div>
      <button class="remove-btn" onclick="removeCollab(${col.id})">✕</button>
    </div>
    <div class="collab-tags">${assigned.slice(0,20).map(r=>`<span class="ctag">${r}</span>`).join('')}${assigned.length>20?`<span class="ctag">+${assigned.length-20}</span>`:''}</div>`;
    c.appendChild(div);
  });

  const gl = document.getElementById('gov-list'); gl.innerHTML='';
  state.gouvernantes.forEach((g,i) => {
    const div=document.createElement('div');
    div.style.cssText='display:flex;align-items:center;justify-content:space-between;padding:0.4rem 0;border-bottom:1px solid var(--border-soft);font-size:14px;';
    div.innerHTML=`<span>${g}</span><button class="remove-btn" onclick="removeGov(${i})">✕</button>`;
    gl.appendChild(div);
  });
}

function addCollab() {
  const inp=document.getElementById('new-collab-input');
  const name=(inp?.value||'').trim(); if(!name)return;
  state.collabs.push({id:Date.now(),name}); saveState(); inp.value=''; renderCollabTab();
}
function removeCollab(id) {
  const col=state.collabs.find(c=>c.id==id);
  if(!col||!confirm('¿Quitar a '+col.name+'?')) return;
  ALL_ROOMS.forEach(r=>{if(state.rooms[r].collab==id)state.rooms[r].collab='';});
  state.collabs=state.collabs.filter(c=>c.id!=id); saveState(); renderCollabTab(); renderAll();
}
function addGov() {
  const inp=document.getElementById('new-gov-input');
  const name=(inp?.value||'').trim(); if(!name)return;
  state.gouvernantes.push(name); saveState(); inp.value=''; renderCollabTab();
}
function removeGov(i) {
  state.gouvernantes.splice(i,1); saveState(); renderCollabTab();
}
document.getElementById('new-collab-input')?.addEventListener('keydown',e=>{if(e.key==='Enter')addCollab();});
document.getElementById('new-gov-input')?.addEventListener('keydown',e=>{if(e.key==='Enter')addGov();});

// ===== AJUSTES =====
function changeCode() {
  const old=document.getElementById('cfg-old').value;
  const nw=document.getElementById('cfg-new').value;
  const conf=document.getElementById('cfg-confirm').value;
  const err=document.getElementById('cfg-err'); const ok=document.getElementById('cfg-ok');
  err.style.display='none'; ok.style.display='none';
  if(old!==state.code){err.textContent='Código actual incorrecto.';err.style.display='block';return;}
  if(!nw){err.textContent='Ingresa un nuevo código.';err.style.display='block';return;}
  if(nw!==conf){err.textContent='Los códigos no coinciden.';err.style.display='block';return;}
  state.code=nw; saveState(); ok.style.display='block';
  ['cfg-old','cfg-new','cfg-confirm'].forEach(id=>document.getElementById(id).value='');
}
function exportJSON() {
  const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'});
  const a=document.createElement('a'); a.href=URL.createObjectURL(blob);
  a.download='menage_hotel_backup_'+new Date().toISOString().split('T')[0]+'.json'; a.click();
}
function resetAll() {
  if(confirm('¿Restablecer todos los datos? No se puede deshacer.')) { localStorage.removeItem(STORAGE_KEY); location.reload(); }
}

// ===== MODALES =====
function openModal(id) { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }
document.querySelectorAll('.modal-overlay').forEach(o => {
  o.addEventListener('click', e => { if(e.target===o) o.classList.remove('open'); });
});
