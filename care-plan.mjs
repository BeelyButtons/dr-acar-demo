// Calendar-only scheduling. No personal completion records or fixed surgery date.
const DAY = 86400000;
export const STAGES = ['Early recovery', 'Ongoing care', 'Follow-ups'];
export const USE_MODES = Object.freeze({SCHEDULED:'scheduled',IF_NEEDED:'if_needed'});
const define = (id, name, stage, icon, tone, start, duration, frequency, instructions, extra = {}) =>
  ({id, name, sourceName: name, stage, icon, tone, start, duration, frequency, instructions, kind:'routine',defaultUseMode:USE_MODES.SCHEDULED,...extra});

export const CATALOG = [
  define('surgery','Hair transplantation',0,'calendar','navy','Day 0','One day','Once','Hair transplantation on the selected surgery date.',{kind:'milestone'}),
  define('paracetamol','Paracetamol',0,'pill','coral','Day 0 evening; day 1','Through day 1','Day 1: 6 AM, 10 AM, 2 PM, 6 PM','If needed for pain: 1 tablet. Follow the prescribed dose limit.',{defaultUseMode:USE_MODES.IF_NEEDED}),
  define('saline','Saline Spray',0,'drop','blue','Day 0 evening','Through day 8','Every 2 hours, 6 AM–10 PM','3–6 sprays to implanted areas. No need to wake from sleep.'),
  define('sleep','Sleeping position',0,'moon','navy','Night of day 0','Nights 0–6; milestone day 7','Nightly at 10 PM','Sleep on your back at 45° with a neck pillow.'),
  define('omeprazole','Omeprazol (omeprazole)',0,'pill','lime','Day 1','8 days (days 1–8)','7:30 AM, before breakfast','20 mg, 1 capsule before breakfast.'),
  define('aspirin','Coraspin (aspirin)',0,'pill','coral','Day 1','8 days (days 1–8)','8 AM, after breakfast','100 mg, 1 tablet after breakfast.'),
  define('headband','Headband',0,'sun','blue','Day 1','2 days (days 1–2)','Put on 8 AM; remove 10 PM','Put on the headband for daytime wear. Remove it for the night.'),
  define('prednol','Prednol',0,'pill','lime','Day 1','8 days (days 1–8)','8 AM, after breakfast','16 mg, 1 tablet after breakfast.'),
  define('sifloks','Sifloks (ciprofloxacin)',0,'pill','coral','Day 1','8 days (days 1–8)','8 AM and 8 PM','500 mg, 1 tablet after breakfast and after dinner, approximately 12 hours apart.'),
  define('bucket','Bucket hat',0,'sun','navy','Day 1','10 days (days 1–10)','Daily, when outside','Wear a loose bucket hat outside during sun or rain.'),
  define('foam','Moisturizer Repair Foam',0,'drop','blue','Day 2','Days 2–9','9 AM; final wash on day 9','Pat gently onto transplanted areas. Do not rub. Leave 30 minutes, then rinse gently with warm bottled water.'),
  define('hydrating','Hydrating Shampoo',0,'bottle','navy','Day 2','Until the day before month 1','Daily; time follows washing phase','Pat onto transplanted areas without rubbing. Wash donor area normally. Leave 1 minute, then rinse gently with warm bottled water.'),
  define('nicotine','Nicotine',0,'flag','coral','Day 3','One milestone','Once','Nicotine restriction ends.',{kind:'milestone'}),
  define('alcohol','Alcohol',0,'flag','coral','Day 7','One milestone','Once','Alcohol restriction ends.',{kind:'milestone'}),
  define('sex','Sexual activity',0,'flag','coral','Day 7','One milestone','Once','Sexual activity can resume.',{kind:'milestone'}),
  define('scarex','ScarEx Jel',1,'drop','blue','Day 2','Until the bottle is finished','Daily at 10 AM','Apply according to the clinic’s application instructions. Stop when the bottle is finished.',{untilFinished:true}),
  define('biotin','Biotin',1,'pill','lime','Day 7','12 calendar months from day 7','Daily at 8 AM','Take 1 tablet after a meal.',{commercial:true}),
  define('multi','Complex Formula Multivitamin',1,'pill','coral','Day 7','12 calendar months from day 7','Daily at 8 AM','Take 1 tablet after a meal.',{commercial:true}),
  define('saw','Saw Palmetto',1,'pill','lime','Day 7','12 calendar months from day 7','Daily at 8 AM','Take 1 tablet after a meal.',{commercial:true}),
  define('finasteride','Finasteride + Minoxidil Topical Treatment',1,'bottle','blue','Month 1','12 calendar months','Daily at 8 AM','Apply 4–5 pumps and massage into scalp.'),
  define('hats','Normal hats / beanie',1,'flag','coral','Month 1','One milestone','Once at 8 AM','Normal hats or a beanie can be worn.',{kind:'milestone'}),
  define('shampoo','Anti Hair Loss Shampoo',1,'bottle','navy','Month 1','12 months; rinse changes at month 2','Every 2 days at 9 AM','Lather shampoo in hands, apply foam to scalp and rinse immediately.',{commercial:true}),
  define('serum','Anti Hair Loss Serum',1,'bottle','blue','Month 1','12 calendar months','Daily at 6 PM','Spray 3–5 puffs into hair; leave in at least 5 hours.',{commercial:true}),
  define('meso','Meso Hair Serum',1,'drop','blue','Month 1','Through month 9','Monthly, at 6 PM','Apply to head and leave in 12–24 hours.',{commercial:true}),
  define('dermaroller','Dermaroller + Meso Hair Serum',1,'spark','navy','Month 10','12 monthly sessions (months 10–21)','Monthly, at 6 PM','Prepare and clean as directed; perform treatment; apply serum; clean afterward.'),
  define('photos','Hair photographs',2,'camera','blue','Days 7 and 8','Then months 1, 3, 6, 9 and 12','At each milestone, 10 AM','Take progress photos and submit to Cosmedica through its app.',{kind:'photo'}),
  define('beard','Beard shaving',2,'flag','coral','Day 14','One milestone','Once','Beard shaving can resume.',{kind:'milestone'}),
  define('exercise','Exercise',2,'flag','coral','Month 1','One milestone','Once','Exercise can resume.',{kind:'milestone'}),
  define('sun','Sun exposure',2,'sun','coral','Month 1','One milestone','Once','Sunbathing can resume.',{kind:'milestone'}),
  define('swimming','Swimming',2,'flag','blue','Month 1','One milestone','Once','Swimming can resume.',{kind:'milestone'}),
  define('scissors','Scissors haircut',2,'flag','coral','Month 3','One milestone','Once','Hair cutting with scissors can begin.',{kind:'milestone'}),
  define('prp','PRP Treatment',2,'calendar','coral','Month 6','One follow-up reminder','Once','Contact the clinic about a six-month PRP visit.',{kind:'milestone'}),
  define('trimmer','Trimmer haircut',2,'flag','coral','Month 6','One milestone','Once','Hair cutting with a trimmer can begin.',{kind:'milestone'}),
];
export const ALL_IDS = CATALOG.map(t=>t.id);

