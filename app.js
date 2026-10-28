(function(){
var d=document,root=d.documentElement,$=function(s){return d.querySelector(s)},$$=function(s){return[].slice.call(d.querySelectorAll(s))};
root.classList.add('js');
var rm=window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* theme */
var tb=$('#theme');
function isDark(){var t=root.getAttribute('data-theme');return t?t==='dark':true}
function label(){tb.textContent=isDark()?'Light mode':'Dark mode'}
try{var s=localStorage.getItem('theme');if(s)root.setAttribute('data-theme',s)}catch(e){}
label();
tb.addEventListener('click',function(){var n=isDark()?'light':'dark';root.setAttribute('data-theme',n);try{localStorage.setItem('theme',n)}catch(e){}label()});

/* navigation: every page is its own HTML file; mark the current link and keep it visible in the scrollable mobile bar */
var cur=$('.nav a.l.on'),bar=cur&&cur.parentNode;
if(cur&&bar){bar.scrollLeft=Math.max(0,cur.offsetLeft-(bar.clientWidth-cur.offsetWidth)/2)}
$$('.rv').forEach(function(el){el.classList.add('in')});
/* rotating title */
var rl=$('#role');var roles=['Software Development Technician','Logistics and Operations','Traceability and Data Accuracy'],ri=0;
if(!rm&&rl)setInterval(function(){rl.classList.add('out');setTimeout(function(){ri=(ri+1)%roles.length;rl.textContent=roles[ri];rl.classList.remove('out')},350)},3200);

/* accordion */
var ex=$('#expand'),jobs=$$('details.job');
if(ex)ex.addEventListener('click',function(){var open=jobs.some(function(j){return j.open});jobs.forEach(function(j){j.open=!open});ex.textContent=open?'Expand all':'Collapse all'});

/* skill filter */
$$('.tabs button').forEach(function(b){b.addEventListener('click',function(){
  var f=b.getAttribute('data-f');
  $$('.tabs button').forEach(function(x){x.setAttribute('aria-pressed',x===b?'true':'false')});
  $$('.cols .card').forEach(function(c){c.hidden=!(f==='all'||c.getAttribute('data-c')===f)});
})});

/* copy email */
if($('#copy'))$('#copy').addEventListener('click',function(){
  var m=$('#msg'),mail='bilalezzine07@gmail.com';
  function ok(){m.textContent='Copied'}
  function ko(){m.textContent=mail}
  try{navigator.clipboard.writeText(mail).then(ok,ko)}catch(e){ko()}
  setTimeout(function(){m.textContent=''},2500);
});

/* language EN/FR */
var FR={"Summary":"Résumé","Experience":"Expérience","Skills":"Compétences","Education":"Éducation","Contact":"Contact","Contact me":"Me contacter","View experience":"Voir l’expérience","Print CV":"Imprimer le CV","Software Development Technician":"Technicien en développement logiciel","Logistics and Operations":"Logistique et opérations","Traceability and Data Accuracy":"Traçabilité et précision des données","Sidi Slimane, Morocco":"Sidi Slimane, Maroc","Arabic · French · English":"Arabe · Français · Anglais","Professional summary":"Résumé professionnel","Software development technician (diploma obtained in 2025) combining technical skills with the operational rigor gained in industrial logistics: control, traceability and material flows.":"Technicien en développement logiciel (diplôme obtenu en 2025) alliant compétences techniques et rigueur opérationnelle acquise en logistique industrielle : contrôle, traçabilité et flux de matières.","Reliable, organized and quick to adapt, I am looking to grow my career within an international environment.":"Fiable, organisé et rapide à m’adapter, je souhaite évoluer dans un environnement international.","At a glance":"En un coup d’œil","Microsoft Word, Excel and PowerPoint":"Microsoft Word, Excel et PowerPoint","Data entry accuracy and traceability":"Précision de la saisie et traçabilité","Teamwork and coordination across departments":"Travail d’équipe et coordination entre services","Professional experience":"Expérience professionnelle","Logistics and control":"Logistique et contrôle","June 2026 – present":"Juin 2026 – présent","Material Flow Intern":"Stagiaire flux matières","Track material flows between production areas":"Suivi des flux de matières entre les zones de production","Support the availability of components":"Appui à la disponibilité des composants","Inbound Logistics":"Logistique entrante","Received components and checked their conformity":"Réception des composants et contrôle de leur conformité","Monitored stock levels and entered data accurately in the system":"Suivi des niveaux de stock et saisie précise des données dans le système","Coordinated with other departments":"Coordination avec les autres services","5 months":"5 mois","Logistics Control Agent (Hunter system)":"Agent de contrôle logistique (système Hunter)","Controlled cable movements and ensured their traceability":"Contrôle des mouvements de câbles et garantie de leur traçabilité","Detected and reported anomalies":"Détection et signalement des anomalies","Earlier experience":"Expériences précédentes","2023 · 2 months":"2023 · 2 mois","IT Intern, Sidi Slimane":"Stagiaire informatique, Sidi Slimane","Processed data and supported users":"Traitement de données et assistance aux utilisateurs","Installed software and provided first-level troubleshooting":"Installation de logiciels et dépannage de premier niveau","Retailer and Cashier, clothing store":"Vendeur et caissier, magasin de vêtements","Handled customer relations and sales":"Relation client et vente","Managed the daily cash register":"Gestion de la caisse quotidienne","All":"Tout","Development":"Développement","Tools":"Outils","Operations":"Opérations","Programming and web":"Programmation et web","Productivity tools":"Outils bureautiques","Logistics and operations":"Logistique et opérations","Logistics control":"Contrôle logistique","Material flow tracking":"Suivi des flux de matières","Traceability":"Traçabilité","Receiving":"Réception","Strengths and languages":"Atouts et langues","Rigor and organization":"Rigueur et organisation","Teamwork":"Travail d’équipe","Adaptability":"Adaptabilité","Arabic":"Arabe","French":"Français","English":"Anglais","Specialized Technician diploma in Software Development, with additional training in office applications.":"Diplôme de Technicien Spécialisé en Développement logiciel, avec formation complémentaire en bureautique.","Ibn Tofail University, Kénitra":"Université Ibn Tofail, Kénitra","Second year in Economics and Management.":"Deuxième année en Sciences économiques et gestion.","Baccalaureate in Physical Sciences, French option.":"Baccalauréat en Sciences physiques, option française.","I would be glad to discuss how my technical and operational background can contribute to your team.":"Je serais ravi d’échanger sur la façon dont mon parcours technique et opérationnel peut contribuer à votre équipe.","Copy email address":"Copier l’adresse e-mail","Copied":"Copié","© 2026 Bilal Ezzine · Sidi Slimane, Morocco":"© 2026 Bilal Ezzine · Sidi Slimane, Maroc","Light mode":"Mode clair","Dark mode":"Mode sombre","Expand all":"Tout développer","Collapse all":"Tout réduire"};
var EN={},orig=new WeakMap(),lang='en',lb=$('#lang');
Object.keys(FR).forEach(function(k){EN[FR[k]]=k});
function tr(n){var v=n.nodeValue,t=v.trim();if(!t)return;var src=lang==='fr'?FR:EN,r=src[t];if(r&&r!==t)n.nodeValue=v.replace(t,r)}
function apply(){var w=d.createTreeWalker(d.body,NodeFilter.SHOW_TEXT,{acceptNode:function(n){return n.parentNode.nodeName==='SCRIPT'?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT}}),n;while(n=w.nextNode())tr(n);root.lang=lang;lb.textContent=lang==='fr'?'EN':'FR'}
function setLang(l){lang=l;try{localStorage.setItem('lang',l)}catch(e){}apply()}
lb.addEventListener('click',function(){setLang(lang==='fr'?'en':'fr')});
['#theme','#expand','#copy'].forEach(function(s){if($(s))$(s).addEventListener('click',function(){setTimeout(apply,0)})});
if(rl)new MutationObserver(function(){if(lang==='fr'){var n=rl.firstChild;if(n)tr(n)}}).observe(rl,{childList:true,characterData:true,subtree:true});
try{if(localStorage.getItem('lang')==='fr'||(!localStorage.getItem('lang')&&/^fr/i.test(navigator.language)))setLang('fr')}catch(e){}
})();

/* ===== Dev & Design icon : JS (click ripple) ===== */
(function(){
var mq=window.matchMedia('(prefers-reduced-motion: reduce)');
document.querySelectorAll('.dd').forEach(function(btn){
btn.addEventListener('click',function(){
if(mq.matches)return;
var host=btn.querySelector('.dd__float');
['','dd__ripple--b'].forEach(function(c){
var r=document.createElement('span');r.className=('dd__ripple '+c).trim();
r.addEventListener('animationend',function(){r.remove()});host.appendChild(r);
});
});
});
})();
