// V1 destination-out soft eraser (Raed Ennab, MIT) with per-stroke recovery.
import { SCENE } from './config.js';
export function createFog(canvas, background, onFirstWipe) {
  const {width:W,height:H}=SCENE,ctx=canvas.getContext('2d');
  const initial=document.createElement('canvas');initial.width=W;initial.height=H;
  const source=initial.getContext('2d'),brushes=new Map();
  let radius=SCENE.brushRadius,paused=false,time=0,lastTick=performance.now();
  let pointerId=null,last=null,interacted=false,strokes=[],active=null;
  function rebuild(){
    source.clearRect(0,0,W,H);
    // Restore V1.0 condensation appearance; stroke recovery remains independent.
    source.filter='blur(15px)';source.drawImage(background,0,0);source.filter='none';
    source.fillStyle='rgba(114,139,153,0.19)';source.fillRect(0,0,W,H);
    const haze=source.createRadialGradient(1000,490,60,960,540,1130);
    haze.addColorStop(0,'rgba(131,154,164,0)');haze.addColorStop(1,'rgba(144,167,177,0.15)');
    source.fillStyle=haze;source.fillRect(0,0,W,H);render();
  }
  function brush(r){if(brushes.has(r))return brushes.get(r);const c=document.createElement('canvas');c.width=c.height=r*2;
    const b=c.getContext('2d'),g=b.createRadialGradient(r,r,r*.4,r,r,r);g.addColorStop(0,'#000');g.addColorStop(.45,'rgba(0,0,0,.75)');g.addColorStop(1,'transparent');b.fillStyle=g;b.fillRect(0,0,r*2,r*2);brushes.set(r,c);return c;}
  function stamp(target,s,ox=0,oy=0){const dist=Math.hypot(s.b.x-s.a.x,s.b.y-s.a.y),steps=Math.max(1,Math.ceil(dist/(s.r*.18))),image=brush(s.r);
    for(let i=1;i<=steps;i++){const t=i/steps;target.drawImage(image,s.a.x+(s.b.x-s.a.x)*t-s.r-ox,s.a.y+(s.b.y-s.a.y)*t-s.r-oy);}}
  function render(){ctx.globalCompositeOperation='source-over';ctx.globalAlpha=.94;ctx.clearRect(0,0,W,H);ctx.drawImage(initial,0,0);ctx.globalCompositeOperation='destination-out';
    // One erase per stroke mask: overlapping brush stamps must not multiply fade alpha.
    for(const s of strokes){const p=Math.max(0,Math.min(1,(time-s.t-20000)/8000));ctx.globalAlpha=1-p*p*(3-2*p);ctx.drawImage(s.mask,s.x,s.y);}
    ctx.globalAlpha=1;if(active)for(const s of active.segments)stamp(ctx,s);}
  function advance(now=performance.now()){if(!paused)time+=now-lastTick;lastTick=now;}
  const point=e=>{const b=canvas.getBoundingClientRect();return{x:Math.max(0,Math.min(W,(e.clientX-b.left)*W/b.width)),y:Math.max(0,Math.min(H,(e.clientY-b.top)*H/b.height))}};
  function erase(to){advance();const s={a:last,b:to,r:radius};active.segments.push(s);active.t=time;ctx.globalCompositeOperation='destination-out';ctx.globalAlpha=1;stamp(ctx,s);last=to;}
  function finishStroke(){if(!active)return;
    const segs=active.segments;
    let x=W,y=H,right=0,bottom=0;
    for(const s of segs){x=Math.min(x,s.a.x-s.r,s.b.x-s.r);y=Math.min(y,s.a.y-s.r,s.b.y-s.r);right=Math.max(right,s.a.x+s.r,s.b.x+s.r);bottom=Math.max(bottom,s.a.y+s.r,s.b.y+s.r);}
    x=Math.max(0,Math.floor(x));y=Math.max(0,Math.floor(y));right=Math.min(W,Math.ceil(right));bottom=Math.min(H,Math.ceil(bottom));
    const mask=document.createElement('canvas');mask.width=Math.max(1,right-x);mask.height=Math.max(1,bottom-y);const m=mask.getContext('2d');
    for(const s of segs)stamp(m,s,x,y);
    strokes.push({mask,x,y,t:active.t});active=null;
  }
  function end(e){if(e&&e.pointerId!==pointerId)return;const id=pointerId;pointerId=null;last=null;finishStroke();canvas.classList.remove('wiping');if(id!==null&&canvas.hasPointerCapture(id))canvas.releasePointerCapture(id);}
  canvas.addEventListener('pointerdown',e=>{if(!e.isPrimary||e.button!==0||pointerId!==null)return;pointerId=e.pointerId;canvas.setPointerCapture(pointerId);canvas.classList.add('wiping');active={segments:[],t:time};last=point(e);erase(last);if(!interacted){interacted=true;onFirstWipe();}});
  canvas.addEventListener('pointermove',e=>{if(e.pointerId!==pointerId)return;if(e.pointerType==='mouse'&&!(e.buttons&1)){end(e);return;}erase(point(e));});
  ['pointerup','pointercancel','lostpointercapture'].forEach(type=>canvas.addEventListener(type,end));window.addEventListener('blur',()=>end());
  setInterval(()=>{advance();const hasFading=strokes.some(s=>time-s.t>20000);strokes=strokes.filter(s=>time-s.t<28000);if(!paused&&hasFading)render();},100);
  rebuild();
  return {reset(){end();strokes=[];render();},setBrush(value){radius=Math.max(20,Math.min(160,Math.round(value)));},setPaused(value){advance();paused=value;},setBackground(){rebuild();}};
}
