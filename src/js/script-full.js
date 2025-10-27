// PhySphere - Full Script (extracted and adapted from original)
// Global default for materi_progress so all scopes can access it
try{ window.DEFAULT_MATERI_PROGRESS = window.DEFAULT_MATERI_PROGRESS || { ghs:false, pegas:false, bandul:false, getaran:false }; }catch(e){ var DEFAULT_MATERI_PROGRESS = { ghs:false, pegas:false, bandul:false, getaran:false }; }

// Prevent ReferenceError: supabase is not defined in environments where SDK
// hasn't loaded yet. Declare a local alias and refresh it once SDK ready.
var supabase = window.supabase;
if (window.__supabaseReady && typeof window.__supabaseReady.then === 'function') {
  window.__supabaseReady.then(() => { try{ supabase = window.supabase; }catch(e){} }).catch(()=>{});
}
// --- NAVIGATION ---
document.querySelectorAll('.tab-button').forEach(btn=>btn.addEventListener('click',()=>{
  // If user tries to open the VLab, block access until materi progress reaches 100%
  if(btn.dataset.page === 'vlab'){
    try{
      const pctEl = document.getElementById('materi-progress-percent');
      const pct = pctEl ? parseInt((pctEl.textContent||'0').replace('%',''),10) : 0;
      if(isNaN(pct) || pct < 100){
        // show a simple modal warning
        const modal = document.getElementById('modal');
        const title = document.getElementById('modal-title');
        const body = document.getElementById('modal-body');
        if(title) title.textContent = 'Akses Lab Tertutup';
        if(body) body.textContent = 'Selesaikan semua materi (100%) terlebih dahulu untuk membuka PhySphere Lab.';
        if(modal) modal.classList.remove('hidden');
        return; // do not switch tab
      }
    }catch(e){ /* ignore */ }
  }

  document.querySelectorAll('.page').forEach(p=>p.classList.add('hidden'));
  document.getElementById(btn.dataset.page+'-page').classList.remove('hidden');
  document.querySelectorAll('.tab-button').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  // If the user opened the Profile tab, refresh profile view (ensure auth state is reflected)
  try{ if(btn.dataset.page === 'profile' && typeof window.showProfileView === 'function') window.showProfileView(); }catch(e){}
  // If the user opened the Materi tab, refresh button states to reflect current progress
  if(btn.dataset.page === 'materi'){
    setTimeout(()=>{ 
      try{ 
        if(typeof window.checkLoginStatus === 'function') window.checkLoginStatus();
        if(typeof window.updateProgressUI === 'function') window.updateProgressUI();
        if(typeof window.refreshButtons === 'function') window.refreshButtons();
      }catch(e){ console.warn('Failed to refresh materi UI', e); } 
    }, 100);
  }
  // if vlab tab opened, ensure canvas resizes & redraws after layout (no autoplay)
  if(btn.dataset.page === 'vlab'){
    setTimeout(()=>{ try{ if(window.vlabRefresh) window.vlabRefresh(); }catch(e){} },120);
  }
  // persist active page to session storage
  try{ sessionStorage.setItem('pysphere_active_page', btn.dataset.page); }catch(e){}
}));

