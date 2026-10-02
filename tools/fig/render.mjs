import fs from 'fs'; import * as kiwi from 'kiwi-schema'; import * as pako from 'pako'; import {decompress} from 'fzstd';
const b = fs.readFileSync('fig/canvas.fig'); let off=12; const ch=[];
while(off<b.length){const n=b.readUInt32LE(off);off+=4;ch.push(b.subarray(off,off+n));off+=n;}
const un=c=>(c[0]===0x28&&c[1]===0xb5)?decompress(c):pako.inflateRaw(c);
const schema=kiwi.compileSchema(kiwi.decodeBinarySchema(un(ch[0])));
const msg=schema.decodeMessage(un(ch[1])); const N=msg.nodeChanges, blobs=msg.blobs;
const gid=g=>g?g.sessionID+':'+g.localID:null;
const by={}, kids={}; N.forEach(n=>{by[gid(n.guid)]=n; const p=gid(n.parentIndex?.guid); (kids[p]=kids[p]||[]).push(n);});
for(const k in kids) kids[k].sort((a,c)=>a.parentIndex.position<c.parentIndex.position?-1:a.parentIndex.position>c.parentIndex.position?1:0);
const hex=u=>Buffer.from(u).toString('hex');
const pathCache={};
function isEmoji(str,i){const cp=str.codePointAt(i);if(cp==null)return false;if(cp>=0xDC00&&cp<=0xDFFF)return true;return cp>=0x1F000||(cp>=0x2600&&cp<=0x27BF);}
function blobPath(i){ if(pathCache[i]!=null) return pathCache[i]; const u=blobs[i].bytes; const dv=new DataView(u.buffer,u.byteOffset,u.byteLength); let o=0,s='';
  const f=()=>{const v=dv.getFloat32(o,true);o+=4;return +v.toFixed(3)};
  while(o<u.length){const c=u[o++]; if(c===0)s+='Z';else if(c===1)s+=`M${f()} ${f()}`;else if(c===2)s+=`L${f()} ${f()}`;else if(c===3)s+=`Q${f()} ${f()} ${f()} ${f()}`;else if(c===4)s+=`C${f()} ${f()} ${f()} ${f()} ${f()} ${f()}`;else break;}
  return pathCache[i]=s.replace(/^Z+/,''); }
let defs=[], uid=0; const nid=p=>p+(uid++);
const rgba=(c,o=1)=>`rgba(${Math.round(c.r*255)},${Math.round(c.g*255)},${Math.round(c.b*255)},${+(c.a*o).toFixed(3)})`;
const mat=t=>t?`matrix(${t.m00} ${t.m10} ${t.m01} ${t.m11} ${t.m02} ${t.m12})`:'';
function inv(t){const d=t.m00*t.m11-t.m01*t.m10;return{m00:t.m11/d,m01:-t.m01/d,m10:-t.m10/d,m11:t.m00/d,m02:(t.m01*t.m12-t.m11*t.m02)/d,m12:(t.m10*t.m02-t.m00*t.m12)/d};}
// paint -> {fill, extra(svg drawn before as pattern)} ; returns fill attr
function paint(p,w,h){ if(p.visible===false) return null; const op=p.opacity??1;
  if(p.type==='SOLID') return rgba(p.color,op);
  if(p.type.startsWith('GRADIENT')){ const id=nid('g'); const it=inv(p.transform);
    const stops=p.stops.map(s=>`<stop offset="${s.position}" stop-color="${rgba({...s.color,a:1})}" stop-opacity="${s.color.a*op}"/>`).join('');
    const gt=`matrix(${w} 0 0 ${h} 0 0) ${mat(it)}`;
    if(p.type==='GRADIENT_LINEAR') defs.push(`<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="0" y1="0.5" x2="1" y2="0.5" gradientTransform="${gt}">${stops}</linearGradient>`);
    else defs.push(`<radialGradient id="${id}" gradientUnits="userSpaceOnUse" cx="0.5" cy="0.5" r="0.5" gradientTransform="${gt}">${stops}</radialGradient>`);
    return `url(#${id})`; }
  if(p.type==='IMAGE'&&p.image?.hash){ const id=nid('p'); const href=`fig/images/${hex(p.image.hash)}`; const mode=p.imageScaleMode;
    let img;
    if(mode==='STRETCH'&&p.transform){ const it=inv(p.transform); img=`<image href="${href}" x="0" y="0" width="1" height="1" preserveAspectRatio="none" transform="matrix(${w} 0 0 ${h} 0 0) ${mat(it)}" opacity="${op}"/>`; }
    else img=`<image href="${href}" x="0" y="0" width="${w}" height="${h}" preserveAspectRatio="${mode==='FIT'?'xMidYMid meet':'xMidYMid slice'}" opacity="${op}"/>`;
    defs.push(`<pattern id="${id}" patternUnits="userSpaceOnUse" x="${-w}" y="${-h}" width="${3*w}" height="${3*h}"><g transform="translate(${w} ${h})">${img}</g></pattern>`); return `url(#${id})`; }
  return null; }
