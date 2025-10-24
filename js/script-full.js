// PhySphere - Full Script (extracted and adapted from original)
// --- NAVIGATION ---
document.querySelectorAll('.tab-button').forEach(btn=>btn.addEventListener('click',()=>{
  document.querySelectorAll('.page').forEach(p=>p.classList.add('hidden'));
  document.getElementById(btn.dataset.page+'-page').classList.remove('hidden');
  document.querySelectorAll('.tab-button').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  // if vlab tab opened, ensure canvas resizes & redraws after layout
  if(btn.dataset.page === 'vlab'){
    setTimeout(()=>{ try{ if(window.vlabRefresh) window.vlabRefresh({autoplay:true}); }catch(e){} },120);
  }
  // persist active page to session storage
  try{ sessionStorage.setItem('pysphere_active_page', btn.dataset.page); }catch(e){}
}));

// --- Quiz Data: separate QUIZZES per topic ---
function shuffleArray(arr){return arr.slice().sort(()=>Math.random()-0.5)}

const QUIZZES = {
  getaran:[
    {type:'mcq', part:'Getaran & Gelombang', q:'Gelombang longitudinal memiliki getaran pada arah?', options:['Sejajar arah rambat','Tegak lurus arah rambat','Melingkar','Mundar'], a:'Sejajar arah rambat', explanation: 'Gelombang longitudinal memiliki getaran partikel medium sejajar arah rambat gelombang, contohnya gelombang bunyi.'},
    {type:'order', part:'Getaran & Gelombang', q:'Urutkan tahap dasar analisis gelombang', items:shuffleArray(['Tentukan periode/ frekuensi','Identifikasi medium','Tuliskan persamaan gelombang','Analisis perambatan']), correct:['Identifikasi medium','Tuliskan persamaan gelombang','Tentukan periode/ frekuensi','Analisis perambatan'], explanation: 'Langkah awal biasanya mengenali medium dan sifatnya, kemudian menulis persamaan, menentukan periode/frekuensi, lalu menganalisis perambatan.'},
    {type:'short', part:'Getaran & Gelombang', q:'Satuan frekuensi (tulis singkat)', a:'Hz', explanation: 'Frekuensi diukur dalam Hertz (Hz), yaitu jumlah getaran per detik.'}
  ],
  ghs:[
    {type:'mcq', part:'GHS', q:'Pada GHS ideal, periode T bergantung pada?', options:['Amplitudo','Massa dan konstanta pegas','Hanya massa','Warna pegas'], a:'Massa dan konstanta pegas', explanation: 'Periode GHS pada pegas tergantung pada massa m dan konstanta pegas k: T = 2π√(m/k).'},
    {type:'order', part:'GHS', q:'Urutkan turunan dari simpangan untuk mendapatkan percepatan', items:shuffleArray(['y(t)','v(t)','a(t)']), correct:['y(t)','v(t)','a(t)'], explanation: 'Percepatan adalah turunan kedua dari posisi y(t): y → v (turunan pertama) → a (turunan kedua).'},
    {type:'short', part:'GHS', q:'Tuliskan simbol konstanta pegas', a:'k', explanation: 'Konstanta pegas biasanya dilambangkan dengan huruf k dalam hukum Hooke.'}
  ],
  bandul:[
    {type:'mcq', part:'Bandul', q:'Periode bandul ideal bergantung pada?', options:['Massa','Panjang tali','Amplitudo besar','Warna'], a:'Panjang tali', explanation: 'Untuk bandul sederhana pada sudut kecil, periode bergantung pada panjang tali L dan percepatan gravitasi g: T = 2π√(L/g).'},
    {type:'order', part:'Bandul', q:'Urutkan analisis bandul untuk menemukan periode', items:shuffleArray(['Tuliskan gaya tangensial','Linearize untuk sudut kecil','Tulis persamaan gerak','Hitung perioda']), correct:['Tuliskan gaya tangensial','Tulis persamaan gerak','Linearize untuk sudut kecil','Hitung perioda'], explanation: 'Analisis bandul dimulai dari gaya tangensial, menuliskan persamaan gerak, melakukan linearization untuk sudut kecil, lalu menghitung periode.'},
    {type:'short', part:'Bandul', q:'Satuan periode T (singkat)', a:'s', explanation: 'Periode diukur dalam satuan waktu, yaitu detik (s).'}
  ],
  pegas:[
    {type:'mcq', part:'Pegas', q:'Hukum Hooke menyatakan gaya berbanding lurus dengan?', options:['Kecepatan','Percepatan','Perubahan panjang Δx','Massa'], a:'Perubahan panjang Δx', explanation: 'Hukum Hooke menyatakan F = -k Δx, jadi gaya berbanding lurus dengan perubahan panjang pegas Δx.'},
    {type:'order', part:'Pegas', q:'Urutkan langkah analisis pegas: dari gaya ke periode', items:shuffleArray(['Tentukan gaya pemulih','Tulis persamaan gerak','Cari solusi harmonik','Hitung T']), correct:['Tentukan gaya pemulih','Tulis persamaan gerak','Cari solusi harmonik','Hitung T'], explanation: 'Analisis dimulai dari gaya pemulih (Hooke), menulis persamaan gerak, mencari solusi harmonik, lalu menghitung periode.'},
    {type:'short', part:'Pegas', q:'Jika k=10 N/m dan m=1 kg, berapa ω (rad/s)? (angka saja)', a:(Math.sqrt(10/1)).toFixed(3), explanation: 'Untuk pegas, ω = √(k/m). Dengan k=10 dan m=1, ω ≈ √10 ≈ 3.162.'}
  ]
};