// Consolidated modal handlers: overlay click closes modal, and the modal "Buka Materi" button
// will both close the modal and navigate to the Materi tab to avoid conflicting listeners.
(function attachModalHandlers(){
  const modal = document.getElementById('modal');
  const modalClose = document.getElementById('modal-close');
  if(modal){
    // click outside content (on overlay) closes modal
    modal.addEventListener('click', (ev)=>{
      if(ev.target === modal) modal.classList.add('hidden');
    });
  }
  if(modalClose){
    modalClose.addEventListener('click', ()=>{
      if(modal) modal.classList.add('hidden');
      // navigate to materi tab so the user can continue
      const materiBtn = document.querySelector('.tab-button[data-page="materi"]');
      if(materiBtn) materiBtn.click();
    });
  }
})();

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
  // hide nav and submit/review controls until the user explicitly starts the topic
  try{ if(nav) nav.style.display = 'none'; }catch(e){}
  try{ const submitBtn = document.querySelector(`.submit-topic[data-topic='${topic}']`); if(submitBtn) submitBtn.style.display = 'none'; }catch(e){}
  try{ const reviewBtn = document.querySelector(`.review-topic[data-topic='${topic}']`); if(reviewBtn) { reviewBtn.disabled = true; reviewBtn.style.opacity = '0.6'; } }catch(e){}

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
      html += `</ul>`;
      // only show save button while taking the quiz (not when showing all questions after finish)
      if(!showAll) html += `<button id='save-ans-${topic}-${i}' class='vlab-button bg-green-500 text-white mt-2'>Simpan Urutan</button>`;
      html += `</div>`;
    } else {
      html += `<input id='short-answer-${topic}-${i}' type='text' class='mt-2 px-3 py-2 border rounded w-full' placeholder='Jawaban singkat'>`;
    }
    // explanation area (hidden until grading)
    html += `<div class='mt-2 text-sm text-slate-700 explanation' style='display:none'><strong>Pembahasan:</strong> ${q.explanation || ''}</div>`;
  // do not show per-question 'Pembahasan' button while quiz is in progress; explanations appear after submission
  if(!showAll) html += `</div>`;
    card.innerHTML = html;

    // attach interactions
    if(!showAll){
      const prevBtn = card.querySelector('#prev-'+topic);
      const nextBtn = card.querySelector('#next-'+topic);
      if(prevBtn) prevBtn.addEventListener('click', ()=>{ if(idx>0) goto(idx-1); });
      if(nextBtn){
        // if this is the last question, make the button send/submit instead of next
        if(i === qdata.length - 1){
          nextBtn.textContent = 'Kirim';
          nextBtn.addEventListener('click', ()=>{ try{ finish(); }catch(e){ /* fallback to compute score */ } });
        } else {
          nextBtn.addEventListener('click', ()=>{ if(idx < qdata.length-1) goto(idx+1); });
        }
      }
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
        const saveBtn = card.querySelector(`#save-ans-${topic}-${i}`);
        list.querySelectorAll('.ordering-item').forEach(it=>{ 
          it.addEventListener('dragstart',()=>{ drag=it; it.style.opacity=0.6}); 
          it.addEventListener('dragend',()=>{ 
            drag=null; 
            it.style.opacity=1; 
            // when user changes order, mark the question as having unsaved changes
            if(saveBtn){
              saveBtn.disabled = false;
              saveBtn.textContent = 'Simpan Urutan';
              // visual: change color to indicate unsaved (yellow)
              saveBtn.classList.remove('bg-green-500');
              saveBtn.classList.add('bg-yellow-500');
            }
            // do NOT persist on drag; previous saved answer remains until user clicks Save
          }); 
          it.addEventListener('dragover',e=>{ e.preventDefault(); if(drag!==it) list.insertBefore(drag,it); }); 
        });
        if(saveBtn){ 
          saveBtn.addEventListener('click', ()=>{
            const items = Array.from(list.querySelectorAll('.ordering-item')).map(li=>li.textContent);
            answersLocal[i] = items;
            persist();
            updateGlobalScore();
            saveBtn.disabled = true; 
            saveBtn.textContent = 'Tersimpan';
            // restore saved visual (green)
            saveBtn.classList.remove('bg-yellow-500');
            saveBtn.classList.add('bg-green-500');
          });
          if(answersLocal[i] && Array.isArray(answersLocal[i]) && answersLocal[i].length){ saveBtn.disabled = true; saveBtn.textContent = 'Tersimpan'; saveBtn.classList.remove('bg-yellow-500'); saveBtn.classList.add('bg-green-500'); }
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
    // show question navigation and enable submit for this topic
    try{ if(nav) nav.style.display = ''; }catch(e){}
    const submitBtn = document.querySelector(`.submit-topic[data-topic='${topic}']`);
    if(submitBtn){ submitBtn.style.display = ''; submitBtn.onclick = ()=>{ finish(); } }
    try{ const reviewBtn = document.querySelector(`.review-topic[data-topic='${topic}']`); if(reviewBtn){ reviewBtn.disabled = true; reviewBtn.style.opacity = '0.6'; } }catch(e){}
  }

  async function finish(){ 
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
            // --- TAMBAHKAN BLOK BARU INI ---
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const historyData = {
            user_id: user.id,
            quiz_key: topic, // 'topic' sudah ada di scope fungsi ini
            quiz_name: `Kuis ${topic.toUpperCase()}`,
            score: res.score,    // Jumlah jawaban benar
            max_score: res.max,  // Jumlah soal
            percentage: res.percent, // Persentase
            passed: res.percent >= 75, // (Asumsi KKM 75, bisa diubah)
            metadata: answersLocal // Menyimpan riwayat jawaban pengguna
            };

            // Kirim (insert) data ke tabel quiz_history
            const { error } = await supabase
            .from('quiz_history')
            .insert(historyData);

            if (error) {
            console.error("Gagal menyimpan riwayat kuis:", error.message);
            } else {
            console.log("Riwayat kuis berhasil disimpan!");
            }
        }
        } catch (e) {
        console.error("Error saat mencoba menyimpan riwayat kuis:", e);
    }
        // --- AKHIR BLOK BARU ---
  const panel = document.getElementById('quiz-result-panel');
  if(panel) panel.innerHTML = `<div class='font-bold'>Skor Anda: ${res.percent} / 100</div><div class='text-sm mt-1'>(${res.score} benar dari ${res.max} soal)</div>`;
  // hide per-topic placeholder (if present) since the topic has been attempted
  try{ const resEl = document.getElementById('result-' + topic); if(resEl) resEl.style.display = 'none'; }catch(e){}
    if(timerEl) timerEl.textContent = `Skor: ${res.percent}/100`;
    persist(); 
    updateGlobalScore();
    const submitBtn = document.querySelector(`.submit-topic[data-topic='${topic}']`);
    if(submitBtn) submitBtn.disabled = true;
    // disable the Start button for this topic so user can't restart until they press Ulangi
    try{
      const startBtn = document.querySelector(`.start-topic[data-topic='${topic}']`);
      if(startBtn){ startBtn.disabled = true; startBtn.classList.add('opacity-50'); }
      const retryBtn = document.querySelector(`.retry-topic[data-topic='${topic}']`);
      if(retryBtn){ retryBtn.disabled = false; retryBtn.style.opacity = ''; }
    }catch(e){/* ignore */}
    try{ sessionStorage.setItem('pysphere_quiz_finished_'+topic, '1'); }catch(e){}
    try{ if(window.updateTopicUI) window.updateTopicUI(topic); }catch(e){}
    try{ if(window.renderCompletedResults) window.renderCompletedResults(); }catch(e){}
    try{ const reviewBtn = document.querySelector(`.review-topic[data-topic='${topic}']`); if(reviewBtn){ reviewBtn.disabled = false; reviewBtn.style.opacity = ''; } }catch(e){}
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
    // re-enable start button and reset result placeholder
    try{
      const startBtn = document.querySelector(`.start-topic[data-topic='${topic}']`);
      if(startBtn){ startBtn.disabled = false; startBtn.classList.remove('opacity-50'); }
      const resEl = document.getElementById('result-' + topic);
      if(resEl){ resEl.style.display = ''; resEl.textContent = 'Belum dikerjakan.'; }
    }catch(e){ }
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
  // review-topic removed from UI; no binding
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

// Global helper: try fetching a profile row from either 'profile' or 'profiles'.
// Returns { data, table } on success or { error } on failure.
async function fetchProfileRow(user_id, selectCols = '*'){
  const sup = (typeof window !== 'undefined' && window.supabase) ? window.supabase : (typeof supabase !== 'undefined' ? supabase : null);
  if(!sup) return { error: new Error('supabase client not available') };
  
  const tableCandidates = ['profile','profiles'];
  for(const tbl of tableCandidates){
    try{
      const res = await sup.from(tbl).select(selectCols).eq('id', user_id).single();
      if(!res || res.error){
        console.debug(`fetchProfileRow: table=${tbl} returned error`, res && res.error ? res.error : res);
        continue;
      }
      return { data: res.data, table: tbl };
    }catch(e){
      console.debug('fetchProfileRow caught exception for table', tbl, e);
      continue;
    }
  }
  return { error: new Error('No profile table found or all queries failed') };
}

// --- ...DENGAN FUNGSI BARU (ASYNC) INI ---
window.renderCompletedResults = async function(){
  try{
    const panel = document.getElementById('quiz-result-panel');
    if(!panel) return;
    
    const sup = (typeof window !== 'undefined' && window.supabase) ? window.supabase : (typeof supabase !== 'undefined' ? supabase : null);
    if(!sup || !sup.auth) return;
    
    // Ambil data skor dari database
    const { data: { user } } = await sup.auth.getUser();
    if (!user) return;

    // Prefer reading best percentages from `user_best_score` table.
    // Fallback: compute best percentage per topic from quiz_history.
    try{
      const [{ data: bests, error: bErr }, { data: history, error: hErr }] = await Promise.all([
        sup.from('user_best_score').select('quiz_key, best_percentage, updated_at').eq('user_id', user.id),
        sup.from('quiz_history').select('quiz_key, percentage, created_at').eq('user_id', user.id)
      ]);

      if(bErr) console.debug('renderCompletedResults: user_best_score fetch error', bErr);
      if(hErr) console.debug('renderCompletedResults: quiz_history fetch error', hErr);

      let scoresMap = {};
      if (bests && bests.length) {
        bests.forEach(b => { if(b && b.quiz_key) scoresMap[String(b.quiz_key).toLowerCase()] = { pct: (b.best_percentage!=null?Number(b.best_percentage):null), date: b.updated_at }; });
      }

      if ((!bests || bests.length === 0) && history && history.length) {
        // compute best from history
        history.forEach(h => {
          const key = String(h.quiz_key || 'unknown').toLowerCase();
          const pct = (h.percentage != null) ? Number(h.percentage) : null;
          if(pct != null){
            if(!scoresMap[key] || (scoresMap[key].pct == null) || pct > scoresMap[key].pct){
              scoresMap[key] = { pct, date: h.created_at };
            }
          }
        });
      }

      let html = '<div class="text-sm font-semibold mb-2">Hasil Kuis:</div>';
      let hasScores = false;
      TOPICS.forEach(t => {
        const entry = scoresMap[t.toLowerCase()];
        if(entry && entry.pct != null){
          html += `<div class="topic-result quiz-completed mb-2"><span class="completed-badge">Selesai</span> ${t.toUpperCase()}: ${Math.round(entry.pct)}%</div>`;
          hasScores = true;
        }
      });
      if (!hasScores) html += '<div class="text-sm text-slate-600">Belum ada hasil kuis.</div>';
      panel.innerHTML = html;
    }catch(err){
      console.warn('renderCompletedResults failed fetching bests/history', err);
      panel.innerHTML = '<div class="text-sm text-slate-600">Belum ada hasil kuis.</div>';
    }
  }catch(e){ console.warn('renderCompletedResults failed', e); }
};

