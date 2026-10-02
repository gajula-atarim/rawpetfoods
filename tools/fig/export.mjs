import * as m from './render.mjs'; import fs from 'fs'; import {chromium} from 'playwright';
const {by,kids}=m;
const jobs=[
 ['logo.png','0:267',{},3,'png'],
 ['logo-footer.png','0:654',{},2,'png'],
 ['trustpilot.png','0:335',{},2,'png'],
 ['hero-bg.jpg','0:329',{fillsOnly:true,noRadius:true},1.4,'jpeg'],
 ['benefits-bg.jpg','0:370',{fillsOnly:true,bg:'#fff'},1,'jpeg'],
 ['dog-sign.jpg','0:400',{noRadius:true},2,'jpeg'],
 ['ocean-card-bg.jpg','0:404',{hide:['0:409','0:406'],noRadius:true},1.5,'jpeg'],
 ['product-bg.jpg','0:418',{fillsOnly:true,bg:'#FFFCF9'},1,'jpeg'],
 ['salmon-belly-fin-pack.png','0:428',{},1.5,'png'],
 ['about-woman-cat.jpg','0:455',{noRadius:true},2,'jpeg'],
 ['testimonials-paws-bg.png','0:466',{},1,'png'],
 ['partner-man-dog.jpg','0:571',{noRadius:true},2,'jpeg'],
 ['blog-seafood.jpg','0:586',{},2,'jpeg'],
 ['blog-natural.jpg','0:598',{},2,'jpeg'],
 ['blog-sustainable.jpg','0:610',{},2,'jpeg'],
];
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'}); fs.mkdirSync('assets',{recursive:true});
for(const [name,id,opt,scale,type] of jobs.filter(j=>j[0].startsWith(process.env.ONLY||""))){
  const {W,H,html}=m.renderNodeHTML(id,opt); fs.writeFileSync('tmp.html',html);
  const p=await b.newPage({viewport:{width:Math.ceil(W),height:Math.ceil(H)},deviceScaleFactor:scale});
  await p.goto('file://'+process.cwd()+'/tmp.html'); await p.waitForTimeout(400);
  await p.screenshot({path:'assets/'+name,type,quality:type==='jpeg'?80:undefined,omitBackground:type==='png',clip:{x:0,y:0,width:W,height:H}});
  await p.close(); console.log(name,Math.round(W*scale)+'x'+Math.round(H*scale),fs.statSync('assets/'+name).size);
}
await b.close();