// Create per-topic quiz controllers (4 independent sections)
const TOPICS = ['getaran','ghs','bandul','pegas'];

function makeQuizController(topic){
  const qdata = QUIZZES[topic] ? QUIZZES[topic].slice() : [];
  const storageKey = 'pysphere_quiz_' + topic;
  let idx = 0; let answersLocal = Array(qdata.length).fill(null); let timerId = null; let tleft = 120; let running=false;
  const container = document.getElementById('question-container-'+topic);
  const nav = document.getElementById('question-nav-'+topic);
  const timerEl = document.getElementById('timer-'+topic);

  // load persisted answers if available
  function loadPersist(){ try{ const raw = sessionStorage.getItem(storageKey); if(raw){ const parsed = JSON.parse(raw); if(Array.isArray(parsed)) answersLocal = parsed.concat([]).slice(0, qdata.length); } }catch(e){} }
  function persist(){ try{ sessionStorage.setItem(storageKey, JSON.stringify(answersLocal)); }catch(e){} updateNavAnswered(); }

  function updateTimerDisplay(){ if(timerEl) timerEl.textContent = `${String(Math.floor(tleft/60)).padStart(2,'0')}:${String(tleft%60).padStart(2,'0')}` }

  function updateNavAnswered(){ if(!nav) return; Array.from(nav.children).forEach((b,i)=>{ if(answersLocal[i] !== null && answersLocal[i] !== undefined && answersLocal[i] !== '') b.style.background = '#dcfce7'; else b.style.background = ''; }); }

  function renderNav(){ if(!nav) return; nav.innerHTML=''; qdata.forEach((_,i)=>{ const b=document.createElement('button'); b.className='px-2 py-1 border mr-1'; b.textContent=(i+1); b.addEventListener('click',()=> goto(i)); nav.appendChild(b); }); highlightNav(); updateNavAnswered(); }
  function highlightNav(){ if(!nav) return; Array.from(nav.children).forEach((b,i)=> b.style.opacity = i===idx ? '1' : '0.6'); }

  function goto(i){ idx=i; renderQuestion(); highlightNav(); }

  function makeQuestionCard(q, i, showAll){
    const card = document.createElement('div');
    card.className = 'question-card p-4 bg-white rounded-xl mb-3';
    card.id = `q-${topic}-${i}`;
    let html = '';
    html += `<div class="flex justify-between items-center"><div><div class="text-sm text-slate-500">Bagian: ${q.part||''}</div><h3 class="font-semibold text-slate-800">Soal ${i+1} / ${qdata.length}</h3></div>`;
    if(!showAll) html += `<div><button id='prev-${topic}' class='vlab-button bg-white border mr-2'>Sebelumnya</button><button id='next-${topic}' class='vlab-button bg-blue-500 text-white'>Selanjutnya</button></div>`;
    html += `</div><div class='mt-3'><p class='text-slate-700'>${q.q}</p>`;
    if(q.type==='mcq'){
      html += `<div class='mt-2 space-y-2'>`;
      q.options.forEach((opt,oi)=>{ html += `<label class='flex items-center gap-2'><input type='radio' name='ans-${topic}-${i}' value='${opt}'><span>${opt}</span></label>`; });
      html += `</div>`;
    } else if(q.type==='order'){
      html += `<div class='mt-2'><ul id='order-list-${topic}-${i}' class='ordering-list'>`;
      q.items.forEach(it=>{ html += `<li class='ordering-item' draggable='true'>${it}</li>`; });
      html += `</ul><button id='save-ans-${topic}-${i}' class='vlab-button bg-green-500 text-white mt-2'>Simpan Urutan</button></div>`;
    } else {
      html += `<input id='short-answer-${topic}-${i}' type='text' class='mt-2 px-3 py-2 border rounded w-full' placeholder='Jawaban singkat'>`;
    }
    // explanation area (hidden until grading)
    html += `<div class='mt-2 text-sm text-slate-700 explanation' style='display:none'><strong>Pembahasan:</strong> ${q.explanation || ''}</div>`;
    if(!showAll) html += `</div><div class='mt-3 flex gap-2'><button id='sol-${topic}' class='vlab-button bg-white border'>Pembahasan</button></div>`;
    card.innerHTML = html;

    // attach interactions
    if(!showAll){
      const prevBtn = card.querySelector('#prev-'+topic);
      const nextBtn = card.querySelector('#next-'+topic);
      if(prevBtn) prevBtn.addEventListener('click', ()=>{ if(idx>0) goto(idx-1); });
      if(nextBtn) nextBtn.addEventListener('click', ()=>{ if(idx < qdata.length-1) goto(idx+1); });
    }

    // restore saved answer for this index
    const prev = answersLocal[i];
    if(q.type==='mcq'){
      const inputs = card.querySelectorAll(`input[type=radio]`);
      inputs.forEach(inp=>{
        if(prev !== null && prev !== undefined && String(prev) === String(inp.value)) inp.checked = true;
        inp.addEventListener('change', (e)=>{ answersLocal[i] = e.target.value; persist(); updateGlobalScore(); });
      });
    } else if(q.type==='short'){
      const sa = card.querySelector(`#short-answer-${topic}-${i}`);
      if(sa){ sa.value = prev || ''; sa.addEventListener('input', e=>{ answersLocal[i] = e.target.value; persist(); updateGlobalScore(); }); }
    } else if(q.type==='order'){
      const list = card.querySelector(`#order-list-${topic}-${i}`);
      // restore ordering if present
      if(list && prev && Array.isArray(prev) && prev.length){ list.innerHTML = ''; prev.forEach(it=>{ const li = document.createElement('li'); li.className='ordering-item'; li.draggable=true; li.textContent=it; list.appendChild(li); }); }
      if(list){ 
        let drag=null; 
        list.querySelectorAll('.ordering-item').forEach(it=>{ 
          it.addEventListener('dragstart',()=>{ drag=it; it.style.opacity=0.6}); 
          it.addEventListener('dragend',()=>{ drag=null; it.style.opacity=1; persist(); updateGlobalScore(); }); 
          it.addEventListener('dragover',e=>{ e.preventDefault(); if(drag!==it) list.insertBefore(drag,it); }); 
        });
        const saveBtn = card.querySelector(`#save-ans-${topic}-${i}`);
        if(saveBtn){ 
          saveBtn.addEventListener('click', ()=>{
            const items = Array.from(list.querySelectorAll('.ordering-item')).map(li=>li.textContent);
            answersLocal[i] = items;
            persist();
            updateGlobalScore();
            saveBtn.disabled = true; 
            saveBtn.textContent = 'Tersimpan';
          });
          if(answersLocal[i] && Array.isArray(answersLocal[i]) && answersLocal[i].length){ saveBtn.disabled = true; saveBtn.textContent = 'Tersimpan'; }
        }
      }
    }

    return card;
  }

  function renderQuestion(){ if(!container) return; container.innerHTML = ''; const q = qdata[idx] || {type:'short', q:'Tidak ada soal'}; const card = makeQuestionCard(q, idx, false); container.appendChild(card); }

  function renderAllQuestions(){ if(!container) return; container.innerHTML = ''; qdata.forEach((q,i)=> container.appendChild(makeQuestionCard(q,i,true))); }

  function computeScore(){ 
    let s=0; 
    qdata.forEach((q,i)=>{ 
      const a = answersLocal[i]; 
      if(a===null || a===undefined || a==='') return; 
      if(q.type==='mcq' && String(a)===String(q.a)) s++; 
      else if(q.type==='short' && String(a).toLowerCase()===String(q.a).toLowerCase()) s++; 
      else if(q.type==='order' && JSON.stringify(a)===JSON.stringify(q.correct)) s++; 
    }); 
    const percent = Math.round(100 * s / qdata.length); 
    return {score:s, max:qdata.length, percent}; 
  }

  function start(){ 
    if(running) return; 
    running=true; 
    loadPersist(); 
    updateNavAnswered(); 
    tleft=120; 
    updateTimerDisplay(); 
    if(timerId) clearInterval(timerId); 
    timerId = setInterval(()=>{ 
      tleft--; 
      if(tleft<=0){ 
        clearInterval(timerId); 
        running=false; 
        finish(); 
      } 
      updateTimerDisplay(); 
    },1000); 
    renderNav(); 
    renderQuestion();
    const submitBtn = document.querySelector(`.submit-topic[data-topic='${topic}']`);
    if(submitBtn){ submitBtn.onclick = ()=>{ finish(); } }
  }

  function finish(){ 
    try{ persist(); }catch(e){}
    if(timerId) clearInterval(timerId); 
    running=false;
    renderAllQuestions();
    qdata.forEach((q,i)=>{
      const card = document.getElementById(`q-${topic}-${i}`);
      if(!card) return;
      const explain = card.querySelector('.explanation');
      let correct = false; 
      const a = answersLocal[i];
      if(q.type==='mcq' && String(a)===String(q.a)) correct = true;
      if(q.type==='short' && a && String(a).toLowerCase()===String(q.a).toLowerCase()) correct = true;
      if(q.type==='order' && a && JSON.stringify(a)===JSON.stringify(q.correct)) correct = true;
      if(explain) explain.style.display = 'block';
      if(correct) card.classList.add('q-correct'); else card.classList.add('q-wrong');
      const items = card.querySelectorAll('.ordering-item'); 
      items.forEach(it=>{ it.draggable = false; it.style.cursor = 'default'; });
    });
    const res = computeScore();
    const panel = document.getElementById('quiz-result-panel');
    if(panel) panel.innerHTML = `<div class='font-bold'>Skor Anda: ${res.percent} / 100</div><div class='text-sm mt-1'>(${res.score} benar dari ${res.max} soal)</div>`;
    if(timerEl) timerEl.textContent = `Skor: ${res.percent}/100`;
    persist(); 
    updateGlobalScore();
    const submitBtn = document.querySelector(`.submit-topic[data-topic='${topic}']`);
    if(submitBtn) submitBtn.disabled = true;
    try{ sessionStorage.setItem('pysphere_quiz_finished_'+topic, '1'); }catch(e){}
    try{ if(window.updateTopicUI) window.updateTopicUI(topic); }catch(e){}
    try{ if(window.renderCompletedResults) window.renderCompletedResults(); }catch(e){}
  }

  function review(){ console.table(answersLocal); alert('Rangkuman jawaban untuk '+topic+' ditampilkan di konsol (developer).'); }

  function retry(){ 
    if(timerId) clearInterval(timerId); 
    sessionStorage.removeItem(storageKey); 
    try{ sessionStorage.removeItem('pysphere_quiz_finished_'+topic); }catch(e){} 
    answersLocal = Array(qdata.length).fill(null); 
    idx=0; 
    tleft=120; 
    running=false; 
    renderNav(); 
    renderQuestion(); 
    updateGlobalScore(); 
    try{ if(window.updateTopicUI) window.updateTopicUI(topic); }catch(e){} 
  }

  loadPersist();

  return { start, review, retry, computeScore, renderNav };
}