setTimeout(()=>{ try{ window.renderCompletedResults(); }catch(e){} }, 300);

// --- ...DENGAN FUNGSI BARU (ASYNC) INI ---
window.updateTopicUI = async function(topic){
  try{
    const resultEl = document.getElementById('result-'+topic);
    if (!resultEl) return;
    // Ensure Supabase client & auth API are ready before calling
    try { await (window.__supabaseReady || Promise.resolve()); } catch(e) { console.warn('supabase init failed in updateTopicUI', e); }
    const supa = window.supabase;
    if (!supa || !supa.auth || typeof supa.auth.getUser !== 'function') {
      console.warn('supabase.auth.getUser not available in updateTopicUI; skipping');
      return;
    }

    // Ambil data skor dari database
    const { data: { user } } = await supa.auth.getUser();
    if (!user) return;

    // First try to read per-topic best from `user_best_score` (preferred),
    // otherwise fall back to most recent entry in `quiz_history` for this topic.
    try{
  const { data: bestRows, error: bestErr } = await supa.from('user_best_score').select('best_percentage, updated_at').eq('user_id', user.id).eq('quiz_key', topic);
      if(bestErr) console.debug('updateTopicUI: user_best_score fetch error', bestErr);
      if(bestRows && bestRows.length){
        const b = bestRows[0];
        if(b && b.best_percentage != null){
          resultEl.innerHTML = `<span class="completed-badge">Selesai</span> Skor: ${Math.round(Number(b.best_percentage))}%`;
          resultEl.classList.add('quiz-completed');
          return;
        }
      }

      // fallback: latest history entry for this topic
  const { data: histRows, error: histErr } = await supa.from('quiz_history').select('percentage, created_at').eq('user_id', user.id).eq('quiz_key', topic).order('created_at', { ascending: false }).limit(1);
      if(histErr) console.debug('updateTopicUI: quiz_history fetch error', histErr);
      if(histRows && histRows.length){
        const h = histRows[0];
        if(h && h.percentage != null){
          resultEl.innerHTML = `<span class="completed-badge">Selesai</span> Skor: ${Math.round(Number(h.percentage))}%`;
          resultEl.classList.add('quiz-completed');
          return;
        }
      }

      // no data found for this topic
      resultEl.innerHTML = 'Belum dikerjakan.';
      resultEl.classList.remove('quiz-completed');
    }catch(e){
      console.warn('updateTopicUI failed fetching best/history', e);
      resultEl.innerHTML = 'Belum dikerjakan.';
      resultEl.classList.remove('quiz-completed');
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
  // simulation timing controls
  let simStartTime = 0;
  let simRunDuration = Infinity; // seconds; when reached, simulation stops and results are shown

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
    // update physics state
    if(mode === 'pegas'){
      omega = Math.sqrt(k/m);
      period = 2*Math.PI/omega;
      a = -(k/m) * x;
      v += a * dt;
      x += v * dt;
      if(record) {
        const EP = 0.5 * k * x * x;
        const EK = 0.5 * m * v * v;
        const ET = EP + EK;
        records.push({t:performance.now(),mode,x,v,a,EP,EK,ET});
      }
    } else {
      omega = Math.sqrt(g/L);
      period = 2*Math.PI/omega;
      const theta = x;
      a = -(g/L) * Math.sin(theta);
      v += a * dt;
      x += v * dt;
      if(record) {
        const h = L * (1 - Math.cos(theta));
        const EP = m * g * h;
        const EK = 0.5 * m * (v*L) * (v*L);
        const ET = EP + EK;
        records.push({t:performance.now(),mode,theta,v,a,EP,EK,ET});
      }
    }

    draw();

    // stop automatically after run duration (if set)
    if(simStartTime && isFinite(simRunDuration)){
      const elapsed = (performance.now() - simStartTime) / 1000;
      if(elapsed >= simRunDuration){
        finishSimulation();
        return;
      }
    }

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
      // set run duration to a few periods (or fallback to 5s)
      try{ simRunDuration = Math.max(3 * (period || (2*Math.PI/Math.sqrt(k/m))), 5); }catch(e){ simRunDuration = 5; }
      simStartTime = performance.now();
      running = true;
      // hide any previous result
      const resultCard = document.getElementById('vlab-result-card'); if(resultCard) resultCard.classList.add('hidden');
      rafId = requestAnimationFrame(step);
    }
  });

  document.getElementById('vlab-pause')?.addEventListener('click', ()=>{
    if(running){ running = false; if(rafId) cancelAnimationFrame(rafId); }
  });

  document.getElementById('vlab-reset')?.addEventListener('click', ()=>{
    running = false; record = false; records.length = 0; if(rafId) cancelAnimationFrame(rafId);
    x = 0; v = 0; a = 0; simStartTime = 0; simRunDuration = Infinity;
    draw();
    const resultCard = document.getElementById('vlab-result-card'); if(resultCard) resultCard.classList.add('hidden');
  });

  // skip button: jump to simulation end and show results
  document.getElementById('vlab-skip')?.addEventListener('click', ()=>{
    finishSimulation();
  });

  // finalization: show results summary and stop simulation
  function finishSimulation(){
    try{ running = false; if(rafId) cancelAnimationFrame(rafId); }catch(e){}
    // compute final metrics
    getSliders();
    let finalOmega = 0, finalPeriod = 0, finalEP = 0, finalEK = 0, finalET = 0, finalPos = '';
    if(mode === 'pegas'){
      finalOmega = Math.sqrt(k/m);
      finalPeriod = 2*Math.PI/finalOmega;
      finalEP = 0.5 * k * x * x;
      finalEK = 0.5 * m * v * v;
      finalET = finalEP + finalEK;
      finalPos = x.toFixed(3) + ' m';
    } else {
      finalOmega = Math.sqrt(g/L);
      finalPeriod = 2*Math.PI/finalOmega;
      const theta = x;
      const h = L * (1 - Math.cos(theta));
      finalEP = m * g * h;
      finalEK = 0.5 * m * (v*L) * (v*L);
      finalET = finalEP + finalEK;
      finalPos = (theta * 180/Math.PI).toFixed(2) + ' °';
    }
    // populate result panel
    const panel = document.getElementById('vlab-result-panel');
    if(panel){
      panel.innerHTML = `
        <div>Mode: <strong>${mode === 'pegas' ? 'Pegas' : 'Bandul'}</strong></div>
        <div>Periode (T): <strong>${finalPeriod.toFixed(3)}</strong> s</div>
        <div>Frekuensi Sudut (ω): <strong>${finalOmega.toFixed(3)}</strong> rad/s</div>
        <div>Posisi Akhir: <strong>${finalPos}</strong></div>
        <div>Kecepatan Akhir: <strong>${v.toFixed(3)}</strong></div>
        <div>Percepatan Akhir: <strong>${a.toFixed(3)}</strong></div>
        <div>Energi Potensial (EP): <strong>${finalEP.toFixed(3)}</strong> J</div>
        <div>Energi Kinetik (EK): <strong>${finalEK.toFixed(3)}</strong> J</div>
        <div class='font-bold'>Energi Total (ET): <strong>${finalET.toFixed(3)}</strong> J</div>
      `;
    }
    const resultCard = document.getElementById('vlab-result-card'); if(resultCard) resultCard.classList.remove('hidden');
    draw();
    simStartTime = 0; simRunDuration = Infinity;
  }

  window.vlabSetMode = function(m){
    try{
      mode = m;
      if(outputs.mode) outputs.mode.textContent = (m === 'pegas') ? 'Pegas' : 'Bandul';
      // when switching mode, re-read sliders and reset position to sensible initial for that mode
      try{ getSliders(); }catch(e){}
      if(mode === 'pegas'){
        // set initial displacement to amplitude and zero velocity
        x = A; v = 0; a = 0;
      } else {
        // set initial angle from theta slider
        const thetaDeg = parseFloat(document.getElementById('theta-slider')?.value || 10);
        x = thetaDeg * Math.PI / 180; v = 0; a = 0;
      }
      // hide any previous result card when switching modes
      const resultCard = document.getElementById('vlab-result-card'); if(resultCard) resultCard.classList.add('hidden');
      draw();
    }catch(e){}
  };

  draw();

  window.vlabRefresh = function(opts){
    try{
      resize();
      draw();
      // intentionally do not autoplay; user must press Start
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

  // legacy left-column quick buttons removed; controls live in the result/control card

  setModeUI('pegas');
})();

