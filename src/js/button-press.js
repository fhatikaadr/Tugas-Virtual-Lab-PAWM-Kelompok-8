(function(){
  function addPressedHandlers(btn){
    btn.addEventListener('mousedown', ()=> btn.classList.add('pressed'));
    btn.addEventListener('mouseup', ()=> btn.classList.remove('pressed'));
    btn.addEventListener('mouseleave', ()=> btn.classList.remove('pressed'));
    btn.addEventListener('touchstart', ()=> btn.classList.add('pressed'), {passive:true});
    btn.addEventListener('touchend', ()=> btn.classList.remove('pressed'));
    btn.addEventListener('keydown', (e)=>{
      if(e.key === ' ' || e.key === 'Enter'){
        btn.classList.add('pressed');
      }
    });
    btn.addEventListener('keyup', (e)=>{
      if(e.key === ' ' || e.key === 'Enter'){
        btn.classList.remove('pressed');
      }
    });
  }

  function attachAll(){ document.querySelectorAll('button').forEach(addPressedHandlers); }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', attachAll); else attachAll();

  const mo = new MutationObserver((mutations)=>{
    for(const m of mutations){
      if(m.addedNodes && m.addedNodes.length){
        m.addedNodes.forEach(node=>{
          if(node.nodeType === 1){
            if(node.tagName === 'BUTTON') addPressedHandlers(node);
            node.querySelectorAll && node.querySelectorAll('button').forEach(addPressedHandlers);
          }
        });
      }
    }
  });
  mo.observe(document.body, {childList:true,subtree:true});
})();