const CONTROLLERS = {};
TOPICS.forEach(t=>{
  CONTROLLERS[t] = makeQuizController(t);
  document.querySelectorAll(`button.start-topic[data-topic='${t}']`).forEach(b=> b.addEventListener('click', ()=>{
    CONTROLLERS[t].start();
    try{ location.hash = `take-${t}`; window.scrollTo(0,0); }catch(e){}
  }));
  document.querySelectorAll(`button.review-topic[data-topic='${t}']`).forEach(b=> b.addEventListener('click', ()=> CONTROLLERS[t].review()));
  document.querySelectorAll(`button.retry-topic[data-topic='${t}']`).forEach(b=> b.addEventListener('click', ()=> CONTROLLERS[t].retry()));
  CONTROLLERS[t].renderNav();
});

function handleHashStart(){
  try{
    const hash = location.hash.slice(1);
    if(!hash || !hash.startsWith('take-')) return;
    const topic = hash.replace('take-','');
    if(!TOPICS.includes(topic)) return;
    document.querySelectorAll('.page').forEach(p=>p.classList.add('hidden'));
    document.getElementById('quiz-page').classList.remove('hidden');
    document.querySelectorAll('.tab-button').forEach(b=>{
      if(b.dataset.page === 'quiz') b.classList.add('active'); else b.classList.remove('active');
    });
    setTimeout(()=>{
      const quizSection = document.getElementById('quiz-'+topic);
      if(quizSection) quizSection.scrollIntoView({behavior:'smooth'});
    },100);
  }catch(e){ console.warn('hash start handling failed', e); }
}
handleHashStart();
window.addEventListener('hashchange', handleHashStart);

