(function(){
  var supported=['uk','ru','en'];
  var path=location.pathname;
  var legacy=/^\/ru\/en\//.test(path);
  var match=!legacy&&path.match(/^\/(uk|ru|en)(?:\/|$)/);
  var current=match?match[1]:'uk';
  var id=(path.match(/\/lessons\/(\d+)(?:\.html)?\/?$/)||path.match(/\/lesson-(\d+)(?:\.html)?\/?$/)||[])[1];
  var saved;try{saved=localStorage.getItem('grammar-interface-language');}catch(e){}
  function url(lang){return '/'+lang+'/'+(id?'lessons/'+id+'.html':'')+location.hash;}
  if(!match&&supported.indexOf(saved)>=0&&saved!=='uk'){location.replace(url(saved));return;}
  try{localStorage.setItem('grammar-interface-language',current);}catch(e){}
  document.addEventListener('DOMContentLoaded',function(){
    var select=document.getElementById('language-select');if(!select)return;
    select.value=current;select.addEventListener('change',function(){var lang=select.value;if(supported.indexOf(lang)<0)return;try{localStorage.setItem('grammar-interface-language',lang);}catch(e){}location.assign(url(lang));});
  });
})();