export function parseDate(iso) {
  if (typeof iso !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) throw new Error('Select a valid surgery or care date.');
  const [y,m,d]=iso.split('-').map(Number);
  const stamp=Date.UTC(y,m-1,d);
  if(y<1900||y>9998||new Date(stamp).toISOString().slice(0,10)!==iso) throw new Error('Select a valid calendar date.');
  return stamp;
}
const isoDate = stamp => new Date(stamp).toISOString().slice(0,10);
export const addDays = (iso, days) => isoDate(parseDate(iso)+days*DAY);
export const daysBetween = (a,b) => Math.round((parseDate(b)-parseDate(a))/DAY);
export function addMonths(iso, months) {
  const date=new Date(parseDate(iso));
  const day=date.getUTCDate();
  date.setUTCDate(1); date.setUTCMonth(date.getUTCMonth()+months);
  const last=new Date(Date.UTC(date.getUTCFullYear(),date.getUTCMonth()+1,0)).getUTCDate();
  date.setUTCDate(Math.min(day,last));
  return isoDate(date.getTime());
}
export function formatDate(iso, options={month:'short',day:'numeric',year:'numeric'}) {
  return new Date(parseDate(iso)).toLocaleDateString('en-US',{...options,timeZone:'UTC'});
}
export function formatTime(minutes) {
  if(minutes===null)return 'Any time';
  const h=Math.floor(minutes/60),m=minutes%60;
  return `${h%12||12}:${String(m).padStart(2,'0')} ${h<12?'AM':'PM'}`;
}
function normalize(plan) {
  parseDate(plan.surgeryDate);
  const ids=new Set(plan.included===undefined?ALL_IDS:plan.included);
  for(const id of ids)if(!ALL_IDS.includes(id))throw new Error(`Unknown care item: ${id}`);
  for(const [id,reason] of Object.entries(plan.exclusions||{})) {
    if(!ALL_IDS.includes(id)||!['unsuitable','declined'].includes(reason))throw new Error('Invalid exclusion.');
    ids.delete(id);
  }
  for(const [id,date] of Object.entries(plan.finishedOn||{})) {
    if(!ALL_IDS.includes(id))throw new Error('Unknown finished item.');
    parseDate(date);
  }
  const useModes=Object.fromEntries(CATALOG.map(t=>[t.id,t.defaultUseMode]));
  for(const [id,mode] of Object.entries(plan.useModes||{})){
    if(!ALL_IDS.includes(id))throw new Error(`Unknown care item use mode: ${id}`);
    if(!Object.values(USE_MODES).includes(mode))throw new Error(`Invalid use mode for ${id}`);
    useModes[id]=mode;
  }
  return {...plan,ids,useModes};
}