function updateGlobalScore(){ 
  let total=0, maxTotal=0; 
  TOPICS.forEach(t=>{ 
    const r = CONTROLLERS[t].computeScore(); 
    total += r.score; 
    maxTotal += r.max; 
  }); 
  document.getElementById('live-score').textContent = `${total} / ${maxTotal}`; 
}

window.renderCompletedResults = function(){
  try{
    const panel = document.getElementById('quiz-result-panel');
    if(!panel) return;
    let html = '<div class="text-sm font-semibold mb-2">Hasil Kuis:</div>';
    TOPICS.forEach(t=>{
      const finished = sessionStorage.getItem('pysphere_quiz_finished_'+t);
      if(finished === '1'){
        const res = CONTROLLERS[t].computeScore();
        html += `<div class="topic-result quiz-completed mb-2"><span class="completed-badge">Selesai</span> ${t.toUpperCase()}: ${res.percent}%</div>`;
      }
    });
    panel.innerHTML = html;
  }catch(e){ console.warn('renderCompletedResults failed', e); }
};

setTimeout(()=>{ try{ window.renderCompletedResults(); }catch(e){} }, 300);

window.updateTopicUI = function(topic){
  try{
    const finished = sessionStorage.getItem('pysphere_quiz_finished_'+topic);
    const resultEl = document.getElementById('result-'+topic);
    if(finished === '1' && resultEl){
      const res = CONTROLLERS[topic].computeScore();
      resultEl.innerHTML = `<span class="completed-badge">Selesai</span> Skor: ${res.percent}% (${res.score}/${res.max})`;
      resultEl.classList.add('quiz-completed');
    }
  }catch(e){ console.warn('updateTopicUI failed', e); }
};

