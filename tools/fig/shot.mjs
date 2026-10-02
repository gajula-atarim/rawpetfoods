import {chromium} from 'playwright'; import fs from 'fs';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'}); const p=await b.newPage({viewport:{width:1440,height:900}});
await p.goto('file://'+process.cwd()+'/page.html'); await p.waitForTimeout(1500);
fs.mkdirSync('shots',{recursive:true});
await p.screenshot({path:'shots/full.png',fullPage:true});
const secs=JSON.parse(fs.readFileSync('sections.json'));
for(const [i,s] of secs.entries()) await p.screenshot({path:`shots/s${String(i+1).padStart(2,'0')}.png`,clip:{x:0,y:s.y,width:1440,height:s.h},fullPage:true});
await b.close();
