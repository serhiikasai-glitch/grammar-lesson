(function(){
  'use strict';
  const $=s=>document.querySelector(s);
  const $$=s=>Array.from(document.querySelectorAll(s));
  const read=id=>{try{return JSON.parse(localStorage.getItem('study-grammar-'+id)||'{}');}catch{return {};}};
  const safeGet=k=>{try{return localStorage.getItem(k);}catch{return null;}};
  const safeSet=(k,v)=>{try{localStorage.setItem(k,v);}catch{}};
  const normalize=s=>s.toLocaleLowerCase('uk').replace(/ё/g,"е").trim();
  let lessons=[];
  function stats(l){const saved=read(l.id);const done=Array.from({length:l.exercises},(_,i)=>Number(saved['step'+i])>=60).filter(Boolean).length;return {done,complete:done===l.exercises,percent:Math.round(done/l.exercises*100)};}
  function progress(){
    let complete=0;lessons.forEach(l=>{const s=stats(l);if(s.complete)complete++;$$('[data-lesson="'+l.id+'"]').forEach(card=>{card.classList.toggle('is-complete',s.complete);const flag=card.querySelector('.card-done,.course-complete');if(flag)flag.hidden=!s.complete;const bar=card.querySelector('.card-progress i');if(bar)bar.style.width=s.percent+'%';});});
    if($('#overall-progress'))$('#overall-progress').style.width=(complete/25*100)+'%';
    if($('#progress-caption'))$('#progress-caption').textContent=complete+" з 25 уроків";
    const last=safeGet('grammar-last-lesson');const recent=lessons.find(l=>l.id===last);const next=recent&&!stats(recent).complete?recent:lessons.find(l=>!stats(l).complete)||lessons[0];
    if($('#continue-learning'))$('#continue-learning').href=next.url;
    if(recent&&$('#progress-title')){$('#progress-title').textContent=complete===25?"Усі уроки пройдено. Чудова робота!":"Продовжимо з того місця, де зупинилися?";$('#progress-description').textContent="Урок "+next.number+' · '+next.title;$('#start-learning').href=next.url;$('#start-learning').firstChild.textContent="Продовжити навчання ";}
    const id=document.body.dataset.currentLesson;if(id){const l=lessons.find(l=>l.id===id);if(l){const s=stats(l);$('#lesson-progress-label').textContent="Виконано "+s.done+" з "+l.exercises+" вправ";$('#lesson-progress-fill').style.width=s.percent+'%';}}
  }
  function init(){
    const engine=window.nb1;
    if(engine&&window.jQuery){
      engine.openEx=function(index){
        engine.helperBlock.stop(true,true).css({top:0});engine.hHelperBlock.stop(true,true).css({height:'auto',maxHeight:'none'});
        engine.nexBlocks.removeClass('nex-block-active').hide().eq(index).show().addClass('nex-block-active');
        engine.tabsButtons.find('a').attr('aria-current','false').eq(index).attr('aria-current','step');
      };
      engine.expandEx=function(){engine.helperBlock.stop(true,true).css({top:0});engine.hHelperBlock.stop(true,true).css({height:'auto',maxHeight:'none'});engine.nexBlocks.show();};
      engine.openEx(engine.activeEx());
    }
    if($('#tab02>div'))$('#tab02>div').textContent="Правила";
    $$('.fs-container').forEach(container=>{
      const on=container.querySelector('.opt-transcribe_on'),off=container.querySelector('.opt-transcribe_off'),transcript=container.querySelector('.fs-transcript');if(!on||!off||!transcript)return;
      window.jQuery(container).find('.drop_1,.drop_2bl').unbind('mouseenter mouseleave');
      const settings=container.querySelector('.tb_settings'),menu=container.querySelector('.tb_settings-wrap');
      if(settings){settings.setAttribute('role','button');settings.setAttribute('tabindex','0');settings.setAttribute('aria-expanded','false');settings.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();settings.click();}});settings.addEventListener('click',()=>settings.setAttribute('aria-expanded',String(settings.getAttribute('aria-expanded')!=='true')));}
      container.querySelectorAll('.tcheck').forEach(option=>{option.setAttribute('role','button');option.setAttribute('tabindex','0');option.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();option.click();}});});
      const row=document.createElement('label');row.className='transcription-toggle';
      const input=document.createElement('input');input.type='checkbox';input.setAttribute('aria-label',"Показувати транскрипцію");
      transcript.id=container.id+'-transcription';input.setAttribute('aria-controls',transcript.id);
      const label=document.createElement('span');label.textContent="Транскрипція";row.append(input,label);
      container.insertBefore(row,container.querySelector('.fs-window'));
      const sync=show=>{input.checked=show;safeSet('grammar-show-transcription',show?'1':'0');};
      on.addEventListener('click',()=>sync(true));off.addEventListener('click',()=>sync(false));
      input.addEventListener('change',()=>{(input.checked?on:off).click();});
      const saved=safeGet('grammar-show-transcription');(saved!=='0'?on:off).click();
      const autoOn=container.querySelector('.opt-autoplay_on'),autoOff=container.querySelector('.opt-autoplay_off');
      if(autoOn&&autoOff){autoOn.addEventListener('click',()=>safeSet('grammar-autoplay','1'));autoOff.addEventListener('click',()=>safeSet('grammar-autoplay','0'));const auto=safeGet('grammar-autoplay');if(auto!==null)(auto==='1'?autoOn:autoOff).click();}
    });
    const cards=$$('.lesson-card');let filter='all';
    function applyFilter(){const text=normalize($('#lesson-search')?.value||'');let visible=0;cards.forEach(card=>{const show=(filter==='all'||card.dataset.module===filter)&&normalize(card.dataset.search).includes(text);card.hidden=!show;if(show)visible++;});if($('#lesson-count'))$('#lesson-count').textContent=visible+' '+(visible%10===1&&visible%100!==11?"урок":visible%10>=2&&visible%10<=4&&(visible%100<12||visible%100>14)?"уроки":"уроків");if($('.empty-state'))$('.empty-state').hidden=visible>0;}
    $$('.filter-button').forEach(btn=>btn.addEventListener('click',()=>{filter=btn.dataset.filter;$$('.filter-button').forEach(b=>{const active=b===btn;b.classList.toggle('is-active',active);b.setAttribute('aria-pressed',String(active));});applyFilter();}));
    $('#lesson-search')?.addEventListener('input',applyFilter);
    $('#reset-search')?.addEventListener('click',()=>{$('#lesson-search').value='';$('.filter-button[data-filter="all"]').click();$('#lesson-search').focus();});
    $('.course-toggle')?.addEventListener('click',()=>{const open=$('.course-sidebar').classList.toggle('is-open');$('.course-toggle').setAttribute('aria-expanded',String(open));});
    const id=document.body.dataset.currentLesson;if(id)safeSet('grammar-last-lesson',id);
    fetch('/uk/lessons.json').then(r=>r.json()).then(data=>{lessons=data;progress();}).catch(()=>{});
    window.addEventListener('storage',progress);
    // The original checks run first; read the updated scores after their click handlers finish.
    document.addEventListener('click',()=>setTimeout(progress,0));
    $$('.fs-btn,.nex-com-icon,.nex-check-done,.nex-ex-icon,.nex-f-button,#tabs_row .ptab').forEach(el=>{el.setAttribute('role','button');el.setAttribute('tabindex','0');if(el.classList.contains('nex-com-icon'))el.setAttribute('aria-label',"Підказка до вправи");el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();el.click();}});});
    // Keep the compact exercise view readable after a device rotates or the window changes size.
    let resizeTimer;window.addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>{const button=$('.nex-t-active a');if(button)button.click();},180);});
  }
  if(window.jQuery)window.jQuery(init);
  else if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