TOPICS.forEach(t=> setTimeout(()=>{ try{ window.updateTopicUI(t); }catch(e){} }, 200));

// Interactive V-Lab simulation
(function(){
  const canvas = document.getElementById('physicsCanvas');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  let rafId = null;
  let running = false;
  let record = false;
  const records = [];

  let mode = 'pegas';
  let m = 1, k = 10, A = 0.5, L = 1, g = 9.81;
  let x = 0, v = 0, a = 0;
  let omega = 0, period = 0;

  const getSliders = () => {
    m = parseFloat(document.getElementById('mass-slider')?.value || 1);
    k = parseFloat(document.getElementById('k-slider')?.value || 10);
    A = parseFloat(document.getElementById('amp-slider')?.value || 0.5);
    L = parseFloat(document.getElementById('length-slider')?.value || 1);
    g = parseFloat(document.getElementById('g-slider')?.value || 9.81);
  };

  const outputs = {
    mode: document.getElementById('vlab-mode-display'),
    period: document.getElementById('vlab-period'),
    omega: document.getElementById('vlab-omega'),
    pos: document.getElementById('vlab-pos'),
    vel: document.getElementById('vlab-vel'),
    acc: document.getElementById('vlab-acc'),
    ep: document.getElementById('vlab-ep'),
    ek: document.getElementById('vlab-ek'),
    et: document.getElementById('vlab-et')
  };

  const resize = () => {
    const parent = canvas.parentElement;
    canvas.width = parent.offsetWidth;
    canvas.height = parent.offsetHeight;
  };
  window.addEventListener('resize', resize);
  resize();

  function draw(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    const W = canvas.width, H = canvas.height;
    const cx = W/2;
    if(mode === 'pegas'){
      const scale = 80;
      const blockY = H/2 + x * scale;
      ctx.strokeStyle = '#4ade80';
      ctx.lineWidth = 3;
      ctx.beginPath();
      const springSegments = 12;
      const springWidth = 20;
      for(let i=0; i<=springSegments; i++){
        const sy = 50 + (blockY - 50) * (i/springSegments);
        const sx = cx + ((i%2===0)?-springWidth:springWidth);
        if(i===0) ctx.moveTo(cx, sy); else ctx.lineTo(sx, sy);
      }
      ctx.stroke();
      ctx.fillStyle = '#3b82f6';
      ctx.fillRect(cx-25, blockY-15, 50, 30);
      ctx.fillStyle = '#fff'; 
      ctx.font='16px Inter'; 
      ctx.textAlign='center'; 
      ctx.fillText('M='+m.toFixed(2)+' kg', cx, blockY+28);
    } else {
      const pendulumLen = L * 100;
      const angle = x;
      const bobX = cx + pendulumLen * Math.sin(angle);
      const bobY = 50 + pendulumLen * Math.cos(angle);
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx, 50);
      ctx.lineTo(bobX, bobY);
      ctx.stroke();
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(bobX, bobY, 15, 0, 2*Math.PI);
      ctx.fill();
    }
  }

  const dt = 0.016;
  function step(){
    getSliders();
    if(mode === 'pegas'){
      omega = Math.sqrt(k/m);
      period = 2*Math.PI/omega;
      a = -(k/m) * x;
      v += a * dt;
      x += v * dt;
      const EP = 0.5 * k * x * x;
      const EK = 0.5 * m * v * v;
      const ET = EP + EK;
      if(outputs.period) outputs.period.textContent = period.toFixed(3);
      if(outputs.omega) outputs.omega.textContent = omega.toFixed(3);
      if(outputs.pos) outputs.pos.textContent = x.toFixed(3) + ' m';
      if(outputs.vel) outputs.vel.textContent = v.toFixed(3) + ' m/s';
      if(outputs.acc) outputs.acc.textContent = a.toFixed(3) + ' m/s²';
      if(outputs.ep) outputs.ep.textContent = EP.toFixed(3);
      if(outputs.ek) outputs.ek.textContent = EK.toFixed(3);
      if(outputs.et) outputs.et.textContent = ET.toFixed(3);
      if(record) records.push({t:performance.now(),mode,x,v,a,EP,EK,ET});
    } else {
      omega = Math.sqrt(g/L);
      period = 2*Math.PI/omega;
      const theta = x;
      a = -(g/L) * Math.sin(theta);
      v += a * dt;
      x += v * dt;
      const h = L * (1 - Math.cos(theta));
      const EP = m * g * h;
      const EK = 0.5 * m * (v*L) * (v*L);
      const ET = EP + EK;
      if(outputs.period) outputs.period.textContent = period.toFixed(3);
      if(outputs.omega) outputs.omega.textContent = omega.toFixed(3);
      if(outputs.pos) outputs.pos.textContent = (theta * 180/Math.PI).toFixed(2) + ' °';
      if(outputs.vel) outputs.vel.textContent = v.toFixed(3) + ' rad/s';
      if(outputs.acc) outputs.acc.textContent = a.toFixed(3) + ' rad/s²';
      if(outputs.ep) outputs.ep.textContent = EP.toFixed(3);
      if(outputs.ek) outputs.ek.textContent = EK.toFixed(3);
      if(outputs.et) outputs.et.textContent = ET.toFixed(3);
      if(record) records.push({t:performance.now(),mode,theta,v,a,EP,EK,ET});
    }

    draw();
    if(running) rafId = requestAnimationFrame(step);
  }

  document.getElementById('vlab-start')?.addEventListener('click', ()=>{
    if(!running){
      getSliders();
      if(mode === 'pegas'){ x = A; v = 0; }
      else { 
        const thetaDeg = parseFloat(document.getElementById('theta-slider')?.value || 10);
        x = thetaDeg * Math.PI / 180;
        v = 0;
      }
      running = true;
      rafId = requestAnimationFrame(step);
    }
  });

  document.getElementById('vlab-pause')?.addEventListener('click', ()=>{
    if(running){ running = false; if(rafId) cancelAnimationFrame(rafId); }
  });

  document.getElementById('vlab-reset')?.addEventListener('click', ()=>{
    running = false; record = false; records.length = 0; if(rafId) cancelAnimationFrame(rafId);
    x = 0; v = 0; a = 0; 
    if(outputs.pos) outputs.pos.textContent='--'; 
    if(outputs.vel) outputs.vel.textContent='--'; 
    if(outputs.acc) outputs.acc.textContent='--'; 
    if(outputs.ep) outputs.ep.textContent='--'; 
    if(outputs.ek) outputs.ek.textContent='--'; 
    if(outputs.et) outputs.et.textContent='--'; 
    if(outputs.period) outputs.period.textContent='--'; 
    if(outputs.omega) outputs.omega.textContent='--'; 
    draw();
  });

  document.getElementById('vlab-record')?.addEventListener('click', ()=>{
    record = !record; 
    const btn = document.getElementById('vlab-record');
    if(btn) btn.textContent = record ? 'Berhenti Rekam' : 'Rekam';
    if(record) records.length = 0;
  });

  document.getElementById('vlab-download')?.addEventListener('click', ()=>{
    if(records.length === 0){ alert('Tidak ada data untuk diunduh.'); return; }
    const keys = Object.keys(records[0]);
    const csv = [keys.join(',')].concat(records.map(r => keys.map(k => r[k]).join(','))).join('\n');
    const blob = new Blob([csv], {type:'text/csv'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); 
    a.href = url; 
    a.download = 'vlab-records.csv'; 
    document.body.appendChild(a); 
    a.click(); 
    a.remove(); 
    URL.revokeObjectURL(url);
  });

  window.vlabSetMode = function(m){
    try{ mode = m; if(outputs.mode) outputs.mode.textContent = (m === 'pegas') ? 'Pegas' : 'Bandul'; }catch(e){}
  };

  draw();

  window.vlabRefresh = function(opts){
    try{
      resize();
      draw();
      if(opts && opts.autoplay && !running){
        setTimeout(()=> document.getElementById('vlab-start')?.click(), 200);
      }
    }catch(e){}
  };
})();

