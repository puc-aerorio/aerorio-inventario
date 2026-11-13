import * as THREE from 'three';
import { LIVE } from '../config.js';

/* ================= dados ================= */
export const CL={ferr:{n:'Ferramenta manual',i:'wrench',c:'#E07A1F',m:'unidades'},elet:{n:'Ferramenta elétrica',i:'bolt',c:'#D9A400',m:'unidades'},eletro:{n:'Eletrônica',i:'chip',c:'#1E9E6A',m:'contavel'},
 fix:{n:'Fixação',i:'screw',c:'#5B6B7F',m:'conjunto'},quim:{n:'Adesivos e químicos',i:'drop',c:'#8E5BD0',m:'contavel'},mat:{n:'Materiais',i:'layers',c:'#A0703C',m:'contavel'},
 med:{n:'Medição',i:'ruler',c:'#1585A3',m:'unidades'},epi:{n:'EPI',i:'shield',c:'#D2483F',m:'contavel'},div:{n:'Diversos',i:'dots',c:'#7A8794',m:'contavel'}};
export const SPECK={ferr:['Marca','Medida'],elet:['Marca','Potência'],eletro:['Tipo (macho/fêmea)','Especificação'],fix:['Tipos'],quim:['Validade','Rendimento'],mat:['Dimensão','Espessura'],med:['Faixa','Resolução'],epi:['Tamanho'],div:['Especificação']};
export const SUG=[[/broca|chave|lima|estilete|tesoura|alicate|martelo|serrote|grampo|esquadro/,'ferr'],[/furadeira|parafusadeira|dremel|retifica|solda|soprador|tupia|lixadeira/,'elet'],
 [/resistor|capacitor|servo|conector|placa|arduino|bateria|lipo|motor|esc|fio|cabo|led|sensor|multimetro/,'eletro'],[/parafuso|porca|arruela|rebite|abracadeira|pino/,'fix'],
 [/cola|epoxi|resina|tinta|fita|primer|solvente|thinner/,'quim'],[/balsa|carbono|madeira|espuma|tecido|fibra|chapa|tubo|compensado/,'mat'],
 [/paquimetro|regua|trena|balanca|micrometro|nivel/,'med'],[/luva|oculos|mascara|protetor|avental/,'epi']];
export const ESTADOS={boa:['Boa','#237F52'],desgastada:['Desgastada','#C98F00'],quebrada:['Quebrada','#D2483F'],manutencao:['Em manutenção','#1585A3']};
export const PESSOAS=['Lucas','Marina','Pedro','Ana','Cava','Júlia'];
export const TIPOEMP={equipe:'Pessoa da equipe',externa:'Outra equipe',inst:'Instituição'};
export const NIVEIS=['Vazio','Pouco','Médio','Cheio'];
export const OT={caixaTrava:{n:'Caixa transparente com travas',h:{P:.09,M:.13,G:.19},lid:1,transp:1,cor:'#c9302c'},
 gavetinhas:{n:'Gaveteiro plástico',h:{P:.14,M:.2,G:.28},cor:'#c6cbce'},
 maleta:{n:'Maleta rígida',h:{P:.07,M:.09,G:.12},lid:1,cor:'#e26b1f'},
 maletaT:{n:'Maleta com tampa transparente',h:{P:.08,M:.11,G:.14},lid:1,transp:1,cor:'#d8b21f'},
 cesto:{n:'Cesto vazado',h:{P:.06,M:.09,G:.12},open:1,cor:'#f2f2ef'},
 ferramentas:{n:'Caixa de ferramentas',h:{P:.12,M:.16,G:.22},lid:1,cor:'#5f6468'},
 divisorias:{n:'Caixa com divisórias',h:{P:.04,M:.05,G:.07},lid:1,transp:1,cor:'#4f8fd0'},
 papelao:{n:'Caixa de papelão',h:{P:.1,M:.15,G:.22},open:1,cor:'#c49a62'},
 saco:{n:'Saco',h:{P:.06,M:.08,G:.1},cor:'#D2483F'}};