function rectPath(n,w,h){ const r=n.cornerRadius||0; const tl=n.rectangleTopLeftCornerRadius??r,tr=n.rectangleTopRightCornerRadius??r,br=n.rectangleBottomRightCornerRadius??r,bl=n.rectangleBottomLeftCornerRadius??r;
  if(n.type==='ELLIPSE') return `M${w/2} 0A${w/2} ${h/2} 0 1 1 ${w/2} ${h}A${w/2} ${h/2} 0 1 1 ${w/2} 0Z`;
  const c=v=>Math.min(v,w/2,h/2); const [a,bb,cc,d]=[c(tl),c(tr),c(br),c(bl)];
  return `M${a} 0H${w-bb}A${bb} ${bb} 0 0 1 ${w} ${bb}V${h-cc}A${cc} ${cc} 0 0 1 ${w-cc} ${h}H${d}A${d} ${d} 0 0 1 0 ${h-d}V${a}A${a} ${a} 0 0 1 ${a} 0Z`; }
function shadow(n){ const ef=(n.effects||[]).filter(e=>e.visible!==false&&(e.type==='DROP_SHADOW'||e.type==='FOREGROUND_BLUR'||e.type==='LAYER_BLUR')); if(!ef.length) return '';
  const id=nid('f'); let s=`<filter id="${id}" x="-50%" y="-50%" width="200%" height="200%">`; const outs=[];
  ef.forEach((e,i)=>{ if(e.type==='DROP_SHADOW'){ s+=`<feDropShadow dx="${e.offset.x}" dy="${e.offset.y}" stdDeviation="${e.radius/2}" flood-color="${rgba({...e.color,a:1})}" flood-opacity="${e.color.a}" result="s${i}"/>`; } else { s+=`<feGaussianBlur stdDeviation="${e.radius/2}"/>`; } });
  defs.push(s+'</filter>'); return ` filter="url(#${id})"`; }
const SHAPES=new Set(['FRAME','ROUNDED_RECTANGLE','RECTANGLE','ELLIPSE','SYMBOL','INSTANCE','SECTION']);
function render(n, ov){ // ov: override map for instance children
  if(ov){ const k=gid(n.overrideKey)||gid(n.guid); if(ov[k]) n={...n,...ov[k]}; }
  if(n.visible===false) return '';
  const w=n.size?.x||0,h=n.size?.y||0; let out=''; const att=[];
  if(n.opacity!=null&&n.opacity<1) att.push(`opacity="${n.opacity}"`);
  const fills=(n.fillPaints||[]), strokes=(n.strokePaints||[]).filter(p=>p.visible!==false);
  const filt=shadow(n);
  if(SHAPES.has(n.type)){ const d=rectPath(n,w,h);
    out+=fills.map(p=>{const f=paint(p,w,h);return f?`<path d="${d}" fill="${f}"${filt}/>`:''}).join('');
    if(strokes.length&&n.strokeWeight){ const sw=n.strokeWeight; strokes.forEach(p=>{const f=paint(p,w,h); if(!f)return;
      if(n.borderStrokeWeightsIndependent){ const t=n.borderTopWeight||0,bo=n.borderBottomWeight||0,l=n.borderLeftWeight||0,r=n.borderRightWeight||0;
        if(t)out+=`<rect x="0" y="0" width="${w}" height="${t}" fill="${f}"/>`; if(bo)out+=`<rect x="0" y="${h-bo}" width="${w}" height="${bo}" fill="${f}"/>`; if(l)out+=`<rect x="0" y="0" width="${l}" height="${h}" fill="${f}"/>`; if(r)out+=`<rect x="${w-r}" y="0" width="${r}" height="${h}" fill="${f}"/>`; }
      else { const ins=n.strokeAlign==='INSIDE'?sw/2:n.strokeAlign==='OUTSIDE'?-sw/2:0; const r=Math.min(Math.max(0,(n.cornerRadius||0)-ins),(w-2*ins)/2,(h-2*ins)/2);
        out+=`<rect x="${ins}" y="${ins}" width="${w-2*ins}" height="${h-2*ins}" rx="${r}" fill="none" stroke="${f}" stroke-width="${sw}"${n.dashPattern?.length?` stroke-dasharray="${n.dashPattern.join(' ')}"`:''}/>`; } }); }
    let kidsSvg=''; let o2=ov;
    let ch=kids[gid(n.guid)]||[];
    if(n.type==='INSTANCE'&&n.symbolData){ const sym=by[gid(n.symbolData.symbolID)]; ch=sym?kids[gid(sym.guid)]||[]:[]; o2={...(ov||{})};
      for(const src of [n.symbolData.symbolOverrides||[], n.derivedSymbolData||[]]) for(const o of src){ const g=o.guidPath?.guids; if(!g?.length)continue; const k=gid(g[g.length-1]); const {guidPath,...rest}=o; o2[k]={...(o2[k]||{}),...rest}; }
      if(sym&&sym.size&&(Math.abs(sym.size.x-w)>0.5||Math.abs(sym.size.y-h)>0.5)&&!(n.derivedSymbolData?.length)){ kidsSvg=`<g transform="scale(${w/sym.size.x} ${h/sym.size.y})">`+ch.map(c=>render(c,o2)).join('')+'</g>'; ch=[]; } }
    kidsSvg+=renderKids(ch,o2);
    if(n.frameMaskDisabled!==true&&(n.type==='FRAME'||n.type==='INSTANCE'||n.type==='SYMBOL')&&kidsSvg){ const id=nid('c'); defs.push(`<clipPath id="${id}"><path d="${rectPath(n,w,h)}"/></clipPath>`); out+=`<g clip-path="url(#${id})">${kidsSvg}</g>`; } else out+=kidsSvg;
  } else if(n.type==='TEXT'){ const dt=n.derivedTextData; const f=fills.map(p=>paint(p,w,h)).filter(Boolean)[0]||'#000';
    if(dt?.glyphs) { out+=`<g fill="${f}">`+dt.glyphs.filter(g=>g.commandsBlob!=null&&!(([...(n.textData.characters)].length===n.textData.characters.length)?false:false)&&!isEmoji(n.textData.characters,g.firstCharacter)).map(g=>`<path transform="translate(${g.position.x} ${g.position.y}) scale(${g.fontSize} ${-g.fontSize})" d="${blobPath(g.commandsBlob)}"/>`).join('')+'</g>';
      if(n.textDecoration==='UNDERLINE') (dt.baselines||[]).forEach(bl=>out+=`<rect x="${bl.position.x}" y="${bl.position.y+2}" width="${bl.width}" height="${Math.max(1,(n.fontSize||16)/14)}" fill="${f}"/>`); }
  } else { // vectors / boolean / line
    (n.fillGeometry||[]).forEach(g=>fills.forEach(p=>{const f=paint(p,w,h); if(f) out+=`<path d="${blobPath(g.commandsBlob)}" fill="${f}" fill-rule="${g.windingRule==='ODD'?'evenodd':'nonzero'}"${filt}/>`;}));
    (n.strokeGeometry||[]).forEach(g=>strokes.forEach(p=>{const f=paint(p,w,h); if(f) out+=`<path d="${blobPath(g.commandsBlob)}" fill="${f}"/>`;}));
    if(n.type==='BOOLEAN_OPERATION'&&!n.fillGeometry) out+=renderKids(kids[gid(n.guid)]||[],ov);
  }
  return `<g transform="${mat(n.transform)}" ${att.join(' ')} data-name="${(n.name||'').replace(/[&"<>]/g,'')}">${out}</g>`;
}
function renderKids(ch,ov){ let s='',clip=null;
  for(const c of ch){ if(c.mask&&c.visible!==false){ const id=nid('m'); defs.push(`<clipPath id="${id}">${render({...c,fillPaints:[{type:'SOLID',color:{r:0,g:0,b:0,a:1}}],effects:[]},ov)}</clipPath>`); clip=id; continue; }
    const r=render(c,ov); s+=clip?`<g clip-path="url(#${clip})">${r}</g>`:r; } return s; }

