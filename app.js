// Checkpoint 3: v7 scheduling and a reviewable daily preview. Persistence is checkpoint 4.
import { setupView, milestoneView } from './plan-views.mjs';
import { CATALOG, ALL_IDS, addDays, addMonths, daysBetween, formatDate, formatTime, scheduleForDate, milestonesForPlan, recommendationsForPlan } from './care-plan.mjs';
const icons = {
  calendar: '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M7 3v4m10-4v4M3 11h18m-13 4h2m4 0h2"/>',
  flag: '<path d="M5 21V4m0 1c5-5 9 5 14 0v10c-5 5-9-5-14 0"/>',
  bag: '<path d="M5 7h14l2 14H3L5 7Z"/><path d="M8 8V6a4 4 0 0 1 8 0v2"/>',
  chat: '<path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5H4l-2 2v-9A9 9 0 1 1 21 11.5Z"/><path d="M7 10h10m-10 4h6"/>',
  drop: '<path d="M12 2S5 10 5 15a7 7 0 0 0 14 0c0-5-7-13-7-13Z"/><path d="M8 15a4 4 0 0 0 4 4"/>',
  bottle: '<path d="M9 3h6v4H9zM8 7h8l2 4v10H6V11l2-4Z"/><path d="M6 13h12m-9 4h6"/>',
  pill: '<path d="m9 4-5 5a6.4 6.4 0 0 0 9 9l5-5a6.4 6.4 0 0 0-9-9Z"/><path d="m7 7 10 10"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  moon: '<path d="M20 15.5A9 9 0 0 1 8.5 4 9 9 0 1 0 20 15.5Z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/>',
  camera: '<path d="M3 7h4l2-3h6l2 3h4v14H3V7Z"/><circle cx="12" cy="13" r="4"/>',
  spark: '<path d="m12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3 3-7Z"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
};
const icon = (name) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] || icons.spark}</svg>`;
const esc = (value) => String(value).replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const state = { scene:'setup', setupStep:0, stage:0, name:'', surgeryDate:'', day:1, hasPlan:false, done:new Set(), excluded:{}, included:new Set(ALL_IDS), finishedOn:{}, filter:'all' };
const treatments = CATALOG;
const planConfig = () => ({surgeryDate:state.surgeryDate,included:[...state.included],exclusions:state.excluded,finishedOn:state.finishedOn});
const currentDate = () => addDays(state.surgeryDate,state.day);
const currentEvents = () => state.hasPlan ? scheduleForDate(planConfig(),currentDate()) : [];
const reviewCopy = {
  setup:['A plan built<br>together.','A guided conversation gives every treatment a purpose. Staff and patient agree on what belongs in the plan.'],
  daily:['Your day.<br>Made clear.','The next step is always obvious. Care tasks, progress, and milestones each have their own place.'],
  milestones:['See what’s<br>ahead.','The important moments, in one quick reference. Less searching for when a restriction ends.'],
  products:['Keep the<br>care going.','Useful refill reminders and future visits appear as part of the patient’s care journey.'],
  questions:['A question.<br>With context.','Each question stays connected to the treatment that prompted it, ready for the clinic team.'],
};
const content = document.querySelector('#phone-content');
const bottomNav = document.querySelector('.bottom-nav');

function dateAt(day, month) {
  if (!state.surgeryDate) return month ? `Month ${month}` : `Day ${day}`;
  return formatDate(month?addMonths(state.surgeryDate,month):addDays(state.surgeryDate,day),{month:'short',day:'numeric'});
}
function switchScene(scene) {
  state.scene = Object.hasOwn(reviewCopy,scene) ? scene : 'daily';
  closeDialog(); render(); content.scrollTop=0;
}
function render() {
  document.querySelectorAll('[data-scene]').forEach(b=>{b.classList.toggle('active',b.dataset.scene===state.scene);b.setAttribute('aria-current',b.dataset.scene===state.scene?'page':'false');});
  document.querySelector('#review-title').innerHTML=reviewCopy[state.scene][0];
  document.querySelector('#review-description').textContent=reviewCopy[state.scene][1];
  bottomNav.innerHTML=[['daily','calendar','Today'],['milestones','flag','Milestones'],['products','bag','My care'],['questions','chat','Questions']].map(([id,i,label])=>`<button data-go="${id}" class="${state.scene===id?'active':''}" ${state.scene===id?'aria-current="page"':''}>${icon(i)}${label}</button>`).join('');
  const screens={setup:renderSetup,daily:renderDaily,milestones:renderMilestones,products:renderProducts,questions:renderQuestions};
  content.innerHTML=`<div class="screen-enter">${screens[state.scene]()}</div>`;
  if(state.scene==='products'&&(!state.hasPlan||!recommendationsForPlan(planConfig()).some(t=>t.id==='serum'))){
    const optional=content.querySelector('.optional-product');
    optional?.previousElementSibling?.remove(); optional?.remove();
  }
}
function renderDaily() {
  if(!state.hasPlan)return noPlanScreen();
  const events=currentEvents(),tasks=events.filter(t=>!['milestone','optional'].includes(t.kind));
  const optional=events.filter(t=>t.kind==='optional');
  const visibleTasks=events.filter(t=>t.kind!=='milestone');
  const milestones=milestonesForPlan(planConfig()).filter(m=>m.day===state.day);
  const completed=tasks.filter(t=>state.done.has(t.occurrenceId)).length;
  const percent=tasks.length?completed/tasks.length*100:0;
  const groups=new Map();
  for(const t of visibleTasks){const key=formatTime(t.time);if(!groups.has(key))groups.set(key,[]);groups.get(key).push(t);}
  const first=Math.max(0,state.day-2);
  return `<div class="hero"><p class="eyebrow">${formatDate(currentDate(),{weekday:'long',month:'long',day:'numeric',year:'numeric'})}</p><div class="hero-row"><div><h2>Your daily care.</h2><p>${state.name?`One step at a time, ${esc(state.name.split(' ')[0])}.`:'One step at a time.'}</p></div><div class="progress-ring" style="background:conic-gradient(var(--lime) 0 ${percent}%,#425770 ${percent}% 100%)"><strong>${completed}<span style="font-weight:400;color:#cfdded"> / ${tasks.length}</span></strong><small>COMPLETED</small></div></div></div>
    <div class="day-strip">${Array.from({length:7},(_,i)=>first+i).map(d=>{const date=addDays(state.surgeryDate,d);return `<button data-day="${d}" class="${d===state.day?'active':''}" aria-label="Care for ${formatDate(date,{weekday:'long',month:'long',day:'numeric',year:'numeric'})}"><span>${formatDate(date,{weekday:'short'}).toUpperCase()}</span><strong>${formatDate(date,{day:'numeric'})}</strong><small>${formatDate(date,{month:'short'}).toUpperCase()}</small></button>`;}).join('')}</div>
    <div class="care-date-controls"><button data-day="${Math.max(0,state.day-1)}" aria-label="Previous day">←</button><label for="care-date">Jump to date</label><input type="date" id="care-date" min="${state.surgeryDate}" value="${currentDate()}"><button data-day="${state.day+1}" aria-label="Next day">→</button></div>
    <div class="content-pad">${milestones.length===1?`<button class="milestone-banner" data-go="milestones"><span class="banner-icon">${icon('flag')}</span><span><small>TODAY’S MILESTONE</small><strong>${esc(milestones[0].title)}</strong></span><span>↗</span></button>`:milestones.length>1?`<details class="daily-milestones"><summary class="milestone-banner"><span class="banner-icon">${icon('flag')}</span><span><small>TODAY’S MILESTONES</small><strong>${milestones.length} moments in your care plan</strong></span><span>⌄</span></summary><div>${milestones.map(m=>`<p><strong>${esc(m.title)}</strong><br><small>${esc(m.description)}</small></p>`).join('')}<button class="section-link" data-go="milestones">View all milestones →</button></div></details>`:''}
    <div class="section-heading"><h3>Your daily care</h3><span>${tasks.length} scheduled${optional.length?` · ${optional.length} optional`:''}</span></div>${[...groups].map(([time,items])=>`<div class="time-label">${icon('clock')} ${time.toUpperCase()}</div>${items.map(taskCard).join('')}`).join('')||'<p class="small-copy">No tasks scheduled for this day.</p>'}
    <button class="secondary" data-go="milestones" style="margin-top:20px">View all milestones →</button></div>`;
}
function noPlanScreen(){return `<div class="page-heading"><p class="eyebrow">YOUR PERSONAL CARE PLAN</p><h2>Start with<br>your surgery date.</h2><p>Complete staff setup and generate the selected plan to see the care scheduled for each day.</p></div><div class="content-pad"><button class="primary" data-go="setup">Open staff setup <span>→</span></button></div>`;}
function taskCard(t) {
  const done=state.done.has(t.occurrenceId);
  return `<div class="task ${done?'done':''}"><span class="task-icon ${t.tone}">${icon(t.icon)}</span><button class="task-main" data-detail="${esc(t.occurrenceId)}"><strong>${t.name}</strong>${t.kind==='optional'?'<span class="optional-badge">Optional · if needed</span>':''}<small>${esc(t.instructions)}</small></button><button class="complete" data-complete="${esc(t.occurrenceId)}" aria-label="${done?'Undo completion of':'Mark complete:'} ${t.name} ${formatTime(t.time)}${t.kind==='optional'?' — optional, if needed':''}" aria-pressed="${done}">${done?icon('check'):''}</button></div>`;
}
function renderSetup() { return setupView({state,esc,icon,dateAt}); }
function renderMilestones() { return milestoneView({state,config:state.hasPlan?planConfig():null,icon,esc,noPlanScreen}); }
function renderProducts() {
  return `<div class="product-hero"><p class="eyebrow">CARE THAT KEEPS UP WITH YOU</p><h2>Your routine.<br>Well supplied.</h2><p>Products and follow-ups, right when they’re useful.</p></div><div class="content-pad"><div class="section-heading"><h3>Time to check your supply</h3><span>${icon('bag')}</span></div><article class="refill-card"><div class="refill-photo"><img src="assets/shampoo.jpg" alt="Hairpower Anti Hair Loss Shampoo product packaging"><span class="photo-badge">YOUR ROUTINE</span></div><div class="refill-body"><h3>Anti Hair Loss Shampoo</h3><p>A little planning keeps your routine on track.</p><div class="stock-row"><span>Estimated supply</span><span id="supply-label">About 7 days left</span></div><div class="stock-bar"><span id="supply-bar"></span></div><button class="primary" data-refill>Explore refill <span>→</span></button><button class="section-link" data-supply>I still have enough</button></div></article><div class="section-heading"><h3>Your next clinic visit</h3></div><div class="followup-card"><p class="eyebrow">MONTH 6 · ${state.surgeryDate?dateAt(null,6):'FOLLOW-UP'}</p><h3>Let’s plan your PRP visit.</h3><p>Keep your next appointment in view, wherever life takes you.</p><button class="primary lime-button" data-book>Request an appointment <span>↗</span></button></div><div class="section-heading" style="margin-top:25px"><h3>For your ongoing care</h3></div><div class="optional-product"><img src="assets/serum.jpg" alt="Hairpower Anti Hair Loss Serum packaging"><div><strong>Anti Hair Loss Serum</strong><small>A suitable option you can revisit.</small><button data-product="serum">Learn about this product →</button></div></div></div>`;
}
function renderQuestions() {
  return `<div class="page-heading"><p class="eyebrow">CONNECTED TO YOUR CARE</p><h2>Your questions.<br>In one place.</h2><p>Ask from any care step. The context comes with it.</p></div><div class="content-pad" style="padding-top:5px"><article class="question-card"><span class="tag">AWAITING RESPONSE</span><h3>Can I move my morning routine to a later time?</h3><small>About: Hydrating shampoo<br>Sample question · visual preview</small></article><div class="tip-card">${icon('chat')}<div><strong>Less explaining. More clarity.</strong><p>Each question includes its related treatment, so your clinic team knows where to start.</p></div></div></div>`;
}

let previousFocus;
function dialog(html) {
  previousFocus=document.activeElement;
  document.querySelector('#dialog-root').innerHTML=`<div class="dialog-backdrop"><section class="dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title"><button class="dialog-close" aria-label="Close dialog">×</button>${html}</section></div>`;
  document.querySelector('.dialog-close').focus();
}
function closeDialog() { document.querySelector('#dialog-root').innerHTML=''; if(previousFocus?.isConnected)previousFocus.focus(); }
function toast(message) { const t=document.querySelector('#toast'); t.textContent=message;t.classList.add('visible');clearTimeout(toast.timer);toast.timer=setTimeout(()=>t.classList.remove('visible'),3200); }
function showDetails(id) {
  const t=currentEvents().find(t=>t.occurrenceId===id)||treatments.find(t=>t.id===id);
  if(!t)return;
  dialog(`<p class="eyebrow">${t.occurrenceId?`${formatDate(t.date,{weekday:'short',month:'short',day:'numeric',year:'numeric'})} · ${formatTime(t.time)}`:'YOUR CARE ITEM'}</p><h2 id="dialog-title">${t.name}</h2><p>${esc(t.instructions)}</p><div class="facts"><div><small>START</small><strong>${t.start}</strong></div><div><small>DURATION</small><strong>${t.duration}</strong></div></div><button class="primary" data-ask="${t.itemId||t.id}">Ask a question ${icon('chat')}</button>`);
}
document.addEventListener('click',e=>{
  const b=e.target.closest('button');
  if(e.target.classList.contains('dialog-backdrop')||b?.classList.contains('dialog-close')){closeDialog();return;}
  if(!b)return;
  if(b.dataset.scene){switchScene(b.dataset.scene);return;}
  if(b.dataset.go){switchScene(b.dataset.go);return;}
  if(b.hasAttribute('data-generate')){state.hasPlan=true;state.day=1;state.done.clear();switchScene('daily');toast('Daily plan generated from the selected date and items.');return;}
  if(b.dataset.jumpDay){state.day=Number(b.dataset.jumpDay);switchScene('daily');return;}
  if(b.dataset.day){state.day=Number(b.dataset.day);render();return;}
  if(b.dataset.complete){const k=b.dataset.complete;state.done.has(k)?state.done.delete(k):state.done.add(k);const scroll=content.scrollTop;render();content.scrollTop=scroll;return;}
  if(b.dataset.detail){showDetails(b.dataset.detail);return;}
  if(b.dataset.setupStep){state.setupStep=Number(b.dataset.setupStep);render();content.scrollTop=0;return;}
  if(b.dataset.stage){state.stage=Number(b.dataset.stage);render();content.scrollTop=0;return;}
  if(b.dataset.include){state.included.add(b.dataset.include);delete state.excluded[b.dataset.include];state.hasPlan=false;const scroll=content.scrollTop;render();content.scrollTop=scroll;return;}
  if(b.dataset.exclude){const t=treatments.find(t=>t.id===b.dataset.exclude);dialog(`<p class="eyebrow">A CHOICE WITH CONTEXT</p><h2 id="dialog-title">Why leave out<br>${t.name}?</h2><p>This helps keep future suggestions relevant to the patient.</p><button class="option" data-reason="unsuitable" data-id="${t.id}"><strong>Not suitable for this patient</strong><small>Exclude from the plan and never suggest it as a product recommendation.</small></button><button class="option" data-reason="declined" data-id="${t.id}"><strong>Patient declined or hasn’t purchased</strong><small>Exclude from the plan. It can appear as an optional recommendation later.</small></button>`);return;}
  if(b.dataset.reason){state.included.delete(b.dataset.id);state.excluded[b.dataset.id]=b.dataset.reason;state.hasPlan=false;const scroll=content.scrollTop;closeDialog();render();content.scrollTop=scroll;return;}
  if(b.dataset.filter){state.filter=b.dataset.filter;render();return;}
  if(b.hasAttribute('data-refill')){dialog('<p class="eyebrow">REFILL PREVIEW</p><h2 id="dialog-title">Keep your routine<br>going.</h2><p>Anti Hair Loss Shampoo</p><p>The next checkpoint adds the refill request and confirmation flow. No purchase takes place in this visual preview.</p><button class="primary" data-close>Back to my care <span>→</span></button>');return;}
  if(b.hasAttribute('data-book')){dialog(`<p class="eyebrow">FOLLOW-UP PREVIEW</p><h2 id="dialog-title">Your next chapter<br>of care.</h2><p>PRP follow-up · ${dateAt(null,6)}</p><p>The appointment-request form and demo confirmation will be added in checkpoint 5.</p><button class="primary" data-close>Back to the preview <span>→</span></button>`);return;}
  if(b.hasAttribute('data-supply')){document.querySelector('#supply-label').textContent='Supply looks good';document.querySelector('#supply-label').style.color='#286025';document.querySelector('#supply-bar').style.cssText='width:70%;background:#2160ee';toast('Supply estimate updated for this preview.');return;}
  if(b.dataset.product){showDetails(b.dataset.product);return;}
  if(b.dataset.ask){const t=treatments.find(t=>t.id===b.dataset.ask);dialog(`<p class="eyebrow">ABOUT ${t.name.toUpperCase()}</p><h2 id="dialog-title">What would you<br>like to ask?</h2><label for="question-text">Your question</label><textarea id="question-text" placeholder="Write your question here…"></textarea><p class="small-copy">Question submission and saving come in checkpoint 4.</p><button class="primary" data-go="questions">Preview my questions <span>→</span></button>`);return;}
  if(b.hasAttribute('data-close')){closeDialog();return;}
  if(b.id==='reset-preview'){state.surgeryDate='';state.name='';state.setupStep=0;state.stage=0;state.day=1;state.done.clear();state.excluded={};state.included=new Set(ALL_IDS);state.finishedOn={};state.hasPlan=false;state.filter='all';switchScene('setup');toast('Preview reset. Surgery date is empty.');}
});
document.addEventListener('submit',e=>{
  if(e.target.id!=='setup-form')return;
  e.preventDefault();
  const form=new FormData(e.target);state.name=String(form.get('patientName')).trim();state.surgeryDate=String(form.get('surgeryDate'));
  state.setupStep=1;render();content.scrollTop=0;
});
document.addEventListener('input',e=>{
  if(e.target.id==='patient-name')state.name=e.target.value;
  if(e.target.id==='surgery-date'){state.surgeryDate=e.target.value;state.hasPlan=false;}
  if(e.target.id.startsWith('finish-')){const id=e.target.id.slice(7);if(e.target.value)state.finishedOn[id]=e.target.value;else delete state.finishedOn[id];state.hasPlan=false;}
});
document.addEventListener('change',e=>{
  if(e.target.id==='care-date'&&e.target.value){state.day=Math.max(0,daysBetween(state.surgeryDate,e.target.value));render();content.scrollTop=0;}
});
document.addEventListener('keydown',e=>{
  const modal=document.querySelector('.dialog');
  if(!modal)return;
  if(e.key==='Escape'){closeDialog();return;}
  if(e.key==='Tab'){
    const focusables=[...modal.querySelectorAll('button,input,textarea,a[href]')].filter(el=>!el.disabled);
    const first=focusables[0],last=focusables.at(-1);
    if(e.shiftKey&&document.activeElement===first){last.focus();e.preventDefault();}
    else if(!e.shiftKey&&document.activeElement===last){first.focus();e.preventDefault();}
  }
});
document.querySelector('.wordmark').addEventListener('click',e=>{e.preventDefault();switchScene('daily');});
render();