// A serializable patient-plan snapshot. Staff editing and durable storage are checkpoint 4.
export function createPatientPlan(config){
  const plan=normalize(config);
  return {schemaVersion:1,surgeryDate:plan.surgeryDate,included:[...plan.ids],
    exclusions:{...plan.exclusions},finishedOn:{...plan.finishedOn},useModes:{...plan.useModes}};
}
export function dispositionsForOccurrence(occurrence){
  if(occurrence.kind==='milestone')return [];
  return occurrence.useMode===USE_MODES.IF_NEEDED?['not_completed','completed','skipped']:['not_completed','completed'];
}

export function scheduleForDate(plan, careDate) {
  const p=normalize(plan),s=p.surgeryDate;
  const day=daysBetween(s,careDate),events=[];
  if(day<0)return events;
  const m=n=>addMonths(s,n);
  const between=(start,end)=>careDate>=start&&careDate<end;
  function emit(id,time=null,instructions=null,phase='routine',kind=null) {
    if(!p.ids.has(id)||(p.finishedOn?.[id]&&careDate>=p.finishedOn[id]))return;
    const item=CATALOG.find(t=>t.id===id);
    const event={...item,itemId:id,date:careDate,day,time,phase,kind:kind||item.kind,
      useMode:p.useModes[id],instructions:instructions||item.instructions,occurrenceId:`${id}:${careDate}:${time??'any'}:${phase}`};
    event.availableDispositions=dispositionsForOccurrence(event);
    events.push(event);
  }
  if(day===0)emit('surgery',null,`Hair transplantation on ${formatDate(s)}.`,'surgery');
  if(day===0)emit('paracetamol',1080);
  if(day===1)for(const time of [360,600,840,1080])emit('paracetamol',time);
  if(day===0)for(const time of [1080,1200,1320])emit('saline',time);
  if(day>=1&&day<=8)for(let time=360;time<=1320;time+=120)emit('saline',time);
  if(day<7)emit('sleep',1320);
  if(day===7)emit('sleep',null,'The inclined sleeping and neck-pillow period ends.','restriction-end','milestone');
  if(day>=1&&day<=8) {
    emit('omeprazole',450); emit('aspirin',480); emit('prednol',480);
    emit('sifloks',480,'500 mg, 1 tablet after breakfast.','morning');
    emit('sifloks',1200,'500 mg, 1 tablet after dinner, approximately 12 hours after morning dose.','evening');
  }
  if(day===1||day===2) {
    emit('headband',480,'Put on the headband for daytime wear.','put-on');
    emit('headband',1320,'Remove the headband for the night.','remove');
  }
  if(day>=1&&day<=10)emit('bucket');
  if(day>=2&&day<=8)emit('foam',540,null,'regular-wash');
  if(day===9)emit('foam',540,'Pat foam onto transplanted areas; leave 60 minutes. Complete scab removal and gentle rinsing as directed; do not force attached scabs. Stop foam once scab removal is complete; contact the clinic if scabs remain.','final-scab-wash');
  if(day>=2&&careDate<m(1))emit('hydrating',day<9?570:day===9?600:540,null,day<10?'after-foam':'daily-wash');
  if(day>=2)emit('scarex',600);
  const supplementStart=addDays(s,7);
  if(between(supplementStart,addMonths(supplementStart,12)))for(const id of ['biotin','multi','saw'])emit(id,480);
  if(between(m(1),m(13))) {
    emit('finasteride',480); emit('serum',1080);
    if(daysBetween(m(1),careDate)%2===0) {
      const bottled=careDate<m(2);
      emit('shampoo',540,`Lather shampoo in hands, apply foam to scalp and rinse immediately ${bottled?'with warm bottled water':'in shower'}.`,bottled?'bottled-water':'shower');
    }
  }
  for(let month=1;month<=9;month++)if(careDate===m(month))emit('meso',1080,null,`month-${month}`);
  for(let month=10;month<=21;month++)if(careDate===m(month))emit('dermaroller',1080,null,`month-${month}`);
  if(day===7)emit('photos',600,null,'week-1');
  if(day===8)emit('photos',600,'Take scalp photos after the seventh wash and send them to Cosmedica.','wash-7');
  for(const month of [1,3,6,9,12])if(careDate===m(month))emit('photos',600,null,`month-${month}`);
  for(const [id,offset] of [['nicotine',3],['alcohol',7],['sex',7],['beard',14]])if(day===offset)emit(id);
  if(careDate===m(1))for(const id of ['hats','exercise','sun','swimming'])emit(id,id==='hats'?480:null);
  if(careDate===m(3))emit('scissors');
  if(careDate===m(6))for(const id of ['prp','trimmer'])emit(id);
  return events.sort((a,b)=>(a.time??1440)-(b.time??1440)||a.name.localeCompare(b.name)||a.phase.localeCompare(b.phase));
}