export function renderNodeHTML(id,{hide=[],fillsOnly=false,noRadius=false,bg='transparent'}={}){
  defs=[]; let root={...by[id],transform:{m00:1,m01:0,m02:0,m10:0,m11:1,m12:0}};
  if(noRadius){root.cornerRadius=0;delete root.rectangleTopLeftCornerRadius;delete root.rectangleTopRightCornerRadius;delete root.rectangleBottomLeftCornerRadius;delete root.rectangleBottomRightCornerRadius;}
  if(fillsOnly) root.fillPaints=(root.fillPaints||[]).filter(p=>p.type==='IMAGE');
  const saved={}; hide.forEach(h=>{saved[h]=by[h].visible; by[h].visible=false;});
  if(fillsOnly){ const k=kids[id]; kids[id]=[]; var body=render(root); kids[id]=k; } else var body=render(root);
  hide.forEach(h=>by[h].visible=saved[h]);
  const W=root.size.x,H=root.size.y;
  return {W,H,html:`<!doctype html><html><body style="margin:0;background:${bg}"><svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><defs>${defs.join('')}</defs>${body}</svg></body></html>`};
}
export {by,kids,gid};
if((process.argv[1]||'').endsWith('render.mjs')){
const target=process.argv[2]||'0:262'; const root=by[target];
const body=render({...root,transform:{m00:1,m01:0,m02:0,m10:0,m11:1,m12:0}});
const W=root.size.x,H=root.size.y;
fs.writeFileSync('page.html',`<!doctype html><html><body style="margin:0;background:#fff"><svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><defs>${defs.join('')}</defs>${body}</svg></body></html>`);
// also dump structure info for sections
const sec=(kids[target]||[]).map(c=>({id:gid(c.guid),name:c.name,y:c.transform.m12,h:c.size.y}));
fs.writeFileSync('sections.json',JSON.stringify(sec,null,1)); console.log('ok',W,H,defs.length);

}
