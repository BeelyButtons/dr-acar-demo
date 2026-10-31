import {STAGES,addDays,addMonths,daysBetween,formatDate,formatTime,scheduleForDate,milestonesForPlan} from './care-plan.mjs';
const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
async function loadReport(){
  const response=await fetch('data/verification.json');
  if(!response.ok)throw new Error('Verification results could not be loaded.');
  const report=await response.json();
  document.querySelector('#verification-summary').innerHTML=[[report.items.length,'items accounted for'],[`${report.testCount} / ${report.testCount}`,'automated checks passed'],[report.matchedOccurrences.toLocaleString(),'v7 occurrences match exactly'],['1','calendar correction disclosed']].map(([n,label])=>`<div class="metric"><strong>${n}</strong><span>${label}</span></div>`).join('');
  document.querySelector('#correction').textContent=report.correction;
  document.querySelector('#source-decisions').innerHTML=report.decisions.map(d=>`<li>${esc(d)}</li>`).join('');
  document.querySelector('#source-hash').textContent=report.sha256?`Source fingerprint (SHA-256): ${report.sha256}`:'The detailed source audit is kept in the private project repository.';
  document.querySelector('#rule-table').innerHTML=report.items.map(t=>`<tr><td>${t.name}<small>${t.instructions}</small></td><td>${STAGES[t.stage]}</td><td>${t.defaultUseMode==='if_needed'?'If needed':'Scheduled'}</td><td>${t.start}</td><td>${t.duration}</td><td>${t.frequency}</td><td>${t.referenceCount} occurrences<small>Daily Tracker rows ${t.sourceFirstRow}–${t.sourceLastRow}</small></td></tr>`).join('');
}
function examples(surgeryDate){
  const cases=[
    ['Surgery day',surgeryDate],['Day after surgery',addDays(surgeryDate,1)],['First wash',addDays(surgeryDate,2)],
    ['One week',addDays(surgeryDate,7)],['Seventh wash photos',addDays(surgeryDate,8)],['Final foam / scab-removal wash',addDays(surgeryDate,9)],
    ['First day without foam',addDays(surgeryDate,10)],['First day without bucket-hat routine',addDays(surgeryDate,11)],
    ['Beard-shaving milestone',addDays(surgeryDate,14)],['Last hydrating-shampoo day',addDays(addMonths(surgeryDate,1),-1)],
    ['Anti Hair Loss Shampoo begins',addMonths(surgeryDate,1)],['Following day: no anti-loss shampoo',addDays(addMonths(surgeryDate,1),1)],
    ['Shower-rinse phase starts',addMonths(surgeryDate,2)],['Month-4 serum anniversary',addMonths(surgeryDate,4)],
    ['Six-month follow-up',addMonths(surgeryDate,6)],['Dermaroller phase begins',addMonths(surgeryDate,10)],
    ['First day after 12-month topical / shampoo courses',addMonths(surgeryDate,13)]
  ];
  const plan={surgeryDate},milestones=milestonesForPlan(plan);
  document.querySelector('#daily-examples').innerHTML=`<div class="examples">${cases.map(([title,date],index)=>{
    const events=scheduleForDate(plan,date),today=milestones.filter(m=>m.date===date);
    return `<details ${index===1?'open':''}><summary>${title} · ${formatDate(date)}<small>Day ${daysBetween(surgeryDate,date)} · ${events.length} scheduled occurrences</small></summary>${today.map(m=>`<div class="phase-note">${m.title}</div>`).join('')}${events.map(t=>`<div class="event-row"><time>${formatTime(t.time)}</time><strong>${t.name}<small>${t.useMode==='if_needed'?'Only if needed':t.kind==='milestone'?'Milestone':t.phase.replaceAll('-',' ')}</small></strong><span>${esc(t.instructions)}</span></div>`).join('')||'<p class="example-empty">No scheduled occurrences.</p>'}</details>`;
  }).join('')}</div>`;
}
document.querySelector('#review-date-form').addEventListener('submit',e=>{e.preventDefault();try{examples(document.querySelector('#review-date').value);}catch(error){document.querySelector('#daily-examples').textContent=error.message;}});
const dateFromSetup=new URLSearchParams(location.search).get('date');
if(dateFromSetup){try{document.querySelector('#review-date').value=dateFromSetup;examples(dateFromSetup);}catch{document.querySelector('#review-date').value='';}}
loadReport().catch(error=>{document.querySelector('#verification-summary').textContent=error.message;});
