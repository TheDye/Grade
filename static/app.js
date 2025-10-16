// Grade calc - pure client-side grade calculator
console.debug('Grade calc app.js loaded');
const SUBJECTS = [
  {id:'math', name:'Mathematics'},
  {id:'physics', name:'Physics'},
  {id:'english', name:'English'},
  {id:'history', name:'History'}
];

// cache selectors used often to avoid repeated DOM queries
const SELECTORS = {
  subjectSelect: () => document.getElementById('subjectSelect'),
  fieldsContainer: () => document.getElementById('fieldsContainer'),
  statusMsg: () => document.getElementById('statusMsg'),
  resultValue: () => document.getElementById('resultValue'),
  resultDetails: () => document.getElementById('resultDetails')
};

function loadSubjects(){
  const sel = SELECTORS.subjectSelect(); sel.innerHTML = '';
  SUBJECTS.forEach(s=>{ const opt = document.createElement('option'); opt.value=s.id; opt.textContent=s.name; sel.appendChild(opt); });
}

function showStatus(msg, timeout=2000){ const status=document.getElementById('statusMsg'); if(!status) return; status.textContent=msg; if(timeout>0) setTimeout(()=>status.textContent='', timeout); }

function makeFields(){
  const n = Math.max(1, parseInt(document.getElementById('numGrades').value)||1);
  const cont = SELECTORS.fieldsContainer();
  // build rows in a document fragment to minimize reflows
  const frag = document.createDocumentFragment();
  for(let i=0;i<n;i++){
    const row = document.createElement('div');
    row.className = 'row g-2 mb-3 align-items-center';
    const col1 = document.createElement('div'); col1.className = 'col-6';
    const gInput = document.createElement('input'); gInput.className = 'form-control'; gInput.placeholder = `Grade ${i+1}`; gInput.setAttribute('data-grade',''); gInput.setAttribute('inputmode','decimal');
    col1.appendChild(gInput);
    const col2 = document.createElement('div'); col2.className = 'col-6';
    const wInput = document.createElement('input'); wInput.className = 'form-control'; wInput.placeholder = `Weight ${i+1} (decimal)`; wInput.setAttribute('data-weight',''); wInput.setAttribute('inputmode','decimal');
    col2.appendChild(wInput);
    row.appendChild(col1); row.appendChild(col2);
    frag.appendChild(row);
  }
  // replace container contents in one operation
  cont.innerHTML = '';
  cont.appendChild(frag);
  attachEnterNavigation();
  showStatus(`Created ${n} field(s)`, 1800);
  const first = document.querySelector('[data-grade]'); if(first){ first.focus(); first.select && first.select(); }
}

function parseTXTAndPopulate(text){
  const lines = text.split(/\r?\n/).map(l=>l.trim()).filter(Boolean);
  const pairs = lines.map(l=>{ const parts = l.split(','); return [(parts[0]||'').trim(), (parts[1]||'').trim()]; });
  document.getElementById('numGrades').value = pairs.length || 1;
  makeFields();
  const gradeEls = [...document.querySelectorAll('[data-grade]')];
  const weightEls = [...document.querySelectorAll('[data-weight]')];
  pairs.forEach((p,i)=>{ if(gradeEls[i]) gradeEls[i].value = p[0]||''; if(weightEls[i]) weightEls[i].value = p[1]||''; });
}

function attachEnterNavigation(){
  const grades = [...document.querySelectorAll('[data-grade]')];
  const weights = [...document.querySelectorAll('[data-weight]')];
  grades.forEach((g,i)=>{ g.onkeydown=null; g.addEventListener('keydown', e=>{ if(e.key==='Enter'){ e.preventDefault(); if(weights[i]){ weights[i].focus(); weights[i].select && weights[i].select(); } else if(grades[i+1]){ grades[i+1].focus(); grades[i+1].select && grades[i+1].select(); } } }); });
  weights.forEach((w,i)=>{ w.onkeydown=null; w.addEventListener('keydown', e=>{ if(e.key==='Enter'){ e.preventDefault(); if(grades[i+1]){ grades[i+1].focus(); grades[i+1].select && grades[i+1].select(); } else { const calc=document.getElementById('calculateBtn'); if(calc) calc.focus(); } } }); });
}

