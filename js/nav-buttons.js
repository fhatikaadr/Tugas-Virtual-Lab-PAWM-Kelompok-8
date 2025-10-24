// Navigation helpers for buttons: data-page, data-target, data-module, data-topic
(function(){
  function showPage(pageId){
    document.querySelectorAll('.page').forEach(p=>{
      if(p.id === pageId) p.classList.remove('hidden'); else p.classList.add('hidden');
    });
  }

  function activateTabButton(page){
    document.querySelectorAll('.tab-button').forEach(btn=>{
      if(btn.dataset.page === page) btn.classList.add('active'); else btn.classList.remove('active');
    });
  }

  function scrollToId(id){
    const el = document.getElementById(id);
    if(!el) return false;
    // ensure parent page visible if exists
    const pageAncestor = el.closest('.page');
    if(pageAncestor){
      // show the page that contains this element
      const pid = pageAncestor.id;
      // normalize: many pages are named like 'materi-page'
      if(pid) showPage(pid);
    }
    el.scrollIntoView({behavior:'smooth', block:'start'});
    return true;
  }

  function handleClick(e){
    const btn = e.currentTarget;
    const page = btn.dataset.page;
    const target = btn.dataset.target;
    const module = btn.dataset.module;
    const topic = btn.dataset.topic;

    if(page){
      const pageId = page.endsWith('-page') ? page : page + '-page';
      showPage(pageId);
      activateTabButton(page);
      // scroll to top
      window.scrollTo({top:0,behavior:'smooth'});
      return;
    }

    if(target){
      // target usually an id of article
      if(!scrollToId(target)){
        // try show materi page first then scroll
        showPage('materi-page');
        scrollToId(target);
      }
      return;
    }

    if(module){
      // modules live inside materi page
      showPage('materi-page');
      scrollToId(module);
      return;
    }

    if(topic){
      // quiz topics: show quiz page and scroll to quiz-<topic>
      showPage('quiz-page');
      const qid = 'quiz-' + topic;
      // small timeout to allow layout change
      setTimeout(()=> scrollToId(qid), 50);
      return;
    }

    // fallback: if button has data-href behave like anchor
    const href = btn.dataset.href || btn.getAttribute('href');
    if(href && href.startsWith('#')){
      const id = href.slice(1);
      scrollToId(id);
    }
  }

  function attach(btn){
    // avoid double attach
    if(btn.__nav_attached) return; btn.__nav_attached = true;
    btn.addEventListener('click', handleClick);
  }

  function attachAll(){
    document.querySelectorAll('button, a[data-href]').forEach(el=>{
      // prefer buttons; attach only to elements that have our dataset markers
      if(el.dataset.page || el.dataset.target || el.dataset.module || el.dataset.topic || el.dataset.href || el.getAttribute('href')?.startsWith('#')) attach(el);
    });
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', attachAll); else attachAll();

  // observe DOM for dynamic buttons
  const mo = new MutationObserver(muts=>{
    muts.forEach(m=>{
      m.addedNodes.forEach(n=>{
        if(n.nodeType===1){
          if(n.matches && (n.matches('button') || n.matches('a'))) attach(n);
          n.querySelectorAll && n.querySelectorAll('button, a').forEach(el=> attach(el));
        }
      });
    });
  });
  mo.observe(document.body, {childList:true,subtree:true});

  // support deep-link via URL hash on load
  if(location.hash){
    const id = location.hash.slice(1);
    // try topic or module or page
    if(document.getElementById(id)) setTimeout(()=> scrollToId(id), 80);
    else if(document.getElementById(id + '-page')) setTimeout(()=> showPage(id + '-page'), 80);
  }
})();
