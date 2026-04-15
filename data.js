const FLOORS = [
  { label: 'Recepción (RC)', rooms: ['001','002','003','004','005','006','007','008'] },
  { label: '1er Piso',       rooms: ['100','101','102','103','104','105','106','107','108','109','110','111','112','113','115'] },
  { label: '2do Piso',       rooms: ['200','201','202','203','204','205','206','207','208','209','210','211','212','213','215'] },
  { label: '3er Piso',       rooms: ['300','301','302','303','304','305','306','307','308','309','310','311','313','315'] },
  { label: '4to Piso',       rooms: ['400','401','402','403','404','405','406','407','408','409','410','411','413','415'] },
  { label: '5to Piso',       rooms: ['500','501','502','503','504','505','506','507','508','509','510','511','513','515'] },
];
const ALL_ROOMS = FLOORS.flatMap(f => f.rooms);

const DEFAULT_BED = {
  '001':'Q','002':'Q','003':'Q','004':'K','005':'Q','006':'Q','007':'K','008':'K',
  '100':'K','101':'K','102':'Q','103':'Q','104':'Q','105':'Q','106':'Q','107':'Q',
  '108':'Q','109':'Q','110':'Q','111':'Q','112':'K','113':'Q','115':'K',
  '200':'K','201':'K','202':'Q','203':'Q','204':'Q','205':'Q','206':'Q','207':'Q',
  '208':'Q','209':'Q','210':'Q','211':'Q','212':'K','213':'Q','215':'K',
  '300':'K','301':'K','302':'Q','303':'Q','304':'K','305':'Q','306':'Q','307':'Q',
  '308':'Q','309':'Q','310':'SK','311':'Q','313':'Q','315':'K',
  '400':'K','401':'K','402':'K','403':'K','404':'K','405':'Q','406':'Q','407':'Q',
  '408':'Q','409':'Q','410':'SK','411':'Q','413':'Q','415':'K',
  '500':'K','501':'K','502':'K','503':'K','504':'K','505':'K','506':'K','507':'K',
  '508':'K','509':'K','510':'SK','511':'K','513':'K','515':'K',
};

const TYPES = {
  'vacant':        { label:'Vacía',                short:'—',   cls:'room-vacant',        lb:'',        alert:false, color:'#bbb' },
  'rest-normal':   { label:'Rest normal',           short:'RN',  cls:'room-rest-normal',   lb:'lb-rn',   alert:false, color:'#7a9e7e' },
  'rest-especial': { label:'Rest especial',         short:'RE',  cls:'room-rest-especial', lb:'lb-re',   alert:true,  color:'#7bafd4' },
  'rest-super':    { label:'Rest súper-esp.',       short:'RS',  cls:'room-rest-super',    lb:'lb-rs',   alert:true,  color:'#d4a96a' },
  'depart':        { label:'Depart normal',         short:'DN',  cls:'room-depart',        lb:'lb-dn',   alert:false, color:'#b5838d' },
  'dnd':           { label:'DND',                   short:'DND', cls:'room-dnd',           lb:'lb-dnd',  alert:true,  color:'#7c5cbf' },
  'retouche':      { label:'Retouche',              short:'RET', cls:'room-retouche',      lb:'lb-ret',  alert:true,  color:'#e07b3a' },
  'propre':        { label:'Propre / Inspeccionada',short:'OK',  cls:'room-propre',        lb:'lb-ok',   alert:false, color:'#4caf6e' },
};

const DAYS = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
const STORAGE_KEY = 'menage_hotel_v3';

function defaultState() {
  const rooms = {};
  ALL_ROOMS.forEach(r => {
    rooms[r] = { type:'vacant', nights:0, collab:'', notes:'', bed:DEFAULT_BED[r]||'Q', inspected:false };
  });
  return {
    rooms,
    collabs: [
      { id:1, name:'Melissa' }, { id:2, name:'Myrna' },
      { id:3, name:'Miriam' },  { id:4, name:'Irazema' },
      { id:5, name:'Jazmin' },  { id:6, name:'Deyanira' },
    ],
    schedule: {},
    code: 'gouvernante',
    gouvernantes: ['Javier','Teresa','Leidy'],
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const p = JSON.parse(raw);
      ALL_ROOMS.forEach(r => {
        if (!p.rooms[r]) p.rooms[r] = { type:'vacant', nights:0, collab:'', notes:'', bed:DEFAULT_BED[r]||'Q', inspected:false };
        if (!p.rooms[r].bed) p.rooms[r].bed = DEFAULT_BED[r]||'Q';
        if (p.rooms[r].inspected === undefined) p.rooms[r].inspected = false;
      });
      if (!p.schedule)    p.schedule = {};
      if (!p.gouvernantes) p.gouvernantes = ['Javier','Teresa','Leidy'];
      return p;
    }
  } catch(e) {}
  return defaultState();
}

function saveState() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch(e) {}
}

let state = loadState();

function todayKey() { return new Date().toISOString().split('T')[0]; }
function getTodaySchedule() { return state.schedule[todayKey()] || { gouvernante:'', workers:[] }; }
function getActiveWorkers() {
  const s = getTodaySchedule();
  if (!s.workers || !s.workers.length) return state.collabs;
  return state.collabs.filter(c => s.workers.includes(c.id));
}
