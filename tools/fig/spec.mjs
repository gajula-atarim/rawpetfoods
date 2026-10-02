import fs from 'fs'; import * as kiwi from 'kiwi-schema'; import * as pako from 'pako'; import {decompress} from 'fzstd';
const b=fs.readFileSync('fig/canvas.fig');let off=12;const ch=[];while(off<b.length){const n=b.readUInt32LE(off);off+=4;ch.push(b.subarray(off,off+n));off+=n;}
const un=c=>(c[0]===0x28&&c[1]===0xb5)?decompress(c):pako.inflateRaw(c);
const msg=kiwi.compileSchema(kiwi.decodeBinarySchema(un(ch[0]))).decodeMessage(un(ch[1]));const N=msg.nodeChanges;
const gid=g=>g?g.sessionID+':'+g.localID:null;const by={},kids={};N.forEach(n=>{by[gid(n.guid)]=n;const p=gid(n.parentIndex?.guid);(kids[p]=kids[p]||[]).push(n)});
for(const k in kids)kids[k].sort((a,c)=>a.parentIndex.position<c.parentIndex.position?-1:1);
const hex=c=>'#'+[c.r,c.g,c.b].map(v=>Math.round(v*255).toString(16).padStart(2,'0')).join('').toUpperCase();
const fill=n=>(n.fillPaints||[]).filter(p=>p.visible!==false).map(p=>p.type==='SOLID'?hex(p.color)+(p.opacity<1?`@${+p.opacity.toFixed(2)}`:''):p.type==='IMAGE'?'IMG:'+Buffer.from(p.image.hash).toString('hex').slice(0,8)+`(${p.imageScaleMode})`:p.type).join(',');
function walk(n,d,ax,ay){ if(n.visible===false)return; const x=Math.round(ax+(n.transform?.m02||0)), y=Math.round(ay+(n.transform?.m12||0));
  let s='  '.repeat(d)+`${n.type} "${n.name}" ${Math.round(n.size?.x)}x${Math.round(n.size?.y)} @${x},${y}`;
  const f=fill(n); if(f)s+=` fill=${f}`; if(n.cornerRadius)s+=` r=${n.cornerRadius}`; if(n.strokePaints?.length&&n.strokeWeight)s+=` stroke=${n.strokeWeight}${fill({fillPaints:n.strokePaints})}`;
  if(n.stackMode)s+=` [${n.stackMode} gap=${n.stackSpacing||0} pad=${n.stackVerticalPadding||0}/${n.stackHorizontalPadding||0}/${n.stackPaddingBottom??''}/${n.stackPaddingRight??''}]`;
  if((n.effects||[]).length)s+=` fx=`+n.effects.map(e=>`${e.type}(${e.offset?.x},${e.offset?.y},${e.radius},${e.color?hex(e.color)+'@'+e.color.a.toFixed(2):''})`).join(';');
  if(n.type==='TEXT'){s+=` | ${n.fontName.family} ${n.fontName.style} ${n.fontSize}/${n.lineHeight?.units==='PIXELS'?n.lineHeight.value+'px':n.lineHeight?.units==='PERCENT'?n.lineHeight.value+'%':'auto'} ls=${n.letterSpacing?.value||0}${n.letterSpacing?.units==='PERCENT'?'%':''} ${n.textAlignHorizontal||''} «${n.textData.characters.replace(/\n/g,'⏎')}»`; console.log(s); return;}
  console.log(s); if(n.type==='INSTANCE'){ const sym=by[gid(n.symbolData.symbolID)]; console.log('  '.repeat(d+1)+`(instance of "${sym?.name}")`); return; }
  if(n.type==='VECTOR'||n.type==='BOOLEAN_OPERATION')return;
  (kids[gid(n.guid)]||[]).forEach(c=>walk(c,d+1,x,y)); }
walk(by['0:262'],0,0,0);
