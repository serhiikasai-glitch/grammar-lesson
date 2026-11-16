(function(){
  'use strict';
  const preference='grammar-transcription-language';
  const modes=['uk','ru','ipa'];
  const locale=(document.documentElement.lang||'uk').split('-')[0];
  const words={
    uk:{label:'Мова транскрипції',uk:'Українські літери',ru:'Російські літери',ipa:'IPA',listen:'Послухати англійською'},
    ru:{label:'Язык транскрипции',uk:'Украинские буквы',ru:'Русские буквы',ipa:'IPA',listen:'Послушать по-английски'},
    en:{label:'Transcription language',uk:'Ukrainian letters',ru:'Russian letters',ipa:'IPA',listen:'Listen in English'}
  }[locale]||{label:'Мова транскрипції',uk:'Українські літери',ru:'Російські літери',ipa:'IPA',listen:'Послухати англійською'};
  const safeGet=key=>{try{return localStorage.getItem(key);}catch{return null;}};
  const safeSet=(key,value)=>{try{localStorage.setItem(key,value);}catch{}};
  const storedMode=()=>{const value=safeGet(preference);return modes.includes(value)?value:'uk';};
  let currentMode=storedMode();
  const selectedMode=()=>currentMode;
  const decoder=document.createElement('div');
  const normalize=value=>{decoder.innerHTML=String(value||'');return (decoder.textContent||'').replace(/\u00a0/g,' ').replace(/\s+/g,' ').trim();};
  const installed=[];

  function install(container){
    if(container.dataset.cardSettingsReady)return;
    const instance=window[container.id];
    const data=window.copyCardData;
    if(!instance||!Array.isArray(instance.basicArray)||typeof instance.passage!=='function'||!instance.transcriptHolder||!data)return;
    let covered=0;
    instance.basicArray.forEach(row=>{
      const card=data[normalize(row.origin)];
      if(card&&card.sound){row.sound=card.sound;covered++;}
    });
    instance.sounds=1;
    container.classList.remove('fs-no-sound');
    container.dataset.cardAudio=covered===instance.basicArray.length?'complete':'incomplete';

    const options=document.createElement('div');
    options.className='card-reading-options';
    const toggle=container.querySelector('.transcription-toggle');
    container.insertBefore(options,container.querySelector('.fs-window'));
    if(toggle)options.append(toggle);
    const label=document.createElement('label');
    label.className='transcription-language';
    const caption=document.createElement('span');caption.textContent=words.label;
    const select=document.createElement('select');
    select.className='transcription-language-select';
    select.id=container.id+'-transcription-language';
    select.setAttribute('aria-label',words.label);
    const transcript=container.querySelector('.fs-transcript');
    if(transcript&&transcript.id)select.setAttribute('aria-controls',transcript.id);
    modes.forEach(mode=>{
      const option=document.createElement('option');
      option.value=mode;option.textContent=words[mode];option.lang=mode==='ipa'?'en':mode;
      select.append(option);
    });
    select.value=selectedMode();label.append(caption,select);options.append(label);

    function paintReading(){
      const row=instance.basicArray[instance.counter];
      const card=data[normalize(row&&row.origin)];
      const mode=selectedMode();
      select.value=mode;
      if(card&&typeof card[mode]==='string'){
        instance.transcriptHolder.text('['+card[mode]+']');
        instance.transcriptHolder.attr('lang',mode==='ipa'?'en':mode);
        if(transcript)transcript.dataset.transcriptionLanguage=mode;
      }
    }
    let quiet=0;
    const passage=instance.passage;
    instance.passage=function(){
      const autoplay=instance.autoPlayOn;
      const checked=quiet&&autoplay&&autoplay.hasClass('checked');
      const previousAuto=instance.autoPlay;
      if(checked)autoplay.removeClass('checked');
      try{passage.apply(instance,arguments);}
      finally{
        if(checked)autoplay.addClass('checked');
        if(quiet)instance.autoPlay=previousAuto;
      }
      paintReading();
      container.querySelectorAll('.fs-sound .jp_control').forEach(button=>{
        button.setAttribute('aria-label',words.listen);
        button.title=words.listen;
        if(button.dataset.audioReady)return;
        button.dataset.audioReady='1';
        button.setAttribute('role','button');
        button.setAttribute('tabindex','0');
        button.addEventListener('keydown',event=>{
          if(event.key==='Enter'||event.key===' '){event.preventDefault();button.click();}
        });
      });
    };
    installed.push({select,refresh:paintReading});
    select.addEventListener('change',()=>{
      const mode=modes.includes(select.value)?select.value:'uk';
      currentMode=mode;
      safeSet(preference,mode);
      installed.forEach(card=>card.refresh());
    });
    container.dataset.cardSettingsReady='1';
    quiet++;
    try{instance.passage();}finally{quiet--;}
  }

  function init(){document.querySelectorAll('.fs-container[id]').forEach(install);}
  // The original flashcards and the visibility checkbox finish their ready callbacks first.
  if(window.jQuery)window.jQuery(()=>setTimeout(init,0));
  else if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(init,0));
  else setTimeout(init,0);
  window.addEventListener('storage',event=>{
    if(event.key===preference||event.key===null){currentMode=storedMode();installed.forEach(card=>card.refresh());}
  });
})();