export const OTK=Object.keys(OT);export const SZ={P:[.17,.13],M:[.27,.19],G:[.44,.3]};
export const OCOL=['#3E7CB1','#E0B12E','#4C9A6A','#C8553D','#8E5BD0','#5B6B7F','#E07A1F','#2b3138'];
export const DAY=864e5,NOW=Date.now();
export const ITEMS={
 solda:{nome:'Estação de solda',cl:'elet',desc:'Estação 60 W com controle de temperatura.',spec:{'Marca':'Hikari','Potência':'60 W'}},
 paq:{nome:'Paquímetro digital',cl:'med',spec:{'Faixa':'0–150 mm','Resolução':'0,01 mm'}},
 balsa:{nome:'Balsa 3 mm',cl:'mat',un:'folhas',min:5,spec:{'Dimensão':'100 × 1000 mm','Espessura':'3 mm'}},
 lamina:{nome:'Lâmina de serra 10″',cl:'ferr',modo:'contavel',un:'un.',min:2},
 allen:{nome:'Jogo de chaves Allen',cl:'ferr',spec:{'Medida':'1,5–10 mm'}},
 lima:{nome:'Lima chata',cl:'ferr'},
 brocas:{nome:'Kit de brocas HSS',cl:'ferr',modo:'conjunto',desc:'Maleta com brocas de 1 a 6 mm.'},
 estilete:{nome:'Estilete profissional',cl:'ferr',spec:{'Medida':'Lâmina 18 mm'},ident:{nome:'Cor',tipo:'cor',ops:[{n:'Amarelo',c:'#E0B12E'},{n:'Vermelho',c:'#C8553D'}]}},
 fenda:{nome:'Chave de fenda',cl:'ferr',ident:{nome:'Tamanho',tipo:'texto',ops:[{n:'Pequena'},{n:'Média'},{n:'Grande'}]}},
 tesoura:{nome:'Tesoura de chapa',cl:'ferr'},
 laminas:{nome:'Lâminas de estilete',cl:'ferr',modo:'contavel',un:'un.',min:10,spec:{'Medida':'18 mm'}},
 epoxi:{nome:'Cola epóxi 24 h',cl:'quim',un:'tubos',min:2,spec:{'Validade':'03/2027'}},
 ca:{nome:'Cola CA fina',cl:'quim',un:'frascos',min:2},
 kapton:{nome:'Fita kapton',cl:'quim',un:'rolos',min:2,spec:{'Rendimento':'33 m · 25 mm'}},
 carbono:{nome:'Tecido de fibra de carbono',cl:'mat',un:'rolos',min:1,spec:{'Espessura':'200 g/m²'}},
 paraf:{nome:'Caixa de parafusos',cl:'fix'},porcas:{nome:'Caixa de porcas',cl:'fix'},
 xt60:{nome:'Conector XT60',cl:'eletro',un:'pares',min:6,spec:{'Tipo (macho/fêmea)':'Par macho + fêmea','Especificação':'60 A'}},
 jst:{nome:'Conector JST',cl:'eletro',un:'un.',min:10,spec:{'Tipo (macho/fêmea)':'Fêmea','Especificação':'Passo 2,0 mm'}},
 servo:{nome:'Servo 9 g',cl:'eletro',modo:'unidades',spec:{'Especificação':'1,8 kg·cm'}},
 lipo:{nome:'Bateria LiPo 3S',cl:'eletro',modo:'unidades',spec:{'Especificação':'2200 mAh'}},
 resist:{nome:'Resistores sortidos',cl:'eletro',modo:'conjunto'},
 multi:{nome:'Multímetro',cl:'med'},
 fio:{nome:'Fio de silicone 18 AWG',cl:'eletro',un:'m',min:5},
 luva:{nome:'Luva nitrílica',cl:'epi',un:'pares',min:10},
 dupla:{nome:'Fita dupla face',cl:'quim',un:'rolos',min:1},
 serrafita:{nome:'Serra de fita de bancada',cl:'elet',desc:'Máquina, patrimônio da equipe.',model:'serrafita'},furadeira:{nome:'Furadeira de bancada',cl:'elet',desc:'Máquina, patrimônio da equipe.',model:'furadeira'},ticotico:{nome:'Serra tico-tico de bancada',cl:'elet',desc:'Máquina, patrimônio da equipe.',model:'ticotico'},
 trofeu:{nome:'Troféu',cl:'div',modo:'unidades',desc:'Conquistas da equipe.'}};
