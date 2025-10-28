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
    const pageAncestor = el.closest('.page');
    if(pageAncestor){
      const pid = pageAncestor.id;
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
      window.scrollTo({top:0,behavior:'smooth'});
      return;
    }

    if(target){
      if(!scrollToId(target)){
        showPage('materi-page');
        scrollToId(target);
      }
      return;
    }

    if(module){
      showPage('materi-page');
      scrollToId(module);
      return;
    }

    if(topic){
      showPage('quiz-page');
      const qid = 'quiz-' + topic;
      setTimeout(()=> scrollToId(qid), 50);
      return;
    }

    const href = btn.dataset.href || btn.getAttribute('href');
    if(href && href.startsWith('#')){
      const id = href.slice(1);
      scrollToId(id);
    }
  }

  function attach(btn){
    if(btn.__nav_attached) return; btn.__nav_attached = true;
    btn.addEventListener('click', handleClick);
  }

  function attachAll(){
    document.querySelectorAll('button, a[data-href]').forEach(el=>{
      if(el.dataset.page || el.dataset.target || el.dataset.module || el.dataset.topic || el.dataset.href || el.getAttribute('href')?.startsWith('#')) attach(el);
    });
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', attachAll); else attachAll();

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

  if(location.hash){
    const id = location.hash.slice(1);
    if(document.getElementById(id)) setTimeout(()=> scrollToId(id), 80);
    else if(document.getElementById(id + '-page')) setTimeout(()=> showPage(id + '-page'), 80);
  }
})();
