// ===== DISTRIBUCION.JS =====
let distMode = 'click', distSelected = [], distActiveSel = null, distDragRoom = null, distModalRoom = null;

function setDistMode(m) {
  distMode=m; distSelected=[]; distActiveSel=null;
  ['click','drag','modal'].forEach(t=>{
    const b=document.getElementById('dmode-'+t);
    if(b) b.classList.toggle('active',t===m);
  });
  distInfo(''); renderDist();
}

function distInfo(msg) {
  const el=document.getElementById('dist-info');
  if(msg){el.textContent=msg;el.style.display='block';}else el.style.display='none';
}

function getDistMap() {
  const m={}; state.collabs.forEach(c=>{m[c.id]=[];});
  ALL_ROOMS.forEach(r=>{const cid=state.rooms[r].collab;if(cid&&m[cid])m[cid].push(r);});
  return m;
}

function renderDistFloors() {
  const fp=document.getElementById('dist-floors'); if(!fp)return; fp.innerHTML='';
  FLOORS.forEach(floor=>{
    const block=document.createElement('div'); block.style.marginBottom='1rem';
    const asgn=floor.rooms.filter(r=>state.rooms[r].collab).length;
    const hdr=document.createElement('div');
    hdr.style.cssText='font-size:12px;font-weight:500;color:var(--text-soft);padding:0.35rem 0;border-bottom:1px solid var(--border-soft);margin-bottom:0.4rem;display:flex;justify-content:space-between;';
    hdr.innerHTML=`<b>${floor.label}</b><span style="font-weight:400;">${asgn}/${floor.rooms.length}</span>`;
    block.appendChild(hdr);
    const wrap=document.createElement('div');
    wrap.style.cssText='display:flex;flex-wrap:wrap;gap:4px;';
    floor.rooms.forEach(r=>{
      const rd=state.rooms[r]; const cid=rd.collab;
      const col=cid?collabColor(cid):null; const ti=TYPES[rd.type]||TYPES['vacant'];
      const pill=document.createElement('div');
      pill.className='room-pill-dist'+(cid?'':' unassigned')+(distSelected.includes(r)?' selected':'');
      if(col) pill.style.cssText=`background:${col.bg};border-color:${col.border};color:${col.text};`;
      pill.innerHTML=r+`<span class="type-pip" style="background:${ti.color};"></span>`;
      pill.dataset.room=r;
      if(distMode==='click')      pill.onclick=()=>distClickRoom(r);
      else if(distMode==='drag')  { pill.draggable=true; setupDrag(pill,r); }
      else                        pill.onclick=()=>openDistRoomModal(r);
      wrap.appendChild(pill);
    });
    block.appendChild(wrap); fp.appendChild(block);
  });
}

function setupDrag(pill,r){
  pill.addEventListener('dragstart',e=>{distDragRoom=r;pill.classList.add('dragging');e.dataTransfer.effectAllowed='move';});
  pill.addEventListener('dragend',()=>pill.classList.remove('dragging'));
}

function renderDistCollabs() {
  const cp=document.getElementById('dist-collabs'); if(!cp)return; cp.innerHTML='';
  const map=getDistMap();
  const activeWorkers=getActiveWorkers();

  activeWorkers.forEach((col,i)=>{
    const globalI=state.collabs.findIndex(c=>c.id==col.id);
    const cl=COLLAB_COLORS[globalI%COLLAB_COLORS.length];
    const rooms=map[col.id]||[];
    const typeCounts={};
    rooms.forEach(r=>{const t=state.rooms[r].type||'vacant';typeCounts[t]=(typeCounts[t]||0)+1;});
    const isActive=distActiveSel==col.id;

    const card=document.createElement('div'); card.className='dist-card'+(isActive?' active-sel':'');

    const hdr=document.createElement('div'); hdr.className='dist-hdr';
    hdr.innerHTML=`<div class="dist-avatar" style="background:${cl.av};color:white;">${initials(col.name)}</div>
      <div class="dist-info"><div class="dist-name">${col.name}</div><div class="dist-sub">${rooms.length} hab.</div></div>
      <button class="remove-btn" onclick="clearCollabDist(${col.id})">✕</button>`;
    card.appendChild(hdr);

    if(rooms.length){
      const tb=document.createElement('div'); tb.className='type-badges';
      ['rest-normal','rest-especial','rest-super','depart','dnd','retouche'].forEach(tp=>{
        if(typeCounts[tp]){
          const ti=TYPES[tp]; const b=document.createElement('span'); b.className='tbadge';
          b.style.cssText=`background:${ti.color}22;color:${ti.color};border:1px solid ${ti.color}44;`;
          b.textContent=`${ti.short} ×${typeCounts[tp]}`; tb.appendChild(b);
        }
      });
      card.appendChild(tb);
    }

    const mini=document.createElement('div'); mini.className='dist-mini';
    if(rooms.length){
      rooms.forEach(r=>{
        const ti=TYPES[state.rooms[r].type]||TYPES['vacant'];
        const tag=document.createElement('span'); tag.className='dtag';
        tag.style.cssText=`background:${ti.color}22;color:${ti.color};`;
        tag.textContent=r;
        if(distMode==='drag'){tag.style.cursor='pointer';tag.title='Clic para desasignar';tag.onclick=()=>{state.rooms[r].collab='';renderDist();};}
        mini.appendChild(tag);
      });
    } else {
      mini.innerHTML='<span style="font-size:11px;color:var(--text-soft);">Sin habitaciones</span>';
    }
    card.appendChild(mini);

    if(distMode==='click'){
      const abtn=document.createElement('button'); abtn.className='dist-assign-btn'+(isActive?' active':'');
      if(isActive){
        abtn.textContent='Confirmando asignación — clic en "listo"';
        abtn.onclick=()=>{distActiveSel=null;distSelected=[];distInfo('');renderDist();};
      } else if(distSelected.length>0&&!distActiveSel){
        abtn.textContent=`Asignar ${distSelected.length} hab. aquí`;
        abtn.onclick=()=>{distSelected.forEach(r=>{state.rooms[r].collab=col.id;});distSelected=[];distInfo('');renderDist();};
      } else {
        abtn.textContent='Asignar habitaciones por clic';
        abtn.onclick=()=>{distActiveSel=col.id;distSelected=ALL_ROOMS.filter(r=>state.rooms[r].collab==col.id);distInfo('Clic en habitaciones para asignar/desasignar a '+col.name);renderDist();};
      }
      card.appendChild(abtn);
    }

    if(distMode==='drag'){
      card.addEventListener('dragover',e=>{e.preventDefault();card.classList.add('drag-over');});
      card.addEventListener('dragleave',()=>card.classList.remove('drag-over'));
      card.addEventListener('drop',e=>{e.preventDefault();card.classList.remove('drag-over');if(distDragRoom){state.rooms[distDragRoom].collab=col.id;distDragRoom=null;renderDist();}});
    }
    cp.appendChild(card);
  });

  const addWrap=document.createElement('div'); addWrap.className='add-dist-wrap';
  addWrap.innerHTML=`<p style="font-size:12px;color:var(--text-soft);margin-bottom:0.5rem;font-weight:500;">Agregar colaboradora</p>
    <div class="add-dist-row">
      <input type="text" id="dist-new-name" placeholder="Nombre..." style="margin:0;"/>
      <button onclick="distAddCollab()">+</button>
    </div>`;
  cp.appendChild(addWrap);
  document.getElementById('dist-new-name')?.addEventListener('keydown',e=>{if(e.key==='Enter')distAddCollab();});
}

