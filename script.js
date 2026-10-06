'use strict';
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---- Mobile menu + sticky nav ---- */
const burger=$('#burger'), menu=$('#menu'), nav=$('#nav');
const setMenu=o=>{menu.classList.toggle('open',o);burger.setAttribute('aria-expanded',o);burger.setAttribute('aria-label',o?'Менюну жабуу':'Менюну ачуу')};
burger.onclick=()=>setMenu(!menu.classList.contains('open'));
$$('a',menu).forEach(a=>a.onclick=()=>setMenu(false));
addEventListener('keydown',e=>{if(e.key==='Escape')setMenu(false)});

/* ---- Smooth scrolling (explicit, with hash update) ---- */
$$('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{
  const t=$(a.getAttribute('href'));
  if(t){e.preventDefault();t.scrollIntoView({behavior:reduce?'auto':'smooth'});history.replaceState(null,'',a.getAttribute('href'))}
}));

/* ---- Hero: tunduk rays, floating symbols ---- */
$('#rays').innerHTML=Array.from({length:40},(_,i)=>`<line x1="40" y1="0" x2="${i%2?70:92}" y2="0" transform="rotate(${i*9})"/>`).join('');
const syms=['π','√x','∑','∫','E=mc²','a²+b²=c²','∞','Δ','θ','sin x'];
$('#symbols').innerHTML=Array.from({length:16},(_,i)=>`<span class="sym" style="left:${(i*6.4+Math.random()*4)%96}%;font-size:${14+Math.random()*26}px;animation-duration:${18+Math.random()*22}s;animation-delay:-${Math.random()*30}s">${syms[i%syms.length]}</span>`).join('');

/* ---- Parallax (mountains) + nav background ---- */
const layers=$$('.mtn path'); let ticking=false;
addEventListener('scroll',()=>{
  if(ticking)return; ticking=true;
  requestAnimationFrame(()=>{
    const y=scrollY; nav.classList.toggle('solid',y>40);
    if(!reduce&&y<innerHeight)layers.forEach((l,i)=>l.style.transform=`translateY(${y*(0.06+i*0.05)}px)`);
    ticking=false;
  });
},{passive:true});

/* ---- Scroll reveal + counters ---- */
function countUp(el){
  const end=parseFloat(el.dataset.count),dec=+el.dataset.dec||0,suf=el.dataset.suf||'';
  if(reduce){el.textContent=end.toFixed(dec)+suf;return}
  const t0=performance.now();
  (function f(t){const p=Math.min((t-t0)/1600,1),e=1-Math.pow(1-p,3);el.textContent=(end*e).toFixed(dec)+suf;if(p<1)requestAnimationFrame(f)})(t0);
}
const io=new IntersectionObserver(es=>es.forEach(e=>{
  if(!e.isIntersecting)return;
  e.target.classList.add('in');
  $$('[data-count]',e.target).forEach(countUp);
  io.unobserve(e.target);
}),{threshold:.2});
$$('.reveal').forEach(el=>io.observe(el));

/* ---- Geometry: fractal + hover/click explanations ---- */
(function(){
  let d='';
  (function tri(x,y,s,n){ // Sierpinski triangle
    if(!n){d+=`M${x} ${y}L${x+s/2} ${y+s*.866}H${x-s/2}Z`;return}
    const h=s/2; tri(x,y,h,n-1); tri(x-h/2,y+h*.866,h,n-1); tri(x+h/2,y+h*.866,h,n-1);
  })(300,225,170,4);
  $('#fractal').innerHTML=`<path d="${d}"/>`;
})();
const gi=$('#geoInfo');
function showShape(g){
  $$('.shape').forEach(s=>s.classList.remove('on')); g.classList.add('on');
  gi.innerHTML=`<h3>${g.dataset.t}</h3><p>${g.dataset.d}</p>`;
  gi.classList.remove('flash'); void gi.offsetWidth; gi.classList.add('flash');
}
$$('.shape').forEach(g=>{
  ['mouseenter','click','focus'].forEach(ev=>g.addEventListener(ev,()=>showShape(g)));
  g.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();showShape(g)}});
});

/* ---- Height calculator: h = d * tan(θ) ---- */
const resEl=$('#result'),resNum=$('#resNum'),err=$('#calcErr');
$('#calcBtn').onclick=()=>{
  const d=parseFloat($('#dist').value),a=parseFloat($('#angle').value);
  if(!(d>0)||!(a>0&&a<90)){err.textContent='Аралыкты 0дөн чоң, бурчту 1°–89° аралыгында киргиз.';resEl.classList.remove('show');return}
  err.textContent='';
  const h=Math.round(d*Math.tan(a*Math.PI/180));
  resEl.classList.remove('show'); void resEl.offsetWidth; resEl.classList.add('show');
  const t0=performance.now();
  (function f(t){const p=reduce?1:Math.min((t-t0)/1400,1);resNum.textContent=Math.round(h*(1-Math.pow(1-p,3))).toLocaleString('ru-RU')+' м';if(p<1)requestAnimationFrame(f)})(t0);
};
['dist','angle'].forEach(id=>$('#'+id).addEventListener('keydown',e=>{if(e.key==='Enter')$('#calcBtn').click()}));