function calculate(){
  console.debug('calculate() called');
  showStatus('Calculating...', 1500);
  const gradeEls = [...document.querySelectorAll('[data-grade]')];
  const weightEls = [...document.querySelectorAll('[data-weight]')];
  try{
    const resultValue = document.getElementById('resultValue');
    const resultDetails = document.getElementById('resultDetails');
    const box = document.querySelector('.result-box');

    // Build arrays of valid (grade, weight) pairs. Skip empty grade entries.
    const pairs = [];
    let usedDefaultWeights = false;
    for(let i=0;i<gradeEls.length;i++){
      const gStr = (gradeEls[i].value || '').trim();
      const wStr = (weightEls[i] && weightEls[i].value) ? weightEls[i].value.trim() : '';
      if(gStr === '') continue; // skip entries without a grade
      const gNum = parseFloat(gStr);
      if(Number.isNaN(gNum)) continue; // skip invalid grades
      let wNum = parseFloat(wStr);
      if(wStr === '' || Number.isNaN(wNum)) { wNum = 0.5; usedDefaultWeights = true; } // default missing/invalid weight to 0.5
      pairs.push({ g: gNum, w: wNum });
    }

    if(pairs.length === 0){
      resultValue.textContent = '';
      resultDetails.textContent = 'No valid grades entered.';
      return;
    }

    const totalWeight = pairs.reduce((s,p)=>s + p.w, 0);
    if(totalWeight === 0){ resultValue.textContent=''; resultDetails.textContent='Total weight cannot be zero.'; return; }

    const weighted = pairs.reduce((s,p)=>s + p.g * p.w, 0);
    const avg = Math.round((weighted / totalWeight) * 100) / 100;

    resultValue.textContent = `${avg}`;
    // Custom messages: if average below 60 show a blunt message, otherwise a positive one
    if(avg < 60){
      resultDetails.textContent = `GO FIX YOUR GRADES NOOB` + (usedDefaultWeights ? ' (nezaa.sx)' : '');
    } else {
      resultDetails.textContent = `YOU'RE GOOD` + (usedDefaultWeights ? ' (nezaa.sx)' : '');
    }
    // keep result visible until next calculation
    box.classList.add('visible');
  }catch(err){
    console.error('Error in calculate():', err);
    showStatus('Error calculating — see console', 4000);
    const resultDetails = document.getElementById('resultDetails');
    if(resultDetails) resultDetails.textContent = 'An unexpected error occurred.';
  }
}

function init(){
  loadSubjects(); makeFields();
  // register service worker from JS (deferred) for faster initial paint
  if('serviceWorker' in navigator){
    navigator.serviceWorker.register('/static/sw.js').then(()=>console.debug('SW registered')).catch(e=>console.warn('SW failed', e));
  }
  // Add / Remove single field handlers
  const addBtn = document.getElementById('addField');
  if(addBtn) addBtn.addEventListener('click', ()=>{
    const nEl = document.getElementById('numGrades');
    nEl.value = Math.max(1, (parseInt(nEl.value)||1) + 1);
    makeFields();
  });
  const removeBtn = document.getElementById('removeField');
  if(removeBtn) removeBtn.addEventListener('click', ()=>{
    const nEl = document.getElementById('numGrades');
    nEl.value = Math.max(1, (parseInt(nEl.value)||1) - 1);
    makeFields();
  });
  const makeBtn = document.getElementById('makeFields'); if(makeBtn) makeBtn.addEventListener('click', makeFields);
  const calcBtn = document.getElementById('calculateBtn'); if(calcBtn) calcBtn.addEventListener('click', calculate);
  if(calcBtn){
    calcBtn.addEventListener('keydown', (e)=>{ if(e.key === 'Enter'){ e.preventDefault(); console.debug('Enter on calculateBtn'); calculate(); } });
    // also support Space key
    calcBtn.addEventListener('keydown', (e)=>{ if(e.key === ' '){ e.preventDefault(); calculate(); } });
  }
  const importBtn = document.getElementById('importBtn'); if(importBtn) importBtn.addEventListener('click', ()=>{ const input=document.getElementById('fileUpload'); if(!input.files||!input.files[0]){ alert('Choose a TXT file first'); return; } const reader=new FileReader(); reader.onload=e=>parseTXTAndPopulate(e.target.result); reader.readAsText(input.files[0]); });
  const exportBtn = document.getElementById('exportBtn'); if(exportBtn) exportBtn.addEventListener('click', ()=>{ const grades=[...document.querySelectorAll('[data-grade]')].map(i=>i.value||''); const weights=[...document.querySelectorAll('[data-weight]')].map(i=>i.value||''); const subject=document.getElementById('subjectSelect').value||'subject'; const ts=new Date().toISOString().replace(/[:.]/g,'-'); const header=`# subject:${subject} timestamp:${ts}\n`; const lines=grades.map((g,i)=>`${g},${weights[i]||''}`); const blob=new Blob([header+lines.join('\n')],{type:'text/plain'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=`grades-${subject}-${ts}.txt`; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url); });
  const toggleBtn = document.getElementById('toggleTheme'); if(toggleBtn) toggleBtn.addEventListener('click', ()=>{ document.body.classList.toggle('dark-mode'); toggleBtn.textContent = document.body.classList.contains('dark-mode')? 'Light':'Dark'; });

  // PWA install prompt handling (show native prompt when available)
  let deferredPrompt;
  window.addEventListener('beforeinstallprompt', (e)=>{
    e.preventDefault(); deferredPrompt = e; const banner = document.querySelector('.install-banner'); if(banner) banner.textContent = 'Tap the browser menu and choose "Install" to add to your home screen.';
    // Optionally, you could show a custom install button and call deferredPrompt.prompt()
  });
}

window.addEventListener('load', init);
