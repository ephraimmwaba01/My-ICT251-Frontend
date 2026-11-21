import {validated} from './validation.js';
const KEY='ict251-deskline-v1';
const starters=[
  {
    "id": 1,
    "title": "Lab printer offline",
    "category": "Hardware",
    "description": "The printer in the computing lab shows offline on all workstations.",
    "status": "Pending"
  },
  {
    "id": 2,
    "title": "Residence Wi-Fi drops",
    "category": "Network",
    "description": "The student residence connection drops every few minutes.",
    "status": "In progress"
  },
  {
    "id": 3,
    "title": "Spreadsheet software missing",
    "category": "Software",
    "description": "The spreadsheet application is missing from workstation 12.",
    "status": "Pending"
  },
  {
    "id": 4,
    "title": "Projector has no signal",
    "category": "Hardware",
    "description": "The lecture room projector does not detect the teaching computer.",
    "status": "Completed"
  },
  {
    "id": 5,
    "title": "Learning portal sign-in",
    "category": "Software",
    "description": "A demonstration student account cannot open the learning portal.",
    "status": "In progress"
  },
  {
    "id": 6,
    "title": "Library network socket",
    "category": "Network",
    "description": "The ethernet port at the library help counter has no connection.",
    "status": "Pending"
  },
  {
    "id": 7,
    "title": "Keyboard keys sticking",
    "category": "Hardware",
    "description": "The space bar on a lab keyboard sticks during typing.",
    "status": "Completed"
  },
  {
    "id": 8,
    "title": "Browser update required",
    "category": "Software",
    "description": "A lab browser needs an update to load the practice site.",
    "status": "Pending"
  }
];
function read() {
  if (localStorage.getItem(KEY)===null) write(starters);
  return JSON.parse(localStorage.getItem(KEY));
}
function write(rows) {localStorage.setItem(KEY,JSON.stringify(rows));}
function find(rows,id) {const row=rows.find(r=>r.id===id); if(!row) throw new Error('Request no longer exists.'); return row;}
export const recordService={
 async list(){return read();}, async get(id){return find(read(),id);},
 async create(body){const rows=read();const row={id:rows.reduce((max,r)=>Math.max(max,r.id),0)+1,...validated(body)};write([...rows,row]);return row;},
 async update(id,body){const rows=read();const row=find(rows,id);Object.assign(row,validated(body));write(rows);return row;},
 async remove(id){const rows=read();find(rows,id);write(rows.filter(r=>r.id!==id));return {message:'Record deleted.'};}
};