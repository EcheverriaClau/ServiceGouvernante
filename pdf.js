// ===== PDF.JS — Reporte y Feuille d'Inspection =====

function exportPDF() {
  const today = new Date();
  const dateStr = today.toLocaleDateString('es-ES',{weekday:'long',year:'numeric',month:'long',day:'numeric'});
  const sched = getTodaySchedule();
  const gov = sched.gouvernante || '—';

  const groups = {}; Object.keys(TYPES).forEach(t=>groups[t]=[]);
  ALL_ROOMS.forEach(r=>{ const t=state.rooms[r].type||'vacant'; if(groups[t]) groups[t].push(r); });

  const depart=groups['depart'].length;
  const reste=groups['rest-normal'].length+groups['rest-especial'].length+groups['rest-super'].length;
  const dnd=groups['dnd'].length;
  const retouche=groups['retouche'].length;
  const propres=ALL_ROOMS.filter(r=>state.rooms[r].inspected).length;

  const collabRows=state.collabs.map(col=>{
    const assigned=ALL_ROOMS.filter(r=>state.rooms[r].collab==col.id);
    const tc={};assigned.forEach(r=>{const t=state.rooms[r].type||'vacant';tc[t]=(tc[t]||0)+1;});
    return {name:col.name,rooms:assigned,tc};
  });

  const html=`<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"/>
<title>Feuille d'Inspection — ${today.toLocaleDateString('es-ES')}</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=DM+Sans:wght@300;400;500&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}
body{font-family:'DM Sans',sans-serif;color:#2c1f24;background:white;padding:1.5cm;font-size:10pt;line-height:1.4;}
h1{font-family:'Cormorant Garamond',serif;font-size:24pt;font-weight:600;color:#2c1f24;}
h2{font-family:'Cormorant Garamond',serif;font-size:14pt;font-weight:500;color:#7d4f57;margin:1rem 0 0.4rem;}
.header{display:flex;justify-content:space-between;align-items:flex-end;border-bottom:2px solid #b5838d;padding-bottom:0.75rem;margin-bottom:1rem;}
.brand .sub{font-family:'Cormorant Garamond',serif;font-style:italic;color:#a88898;font-size:12pt;}
.date-block{text-align:right;font-size:9pt;color:#6b4d57;}
.date-block strong{font-size:13pt;color:#2c1f24;display:block;}
.gov-line{font-size:11pt;color:#b5838d;margin-top:4px;font-weight:500;}
.summary{display:flex;gap:10px;margin-bottom:1rem;flex-wrap:wrap;}
.scard{background:#faf0f3;border:1px solid #e8d8de;border-radius:6px;padding:8px 14px;text-align:center;min-width:70px;}
.scard .n{font-size:18pt;font-weight:500;color:#b5838d;font-family:'Cormorant Garamond',serif;}
.scard .l{font-size:8pt;color:#6b4d57;}
.alert-box{background:#fff3e0;border:1px solid #d4a96a;border-radius:6px;padding:8px 12px;margin-bottom:1rem;font-size:9pt;color:#7a5530;}
.floors-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:1.5rem;}
.floor-box{border:1px solid #e8d8de;border-radius:8px;overflow:hidden;}
.floor-hdr{background:#f2e4e8;padding:5px 10px;font-weight:500;font-size:9pt;color:#7d4f57;display:flex;justify-content:space-between;}
.room-row{display:flex;align-items:center;border-bottom:0.5px solid #f5ecef;padding:3px 8px;font-size:8.5pt;}
.room-row:last-child{border-bottom:none;}
.room-row.alt{background:#fdf8f9;}
.rn{font-weight:500;width:32px;color:#2c1f24;}
.rb{width:22px;color:#a88898;font-size:8pt;}
.rt{flex:1;}
.ri{width:28px;text-align:center;font-size:8pt;color:#4caf6e;}
.rnote{flex:1;font-size:7.5pt;color:#a88898;font-style:italic;}
.badge-rn{color:#3d6641;background:#d4e8d6;padding:1px 5px;border-radius:3px;font-size:7.5pt;}
.badge-re{color:#2d5f80;background:#d4eaf5;padding:1px 5px;border-radius:3px;font-size:7.5pt;}
.badge-rs{color:#7a5530;background:#f5e8d4;padding:1px 5px;border-radius:3px;font-size:7.5pt;font-weight:600;}
.badge-dn{color:#7d4f57;background:#f5e0e4;padding:1px 5px;border-radius:3px;font-size:7.5pt;}
.badge-dnd{color:#4a3070;background:#ede8f5;padding:1px 5px;border-radius:3px;font-size:7.5pt;}
.badge-ret{color:#7a3d10;background:#faebd7;padding:1px 5px;border-radius:3px;font-size:7.5pt;}
.badge-ok{color:#2a7a45;background:#d4f0de;padding:1px 5px;border-radius:3px;font-size:7.5pt;}
.collab-section{margin-bottom:0.75rem;}
.collab-name{font-weight:500;color:#2c1f24;font-size:10pt;}
.collab-rooms{display:flex;flex-wrap:wrap;gap:4px;margin-top:4px;}
.cr{background:#f2e4e8;border:1px solid #e8c9ce;border-radius:3px;padding:2px 6px;font-size:8pt;color:#7d4f57;}
.divider{border:none;border-top:1px solid #e8d8de;margin:1rem 0;}
.footer{margin-top:1.5rem;padding-top:0.5rem;border-top:1px solid #e8d8de;font-size:8pt;color:#a88898;text-align:center;font-style:italic;font-family:'Cormorant Garamond',serif;}
.sign-row{display:grid;grid-template-columns:repeat(3,1fr);gap:2rem;margin-top:1.5rem;}
.sign-box{border-top:1px solid #c8b0b8;padding-top:4px;font-size:8pt;color:#a88898;text-align:center;}
@media print{body{padding:1cm;}.floors-grid{grid-template-columns:repeat(3,1fr);}}
</style></head><body>

<div class="header">
  <div class="brand">
    <h1>Ménage Hotel</h1>
    <p class="sub">Feuille d'Inspection — Housekeeping</p>
    ${gov!=='—'?`<p class="gov-line">Gouvernante: ${gov}</p>`:''}
  </div>
  <div class="date-block">
    <strong>${today.toLocaleDateString('es-ES',{day:'2-digit',month:'2-digit',year:'numeric'})}</strong>
    ${today.toLocaleDateString('es-ES',{weekday:'long'})}
  </div>
</div>

<div class="summary">
  ${[['Depart',depart,'#b5838d'],['Reste',reste,'#7bafd4'],['DND',dnd,'#7c5cbf'],['Retouche',retouche,'#e07b3a'],['Propres',propres,'#4caf6e'],['Total',ALL_ROOMS.length,'#aaa']].map(([l,n,c])=>
    `<div class="scard"><div class="n" style="color:${c};">${n}</div><div class="l">${l}</div></div>`
  ).join('')}
</div>

${[...groups['dnd'],...groups['retouche'],...groups['rest-super'],...groups['rest-especial']].length?
  `<div class="alert-box"><strong>Atención:</strong> ${groups['dnd'].length} DND · ${groups['retouche'].length} Retouche · ${groups['rest-super'].length} Súper-especial · ${groups['rest-especial'].length} Especial</div>`:''}

<h2>Vista por piso</h2>
<div class="floors-grid">
${FLOORS.map(floor=>`
  <div class="floor-box">
    <div class="floor-hdr"><span>${floor.label}</span><span>${floor.rooms.length} hab.</span></div>
    ${floor.rooms.map((r,idx)=>{
      const rd=state.rooms[r]; const ti=TYPES[rd.type]||TYPES['vacant'];
      const badgeClass={'rest-normal':'badge-rn','rest-especial':'badge-re','rest-super':'badge-rs','depart':'badge-dn','dnd':'badge-dnd','retouche':'badge-ret','propre':'badge-ok'}[rd.type]||'';
      return `<div class="room-row ${idx%2===1?'alt':''}">
        <span class="rn">${r}</span>
        <span class="rb">${rd.bed||'Q'}</span>
        <span class="rt">${rd.type!=='vacant'?`<span class="${badgeClass}">${ti.short}</span>`:''}</span>
        <span class="ri">${rd.inspected?'✓':''}</span>
        <span class="rnote">${rd.notes||''}</span>
      </div>`;
    }).join('')}
  </div>`).join('')}
</div>

<hr class="divider"/>
<h2>Asignación por colaboradora</h2>
${collabRows.map(c=>`
  <div class="collab-section">
    <span class="collab-name">${c.name}</span>
    <span style="font-size:8pt;color:#a88898;margin-left:6px;">(${c.rooms.length} hab. · ${['rest-normal','rest-especial','rest-super','depart','dnd','retouche'].filter(t=>c.tc[t]).map(t=>TYPES[t].short+'×'+c.tc[t]).join(', ')||'sin asignar'})</span>
    <div class="collab-rooms">${c.rooms.map(r=>`<span class="cr">${r}</span>`).join('')||'<span style="font-size:8pt;color:#a88898;">Sin habitaciones</span>'}</div>
  </div>`).join('')}

<div class="sign-row">
  <div class="sign-box">Gouvernante de turno<br/><strong>${gov}</strong></div>
  <div class="sign-box">Firma</div>
  <div class="sign-box">Hora de cierre</div>
</div>

<div class="footer">Hotel Le Dauphin · Ménage &amp; Housekeeping · ${dateStr}</div>
<script>window.print();window.onafterprint=()=>window.close();<\/script>
</body></html>`;

  const win=window.open('','_blank');
  if(win){win.document.write(html);win.document.close();}
  else alert('Activa las ventanas emergentes para generar el PDF.');
}