// Connection status
setTimeout(()=>{ 
  const el = document.getElementById('conn-status');
  if(el) el.textContent='Terhubung (offline-mode)'; 
},1200);

// VLab controls wiring
(function(){
  const pegasControls = document.querySelector('.pegas-controls');
  const bandulControls = document.querySelector('.bandul-controls');
  const modePegasBtn = document.getElementById('mode-pegas');
  const modeBandulBtn = document.getElementById('mode-bandul');

  function setModeUI(m){
    if(m === 'pegas'){
      if(pegasControls) pegasControls.classList.remove('hidden');
      if(bandulControls) bandulControls.classList.add('hidden');
      if(modePegasBtn){ modePegasBtn.classList.remove('bg-white','text-slate-700','border'); modePegasBtn.classList.add('bg-blue-500','text-white'); }
      if(modeBandulBtn){ modeBandulBtn.classList.add('bg-white','text-slate-700','border'); modeBandulBtn.classList.remove('bg-blue-500','text-white'); }
    } else {
      if(pegasControls) pegasControls.classList.add('hidden');
      if(bandulControls) bandulControls.classList.remove('hidden');
      if(modePegasBtn){ modePegasBtn.classList.add('bg-white','text-slate-700','border'); modePegasBtn.classList.remove('bg-blue-500','text-white'); }
      if(modeBandulBtn){ modeBandulBtn.classList.remove('bg-white','text-slate-700','border'); modeBandulBtn.classList.add('bg-blue-500','text-white'); }
    }
    if(window.vlabSetMode) window.vlabSetMode(m);
  }

  if(modePegasBtn) modePegasBtn.addEventListener('click', ()=> setModeUI('pegas'));
  if(modeBandulBtn) modeBandulBtn.addEventListener('click', ()=> setModeUI('bandul'));

  const mVal = document.getElementById('m-val'); 
  const kVal = document.getElementById('k-val'); 
  const aVal = document.getElementById('a-val');
  const LVal = document.getElementById('L-val'); 
  const gVal = document.getElementById('g-val'); 
  const thetaVal = document.getElementById('theta-val');

  document.getElementById('mass-slider')?.addEventListener('input', e=>{ if(mVal) mVal.textContent = parseFloat(e.target.value).toFixed(2); });
  document.getElementById('k-slider')?.addEventListener('input', e=>{ if(kVal) kVal.textContent = parseFloat(e.target.value).toFixed(2); });
  document.getElementById('amp-slider')?.addEventListener('input', e=>{ if(aVal) aVal.textContent = parseFloat(e.target.value).toFixed(2); });
  document.getElementById('length-slider')?.addEventListener('input', e=>{ if(LVal) LVal.textContent = parseFloat(e.target.value).toFixed(2); });
  document.getElementById('g-slider')?.addEventListener('input', e=>{ if(gVal) gVal.textContent = parseFloat(e.target.value).toFixed(2); });
  document.getElementById('theta-slider')?.addEventListener('input', e=>{ if(thetaVal) thetaVal.textContent = parseInt(e.target.value,10); });

  document.getElementById('start-btn')?.addEventListener('click', ()=>document.getElementById('vlab-start')?.click());
  document.getElementById('reset-btn')?.addEventListener('click', ()=>document.getElementById('vlab-reset')?.click());

  setModeUI('pegas');
})();

