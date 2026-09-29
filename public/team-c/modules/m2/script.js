const API = { model: '', federated: '', shap: '' };

async function apiGet(base, path) {
  const r = await fetch(base + path);
  if (!r.ok) throw new Error(`${r.status} ${path}`);
  return r.json();
}

function pct(v) { return `${Number(v ?? 0).toFixed(1)}%`; }
function setBar(id, value) { const el=document.getElementById(id); if(el){el.style.width=`${Math.max(0,Math.min(100,Number(value||0)))}%`; el.textContent='';} }
function setText(id, value) { const e=document.getElementById(id); if(e)e.textContent=value; }

async function loadAccuracyData() {
  try {
    const d=await apiGet(API.model,'/api/c/model-accuracy');
    setText('accuracy',pct(d.accuracy)); setText('precision',pct(d.precision)); setText('recall',pct(d.recall)); setText('f1',pct(d.f1Score));
    setText('accuracyText',pct(d.accuracy)); setText('precisionText',pct(d.precision)); setText('recallText',pct(d.recall)); setText('f1Text',pct(d.f1Score));
    setBar('accuracyBar',d.accuracy); setBar('precisionBar',d.precision); setBar('recallBar',d.recall); setBar('f1Bar',d.f1Score);
    setText('accuracyStatus','Backend Connected'); setText('accuracyNote',`Random Forest • ${d.trainingSamples} training samples • ${d.testingSamples} testing samples`);
  } catch(e) { console.error(e); setText('accuracyStatus','Ready'); setText('accuracyNote','Live data will appear when records are available.'); }
}

let convergenceChart;
async function loadFederatedData() {
  try {
    const d=await apiGet(API.federated,'/api/c/federated-convergence');
    setText('currentRound',d.current_round ?? 0); setText('globalAccuracy',pct((d.global_accuracy||0)*100)); setText('convergenceStatus',d.convergence_status||'NO DATA'); setText('convergenceNote',d.total_rounds ? `Latest global model: ${d.global_model_version}` : 'Click Train to create federated rounds.');
    const rounds=await apiGet(API.federated,'/api/c/federated-convergence/rounds');
    const canvas=document.getElementById('convergenceChart');
    if(canvas && window.Chart){ if(convergenceChart) convergenceChart.destroy(); convergenceChart=new Chart(canvas,{type:'line',data:{labels:rounds.map(r=>`Round ${r.round_number}`),datasets:[{label:'Global Accuracy',data:rounds.map(r=>Number(r.global_accuracy||0)*100),tension:.25}]},options:{responsive:true,scales:{y:{beginAtZero:true,max:100}}}});}
    return d;
  } catch(e) { console.error(e); setText('convergenceStatus','Ready'); }
}

async function loadDashboard() {
  try { const d=await apiGet(API.model,'/api/c/model-accuracy'); setText('dashAccuracy',pct(d.accuracy)); } catch(e){setText('dashAccuracy','--');}
  try { const d=await apiGet(API.federated,'/api/c/federated-convergence'); setText('dashRound',d.current_round ?? 0); } catch(e){setText('dashRound','--');}
  try { const d=await apiGet(API.shap,'/api/c/shap-validity/health'); setText('dashShap',d.status==='UP'?'Ready':'Down'); } catch(e){setText('dashShap','Ready');}
  const mode=document.getElementById('apiMode'); if(mode) mode.textContent='Live Java REST APIs';
}

async function loadShapData() {
  const button=document.getElementById('predictButton'); if(button){button.disabled=true;button.textContent='Predicting...';}
  try {
    const fields=['age','sysBP','totChol','BMI','glucose']; const patient={};
    for(const f of fields){ const e=document.getElementById(f); const v=Number(e?.value); if(!Number.isFinite(v)){alert(`Please enter ${f}.`);return;} patient[f]=v; }
    const r=await fetch(`${API.shap}/api/c/shap-validity/explain`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(patient)});
    if(!r.ok) throw new Error(`SHAP ${r.status}`); const d=await r.json();
    setText('prediction',d.prediction||'--'); setText('confidence',d.confidence!=null?pct(d.confidence):'--'); setText('validityScore',d.validityScore!=null ? `${Number(d.validityScore).toFixed(0)}%` : '--'); setText('shapMessage',d.message||'');
    setText('shapStatus',d.finalResult==='VALID'?'Explanation Valid':(d.finalResult||'Review Required'));
    setText('validityTitle',d.finalResult==='VALID'?'Explanation Valid':d.finalResult==='PARTIALLY VALID'?'Explanation Partially Valid':'Explanation Invalid');
    const list=document.getElementById('featureList'); if(list){list.innerHTML=''; const max=Math.max(...(d.features||[]).map(x=>Math.abs(Number(x.value))),.01); for(const f of d.features||[]){const v=Number(f.value); const row=document.createElement('div'); row.className='feature-row'; row.innerHTML=`<div class="feature-info"><span>${escapeHtml(f.name)}</span><b class="${v>=0?'positive':'negative'}">${v>=0?'+':''}${v.toFixed(4)}</b></div><div class="feature-bar"><div class="${v>=0?'feature-positive':'feature-negative'}" style="width:${Math.min(100,Math.abs(v)/max*100)}%"></div></div>`; list.appendChild(row);}}
  } catch(e){console.error(e);setText('shapStatus','Ready');setText('shapMessage','Enter patient details and run the explanation.');} finally {if(button){button.disabled=false;button.textContent='Search / Predict';}}
}
function resetShapPage(){ ['prediction','confidence','validityScore'].forEach(id=>setText(id,'--')); setText('shapStatus','Waiting for prediction'); setText('validityTitle','Waiting for Explanation'); setText('shapMessage','Enter patient details and click Search / Predict.'); const l=document.getElementById('featureList');if(l)l.innerHTML='<div class="text-muted">No SHAP feature contributions available.</div>'; }
function escapeHtml(s){return String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}

const loadPredictionData = loadDashboard;

window.addEventListener('DOMContentLoaded',()=>{
  if(document.getElementById('refreshAll')){loadDashboard();document.getElementById('refreshAll').onclick=loadDashboard;}
  if(document.getElementById('accuracyStatus')){loadAccuracyData();document.getElementById('refreshAccuracy')?.addEventListener('click',loadAccuracyData);}
  if(document.getElementById('currentRound')){loadFederatedData();document.getElementById('refreshConvergence')?.addEventListener('click',loadFederatedData);}
  if(document.getElementById('shapForm')){document.getElementById('shapForm').addEventListener('submit',e=>{e.preventDefault();loadShapData();});document.getElementById('refreshShap')?.addEventListener('click',resetShapPage);}
});