for(const [k,v] of Object.entries(ITEMS)){v.id=k;v.modo=v.modo||CL[v.cl].m;v.un=v.un||(v.modo==='unidades'?'un.':'un.');if(v.min==null)v.min=0;v.obs=v.obs||'';v.spec=v.spec||{};}
export let eid=0,oid=0;
/* ids únicos entre aparelhos: tempo + acaso */
export const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,7);
export const U=(n,estado='boa',emp=null,v=null)=>({id:'U'+uid(),n,estado,emp,v});
/* texto digitado ou lido de fora nunca carrega marcação */
export const clean=s=>String(s??'').replace(/[<>]/g,'').replace(/"/g,'”').trim();
export const E=(ref,o={})=>({id:'E'+uid(),ref,nf:false,t:NOW-Math.random()*20*DAY,...o});
export const O=(tipo,cor,tam,o={})=>({id:'O'+uid(),tipo,cor,tam,nome:'',etq:null,itens:[],...o});
export const Pt=(id,o={})=>({id,nomeP:'',etq:null,cheia:false,orgs:[],itens:[],...o});
export const LABS=[{id:'man',nome:'Laboratório de Manufatura',x0:-3.6,x1:3.6,c:new THREE.Vector3(-.2,.2,0),d:19},{id:'ele',nome:'Laboratório de Eletrônica',x0:3.6,x1:6.4,c:new THREE.Vector3(5.0,.2,.2),d:13}];
/* móveis do Lab 01 real (posições no mundo = maquete + OFF) e do Lab Drone/Eletrônica */
export const CARD=['Limas e martelos','Estiletes e tesouras','Chaves','Alicates e pinças','Facas','Medidores','Grampos e cordões','EPIs'];
export const M=[
{id:'central',lab:'man',nome:'Bancada central',cod:'11',tipo:'mesa',pos:[-.675,.15,1.102],rot:0,real:'#f4f5f3',etq:null,partes:[
 Pt('T',{nomeP:'Tampo',itens:[E('solda',{units:[U(1)]}),E('paq',{units:[U(1),U(2,'boa',{para:'Lucas',tipo:'equipe',desde:NOW-3*DAY})]})]}),
 Pt('U',{nomeP:'Embaixo',itens:[E('balsa',{qtd:12})]})]},
{id:'s06',lab:'man',nome:'Armário suspenso 06',cod:'06',tipo:'suspenso',num:'06',pos:[-3.025,-.15,-2.82],rot:Math.PI/2,real:'#eef0ed',etq:null,partes:[
 Pt('PE',{nomeP:'Porta esquerda',orgs:[O('maleta','#e26b1f','M',{nome:'Maleta de campo',etq:'e3',itens:[E('estilete',{units:[U(4)]}),E('kapton',{qtd:1})]})]}),Pt('PD',{nomeP:'Porta direita'})]},
{id:'b06',lab:'man',nome:'Bancada da mesa de empuxo',cod:'12',tipo:'bancada',pos:[-2.95,-.15,-2.82],rot:Math.PI/2,real:'#eef0ed',etq:null,partes:[
 Pt('T',{nomeP:'Tampo'}),Pt('G1',{nomeP:'Gaveta 1'}),Pt('G2',{nomeP:'Gaveta 2'}),Pt('U',{nomeP:'Embaixo do tampo'})]},
{id:'s07',lab:'man',nome:'Armário suspenso 07',cod:'07',tipo:'suspenso',num:'07',rotulo:'ELÉTRICA',tomada:1,pos:[1.025,-.15,-2.82],rot:-Math.PI/2,real:'#e3e5e3',etq:null,partes:[
 Pt('PE',{nomeP:'Porta esquerda',itens:[E('fio',{qtd:12})]}),Pt('PD',{nomeP:'Porta direita',orgs:[O('gavetinhas','#c6cbce','M',{nome:'Gaveteiro de componentes',itens:[E('resist',{nivel:3,tipos:[{n:'1 kΩ'},{n:'10 kΩ'},{n:'100 Ω'}]})]})]})]},
{id:'b07',lab:'man',nome:'Bancada elétrica',cod:'13',tipo:'bancada',pos:[.95,-.15,-2.82],rot:-Math.PI/2,real:'#eef0ed',etq:null,partes:[
 Pt('T',{nomeP:'Tampo',itens:[E('multi',{units:[U(1),U(2)]})]}),Pt('G1',{nomeP:'Gaveta 1'}),Pt('G2',{nomeP:'Gaveta 2'}),Pt('U',{nomeP:'Embaixo do tampo'})]},
{id:'e10',lab:'man',nome:'Estante com armário 10',cod:'10',tipo:'armario',pos:[1.025,-.15,-1.73],rot:-Math.PI/2,real:'#cfd3d4',etq:null,doorParts:['P3'],partes:[
 Pt('A',{nomeP:'Em cima',itens:[E('trofeu',{units:[U(1)]})]}),
 Pt('P1',{nomeP:'Prateleira de cima',orgs:[O('caixaTrava','#c9302c','M',{nome:'Caixa de conectores',itens:[E('xt60',{qtd:14}),E('jst',{qtd:30})]}),O('divisorias','#4f8fd0','M',{nome:'Caixa de servos',itens:[E('servo',{units:[U(1),U(2),U(3),U(4,'quebrada'),U(5),U(6)]})]})]}),
 Pt('P2',{nomeP:'Prateleira de baixo',itens:[E('paraf',{nivel:2,tipos:[{n:'M2'},{n:'M2,5'},{n:'M3'},{n:'M4'},{n:'M5'}]})]}),Pt('P3',{nomeP:'Armário 10'})]},
{id:'colas',lab:'man',nome:'Armário de colas, fitas e tintas',cod:'14',tipo:'armario',pos:[1.2,-.15,-1.05],rot:0,real:'#eef0ed',etq:null,rot2:['FITAS','TINTAS'],partes:[
 Pt('A',{nomeP:'Em cima'}),Pt('P1',{nomeP:'Prateleira de cima',itens:[E('epoxi',{qtd:4,aberto:NOW-12*DAY}),E('ca',{qtd:1})]}),Pt('P2',{nomeP:'Prateleira do meio',itens:[E('kapton',{qtd:5})]}),Pt('P3',{nomeP:'Prateleira de baixo',itens:[E('carbono',{qtd:2})]})]},
{id:'flag',lab:'man',nome:'Armário suspenso “fight like a girl”',cod:'17',tipo:'suspenso',under:1,pos:[1.825,0,-2.82],rot:Math.PI/2,real:'#eef0ed',etq:null,partes:[
 Pt('PE',{nomeP:'Porta esquerda',orgs:[O('maletaT','#d8b21f','M',{nome:'Maleta de brocas',itens:[E('brocas',{nivel:2,tipos:[{n:'1 mm'},{n:'2 mm'},{n:'3 mm',aus:true},{n:'4 mm'},{n:'5 mm'},{n:'6 mm'}]})]})]}),Pt('PD',{nomeP:'Porta direita'}),Pt('U',{nomeP:'Embaixo'})]},
{id:'vao',lab:'man',nome:'Vão cheio de coisas',cod:'22',tipo:'lugar',deco:'vao',W:.5,D:1.35,pos:[1.85,0,-1.475],rot:0,real:'#b07a2a',etq:null,partes:[Pt('L',{nomeP:'Vão'})]},
{id:'materiais',lab:'man',nome:'Área dos materiais',cod:'23',tipo:'lugar',deco:'materiais',W:.75,D:2.6,pos:[3.225,0,-2.2],rot:0,real:'#b07a2a',etq:null,partes:[Pt('L',{nomeP:'Área'})]},
{id:'lixo',lab:'man',nome:'Área do lixo',cod:'24',tipo:'lugar',deco:'lixo',W:.67,D:1.3,pos:[-3.265,.15,.8],rot:0,real:'#b07a2a',etq:null,partes:[Pt('L',{nomeP:'Sucata e descarte'})]},
{id:'gazul',lab:'man',nome:'Gaveteiro azul',cod:'16',tipo:'gaveteiro',pos:[3.35,0,-.45],rot:-Math.PI/2,real:'#1f4c96',etq:'e1',partes:[
 Pt('A',{nomeP:'Top hat'}),...CARD.map((c,i)=>Pt('G'+(i+1),{etq:'g'+(i+1),etqNome:true,
  ...(i===0?{itens:[E('lima',{units:[U(1),U(2),U(3,'quebrada')]})]}:i===1?{orgs:[O('cesto','#f2f2ef','G',{nome:'Bandeja de corte',itens:[E('estilete',{units:[U(1),U(2,'boa',{para:'Marina',tipo:'equipe',desde:NOW-6*DAY}),U(3,'desgastada')]}),E('tesoura',{units:[U(1),U(2)]})]})],itens:[E('laminas',{qtd:8})]}:i===2?{itens:[E('allen',{units:[U(1),U(2,'desgastada')]}),E('fenda',{units:[U(1,'boa',null,'Pequena'),U(2,'boa',null,'Pequena'),U(3,'boa',null,'Média'),U(4,'desgastada',null,'Grande')]})]}:i===7?{orgs:[O('saco','#D2483F','M',{nome:'Saco de EPIs',itens:[E('luva',{qtd:8})]})]}:{})}))]},
{id:'a9',lab:'man',nome:'Armário 9',cod:'15',tipo:'armario',pos:[3.35,0,.2],rot:-Math.PI/2,real:'#eef0ed',etq:null,rot2:['PARAFUSOS',''],partes:[
 Pt('A',{nomeP:'Em cima'}),Pt('P1',{nomeP:'Prateleira de cima',itens:[E('porcas',{nivel:1,tipos:[{n:'M3'},{n:'M3 autotravante',aus:true},{n:'M4'}]})]}),Pt('P2',{nomeP:'Prateleira do meio'}),Pt('P3',{nomeP:'Prateleira de baixo'})]},
{id:'s09',lab:'man',nome:'Armário suspenso 09',cod:'09',tipo:'suspenso',num:'09',rotulo:'CHAVES',yb:1.36,pos:[3.375,0,-.1],rot:-Math.PI/2,real:'#d9dcdb',etq:null,partes:[Pt('PE',{nomeP:'Porta esquerda'}),Pt('PD',{nomeP:'Porta direita'})]},
{id:'serra',lab:'man',nome:'Bancada da serra',cod:'18',tipo:'serra',pos:[-3.3,0,-1.1],rot:Math.PI/2,real:'#eef0ed',etq:null,partes:[
 Pt('T',{nomeP:'Tampo',itens:[E('serrafita',{units:[U(1)]})]}),Pt('G1',{nomeP:'Gaveta 1',itens:[E('lamina',{qtd:2})]}),Pt('G2',{nomeP:'Gaveta 2'}),Pt('U',{nomeP:'Embaixo'}),Pt('AL',{nomeP:'Ao lado',itens:[E('furadeira',{units:[U(1)]}),E('ticotico',{units:[U(1)]})]})]},
{id:'pc',lab:'man',nome:'Bancada do PC',cod:'19',tipo:'computador',pos:[-3.25,.15,2.525],rot:Math.PI/2,real:'#e8eae8',etq:null,partes:[Pt('T',{nomeP:'Tampo'}),Pt('U',{nomeP:'Embaixo'})]},
{id:'carrinho',lab:'man',nome:'Carrinho bandeja',cod:'20',tipo:'estante',pos:[-.675,-.15,-1.0],rot:0,real:'#6f7466',etq:null,partes:[Pt('N1',{nomeP:'Bandeja de cima',itens:[E('dupla',{qtd:2})]}),Pt('N2',{nomeP:'Bandeja do meio'}),Pt('N3',{nomeP:'Bandeja de baixo'})]},
{id:'bel',lab:'ele',nome:'Bancada de eletrônica',cod:'31',tipo:'bancada',pos:[6.0,0,-1.5],rot:-Math.PI/2,real:'#d6c3a2',etq:null,partes:[
 Pt('T',{orgs:[O('gavetinhas','#c6cbce','M',{nome:'Gaveteiro de resistores',itens:[E('resist',{nivel:2,tipos:[{n:'220 Ω'},{n:'4,7 kΩ'}]})]})]}),Pt('U',{itens:[E('fio',{qtd:6})]})]},
{id:'est2',lab:'ele',nome:'Estante de baterias',cod:'32',tipo:'estante',n:2,W:1.3,pos:[5.0,0,3.25],rot:Math.PI,real:'#9aa1a8',etq:null,partes:[
 Pt('A'),Pt('N1',{orgs:[O('ferramentas','#5f6468','M',{nome:'Caixa de baterias',itens:[E('lipo',{units:[U(1),U(2),U(3,'boa',{para:'Equipe Uai!rbus',tipo:'externa',desde:NOW-41*DAY}),U(4)]})]})]}),Pt('N2')]}];
/* posição de projeto de cada móvel (para o botão "Posição original" da edição) */
for(const m of M){m.pos0=[...m.pos];m.rot0=m.rot;}
export const SEM={id:'sem',itens:[E('dupla',{qtd:3,t:NOW-2*DAY})]};
export const ETQ=[{id:'e1',t:'GAVETEIRO AZUL'},{id:'e3',t:'MALETA CAMPO'},{id:'e4',t:'ARMÁRIO 1'},{id:'e5',t:'CAIXA 07'},{id:'e6',t:'BANCADA 2'},...CARD.map((c,i)=>({id:'g'+(i+1),t:c}))];
for(const m of M)for(const p of m.partes)for(const e of [...p.itens,...p.orgs.flatMap(o=>o.itens)])if(e.ref==='estilete')e.units.forEach(u=>u.v=u.n<3?'Amarelo':'Vermelho');
export const identOp=(it,v)=>it.ident&&v?it.ident.ops.find(o=>o.n===v):null;
export const RECADO={linhas:['Reunião quinta 18h','Não deixar a serra ligada']};
/* ---- dados de demonstração guardados no navegador (até a planilha entrar, na etapa 2) ---- */
export const STORE='aerorio-inventario-demo-v2';export let saveT=0;
export function snapshot(){return {v:2,eid,oid,ITEMS,SEM:SEM.itens,ETQ,RECADO:RECADO.linhas,M:M.map(m=>({id:m.id,pos:m.pos,rot:m.rot,etq:m.etq,partes:m.partes}))};}
/* com a planilha ligada, sync.js assume a gravação (HOOK.save) e recebe os resumos das ações (HOOK.resumo) */
export const HOOK={save:null,resumo:[],live:false};
export function save(){if(HOOK.save){HOOK.save();return;}clearTimeout(saveT);saveT=setTimeout(()=>{try{localStorage.setItem(STORE,JSON.stringify(snapshot(),(k,v)=>k[0]==='_'?undefined:v));}catch(e){}},400);}
export function cleanDeep(o){for(const k in o){const v=o[k];if(typeof v==='string')o[k]=clean(v);else if(v&&typeof v==='object')cleanDeep(v);}return o;}
export function restore(){let d=null;try{d=JSON.parse(localStorage.getItem(STORE)||'null');}catch(e){}if(!d||d.v!==2||!Array.isArray(d.M))return;cleanDeep(d);
 const ids=m=>m.partes.map(p=>p.id).join();if(d.M.some(s=>{const m=M.find(x=>x.id===s.id);return !m||ids(m)!==ids(s);}))return; // estrutura mudou: fica a demonstração nova
 eid=d.eid;oid=d.oid;for(const k of Object.keys(ITEMS))delete ITEMS[k];Object.assign(ITEMS,d.ITEMS);SEM.itens=d.SEM;ETQ.length=0;ETQ.push(...d.ETQ);RECADO.linhas=d.RECADO||RECADO.linhas;
 for(const s of d.M){const m=M.find(x=>x.id===s.id);m.pos=s.pos;m.rot=s.rot;m.etq=s.etq;m.partes=s.partes;}}
if(!LIVE)restore();
export function resetDemo(){clearTimeout(saveT);try{localStorage.removeItem(STORE);}catch(e){}location.reload();}
export const LOG=[];export const log=(t,ref)=>{LOG.unshift({h:new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}),t,ref});HOOK.resumo.push({t:String(t).replace(/<[^>]*>/g,''),ref});save();};
export const COMPRADOS=[];
export const BUY=[];

