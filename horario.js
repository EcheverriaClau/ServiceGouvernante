// ===== HORARIO.JS =====
let weekOffset = 0;
let selectedDay = null;

function changeWeek(dir){ weekOffset += dir; renderHorario(); }

function getWeekDates(){
  const today = new Date();
  const dow = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - dow + (dow===0?-6:1) + weekOffset*7);
  const days = [];
  for(let i=0;i<7;i++){
    const d=new Date(monday); d.setDate(monday.getDate()+i); days.push(d);
  }
  return days;
}

function renderHorario(){
  const days = getWeekDates();
  const todayStr = new Date().toISOString().split('T')[0];

  const wl = document.getElementById('week-label');
  if(wl) wl.textContent = fmtDate(days[0])+' – '+fmtDate(days[6]);

  const grid = document.getElementById('week-grid');
  if(!grid) return;
  grid.innerHTML='';

  days.forEach(d=>{
    const key = dateKey(d);
    const sched = state.schedule[key]||{gouvernante:'',workers:[]};
    const isToday = key===todayStr;
    const isSel = key===selectedDay;

    const col=document.createElement('div');
    col.className='day-col'+(isToday?' today':'')+(isSel?' selected-day':'');
    col.onclick=()=>{ selectedDay=key; renderHorario(); };

    const dayName=DAYS[d.getDay()];
    col.innerHTML=`<div class="day-name">${dayName.slice(0,3)}</div>
      <div class="day-num">${d.getDate()}</div>
      <div class="day-gov">${sched.gouvernante||'—'}</div>`;

    if(sched.workers&&sched.workers.length){
      const dots=document.createElement('div'); dots.className='day-workers';
      sched.workers.forEach(wid=>{
        const idx=state.collabs.findIndex(c=>c.id==wid);
        const cl=idx>=0?COLLAB_COLORS[idx%COLLAB_COLORS.length]:{av:'#aaa'};
        dots.innerHTML+=`<div class="day-dot" style="background:${cl.av};" title="${(state.collabs[idx]||{}).name||''}"></div>`;
      });
      col.appendChild(dots);
    }
    grid.appendChild(col);
  });

  renderDayEdit();
}

function renderDayEdit(){
  const panel=document.getElementById('day-edit-panel'); if(!panel) return;
  if(!selectedDay){ panel.innerHTML='<p style="font-size:13px;color:var(--text-soft);">Selecciona un día para editar el horario.</p>'; return; }

  const d=new Date(selectedDay+'T12:00:00');
  const sched=state.schedule[selectedDay]||{gouvernante:'',workers:[]};
  const dayName=DAYS[d.getDay()];

  panel.innerHTML=`<div class="day-edit-title">${dayName} ${d.getDate()} de ${d.toLocaleString('es',{month:'long'})}</div>

    <div class="sched-row">
      <label>Gouvernante de turno</label>
      <select id="gov-sel" onchange="updateSched()">
        <option value="">— Sin asignar —</option>
        ${state.gouvernantes.map(g=>`<option value="${g}" ${sched.gouvernante===g?'selected':''}>${g}</option>`).join('')}
      </select>
    </div>

    <div class="sched-row" style="flex-direction:column;align-items:flex-start;">
      <label style="margin-bottom:0.5rem;">Colaboradoras que trabajan este día</label>
      <div class="worker-checkboxes" id="worker-checks">
        ${state.collabs.map((col,i)=>{
          const cl=COLLAB_COLORS[i%COLLAB_COLORS.length];
          const checked=(sched.workers||[]).includes(col.id);
          return `<label class="worker-check ${checked?'checked':''}" id="wcheck-${col.id}" onclick="toggleWorker(${col.id})">
            <input type="checkbox" ${checked?'checked':''} />
            <span style="width:8px;height:8px;border-radius:50%;background:${cl.av};display:inline-block;"></span>
            ${col.name}
          </label>`;
        }).join('')}
      </div>
    </div>

    <div style="margin-top:1rem;display:flex;gap:8px;">
      <button class="btn-save" onclick="saveSched()">Guardar día</button>
      <button class="btn-cancel" onclick="clearSched()">Limpiar día</button>
    </div>
    <p class="ok-msg" id="sched-ok" style="margin-top:0.5rem;">Guardado correctamente.</p>`;
}

function toggleWorker(id){
  if(!selectedDay) return;
  if(!state.schedule[selectedDay]) state.schedule[selectedDay]={gouvernante:'',workers:[]};
  const w=state.schedule[selectedDay].workers;
  const idx=w.indexOf(id);
  if(idx>=0) w.splice(idx,1); else w.push(id);
  const lbl=document.getElementById('wcheck-'+id);
  if(lbl) lbl.classList.toggle('checked', w.includes(id));
}

function updateSched(){
  if(!selectedDay) return;
  if(!state.schedule[selectedDay]) state.schedule[selectedDay]={gouvernante:'',workers:[]};
  state.schedule[selectedDay].gouvernante=document.getElementById('gov-sel')?.value||'';
  updateTopbarGov();
}

function saveSched(){
  saveState();
  const ok=document.getElementById('sched-ok');
  if(ok){ok.style.display='block';setTimeout(()=>ok.style.display='none',2000);}
  renderHorario();
  updateTopbarGov();
}

function clearSched(){
  if(!selectedDay) return;
  state.schedule[selectedDay]={gouvernante:'',workers:[]};
  saveState(); renderHorario();
}

function fmtDate(d){ return d.getDate()+'/'+(d.getMonth()+1); }
function dateKey(d){ return d.toISOString().split('T')[0]; }
