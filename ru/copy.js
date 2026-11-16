/* Archived exercise compatibility with self-contained audio and local progress. */
(function(){
  var activated=false,audio=new Audio(),activeElement=null,request=0;
  document.addEventListener('pointerdown',function(){activated=true;},true);
  document.addEventListener('keydown',function(){activated=true;},true);
  audio.id='original-audio-player';audio.hidden=true;audio.preload='none';document.body.appendChild(audio);
  function clear(){if(activeElement)activeElement.classList.remove('jp_pause');}
  function failed(){clear();document.body.dataset.audioStatus='error';if(activeElement)activeElement.title='Не удалось воспроизвести запись. Попробуй ещё раз.';}
  audio.addEventListener('ended',function(){clear();document.body.dataset.audioStatus='ended';});
  audio.addEventListener('error',failed);
  function decorate(){Array.prototype.forEach.call(document.querySelectorAll('.jp_control'),function(el){if(el.dataset.audioReady)return;el.dataset.audioReady='1';el.setAttribute('role','button');el.setAttribute('tabindex','0');el.setAttribute('aria-label','Прослушать по-английски');el.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();el.click();}});});}
  decorate();new MutationObserver(decorate).observe(document.body,{childList:true,subtree:true});
  function play(link,el,noPlay){
    if(noPlay||!activated)return;
    var version=(window.copyAudioVersions||{})[link];
    var asset=link+(version?(link.indexOf('?')>=0?'&':'?')+'v='+version:'');
    if(activeElement===el&&audio.getAttribute('src')===asset&&!audio.paused){audio.pause();clear();document.body.dataset.audioStatus='paused';return;}
    clear();audio.pause();activeElement=el;var current=++request;
    audio.src=asset;document.body.dataset.audioStatus='loading';if(el)el.classList.add('jp_pause');
    audio.onplaying=function(){document.body.dataset.audioSource=(window.copyAudioFiles||{})[link]||'file';document.body.dataset.audioStatus='playing';};
    audio.play().catch(function(error){if(current===request&&error.name!=='AbortError')failed();});
  }
  window.cJplayer=function(link,el){play(link,el,false);};
  window.ps_Jplayer=function(link,el,noPlay){play(link,el,noPlay);};
  window.ex_Jplayer=function(link,el,noPlay){play(link,el,noPlay);};
  window.addEventListener('pagehide',function(){audio.pause();clear();});
  if(!window.jQuery)return;
  jQuery(function(){
    var lesson=location.pathname.match(/lesson-(\d+)/)||location.pathname.match(/\/lessons\/(\d+)(?:\.html)?\/?$/);
    var lessonId=document.body.dataset.currentLesson||(lesson&&lesson[1]);if(!lessonId)return;
    var key='study-grammar-'+lessonId;
    try{var saved=JSON.parse(localStorage.getItem(key)||'{}');Object.keys(saved).forEach(function(id){if(window.stResults)window.stResults(jQuery('<span>').text(saved[id]),id.replace('step',''));});}catch(e){}
    var save=function(){var result={};jQuery('[id^="step"]').each(function(){if(/^step\d+$/.test(this.id))result[this.id]=jQuery(this).text();});try{localStorage.setItem(key,JSON.stringify(result));}catch(e){}};
    jQuery(document).on?jQuery(document).on('click',save):jQuery(document).bind('click',save);
  });
})();
