/* ===== Custom cursor : Development & Design ===== */
(function(){
'use strict';
if(window.__ddcCursor||document.querySelector('.ddc'))return; /* never create a second cursor */
window.__ddcCursor=true;
var html=document.documentElement;
try{
var fine=window.matchMedia('(hover: hover) and (pointer: fine)');
var rm=window.matchMedia('(prefers-reduced-motion: reduce)');
if(!fine.matches||!('PointerEvent' in window)){window.__ddcCursor=false;return} /* touch devices keep the normal cursor */
var doc=document;
function el(tag,cls,parent){var e=doc.createElement(tag);if(cls)e.className=cls;if(parent)parent.appendChild(e);return e}

/* DOM */
var root=el('div','ddc');root.setAttribute('aria-hidden','true');
var cv=el('canvas','ddc__trail',root),ctx=cv.getContext('2d');
var ring=el('div','ddc__ring',root);el('div','ddc__shape',ring);
var label=el('div','ddc__label',ring);
el('span','ddc__v',label).textContent='View';
el('span','ddc__a',label).innerHTML='<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7M8 7h9v9"/></svg>';
var dot=el('div','ddc__dot',root);el('i','',dot);
var pulses=el('div','ddc__pulses',root);
doc.body.appendChild(root);

/* top layer: keep the cursor above everything, including dialogs, modals and popovers */
function raise(){
  if(!root.showPopover)return;
  try{
    if(!root.hasAttribute('popover'))root.setAttribute('popover','manual');
    if(root.matches(':popover-open'))root.hidePopover();
    root.showPopover();
  }catch(e){root.removeAttribute('popover')}
}
raise();
doc.addEventListener('toggle',function(e){if(e.target!==root)raise()},true); /* other popovers opening/closing (ignore our own, or it would loop) */
new MutationObserver(raise).observe(html,{subtree:true,attributes:true,attributeFilter:['open']}); /* <dialog> open/close */

/* state */
var lastT=null,tx=-100,ty=-100,rx=-100,ry=-100,seen=false,vis=false,raf=0,last=0,pts=[],W=0,H=0,LIFE=420;
function sizeCanvas(){var d=Math.min(window.devicePixelRatio||1,2);W=window.innerWidth;H=window.innerHeight;cv.width=Math.round(W*d);cv.height=Math.round(H*d);ctx.setTransform(d,0,0,d,0,0)}
function applyMotionPref(){root.classList.toggle('calm',rm.matches);if(rm.matches){pts.length=0;ctx.clearRect(0,0,W,H)}}
sizeCanvas();applyMotionPref();
window.addEventListener('resize',sizeCanvas,{passive:true});
function onChange(mq,fn){if(mq.addEventListener)mq.addEventListener('change',fn);else if(mq.addListener)mq.addListener(fn)}
onChange(rm,applyMotionPref);
var fineTimer=0;
onChange(fine,function(){
  clearTimeout(fineTimer);
  fineTimer=setTimeout(function(){ /* debounced, so a brief media-query flicker never hands the system cursor back */
    if(!fine.matches){hide();html.classList.remove('ddc-on')}else if(seen){html.classList.add('ddc-on')}
  },150);
});

function show(){if(!vis){vis=true;root.classList.add('on')}}
function hide(){vis=false;root.classList.remove('on')}

/* animation loop: runs only while something is moving or fading */
function drawTrail(now){
  while(pts.length&&now-pts[0].t>LIFE)pts.shift();
  ctx.clearRect(0,0,W,H);
  if(pts.length<2)return pts.length>0;
  ctx.lineCap='round';ctx.lineJoin='round';
  for(var i=1;i<pts.length;i++){
    var a=1-(now-pts[i].t)/LIFE;if(a>1)a=1;if(a<=0)continue;
    ctx.beginPath();ctx.moveTo(pts[i-1].x,pts[i-1].y);ctx.lineTo(pts[i].x,pts[i].y);
    ctx.strokeStyle='rgba(94,196,226,'+(.6*a).toFixed(3)+')';
    ctx.lineWidth=.8+3.6*a;
    ctx.shadowColor='rgba(94,196,226,'+(.8*a).toFixed(3)+')';
    ctx.shadowBlur=12*a;
    ctx.stroke();
  }
  return true;
}
function tick(){
  raf=0;
  var now=performance.now(),dt=Math.min(now-last,50);last=now;
  if(rm.matches){rx=tx;ry=ty}else{var k=1-Math.exp(-dt/45);rx+=(tx-rx)*k;ry+=(ty-ry)*k}
  ring.style.transform='translate3d('+rx.toFixed(2)+'px,'+ry.toFixed(2)+'px,0)';
  var live=false;
  if(!rm.matches)live=drawTrail(now);
  if(Math.abs(tx-rx)>.15||Math.abs(ty-ry)>.15||live)raf=requestAnimationFrame(tick);
}
function kick(){if(!raf){last=performance.now();raf=requestAnimationFrame(tick)}}

/* watchdog: if any element still resolves to a visible system cursor (an !important rule, an inline style,
   a third-party stylesheet...), force it to none on that element. Inline !important wins over any stylesheet. */
var forced=[];
function enforce(t){
  if(!html.classList.contains('ddc-on'))return; /* not active yet (first pointer event) */
  if(!t||t.nodeType!==1||!t.closest||t.closest('.ddc'))return;
  var c=getComputedStyle(t).cursor;
  if(c!=='none'){
    forced.push([t,t.style.getPropertyValue('cursor'),t.style.getPropertyPriority('cursor')]);
    t.style.setProperty('cursor','none','important');
    try{console.debug('[ddc] forced cursor:none on <'+t.tagName.toLowerCase()+(t.id?'#'+t.id:'')+(typeof t.className==='string'&&t.className?'.'+t.className.trim().replace(/\s+/g,'.'):'')+'> (was '+c+')')}catch(e){}
  }
}
doc.addEventListener('pointerover',function(e){if(!e.pointerType||e.pointerType==='mouse')enforce(e.target)},true);

/* never show the browser's image drag ghost / drag cursor over images */
doc.addEventListener('dragstart',function(e){if(e.target&&e.target.tagName==='IMG')e.preventDefault()});

/* pointer tracking: the dot is set directly from the event, so it is exact */
doc.addEventListener('pointermove',function(e){
  if(e.pointerType&&e.pointerType!=='mouse'){hide();return}
  if(!root.isConnected){html.classList.remove('ddc-on');return} /* cursor element was removed: restore the system cursor */
  tx=e.clientX;ty=e.clientY;
  if(!seen){seen=true;rx=tx;ry=ty}
  if(!html.classList.contains('ddc-on'))html.classList.add('ddc-on'); /* self-heal */
  if(e.target!==lastT){lastT=e.target;enforce(e.target)} /* also check the element under the pointer when the cursor first activates */
  dot.style.transform='translate3d('+tx+'px,'+ty+'px,0)';
  show();
  if(!rm.matches){
    var l=pts[pts.length-1];
    if(!l||Math.abs(l.x-tx)+Math.abs(l.y-ty)>2){pts.push({x:tx,y:ty,t:performance.now()});if(pts.length>40)pts.shift()}
  }
  kick();
},{passive:true});
doc.addEventListener('mouseout',function(e){if(!e.relatedTarget)hide()});   /* pointer really left the window */
doc.addEventListener('mouseover',function(){if(seen)show()});

/* hover states: view > button > link */
var SEL_VIEW='[data-cursor="view"],.project,.project-card';
var SEL_BTN='button:not(:disabled),.btn,.ib,[role="button"],summary,input[type="button"],input[type="submit"]';
function kindOf(t){
  if(!t||!t.closest||t.closest('[data-cursor="none"]'))return '';
  if(t.closest(SEL_VIEW))return 'view';
  if(t.closest(SEL_BTN))return 'btn';
  if(t.closest('a[href]'))return 'link';
  return '';
}
doc.addEventListener('pointerover',function(e){
  if(e.pointerType&&e.pointerType!=='mouse')return;
  var k=kindOf(e.target);
  if(k)root.setAttribute('data-cur',k);else root.removeAttribute('data-cur');
},{passive:true});

/* click: press + light pulse */
function pulse(x,y){
  if(rm.matches)return;
  var p=el('span','ddc__pulse',pulses);p.style.left=x+'px';p.style.top=y+'px';
  p.addEventListener('animationend',function(){p.remove()});
  setTimeout(function(){if(p.parentNode)p.remove()},1000);
}
doc.addEventListener('pointerdown',function(e){
  if((e.pointerType&&e.pointerType!=='mouse')||e.button!==0)return;
  root.setAttribute('data-down','');pulse(e.clientX,e.clientY);
});
function release(){root.removeAttribute('data-down')}
doc.addEventListener('pointerup',release);
doc.addEventListener('pointercancel',release);
window.addEventListener('blur',release);
}catch(err){ /* anything unexpected: give the system cursor back */
  html.classList.remove('ddc-on');
  var r=document.querySelector('.ddc');if(r)r.remove();
  try{console.warn('[ddc] custom cursor disabled:',err)}catch(e){}
}
})();
/* ===== /Custom cursor ===== */
