/* No dependencies: the canvas projects actual 3D geometry; aggregation is pure data. */
const dims=[{name:'Região',sql:'regiao',axis:'X',values:['Sul','Sudeste','Nordeste']},{name:'Produto',sql:'produto',axis:'Y',values:['Café','Chá']},{name:'Trimestre',sql:'trimestre',axis:'Z',values:['T1','T2']}];
const data=[];
for(let x=0;x<3;x++)for(let y=0;y<2;y++)for(let z=0;z<2;z++)data.push({coords:[x,y,z],value:([120,180,90,150,200,240,160,210,140,190,110,170])[data.length]});
const money=n=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL',maximumFractionDigits:0}).format(n);
const bitCount=n=>n.toString(2).replace(/0/g,'').length;
function aggregate(mask){const map=new Map();data.forEach((r,i)=>{const coords=r.coords.map((v,d)=>mask&(1<<d)?v:null),key=coords.join('|');if(!map.has(key))map.set(key,{coords,value:0,sources:[]});const g=map.get(key);g.value+=r.value;g.sources.push(i)});return [...map.values()]}
const state={mode:'cube',mask:7,selected:0,sqlTab:'operation',showSources:true,auto:false,yaw:-.65,pitch:.48};
const $=s=>document.querySelector(s);let groups=aggregate(7),hits=[],animatedMask=[1,1,1],lastTime=0;
const allowed=()=>state.mode==='rollup'?[7,3,1,0]:[7,3,5,6,1,2,4,0];
function selectMask(mask){if(!allowed().includes(mask))return;state.mask=mask;state.selected=0;update()}
function setMode(mode){state.mode=mode;if(!allowed().includes(state.mask))state.mask=7;state.selected=0;update()}
function sql(){const names=dims.filter((_,d)=>state.mask&(1<<d)).map(d=>d.sql);if(state.sqlTab==='slice'||state.mode==='group')return `SELECT ${names.length?names.join(', ')+',\n       ':''}SUM(vendas) AS total\nFROM vendas${names.length?'\nGROUP BY '+names.join(', '):''};`;return `SELECT regiao, produto, trimestre,\n       SUM(vendas) AS total,\n       GROUPING(regiao, produto, trimestre) AS nivel\nFROM vendas\nGROUP BY ${state.mode.toUpperCase()} (regiao, produto, trimestre);`}
function update(){groups=aggregate(state.mask);state.selected=Math.min(state.selected,groups.length-1);const n=bitCount(state.mask),selected=groups[state.selected];
 $('#shape-title').textContent=['Tudo converge em um total','Uma linha, uma perspectiva','Um plano de subtotais','Um cubo de possibilidades'][n];$('#shape-badge').textContent=`${n} ${n===1?'dimensão':'dimensões'}`;$('#dim-count').textContent=`${n} de 3`;
 $('#scene').setAttribute('aria-label', `${n} dimensões de agrupamento. ${n===3?'Arraste ou use as setas para girar. ':''}Selecione uma célula ou uma linha da tabela para ver a soma.`);
 $('.scene-key').innerHTML=dims.filter((_,i)=>state.mask&(1<<i)).map(d=>`<span>${d.name}</span>`).join('')||'<span>Sem eixos de agrupamento</span>';
 $('.canvas-hint').textContent=n===3?'↔ Arraste para girar · Clique em uma célula':'Clique em um subtotal para ver sua composição';
 $('.check').lastChild.textContent=' Mostrar composição da soma';
 $('.scene-tools').hidden=n!==3;
 $('#scene').style.cursor=n===3?'grab':'pointer';
 $('#selected-formula').hidden=!state.showSources;
 $('#mode-help').textContent={group:'Um único nível de agrupamento, definido pelos eixos que você preservar.',rollup:'4 níveis em uma hierarquia: detalhe → região + produto → região → total.',cube:'8 combinações em uma consulta. Explore qualquer conjunto de eixos.'}[state.mode];
 document.querySelectorAll('[data-mode]').forEach(b=>{b.classList.toggle('active',b.dataset.mode===state.mode);b.setAttribute('aria-pressed',b.dataset.mode===state.mode)});
 $('#dimensions').innerHTML=dims.map((d,i)=>`<button class="dimension" data-dim="${i}" aria-pressed="${!!(state.mask&(1<<i))}" ${allowed().includes(state.mask^(1<<i))?'':'disabled'}><span class="axis">${d.axis}</span><span><strong>${d.name}</strong><small>${d.values.join(' · ')}</small></span><span class="switch"></span></button>`).join('');
 $('#restriction').hidden=state.mode!=='rollup';document.querySelectorAll('[data-mask]').forEach(b=>{b.classList.toggle('active',+b.dataset.mask===state.mask);b.setAttribute('aria-pressed',+b.dataset.mask===state.mask)});
 const removed=dims.filter((_,i)=>!(state.mask&(1<<i))).map(d=>d.name.toLowerCase());
 $('#insight-title').textContent=['3 eixos colapsados → 1 total geral','2 eixos colapsados → uma linha','1 eixo colapsado → um plano','Cada célula conta uma história'][n];
 $('#insight-text').textContent=n===3?'Cada bloco combina uma região, um produto e um trimestre. Selecione um bloco para ver seu valor.':`Ao somar ${removed.join(' e ')}, ${data.length} células se tornam ${groups.length} ${groups.length===1?'célula':'células'}. ${n===0?'O cubo inteiro vira um único valor.':'Os eixos restantes definem cada subtotal.'}`;
 $('#selected-label').textContent=selected.coords.map((c,i)=>c===null?`${dims[i].name}: todos`:dims[i].values[c]).join(' / ');$('#selected-total').textContent=money(selected.value);$('#selected-formula').textContent=`${selected.sources.length} ${selected.sources.length===1?'célula de origem':'células de origem'} · ${selected.sources.map(i=>data[i].value).join(' + ')} = ${selected.value}`;
 $('#sql').innerHTML=sql().replace(/\b(SELECT|SUM|AS|FROM|GROUP BY|GROUPING|CUBE|ROLLUP)\b/g,'<span class="kw">$1</span>');
 document.querySelectorAll('[data-sql]').forEach(b=>b.classList.toggle('active',b.dataset.sql===state.sqlTab));
 $('#sql-note').textContent=state.sqlTab==='slice'||state.mode==='group'?'Esta consulta retorna exatamente o nível mostrado no cubo e na tabela.':`A consulta retorna todos os ${state.mode==='cube'?'8 conjuntos (36 linhas)':'4 conjuntos (22 linhas)'}. A visualização isola um nível. GROUPING identifica eixos agregados; o NULL desses eixos significa “todos”, não dado ausente.`;
 $('#row-count').textContent=`${groups.length} ${groups.length===1?'linha':'linhas'}`;
 $('#results').innerHTML=groups.map((g,i)=>`<tr data-row="${i}" class="${i===state.selected?'selected':''}">${g.coords.map((c,d)=>`<td>${d===0?`<button class="cell-pick" aria-label="Selecionar ${g.coords.map((v,k)=>v===null?'todos':dims[k].values[v]).join(', ')}" aria-pressed="${i===state.selected}">`:''}${c===null?'Todos':dims[d].values[c]}${d===0?'</button>':''}</td>`).join('')}<td>${money(g.value)}</td></tr>`).join('');
 $('#level-total').textContent=`Soma do nível: ${money(groups.reduce((a,g)=>a+g.value,0))}`;$('#group-count').textContent=`${groups.length} linhas no nível atual`;
 $('#sets-description').textContent=state.mode==='group'?'Um conjunto por consulta. Clique para mudar os eixos.':'Clique em um conjunto para visualizar seus subtotais. Não some níveis diferentes: eles reutilizam as mesmas vendas.';
 $('#sets').innerHTML=[7,3,5,6,1,2,4,0].map(m=>`<button data-set="${m}" class="${state.mask===m?'active':''}" ${allowed().includes(m)?'':'disabled'} aria-pressed="${state.mask===m}">(${dims.filter((_,i)=>m&(1<<i)).map(d=>d.sql).join(', ')||'total'})</button>`).join('');
}
document.addEventListener('click',e=>{const b=e.target.closest('button');if(b?.dataset.mode)setMode(b.dataset.mode);if(b?.dataset.dim!==undefined)selectMask(state.mask^(1<<+b.dataset.dim));if(b?.dataset.mask!==undefined)selectMask(+b.dataset.mask);if(b?.dataset.set!==undefined)selectMask(+b.dataset.set);if(b?.dataset.sql){state.sqlTab=b.dataset.sql;update()}const row=e.target.closest('[data-row]');if(row){state.selected=+row.dataset.row;update()}});
$('#sources').onchange=e=>{state.showSources=e.target.checked;update()};
$('#rotate').onclick=()=>{state.auto=!state.auto;$('#rotate').setAttribute('aria-pressed',state.auto);$('#rotate').textContent=state.auto?'Ⅱ Pausar':'↻ Girar'};
$('#reset').onclick=()=>{state.yaw=-.65;state.pitch=.48;state.auto=false;$('#rotate').setAttribute('aria-pressed','false');$('#rotate').textContent='↻ Girar'};
$('#copy').onclick=async()=>{try{await navigator.clipboard.writeText(sql());$('#copy').textContent='Copiado!'}catch{$('#copy').textContent='Selecione o SQL para copiar'}setTimeout(()=>$('#copy').textContent='Copiar SQL',2200)};
$('#download').onclick=()=>{const values=data.map(r=>`  (${r.coords.map((v,i)=>`'${dims[i].values[v]}'`).join(', ')}, ${r.value})`).join(',\n');const script=`-- Execute no PostgreSQL. Dataset local de demonstração.\nWITH vendas (regiao, produto, trimestre, vendas) AS (\n  VALUES\n${values}\n)\n${sql()}\n`;const url=URL.createObjectURL(new Blob([script],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='cubo-sql.sql';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)};
const canvas=$('#scene'),ctx=canvas.getContext('2d');let width=0,height=0,scale=1;
new ResizeObserver(()=>{const rect=canvas.getBoundingClientRect();width=rect.width;height=rect.height;const dpr=window.devicePixelRatio||1;canvas.width=width*dpr;canvas.height=height*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);scale=Math.min(width/6.4,height/5.2)}).observe(canvas);
function project([x,y,z]){const cy=Math.cos(state.yaw),sy=Math.sin(state.yaw),cp=Math.cos(state.pitch),sp=Math.sin(state.pitch);const rx=x*cy+z*sy,rz=-x*sy+z*cy;return [width/2+rx*scale,height/2+18-(y*cp-rz*sp)*scale,y*sp+rz*cp]}
function poly(points,fill,stroke){ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.closePath();ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=1;ctx.stroke()}}
const faceIndices=[[0,1,2,3],[4,7,6,5],[0,4,5,1],[3,2,6,7],[0,3,7,4],[1,5,6,2]];
function block(center,size,index,ghost=false){const verts=[[-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]].map(v=>project(v.map((n,i)=>center[i]+n*size[i]/2)));return faceIndices.map((f,j)=>({points:f.map(i=>verts[i]),depth:f.reduce((a,i)=>a+verts[i][2],0)/4,index,ghost,shade:j}))}
function contains(point,vertices){let inside=false;for(let i=0,j=vertices.length-1;i<vertices.length;j=i++){const [x,y]=vertices[i],[xx,yy]=vertices[j];if((y>point[1])!==(yy>point[1])&&point[0]<(xx-x)*(point[1]-y)/(yy-y)+x)inside=!inside}return inside}
function drawFlat(){
 const active=dims.map((_,i)=>i).filter(i=>state.mask&(1<<i));
 const n=active.length;
 hits=[];
 ctx.textAlign='center';ctx.textBaseline='middle';
 const left=80,right=width-36,top=90,bottom=height-76;
 const plotWidth=right-left,plotHeight=bottom-top;
 function line(a,b,color='#bca9de'){ctx.strokeStyle=color;ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(...a);ctx.lineTo(...b);ctx.stroke()}
 function label(text,x,y,color='#7c8493',size=11){ctx.fillStyle=color;ctx.font=`${size}px "DM Sans", sans-serif`;ctx.fillText(text,x,y)}
 if(n===2){
  const [xDim,yDim]=active,nx=dims[xDim].values.length,ny=dims[yDim].values.length;
  const cw=plotWidth/nx,ch=plotHeight/ny;
  line([left-6,top],[left-6,bottom+6]);line([left-6,bottom+6],[right,bottom+6]);
  dims[xDim].values.forEach((v,i)=>label(v,left+(i+.5)*cw,bottom+24));
  dims[yDim].values.forEach((v,i)=>label(v,left-40,top+(ny-i-.5)*ch));
  label(dims[xDim].name,(left+right)/2,bottom+43,'#7257d8');
  label(dims[yDim].name,left-30,top-22,'#7257d8');
  groups.forEach((g,i)=>{const x=left+g.coords[xDim]*cw+4,y=top+(ny-1-g.coords[yDim])*ch+4;const points=[[x,y],[x+cw-8,y],[x+cw-8,y+ch-8],[x,y+ch-8]];poly(points,i===state.selected?'#9273d2':'#eee7f8','#d8c9eb');label(money(g.value),x+(cw-8)/2,y+(ch-8)/2,i===state.selected?'white':'#654e89',Math.min(14,cw/7));hits.push({points,index:i})});
 } else if(n===1){
  const d=active[0],count=dims[d].values.length,y=height/2;
  const start=60,end=width-60;
  line([start,y],[end,y]);
  groups.forEach((g,i)=>{const x=start+(g.coords[d]+.5)*(end-start)/count;ctx.beginPath();ctx.arc(x,y,i===state.selected?7:5,0,Math.PI*2);ctx.fillStyle=i===state.selected?'#7257d8':'#bca9de';ctx.fill();label(money(g.value),x,y-28,'#7257d8',14);label(dims[d].values[g.coords[d]],x,y+27);hits.push({points:[[x-35,y-40],[x+35,y-40],[x+35,y+40],[x-35,y+40]],index:i})});
  label(dims[d].name,width/2,y+63,'#7257d8',12);
 } else {
  const x=width/2,y=height/2;ctx.beginPath();ctx.arc(x,y,7,0,Math.PI*2);ctx.fillStyle='#7257d8';ctx.fill();
  label(money(groups[0].value),x,y-38,'#7257d8',30);label('Total geral · nenhum eixo preservado',x,y+35);
  hits.push({points:[[x-110,y-65],[x+110,y-65],[x+110,y+55],[x-110,y+55]],index:0});
 }
}
function draw(time){const dt=Math.min((time-lastTime)/1000,.05);lastTime=time;if(state.auto&&state.mask===7)state.yaw+=dt*.25;const easing=window.matchMedia('(prefers-reduced-motion: reduce)').matches?1:Math.min(1,dt*9);animatedMask=animatedMask.map((v,i)=>v+(((state.mask&(1<<i))?1:0)-v)*easing);ctx.clearRect(0,0,width,height);
 if(state.mask!==7){drawFlat();requestAnimationFrame(draw);return;}
 // A quiet ground grid makes the rotation and perspective legible.
 ctx.lineWidth=1;ctx.strokeStyle='#ececf3';for(let i=-4;i<=4;i++){for(const line of [[[i*.5,-1.35,-2],[i*.5,-1.35,2]],[[-2,-1.35,i*.5],[2,-1.35,i*.5]]]){const a=project(line[0]),b=project(line[1]);ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.stroke()}}
 const selected=groups[state.selected];let faces=[];
 // Every source moves toward its aggregate coordinate as an axis collapses.
 data.forEach((r,i)=>{const coords=r.coords.map((v,d)=>(v-(dims[d].values.length-1)/2)*animatedMask[d]);const index=groups.findIndex(g=>g.sources.includes(i));faces.push(...block(coords,animatedMask.map(v=>.23+.54*v),index))});
 faces.sort((a,b)=>a.depth-b.depth);hits=[];
 faces.forEach(f=>{const active=f.index===state.selected;const palettes=active?['#7c5ccb','#a287e2','#8669d0','#c3b1ee','#9d80de','#b8a1e8']:['#b7a7d7','#d9ceec','#c2b1df','#e9e2f4','#cdbfe5','#ded4ee'];poly(f.points,palettes[f.shade],active?'#7152b4':'#ffffffb3');hits.push(f)});
 groups.forEach((g,i)=>{const center=g.coords.map((v,d)=>v===null?0:v-(dims[d].values.length-1)/2);const p=project(center);ctx.font=`${i===state.selected?'600':'400'} 11px "DM Sans",sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle=i===state.selected?'#fff':'#625276';if(state.mask===0||bitCount(state.mask)<3){ctx.fillStyle=i===state.selected?'#5c389a':'#625276';ctx.fillText(money(g.value),p[0],p[1]-19)}});
 const origin=[-1.8,-1.25,-1.25],axisEnds=[[2.05,-1.25,-1.25],[-1.8,1.55,-1.25],[-1.8,-1.25,1.55]],colors=['#8b6bc7','#429c8d','#c69b61'];axisEnds.forEach((end,i)=>{const a=project(origin),b=project(end);ctx.strokeStyle=colors[i];ctx.globalAlpha=state.mask&(1<<i)?1:.3;ctx.setLineDash(state.mask&(1<<i)?[]:[4,4]);ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.stroke();ctx.setLineDash([]);ctx.font='10px "DM Sans",sans-serif';ctx.fillStyle=colors[i];ctx.textAlign='center';ctx.fillText(dims[i].name+(state.mask&(1<<i)?'':' ∑'),b[0],b[1]+(i===1?-12:15));ctx.globalAlpha=1});requestAnimationFrame(draw)
}
let drag=null;
canvas.addEventListener('pointerdown',e=>{drag={x:e.clientX,y:e.clientY,startX:e.clientX,startY:e.clientY,moved:false};canvas.setPointerCapture(e.pointerId)});
canvas.addEventListener('pointermove',e=>{if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;drag.moved ||= Math.hypot(e.clientX-drag.startX,e.clientY-drag.startY)>4;if(drag.moved&&state.mask===7){state.yaw+=dx*.009;state.pitch=Math.max(-1.2,Math.min(1.2,state.pitch+dy*.009))}drag.x=e.clientX;drag.y=e.clientY});
canvas.addEventListener('pointerup',e=>{if(drag&&!drag.moved){const r=canvas.getBoundingClientRect();const hit=[...hits].reverse().find(f=>contains([e.clientX-r.left,e.clientY-r.top],f.points));if(hit){state.selected=hit.index;update()}}drag=null});canvas.addEventListener('pointercancel',()=>drag=null);
canvas.addEventListener('keydown',e=>{if(state.mask===7&&['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();state.yaw+=(e.key==='ArrowRight'?.1:e.key==='ArrowLeft'?-.1:0);state.pitch=Math.max(-1.2,Math.min(1.2,state.pitch+(e.key==='ArrowUp'?.1:e.key==='ArrowDown'?-.1:0)))}});
update();requestAnimationFrame(draw);
