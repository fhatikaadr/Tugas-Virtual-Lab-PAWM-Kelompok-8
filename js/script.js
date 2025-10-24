// Minimal restored script: provides basic UI behavior and stubs to replace the corrupted large script.
// Purpose: restore core interactions so the page is usable. This is a safe, conservative replacement.

(function(){
  // Show page helper: pages have ids like 'materi-page'
  function showPage(pageId){
    document.querySelectorAll('.page').forEach(p=>p.classList.add('hidden'));
    const el = document.getElementById(pageId);
    if(el) el.classList.remove('hidden');
  }

  function activateTab(pageName){
    document.querySelectorAll('.tab-button').forEach(b=>{
      if(b.dataset.page === pageName) b.classList.add('active'); else b.classList.remove('active');
    });
  }

  // Restore initial active page from sessionStorage or default to materi
  document.addEventListener('DOMContentLoaded', function(){
    var active = null;
    try{ active = sessionStorage.getItem('pysphere_active_page'); }catch(e){}
    if(!active) active = 'materi';
    showPage(active + '-page');
    activateTab(active);

    // attach mark-read handlers
    document.querySelectorAll('.mark-read').forEach(btn => {
      btn.addEventListener('click', function(){
        const mod = btn.dataset.module;
        if(!mod) return;
        // toggle marked state
        const marked = btn.dataset.marked === '1';
        btn.dataset.marked = marked ? '0' : '1';
        btn.textContent = marked ? 'Tandai Dibaca' : 'Sudah Dibaca';
        updateMateriProgress();
      });
    });

    // attach modal close
    const modalClose = document.getElementById('modal-close');
    if(modalClose) modalClose.addEventListener('click', ()=> document.getElementById('modal').classList.add('hidden'));

    // attach simple quiz button handlers for start/submit/retry/review
    document.querySelectorAll('.start-topic').forEach(b=> b.addEventListener('click', startTopicHandler));
    document.querySelectorAll('.submit-topic').forEach(b=> b.addEventListener('click', submitTopicHandler));
    document.querySelectorAll('.review-topic').forEach(b=> b.addEventListener('click', reviewTopicHandler));
    document.querySelectorAll('.retry-topic').forEach(b=> b.addEventListener('click', retryTopicHandler));

    // vlab simple controls
    const modePegas = document.getElementById('mode-pegas');
    const modeBandul = document.getElementById('mode-bandul');
    if(modePegas) modePegas.addEventListener('click', ()=> setVlabMode('Pegas'));
    if(modeBandul) modeBandul.addEventListener('click', ()=> setVlabMode('Bandul'));

    const startBtn = document.getElementById('start-btn');
    const resetBtn = document.getElementById('reset-btn');
    if(startBtn) startBtn.addEventListener('click', ()=> startVlab());
    if(resetBtn) resetBtn.addEventListener('click', ()=> resetVlab());

    // ensure page buttons persist active page
    document.querySelectorAll('.tab-button').forEach(btn=> btn.addEventListener('click', function(){
      const page = btn.dataset.page || 'materi';
      try{ sessionStorage.setItem('pysphere_active_page', page); }catch(e){}
    }));

    // compute initial progress
    updateMateriProgress();
  });

  // Update material progress bar based on .mark-read buttons
  function updateMateriProgress(){
    const marks = Array.from(document.querySelectorAll('.mark-read'));
    if(marks.length === 0) return;
    const done = marks.filter(b => b.dataset.marked === '1').length;
    const pct = Math.round((done / marks.length) * 100);
    const fill = document.getElementById('materi-progress-fill');
    const pctEl = document.getElementById('materi-progress-percent');
    if(fill) fill.style.width = pct + '%';
    if(pctEl) pctEl.textContent = pct + '%';
  }

  // Simple vlab stubs: display some computed values and expose vlabRefresh
  let vlabState = {mode:'Pegas', running:false, t:0, iv:null};
  function setVlabMode(m){ vlabState.mode = m; const label = document.getElementById('vlab-mode-label'); const display = document.getElementById('vlab-mode-display'); if(label) label.textContent = m; if(display) display.textContent = m; }
  function startVlab(){ if(vlabState.running) return; vlabState.running = true; vlabState.iv = setInterval(()=>{
    vlabState.t += 0.1;
    updateVlabDisplay();
  }, 100); }
  function resetVlab(){ vlabState.running = false; vlabState.t = 0; if(vlabState.iv){ clearInterval(vlabState.iv); vlabState.iv = null; } updateVlabDisplay(); }
  function updateVlabDisplay(){
    const pos = (Math.sin(vlabState.t) * 0.5).toFixed(3);
    const omega = (vlabState.mode === 'Pegas' ? 3.162 : 2.0).toFixed(3);
    const period = (2*Math.PI/parseFloat(omega)).toFixed(3);
    const elPos = document.getElementById('vlab-pos');
    const elOmega = document.getElementById('vlab-omega');
    const elPeriod = document.getElementById('vlab-period');
    const elVel = document.getElementById('vlab-vel');
    const elAcc = document.getElementById('vlab-acc');
    if(elPos) elPos.textContent = pos;
    if(elOmega) elOmega.textContent = omega;
    if(elPeriod) elPeriod.textContent = period;
    if(elVel) elVel.textContent = (Math.cos(vlabState.t)*0.5).toFixed(3);
    if(elAcc) elAcc.textContent = (Math.sin(vlabState.t)*-0.5).toFixed(3);
  }
  window.vlabRefresh = function(opts){ if(opts && opts.autoplay) startVlab(); else updateVlabDisplay(); };

  // Quiz button handlers (lightweight)
  function startTopicHandler(e){ const topic = e.currentTarget.dataset.topic; if(!topic) return; document.querySelector('.tab-button[data-page="quiz"]')?.click(); setTimeout(()=>{ const el = document.getElementById('quiz-' + topic); if(el) el.scrollIntoView({behavior:'smooth'}); },80); }
  function submitTopicHandler(e){ const topic = e.currentTarget.dataset.topic; if(!topic) return; const res = document.getElementById('result-' + topic); if(res) res.textContent = 'Sudah dikirim. Skor: — (fitur lengkap offline)'; }
  function reviewTopicHandler(e){ const topic = e.currentTarget.dataset.topic; if(!topic) return; const res = document.getElementById('result-' + topic); if(res) res.textContent = 'Rangkuman: belum tersedia (fitur lengkap di skrip penuh).'; }
  function retryTopicHandler(e){ const topic = e.currentTarget.dataset.topic; if(!topic) return; const container = document.getElementById('question-container-' + topic); if(container) container.innerHTML = '<div class="p-3 text-sm text-slate-600">Mengulang topik — soal akan disediakan di versi lengkap.</div>'; }

})();