// --- GANTI BLOK FUNGSI MODUL LAMA DENGAN INI ---
(function(){
  const MODULES = ['getaran','ghs','bandul','pegas'];
  const DEFAULT_MATERI_PROGRESS = { ghs: false, pegas: false, bandul: false, getaran: false };
  // Initialize state with all false - user hasn't read anything by default
  let state = { ghs: false, pegas: false, bandul: false, getaran: false };
  let loaded = false; // Flag agar tidak double-load
  let user_id = null; // ID user yang sedang login

  // --- FUNGSI: Check login status dan tampilkan warning ---
  async function checkLoginStatus() {
    const sup = (typeof window !== 'undefined' && window.supabase) ? window.supabase : (typeof supabase !== 'undefined' ? supabase : null);
    if(!sup || !sup.auth) return false;
    
    try{
      const { data: { user } } = await sup.auth.getUser();
      const warning = document.getElementById('not-logged-in-warning');
      
      if (!user) {
        console.warn('⚠️ User NOT logged in - progress will NOT be saved to database');
        user_id = null; // Clear user_id
        if(warning) warning.classList.remove('hidden');
        return false;
      } else {
        console.log('✅ User logged in:', user.email);
        user_id = user.id; // SET USER_ID HERE! 🔥
        console.log('✅ user_id set to:', user_id);
        if(warning) warning.classList.add('hidden');
        return true;
      }
    }catch(e){
      console.error('Error checking login status:', e);
      user_id = null;
      return false;
    }
  }
  window.checkLoginStatus = checkLoginStatus;

// --- FUNGSI BARU: Mengambil progress dari Supabase ---
  async function loadProgressFromSupabase() {
    if (loaded) return; // Mencegah double-load

    const sup = (typeof window !== 'undefined' && window.supabase) ? window.supabase : (typeof supabase !== 'undefined' ? supabase : null);
    if(!sup || !sup.auth){
      console.warn("loadProgressFromSupabase: supabase client not available");
      return;
    }

    const { data: { user } } = await sup.auth.getUser();
    if (!user) {
      console.log("User tidak login, tidak bisa load progress.");
      user_id = null;
      return; // User tidak login
    }
    user_id = user.id;
    console.log('✅ loadProgressFromSupabase: user_id set to:', user_id);

    // Ambil data dari tabel 'profile' (coba 'profile' lalu 'profiles')
    const fetched = await fetchProfileRow(user_id, 'materi_progress');
    const data = fetched && fetched.data ? fetched.data : null;
    const error = fetched && fetched.error ? fetched.error : null;

    if (data) {
      // Normalize materi_progress into an object with known keys.
      let mp = data.materi_progress;
      if (!mp || typeof mp === 'string') {
        try {
          // attempt JSON parse when it's a string
          mp = (typeof mp === 'string' && mp.trim()) ? JSON.parse(mp) : {};
        } catch (e) {
          mp = {};
        }
      }
      if (typeof mp === 'object' && mp !== null) {
        // ensure all MODULES keys exist as booleans (default false)
        state = {};
        MODULES.forEach(m => { state[m] = !!mp[m]; });
        console.log('loadProgressFromSupabase: loaded progress from DB:', state);
      } else {
        // No progress data - initialize to all false
        state = {};
        MODULES.forEach(m => { state[m] = false; });
        console.log('loadProgressFromSupabase: no progress data, initialized to all false');
      }
      
      // DON'T merge with local storage anymore - it causes "Sudah Dibaca" to appear incorrectly
      // Only use database as source of truth for logged-in users
      
      // If the stored value was empty (no keys), persist a default object
      const hasAnyKey = Object.keys(mp || {}).length > 0;
      if (!hasAnyKey) {
        try{
          const sup = (typeof window !== 'undefined' && window.supabase) ? window.supabase : (typeof supabase !== 'undefined' ? supabase : null);
          if(!sup) throw new Error('supabase client not available');
          
          // try to persist default so other clients see it
          // Upsert into the detected table (fallback to 'profile')
          const targetTable = (fetched && fetched.table) ? fetched.table : 'profile';
          const { error: upErr, data: upData } = await sup.from(targetTable).upsert({ id: user_id, materi_progress: DEFAULT_MATERI_PROGRESS }, { onConflict: 'id' }).select();
          if(upErr) {
            console.error('loadProgressFromSupabase: UPSERT default materi_progress FAILED:', upErr);
            throw upErr;
          }
          console.debug('loadProgressFromSupabase: wrote default materi_progress for user', user_id, upData);
          // also update local state to defaults
          state = {};
          MODULES.forEach(m => { state[m] = !!DEFAULT_MATERI_PROGRESS[m]; });
        }catch(e){ console.warn('loadProgressFromSupabase: failed to write default materi_progress', e); }
      }
    } else if (error) {
       console.error("Error loading progress:", error && error.message ? error.message : error);
    }
    
    loaded = true;
    updateProgressUI();
    refreshButtons();
  }

// --- FUNGSI BARU: Menyimpan progress ke Supabase ---
  async function saveProgressToSupabase() {
    // require a logged-in user; allow saving even if 'loaded' flag hasn't been set yet
    if (!user_id) return false; 

    const sup = (typeof window !== 'undefined' && window.supabase) ? window.supabase : (typeof supabase !== 'undefined' ? supabase : null);
    if(!sup) {
      console.warn('saveProgressToSupabase: supabase client not available');
      return false;
    }

    try {
      // Ensure we persist an object with all module keys explicitly set
      // so other clients / UI can rely on presence of keys.
  // Normalize payload: ensure all keys present (use defaults then override with current state)
  const payload = Object.assign({}, DEFAULT_MATERI_PROGRESS);
  MODULES.forEach(m => { payload[m] = !!state[m]; });

      console.debug('saveProgressToSupabase: user_id=', user_id, 'payload=', payload);

      // Try update first (most common). If no rows were updated, fall back to upsert.
      // Try updating then upserting; attempt both common table names
      const tables = ['profile','profiles'];
      for(const tbl of tables){
        try{
          const { error: updError, data: updData } = await sup
            .from(tbl)
            .update({ materi_progress: payload })
            .eq('id', user_id)
            .select();
          if(!updError){
            const updatedRows = Array.isArray(updData) ? updData.length : (updData ? 1 : 0);
            if(updatedRows){ console.debug('saveProgress update ok on', tbl, updData); return true; }
          } else {
            console.error('saveProgress UPDATE error on', tbl, ':', updError);
          }
        }catch(e){ console.debug('saveProgress update attempt failed on', tbl, e); }
      }

      // If update did not succeed on any table, fallback to upsert on candidates
      for(const tbl of tables){
        try{
          const { error: upError, data: upData } = await sup.from(tbl).upsert({ id: user_id, materi_progress: payload }, { onConflict: 'id' }).select();
          if(!upError){ 
            console.debug('saveProgress upsert ok on', tbl, upData); 
            return true; 
          } else {
            console.error('saveProgress UPSERT error on', tbl, ':', upError);
          }
        }catch(e){ console.debug('saveProgress upsert failed on', tbl, e); }
      }

      console.error('saveProgress: update/upsert failed for all candidate tables');
      return false;

    } catch (e) {
      console.error('saveProgressToSupabase exception', e);
      return false;
    }
  }

  // --- LOCAL QUEUE FALLBACK ---
  const QUEUE_KEY = 'pysphere_progress_queue_v1';
  // Build a per-user local progress key. If userId is falsy, use ':anon' suffix.
  function localProgressKey(uid){ return 'pysphere_materi_progress_local_v1' + (uid ? (':' + uid) : ':anon'); }

  function enqueueProgress(payload){
    try{
      // Normalize queued payload so it always contains the expected keys
      const normalized = Object.assign({}, DEFAULT_MATERI_PROGRESS, payload || {});
      const q = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
      q.push({ ts: Date.now(), user_id: user_id, payload: normalized });
      localStorage.setItem(QUEUE_KEY, JSON.stringify(q));
      console.debug('enqueueProgress saved to local queue', payload);
    }catch(e){ console.warn('enqueueProgress failed', e); }
  }

  async function flushProgressQueue(){
    const sup = (typeof window !== 'undefined' && window.supabase) ? window.supabase : (typeof supabase !== 'undefined' ? supabase : null);
    if (!sup) return; // can't flush yet
    
    try{
      const raw = localStorage.getItem(QUEUE_KEY);
      if(!raw) return;
      const q = JSON.parse(raw || '[]');
      if(!Array.isArray(q) || q.length === 0) return;
      console.debug('flushProgressQueue: attempting to flush', q.length, 'items');
      for(const item of q){
        try{
          if(!item) continue;
          // If item has explicit user_id and it's for another user, skip it.
          if(item.user_id && item.user_id !== user_id) continue;
          // targetUser: if queued item had no user_id (anonymous), associate it with current user_id
          const targetUser = item.user_id || user_id;
          if(!targetUser) continue; // still no user id available

          // try both candidate tables
          const tables = ['profile','profiles'];
          let ok=false;
          for(const tbl of tables){
            try{
              const up = await sup.from(tbl).upsert({ id: targetUser, materi_progress: item.payload }, { onConflict: 'id' }).select();
              if(!up.error){ console.debug('flushProgressQueue upsert ok on', tbl, up.data); ok=true; break; }
            }catch(e){ console.debug('flushProgressQueue upsert failed on', tbl, e); }
          }
          if(!ok) console.warn('flushProgressQueue upsert error for item', item);
        }catch(e){ console.warn('flushProgressQueue item failed', e); }
      }
      // remove only items for this user
      const remaining = q.filter(i => !i || !i.user_id || i.user_id !== user_id);
      if(remaining.length) localStorage.setItem(QUEUE_KEY, JSON.stringify(remaining)); else localStorage.removeItem(QUEUE_KEY);
    }catch(e){ console.warn('flushProgressQueue failed', e); }
  }

  // --- FUNGSI LAMA (Tidak berubah) - Expose as global for tab navigation ---
  const updateProgressUI = () => {
    const total = MODULES.length;
    const done = Object.keys(state).filter(k => state[k]).length;
    const pct = Math.round((done / total) * 100);
    const fill = document.getElementById('materi-progress-fill');
    const pctEl = document.getElementById('materi-progress-percent');
    if(fill) fill.style.width = pct + '%';
    if(pctEl) pctEl.textContent = pct + '%';
  };
  window.updateProgressUI = updateProgressUI;

  // --- FUNGSI LAMA (Tidak berubah) - Expose as global for tab navigation ---
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
  window.refreshButtons = refreshButtons;

  // --- FUNGSI LAMA (Tidak berubah, tapi pastikan 'showModule' ada) ---
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

  // --- INITIALIZATION: DON'T auto-load anonymous progress ---
  // State defaults to all false. Only load progress after we know the user's identity.
  // Anonymous progress will be loaded inside loadProgressFromSupabase() when needed.
  // This prevents showing "Sudah Dibaca" for new users by mistake.
  
  // Initialize UI with default state (all false = "Tandai Dibaca")
  try{ updateProgressUI(); refreshButtons(); }catch(e){ console.warn('Initial UI refresh failed', e); }

  // NOTE: Do not apply global/local progress before knowing which user is active.
  // Applying a shared local copy caused progress from one account to appear when
  // another account logged in on the same browser. We now persist local progress
  // per-user (keyed with the user id) and only merge the correct per-user local
  // copy inside loadProgressFromSupabase() when the currently logged-in user is known.

  // --- LOGIKA KLIK TOMBOL (DIMODIFIKASI) ---
  document.querySelectorAll('.mark-read').forEach(btn=>{
    // Use a capturing handler and stop other listeners so the lightweight
    // handlers in script.js (which toggle dataset attributes) don't clash
    // with our authoritative state object.
  btn.addEventListener('click', async (e)=>{
      try{ e.stopImmediatePropagation(); }catch(_){ /* ignore */ }
      const mod = btn.dataset.module;
      if(!mod) return;
      // Optimistic UI: toggle local state and show a saving indicator on the clicked button
      const prev = !!state[mod];
      state[mod] = !prev;
      updateProgressUI();
      // show temporary saving text on this button only
      const originalText = btn.textContent;
      btn.disabled = true;
      btn.classList.add('opacity-60');
      btn.textContent = 'Menyimpan...';

      // Build normalized payload. For anonymous users persist locally; for logged-in users
      // prefer server as source-of-truth and do NOT write per-user state to localStorage.
      const payload = {};
      MODULES.forEach(m => { payload[m] = !!state[m]; });
      console.log('mark-read clicked:', mod, 'new state:', state);
      try{
        if(!user_id){ // anonymous user -> persist locally under :anon
          const lpKey = localProgressKey(null);
          localStorage.setItem(lpKey, JSON.stringify(payload));
        }
      }catch(e){/* ignore */}

      // Try to save to Supabase; if unavailable or save fails, enqueue locally
      let saved = false;
      
      // DEBUG: Check Supabase and user status
      const sup = (typeof window !== 'undefined' && window.supabase) ? window.supabase : (typeof supabase !== 'undefined' ? supabase : null);
      
      // CRITICAL FIX: Re-check and set user_id if not already set
      if(!user_id && sup && sup.auth){
        try{
          const { data: { user } } = await sup.auth.getUser();
          if(user){
            user_id = user.id;
            console.log('� FIXED: user_id was null, now set to:', user_id);
          }
        }catch(e){
          console.error('Failed to get user on button click:', e);
        }
      }
      
      console.log('�🔍 Debug save - supabase client:', sup ? 'Available' : 'NOT AVAILABLE');
      console.log('🔍 Debug save - user_id:', user_id || 'NOT LOGGED IN');
      console.log('🔍 Debug save - typeof supabase:', typeof supabase);
      console.log('🔍 Debug save - window.supabase:', typeof window.supabase);
      
      if (!sup || !user_id) {
        console.warn('❌ Cannot save to Supabase (not logged in or SDK not ready), enqueueing');
        enqueueProgress(payload);
      } else {
        try{
          const ok = await saveProgressToSupabase();
          if (!ok) {
            console.warn('saveProgressToSupabase returned false, enqueueing');
            enqueueProgress(payload);
          } else {
            saved = true;
            console.log('Progress saved to DB successfully!');
            // do not remove per-user localStorage because we don't store per-user keys anymore
          }
        }catch(e){
          console.warn('saveProgress failed, enqueueing', e);
          enqueueProgress(payload);
        }
      }

      // restore button state and refresh UI to reflect authoritative saved state
      // Use finally block to ALWAYS restore button no matter what
      btn.disabled = false;
      btn.classList.remove('opacity-60');
      refreshButtons();
      console.log('✅ Button restored for module:', mod);
  });
  });

  // --- MEMUAT DATA SAAT HALAMAN DIBUKA ---
  // Panggil fungsi load baru kita -- defer until Supabase client is ready
  // (we'll initialize Supabase-dependent calls in a single async init below)
})();