/* --------- consultas --------- */
export const IT=e=>ITEMS[e.ref];
export function* walk(){for(const m of M)for(const p of m.partes){for(const e of p.itens)yield {m,p,o:null,e};for(const o of p.orgs)for(const e of o.itens)yield {m,p,o,e};}}
export const allLoc=()=>[...walk(),...SEM.itens.map(e=>({m:null,p:null,o:null,e,sem:true}))];
export const locE=id=>allLoc().find(x=>x.e.id===id);
export const findOrg=id=>{for(const m of M)for(const p of m.partes)for(const o of p.orgs)if(o.id===id)return {m,p,o};};
export const unitsOf=e=>{const it=IT(e);return it.modo==='unidades'?e.units.length:it.modo==='contavel'?e.qtd:1;};
export const countable=e=>{const it=IT(e);return it.modo!=='contavel'||e.qtd>0;};
export function alertsOf(e){const it=IT(e),a=[];
 if(e.nf)a.push(['red','Não encontrado']);
 if(it.modo==='contavel'){if(e.qtd===0)a.push(['mute','Esgotado']);else if(e.qtd<=it.min)a.push(['','Acabando']);}
 if(e.aberto)a.push(['',`Aberto há ${Math.round((NOW-e.aberto)/DAY)} dias`]);
 if(it.modo==='conjunto'){const au=(e.tipos||[]).filter(t=>t.aus);if(au.length)a.push(['red','Faltando: '+au.map(t=>t.n).join(', ')]);if(e.nivel===0)a.push(['red','Vazio']);}
 if(it.modo==='unidades'){const q=e.units.filter(u=>u.estado==='quebrada').length;if(q)a.push(['red',`${q} quebrada${q>1?'s':''}`]);
  e.units.filter(u=>u.emp).forEach(u=>{const d=Math.round((NOW-u.emp.desde)/DAY);a.push([d>30?'red':'mute',`#${u.n} com ${u.emp.para}${d>30?` há ${d} dias`:''}`]);});}
 return a;}