// MODULES: sidebar navigation + progress
(function(){
  const MODULES = ['getaran','ghs','bandul','pegas'];
  let state = {};

  const updateProgressUI = () => {
    const total = MODULES.length;
    const done = Object.keys(state).filter(k => state[k]).length;
    const pct = Math.round((done / total) * 100);
    const fill = document.getElementById('materi-progress-fill');
    const pctEl = document.getElementById('materi-progress-percent');
    if(fill) fill.style.width = pct + '%';
    if(pctEl) pctEl.textContent = pct + '%';
  };

  const refreshButtons = () => {
    MODULES.forEach(id=>{
      const btn = document.querySelector(`.mark-read[data-module='${id}']`);
      if(btn){
        if(state[id]){
          btn.textContent = 'Sudah Dibaca';
          btn.classList.remove('bg-blue-600');
          btn.classList.add('bg-gray-400');
        } else {
          btn.textContent = 'Tandai Dibaca';
          btn.classList.add('bg-blue-600');
          btn.classList.remove('bg-gray-400');
        }
      }
    });
  };

  const materiButtons = Array.from(document.querySelectorAll('.materi-link'));
  const moduleArticles = MODULES.map(id => document.getElementById(id));

  const showModule = (id) => {
    moduleArticles.forEach(art=>{
      if(art && art.id === id) art.classList.remove('module-hidden');
      else if(art) art.classList.add('module-hidden');
    });
    materiButtons.forEach(btn=>{
      if(btn.dataset.target === id) btn.classList.add('bg-purple-100','font-semibold');
      else btn.classList.remove('bg-purple-100','font-semibold');
    });
  };

  materiButtons.forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const target = btn.dataset.target;
      if(target) showModule(target);
    });
  });

  (function initModuleView(){
    moduleArticles.forEach(art=>{ if(art) art.classList.add('module-hidden'); });
    showModule(MODULES[0]);
  })();

  document.querySelectorAll('.mark-read').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const mod = btn.dataset.module;
      if(!mod) return;
      state[mod] = !state[mod];
      updateProgressUI();
      refreshButtons();
    });
  });

  updateProgressUI();
  refreshButtons();
})();