// --- GANTI BLOK FUNGSI LOGIN/REGISTER LAMA DENGAN INI ---
(function(){
  function el(id){return document.getElementById(id)}
  const openLogin = el('btn-open-login');
  const openReg = el('btn-open-register');
  const backFromLogin = el('login-back');
  const backFromReg = el('reg-back');
  const loginSubmit = el('login-submit');
  const regSubmit = el('reg-submit');
  const logoutBtn = el('btn-logout');

  function showPage(name){ document.querySelectorAll('.page').forEach(p=>p.classList.add('hidden')); const target = document.getElementById(name+'-page') || document.getElementById(name+'-page'); if(target) target.classList.remove('hidden'); }

// --- FUNGSI PROFIL BARU (GLOBAL) ---
  window.showProfileView = async function showProfileView(){
    // Show loading state
    const loggedInEl = el('logged-in');
    const notLoggedEl = el('not-logged');
    
    // Ensure Supabase SDK is ready and attempt to get the current user/session
    try{ await (window.__supabaseReady || Promise.resolve()); }catch(e){ console.warn('supabase init wait failed in showProfileView', e); }

    let user = null;
    try{
      const sup = (typeof window !== 'undefined' && window.supabase) ? window.supabase : (typeof supabase !== 'undefined' ? supabase : null);
      if(!sup || !sup.auth){ throw new Error('supabase.auth not available'); }

      // Prefer getUser(); if not present/empty try getSession()
      try{
        const res = await sup.auth.getUser();
        user = res && res.data && res.data.user ? res.data.user : null;
      }catch(e){ console.debug('supabase.auth.getUser() failed', e); }

      if(!user){
        try{
          const sess = await sup.auth.getSession();
          user = sess && sess.data && sess.data.session ? sess.data.session.user : null;
        }catch(e){ console.debug('supabase.auth.getSession() failed', e); }
      }
    }catch(e){ console.warn('showProfileView: cannot access supabase auth', e); user = null; }

    if(user){
      el('not-logged').classList.add('hidden');
      el('logged-in').classList.remove('hidden');

      // Ambil 'full_name' dari tabel profile/profiles (coba 'profile' lalu 'profiles')
      const fetchedProfile = await fetchProfileRow(user.id, 'full_name');
      const profileData = fetchedProfile && fetchedProfile.data ? fetchedProfile.data : null;
      if(fetchedProfile && fetchedProfile.error) console.debug('showProfileView: profile fetch error', fetchedProfile.error);

  // Prefer full_name from the app's profile table; fall back to OAuth metadata (Google name), then email
  let displayName = null;
  if (profileData && profileData.full_name) {
    const n = String(profileData.full_name || '').trim();
    if (n && !/^(unknown|null|undefined|<null>)$/i.test(n)) displayName = n;
  }
  if (!displayName && user && user.user_metadata) {
    const meta = user.user_metadata || {};
    displayName = meta.full_name || meta.name || meta.user_name || null;
  }
  if (!displayName) displayName = user && user.email ? user.email : 'Pengguna';

      el('profile-name').textContent = displayName;
      el('profile-email').textContent = user.email || '';
      // hide the hint text when logged in
      const hint = el('profile-hint'); if(hint) hint.style.display = 'none';

      // fetch quiz history and best scores
      try{
        const sup = (typeof window !== 'undefined' && window.supabase) ? window.supabase : (typeof supabase !== 'undefined' ? supabase : null);
        if(!sup) throw new Error('supabase client not available');
        
        const [{ data: history, error: hErr }, { data: bests, error: bErr }] = await Promise.all([
          sup.from('quiz_history').select('id, quiz_key, quiz_name, score, max_score, percentage, passed, created_at').eq('user_id', user.id).order('created_at', {ascending:false}).limit(200),
            // Your DB uses table `user_best_score` (singular) with columns: quiz_key, best_percentage, updated_at
            sup.from('user_best_score').select('quiz_key, best_percentage, updated_at').eq('user_id', user.id)
        ]);

        if(hErr) console.error('history fetch error', hErr);
        if(bErr) console.error('bests fetch error', bErr);

        // If user_best_scores is empty but we have history, compute bests from history as fallback
        let computedBests = [];
        if((!bests || bests.length === 0) && history && history.length){
          const map = {};
          history.forEach(h => {
            const key = h.quiz_key || 'unknown';
            const pct = (h.percentage != null) ? Number(h.percentage) : (h.score != null ? Number(h.score) : 0);
            if(!map[key] || pct > map[key].best_percentage){
              map[key] = {
                quiz_key: key,
                best_score: h.score,
                best_max_score: h.max_score,
                best_percentage: pct,
                achieved_at: h.created_at
              };
            }
          });
          computedBests = Object.keys(map).map(k => map[k]);
        }

        const bestEl = el('profile-best-scores');
        const bestSource = (bests && bests.length) ? bests : computedBests;
        if(bestEl){
          if(bestSource && bestSource.length){
            // render as responsive card grid
            let html = '<div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">';
            bestSource.forEach(b=>{
              const quizLabel = escapeHtml(String(b.quiz_key || b.quiz_name || 'Kuis'));
              // Prefer best_percentage (exists in your schema). If not present, try to compute from available fields.
              const pct = (b.best_percentage != null) ? Number(b.best_percentage) : (b.best_score!=null && b.best_max_score? Math.round(100*(b.best_score/b.best_max_score)): null);
              // Updated timestamp column in your table is `updated_at`.
              const dateLabel = (b.updated_at || b.achieved_at) ? new Date(b.updated_at || b.achieved_at).toLocaleString() : '';
              const scoreLabel = (b.best_score!=null ? `${b.best_score}` : '-') + (b.best_max_score? ` / ${b.best_max_score}` : '');
              html += `
                <div class="bg-white rounded-xl shadow p-4 flex items-center gap-4">
                  <div class="w-12 h-12 rounded-full bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center text-white font-bold text-lg">${(pct!=null?Math.round(pct):'--')}</div>
                  <div class="flex-1">
                    <div class="font-semibold text-slate-800">${quizLabel}</div>
                    <div class="text-xs text-slate-500 mt-1">Skor: <span class="font-medium text-slate-700">${scoreLabel}</span> • <span class="text-slate-500">${dateLabel}</span></div>
                  </div>
                  <div class="text-sm text-slate-600 text-right">
                    ${pct!=null?('<div class="font-semibold text-lg text-slate-800">'+Math.round(pct)+'%</div>'):'<div class="text-slate-400">-</div>'}
                  </div>
                </div>`;
            });
            html += '</div>';
            bestEl.innerHTML = html;
          } else {
            bestEl.innerHTML = '<div class="text-sm text-slate-500">Belum ada nilai tertinggi.</div>';
          }
        }

        // render history (most recent first)
        const histEl = el('profile-quiz-history');
        if(histEl){
          if(history && history.length){
            let html = '<div class="space-y-2">';
            history.forEach(h=>{
              html += `<div class="p-2 bg-gray-50 rounded-md border"><div class="font-semibold">${escapeHtml(h.quiz_name||h.quiz_key||'Kuis')}</div><div class="text-xs text-slate-600">Skor: ${h.score!=null?h.score:''}${h.max_score?('/'+h.max_score):''} — ${h.percentage!=null?h.percentage+'%':''} — ${h.passed? 'Lulus' : 'Gagal'} — ${new Date(h.created_at).toLocaleString()}</div></div>`;
            });
            html += '</div>';
            histEl.innerHTML = html;
          } else {
            histEl.innerHTML = '<div class="text-sm text-slate-500">Belum ada riwayat percobaan.</div>';
          }
        }

        // Update quiz panels: hide "Belum dikerjakan." when user has attempted that topic
        const TOPICS = ['getaran','ghs','bandul','pegas'];
        TOPICS.forEach(topic => {
          try{
            const resEl = el('result-' + topic);
            const hasAttempt = history && history.some(h => (h.quiz_key||'').toLowerCase() === topic.toLowerCase());
            if(resEl){
              if(hasAttempt){
                // hide the placeholder text
                resEl.style.display = 'none';
              } else {
                resEl.style.display = '';
                resEl.textContent = 'Belum dikerjakan.';
              }
            }
          }catch(e){/* ignore per-topic errors */}
        });

      }catch(e){
        console.error('Error loading profile quiz data', e);
      }
    } else {
      el('not-logged').classList.remove('hidden');
      el('logged-in').classList.add('hidden');
    }
  }

  // small helper to escape text for insertion into HTML
  function escapeHtml(s){ if(!s && s!==0) return ''; return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }

  // open pages from profile
  if(openLogin) openLogin.addEventListener('click', ()=>{ document.querySelectorAll('.page').forEach(p=>p.classList.add('hidden')); el('login-page').classList.remove('hidden'); });
  if(openReg) openReg.addEventListener('click', ()=>{ document.querySelectorAll('.page').forEach(p=>p.classList.add('hidden')); el('register-page').classList.remove('hidden'); });
  if(backFromLogin) backFromLogin.addEventListener('click', ()=>{ document.querySelectorAll('.page').forEach(p=>p.classList.add('hidden')); el('profile-page').classList.remove('hidden'); window.showProfileView(); });
  if(backFromReg) backFromReg.addEventListener('click', ()=>{ document.querySelectorAll('.page').forEach(p=>p.classList.add('hidden')); el('profile-page').classList.remove('hidden'); window.showProfileView(); });

  // register (logika dipindah ke register.html)
  // login (logika dipindah ke login.html)
  // Hapus event listener 'regSubmit' dan 'loginSubmit' dari file ini.

  // --- LOGOUT BARU ---
  if(logoutBtn) logoutBtn.addEventListener('click', ()=>{
    // LANGSUNG redirect tanpa menunggu apapun!
    // Clear local state dulu
    try{ sessionStorage.removeItem('pysphere_active_page'); }catch(e){}
    try{ localStorage.removeItem('pysphere_active_page'); }catch(e){}
    
    // Sign out di background (tidak menunggu)
    (async () => {
      try{
        await (window.__supabaseReady || Promise.resolve());
        const sup = (typeof window !== 'undefined' && window.supabase) ? window.supabase : (typeof supabase !== 'undefined' ? supabase : null);
        if (sup && sup.auth && typeof sup.auth.signOut === 'function'){
          sup.auth.signOut().catch(e => console.warn('Background signOut error:', e));
        }
      }catch(e){ console.warn('Background signOut failed', e); }
    })();
    
    // LANGSUNG redirect ke halaman selamat datang - TIDAK MENUNGGU!
    window.location.href = '/src/html/index.html';
  });

  // initialize Supabase-dependent pieces after the SDK is ready
  (async function initSupabaseDependent(){
    try{
      await (window.__supabaseReady || Promise.resolve());
    }catch(e){
      console.warn('supabase init failed or timed out', e);
    }

    // If user logged in via OAuth (Google), ensure their name from OAuth metadata
    // is saved into the app's profile table so the UI shows the correct display name.
    async function upsertProfileFromOAuth(){
      try{
        const sup = (typeof window !== 'undefined' && window.supabase) ? window.supabase : (typeof supabase !== 'undefined' ? supabase : null);
        if(!sup || !sup.auth) return;
        
        const { data: { user } } = await sup.auth.getUser();
        if(!user) return;

        // try to read friendly name from OAuth metadata (common fields)
        const meta = user.user_metadata || {};
        const oauthName = meta.full_name || meta.name || meta.user_name || null;
        if(!oauthName) return; // nothing to write

        // Check if profile already has a full_name saved
        try{
          const fetched = await fetchProfileRow(user.id, 'full_name');
          if(fetched && fetched.data && fetched.data.full_name){
            // already present, nothing to do
            return;
          }
        }catch(e){ /* ignore and attempt upsert anyway */ }

  // Build payload; include email and default materi_progress so new profiles have expected keys
  const payload = { id: user.id, full_name: oauthName, email: user.email || null, materi_progress: DEFAULT_MATERI_PROGRESS };
        const tables = ['profiles','profile'];
        for(const tbl of tables){
          try{
            const { error, data } = await sup.from(tbl).upsert(payload, { onConflict: 'id' }).select();
            if(!error){
              console.debug('upsertProfileFromOAuth: upserted into', tbl, data);
              return;
            } else {
              console.debug('upsertProfileFromOAuth: upsert error on', tbl, error.message || error);
            }
          }catch(e){ console.debug('upsertProfileFromOAuth: exception upserting on', tbl, e); }
        }
      }catch(e){ console.warn('upsertProfileFromOAuth failed', e); }
    }

    try{ if(typeof upsertProfileFromOAuth === 'function') await upsertProfileFromOAuth(); }catch(e){ console.warn('upsertProfileFromOAuth failed', e); }

    // Check login status and show warning if not logged in
    // IMPORTANT: This also SETS user_id variable!
    try{ 
      if(typeof checkLoginStatus === 'function') {
        const isLoggedIn = await checkLoginStatus();
        console.log('🔍 Init: checkLoginStatus result:', isLoggedIn);
      }
    }catch(e){ console.warn('checkLoginStatus failed', e); }

    try{ if(typeof loadProgressFromSupabase === 'function') await loadProgressFromSupabase(); }catch(e){ console.warn('loadProgressFromSupabase failed', e); }
    // Attempt to flush any locally queued progress for this user
    try{ if(typeof flushProgressQueue === 'function') await flushProgressQueue(); }catch(e){ console.warn('flushProgressQueue failed', e); }
    try{ if(typeof window.showProfileView === 'function') await window.showProfileView(); }catch(e){ console.warn('showProfileView failed', e); }

    // Subscribe to auth state changes so we can switch the in-memory progress state
    // to the currently active account (prevents anonymous/local data from leaking
    // into a different signed-in account and ensures UI reflects the correct user).
    try{
      const sup = (typeof window !== 'undefined' && window.supabase) ? window.supabase : (typeof supabase !== 'undefined' ? supabase : null);
      if(sup && sup.auth && typeof sup.auth.onAuthStateChange === 'function'){
        const { data: authSub } = sup.auth.onAuthStateChange(async (event, session) => {
          try{ console.debug('supabase auth state change', event); }catch(_){}
          if(event === 'SIGNED_IN'){
            // A user signed in: reload authoritative progress from server (or per-user local)
            user_id = session && session.user ? session.user.id : null;
            loaded = false; // force reload
            
            // Check login status and hide warning
            try{ if(typeof checkLoginStatus === 'function') await checkLoginStatus(); }catch(e){ console.warn('auth listener: checkLoginStatus failed', e); }
            
            try{ if(typeof loadProgressFromSupabase === 'function') await loadProgressFromSupabase(); }catch(e){ console.warn('auth listener: loadProgressFromSupabase failed', e); }
            try{ if(typeof flushProgressQueue === 'function') await flushProgressQueue(); }catch(e){ console.warn('auth listener: flushProgressQueue failed', e); }
            
            // Immediately show profile view after login
            try{ if(typeof window.showProfileView === 'function') await window.showProfileView(); }catch(e){ console.warn('auth listener: showProfileView failed', e); }
            
            // Auto-navigate to profile tab after login to show user info
            setTimeout(() => {
              try{
                const profileBtn = document.querySelector('.tab-button[data-page="profile"]');
                if(profileBtn) {
                  profileBtn.click();
                  // Refresh profile view again to ensure data is loaded
                  setTimeout(() => {
                    try{ if(typeof window.showProfileView === 'function') window.showProfileView(); }catch(e){}
                  }, 300);
                }
              }catch(e){ console.warn('Failed to auto-navigate to profile', e); }
            }, 100);
            
          } else if(event === 'SIGNED_OUT'){
            // User signed out: clear user_id and reset state to all false
            user_id = null;
            loaded = false;
            try{
              // Reset state to all false - clean slate
              state = {};
              MODULES.forEach(m => { state[m] = false; });
              // Don't load anonymous progress - keep it clean
            }catch(e){ console.warn('auth listener: failed resetting state', e); }
            
            // Show warning banner
            try{ if(typeof checkLoginStatus === 'function') await checkLoginStatus(); }catch(e){ console.warn('auth listener: checkLoginStatus failed after signout', e); }
            
            try{ updateProgressUI(); refreshButtons(); }catch(e){}
            try{ if(typeof window.showProfileView === 'function') await window.showProfileView(); }catch(e){ console.warn('auth listener: showProfileView failed after signout', e); }
          }
        });
        // store subscription so other code can unsubscribe if needed
        window.__supabaseAuthSub = authSub;
      }
    }catch(e){ console.warn('failed to attach auth state listener', e); }

    // re-attach DOMContentLoaded fallback in case consumers expect it
    try{ window.dispatchEvent(new Event('supabase-ready')); }catch(e){}
  })();
})();