export const isAlert=e=>alertsOf(e).some(([k])=>k==='red'||k==='');
export function entriesOf(n){if(n.partes)return n.partes.flatMap(p=>entriesOf(p));if(n.orgs)return [...n.itens,...n.orgs.flatMap(o=>o.itens)];return n.itens;}
export const orgsOf=n=>n.partes?n.partes.flatMap(p=>p.orgs):n.orgs||[];
export function stats(n){const es=entriesOf(n);const cls={};let u=0;for(const e of es){if(!countable(e))continue;const k=unitsOf(e);u+=k;const c=IT(e).cl;cls[c]=(cls[c]||0)+k;}
 return {u,org:orgsOf(n).length,al:es.filter(isAlert).length,cls};}
export const norm=s=>(s||'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase();
export const sugCl=s=>{const n=norm(s);for(const [re,c] of SUG)if(re.test(n))return c;return null;};
export const etqOf=id=>ETQ.find(e=>e.id===id);
export const usedEtq=()=>{const u=new Set();for(const m of M){m.etq&&u.add(m.etq);for(const p of m.partes){p.etq&&u.add(p.etq);p.orgs.forEach(o=>o.etq&&u.add(o.etq));}}return u;};
export const byLab=id=>LABS.find(l=>l.id===id);
export function partName(m,p){if(p.etqNome&&p.etq)return etqOf(p.etq).t;if(p.nomeP)return p.nomeP;const t=m.tipo;
 if(p.id==='A')return {gaveteiro:'Em cima do gaveteiro',armario:'Em cima do armário',estante:'Em cima da estante'}[t]||'Em cima';
 if(p.id==='T')return t==='serra'||t==='bancada'?'Em cima da bancada':'Em cima da mesa';
 if(p.id==='U')return t==='serra'||t==='bancada'?'Embaixo da bancada':'Embaixo da mesa';
 if(p.id[0]==='G')return 'Gaveta '+p.id.slice(1);
 const sh=m.partes.filter(x=>/^[PN]\d/.test(x.id));const i=sh.indexOf(p);const n=sh.length;
 const names=n===2?['Prateleira de cima','Prateleira de baixo']:n===3?['Prateleira de cima','Prateleira do meio','Prateleira de baixo']:sh.map((_,k)=>'Prateleira '+(k+1));return names[i];}
export const orgName=o=>o.nome||OT[o.tipo].n;
export const pathOf=x=>x.sem?'Sem lugar':`${x.m.nome} › ${partName(x.m,x.p)}${x.o?' › '+orgName(x.o):''}`;
export const touch=e=>{e.t=Date.now();};