function distAddCollab(){
  const inp=document.getElementById('dist-new-name');
  const name=(inp?.value||'').trim(); if(!name)return;
  state.collabs.push({id:Date.now(),name}); saveState(); inp.value=''; renderDist();
}
function clearCollabDist(id){
  ALL_ROOMS.forEach(r=>{if(state.rooms[r].collab==id)state.rooms[r].collab='';});
  renderDist();
}

function distClickRoom(r){
  if(distActiveSel){
    if(distSelected.includes(r)){distSelected=distSelected.filter(x=>x!==r);state.rooms[r].collab='';}
    else{distSelected.push(r);state.rooms[r].collab=distActiveSel;}
    renderDist();return;
  }
  if(distSelected.includes(r))distSelected=distSelected.filter(x=>x!==r);
  else distSelected.push(r);
  renderDist();
}

function openDistRoomModal(r){
  distModalRoom=r;
  document.getElementById('mdr-title').textContent='Habitación '+r;
  const ti=TYPES[state.rooms[r].type]||TYPES['vacant'];
  document.getElementById('mdr-sub').textContent=ti.label+' · '+(state.rooms[r].bed||'Q');
  const sel=document.getElementById('mdr-sel');
  sel.innerHTML='<option value="">Sin asignar</option>';
  state.collabs.forEach(c=>{
    const o=document.createElement('option');o.value=c.id;o.textContent=c.name;
    if(state.rooms[r].collab==c.id)o.selected=true;sel.appendChild(o);
  });
  openModal('modal-dist-room');
}
function saveDistRoom(){
  if(distModalRoom){state.rooms[distModalRoom].collab=document.getElementById('mdr-sel').value;}
  closeModal('modal-dist-room'); distModalRoom=null; renderDist();
}

function autoDistribute(){
  if(!state.collabs.length){distInfo('Agrega al menos una colaboradora primero.');return;}
  const workers=getActiveWorkers();
  const n=workers.length;
  ALL_ROOMS.forEach(r=>{state.rooms[r].collab='';});
  const typeOrder=['rest-super','rest-especial','depart','dnd','retouche','rest-normal','propre','vacant'];
  typeOrder.forEach(tp=>{
    FLOORS.forEach(floor=>{
      const rooms=floor.rooms.filter(r=>(state.rooms[r].type||'vacant')===tp);
      if(!rooms.length)return;
      const per=Math.ceil(rooms.length/n);
      let ci=0,cnt=0;
      rooms.forEach(r=>{
        if(cnt>=per&&ci<n-1){ci++;cnt=0;}
        state.rooms[r].collab=workers[ci].id;cnt++;
      });
    });
  });
  distSelected=[];distActiveSel=null;
  distInfo('Distribución automática aplicada — tipos de limpieza y pisos repartidos equitativamente.');
  renderDist();
}

function clearDist(){ALL_ROOMS.forEach(r=>{state.rooms[r].collab='';});distSelected=[];distActiveSel=null;distInfo('');renderDist();}
function saveDist(){saveState();distInfo('Distribución guardada correctamente.');}

function renderDist(){renderDistFloors();renderDistCollabs();}