/* ---- Mountains (demo, approximate data) ---- */
const peaks={
  ala:['Ала-Тоо','Бийиктиги: болжол менен 4 800 м (демо)','Координаттары: ≈ 42.6° с.ш., 74.6° ш.д.','Математика: капталдын бурчу θ жана аралык d белгилүү болсо, бийиктик h = d·tan θ.'],
  teng:['Теңир-Тоо','Бийиктиги: чокулары 7 000 м чейин (демо)','Координаттары: ≈ 42° с.ш., 78° ш.д.','Математика: тоо тизмеги сызыктуу узундукка ээ — аралык менен масштабды катыш аркылуу эсептейбиз.'],
  khan:['Хан-Теңири','Бийиктиги: ≈ 7 000 м (демо)','Координаттары: ≈ 42.2° с.ш., 80.2° ш.д.','Математика: чокусу пирамидага окшош — үч бурчтуктардан түзүлгөн фигура.']
};
const pi=$('#peakInfo');
$$('.peak').forEach(b=>b.onclick=()=>{
  $$('.peak').forEach(x=>x.classList.remove('on')); b.classList.add('on');
  const p=peaks[b.dataset.k];
  pi.innerHTML=`<h3>${p[0]}</h3><p>${p[1]}</p><p>${p[2]}</p><p>${p[3]}</p>`;
  pi.classList.remove('flash'); void pi.offsetWidth; pi.classList.add('flash');
});

/* ---- Timeline ---- */
const steps=[['Башталыш','Ар бир чоң жол бир чечимден башталат.'],['Билим','Окуган адам эч качан жолдон адашпайт.'],['Логика','Ой тартипке келгенде, маселе жөнөкөйлөшөт.'],['Математика','Сандар — бүт дүйнөнүн тили.'],['Илим','Суроо бере билүү — табылганын жарымы.'],['Инновация','Жаңы идея — эл үчүн жаңы мүмкүнчүлүк.'],['Дүйнөлүк деңгээл','Кыргыз ою менен дүйнөнүн чокусуна.']];
$('#timeline').innerHTML=steps.map(s=>`<li><h3>${s[0]}</h3><p>${s[1]}</p></li>`).join('');
const tio=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');tio.unobserve(e.target)}}),{threshold:.5});
$$('#timeline li').forEach(li=>tio.observe(li));

/* ---- Quiz ---- */
const qs=[
  ['Эгер a = 5 болсо, a² канча?',['10','25','20','15'],1],
  ['Катеттери 3 жана 4 болгон тик бурчтуктун гипотенузасы канча?',['5','6','7','12'],0],
  ['π санынын жакындатылган мааниси кайсы?',['2.71','3.14','1.62','4.13'],1],
  ['tan 45° канчага барабар?',['0','2','1','½'],2],
  ['Үч бурчтуктун ички бурчтарынын суммасы канча?',['90°','360°','270°','180°'],3]
];
const qb=$('#quizBox'); let qi=0,score=0;
function renderQ(){
  const [t,o]=qs[qi];
  qb.innerHTML=`<p class="q-meta">Суроо ${qi+1} / ${qs.length}</p><p class="q-text">${t}</p><div class="opts">${o.map((x,i)=>`<button class="opt" data-i="${i}">${x}</button>`).join('')}</div>`;
  $$('.opt',qb).forEach(b=>b.onclick=()=>answer(+b.dataset.i));
}
function answer(i){
  const ok=qs[qi][2],btns=$$('.opt',qb);
  btns.forEach(b=>b.disabled=true);
  btns[ok].classList.add('right');
  if(i===ok)score++; else btns[i].classList.add('wrong');
  setTimeout(()=>{qi++;qi<qs.length?renderQ():finish()},1100);
}
function finish(){
  const msg=score>=4?'Кереметсиң! Бийиктик сенин колуңда.':score>=2?'Жакшы башталыш — улантуу керек!':'Эч нерсе эмес — ар бир кадам чокуга алып барат.';
  qb.innerHTML=`<p class="q-meta">Тест аяктады</p><p class="score">Сенин жыйынтыгың: ${score}/${qs.length}</p><p style="margin-bottom:22px">${msg}</p><button class="btn primary" id="again">Кайра баштоо</button>`;
  $('#again').onclick=()=>{qi=0;score=0;renderQ()};
}
renderQ();
