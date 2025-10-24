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

function shuffleArray(arr){ return arr.slice().sort(()=>Math.random()-0.5); } // local helper (reuse safe)

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
    if(!showAll) html += `<div><button id='prev-${topic}' class='vlab-button bg-white border mr-2'>Sebelumnya</button><button id='next-${topic}' class='vlab-button bg-blue-500 text-white'>Selanjutn** End Patch