export function generatePlan(plan, {from=plan.surgeryDate,through=addDays(addMonths(plan.surgeryDate,22),-1)}={}) {
  const days=daysBetween(from,through);
  if(days<0||days>3660)throw new Error('Choose a plan range of at most ten years.');
  const result=[];
  for(let i=0;i<=days;i++)result.push(...scheduleForDate(plan,addDays(from,i)));
  return result;
}
export function milestonesForPlan(plan) {
  const p=normalize(plan),s=p.surgeryDate, result=[];
  const add=(itemId,date,title,description,phase='milestone')=>{
    if(p.ids.has(itemId)&&!(p.finishedOn?.[itemId]&&date>=p.finishedOn[itemId]))result.push({itemId,date,title,description,day:daysBetween(s,date),occurrenceId:`${itemId}:${date}:${phase}`});
  };
  const atDay=(id,n,title,desc)=>add(id,addDays(s,n),title,desc);
  const atMonth=(id,n,title,desc)=>add(id,addMonths(s,n),title,desc);
  atDay('surgery',0,'Hair transplantation','Your surgery date is day 0.');
  atDay('headband',3,'Headband routine ends','Daytime wear and nightly removal finish after day 2.');
  atDay('nicotine',3,'Nicotine restriction ends','The nicotine milestone from your care plan.');
  atDay('sleep',7,'Inclined sleeping period ends','The seven-night sleeping-position routine is complete.');
  atDay('alcohol',7,'Alcohol restriction ends','The alcohol milestone from your care plan.');
  atDay('sex',7,'Sexual activity can resume','The activity milestone from your care plan.');
  for(const d of [7,8])atDay('photos',d,d===7?'First progress photos':'Photos after wash 7','Take and submit your photos in one task.');
  atDay('saline',9,'Saline routine ends','The last scheduled spray applications were on day 8.');
  atDay('foam',9,'Final foam and scab-removal wash','Today: 60-minute foam step; no more foam scheduled after today.');
  atDay('foam',10,'Repair foam routine complete','The final foam wash was on day 9.');
  atDay('bucket',11,'Bucket-hat routine ends','Ten daily entries, covering days 1 through 10, are complete.');
  atDay('beard',14,'Beard shaving can resume','Your two-week milestone.');
  atMonth('hydrating',1,'Hydrating Shampoo routine ends','The final hydrating wash was the previous day.');
  atMonth('shampoo',1,'Anti Hair Loss Shampoo begins','Every two days. Rinse with warm bottled water.');
  atMonth('shampoo',2,'Shampoo rinse method changes','Continue every two days; shower rinsing replaces bottled-water rinsing.');
  for(const [id,title] of [['hats','Normal hats / beanie can be worn'],['exercise','Exercise can resume'],['sun','Sunbathing can resume'],['swimming','Swimming can resume']])atMonth(id,1,title,'Your one-month milestone.');
  atMonth('scissors',3,'Scissors haircut can begin','Your three-month milestone.');
  atMonth('prp',6,'PRP follow-up','Contact the clinic to plan the next visit.');
  atMonth('trimmer',6,'Trimmer haircut can begin','Your six-month milestone.');
  for(const month of [1,3,6,9,12])atMonth('photos',month,`Month ${month} progress photos`,'Take and submit your photos in one task.');
  atMonth('meso',10,'Monthly Meso-only phase ends','The last standalone monthly session is at month 9.');
  atMonth('dermaroller',10,'Dermaroller + Meso phase begins','Twelve monthly sessions, from month 10 through month 21.');
  for(const id of ['biotin','multi','saw'])add(id,addMonths(addDays(s,7),12),`${CATALOG.find(t=>t.id===id).name} course ends`,'Twelve calendar months after the day-7 start.');
  for(const id of ['shampoo','serum','finasteride'])atMonth(id,13,`${CATALOG.find(t=>t.id===id).name} course ends`,'Twelve calendar months after the month-1 start.');
  atMonth('dermaroller',22,'Dermaroller + Meso phase complete','All twelve monthly sessions are complete.');
  return result.sort((a,b)=>a.date.localeCompare(b.date)||a.title.localeCompare(b.title));
}
export function recommendationsForPlan(plan) {
  const p=normalize(plan);
  return CATALOG.filter(t=>t.commercial&&!p.ids.has(t.id)&&p.exclusions?.[t.id]==='declined');
}
