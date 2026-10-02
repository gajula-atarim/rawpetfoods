import {chromium} from 'playwright'; import fs from 'fs';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'}); const p=await b.newPage();
for(const f of ['salmon-belly-fin-pack.png','testimonials-paws-bg.png','logo.png','logo-footer.png','trustpilot.png']){
  const data=fs.readFileSync('assets/'+f).toString('base64');
  const out=await p.evaluate(async d=>{const img=new Image();img.src='data:image/png;base64,'+d;await img.decode();const c=document.createElement('canvas');c.width=img.width;c.height=img.height;c.getContext('2d').drawImage(img,0,0);return c.toDataURL('image/webp',0.85).split(',')[1]},data);
  const name=f.replace('.png','.webp'); fs.writeFileSync('assets/'+name,Buffer.from(out,'base64')); console.log(name,fs.statSync('assets/'+name).size);
}
await b.close();
