# Ponta a ponta: o site de verdade (build de teste) contra a planilha falsa. Dois aparelhos ao mesmo tempo.
import asyncio, json, urllib.request
from playwright.async_api import async_playwright
A=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--no-sandbox']
SITE='http://localhost:4176/#dbg'; CTL='http://localhost:4175/ctl?'
def ctl(q):
    t=urllib.request.urlopen(CTL+q).read()
    try: return json.loads(t)
    except Exception: return t
def aba(n): v=ctl('aba='+n); h=v[0]; return [dict(zip(h,r)) for r in v[1:] if r and r[0]!='']
falhas=[]
def ok(c,msg):
    print(('  ok  ' if c else '  FALHOU  ')+msg)
    if not c: falhas.append(msg)
async def aparelho(b,email,mob=False):
    s=ctl('sessao='+email)
    if email!='aerorio2024@gmail.com': ctl('aprova='+email)
    c=await b.new_context(viewport={'width':390,'height':780} if mob else {'width':1100,'height':700},has_touch=mob,is_mobile=mob)
    await c.add_init_script("if(!localStorage.getItem('aerorio-inventario-v1'))localStorage.setItem('aerorio-inventario-v1',JSON.stringify({v:1,rev:0,base:null,fila:[],sessao:%s,eu:null,hist:[],meus:[]}))"%json.dumps(s['sessao']))
    pg=await c.new_page(); erros=[]
    pg.on('pageerror',lambda e: (erros.append(str(e)),print('PAGEERR',email,str(e)[:300])))
    pg.on('console',lambda m: erros.append(m.text) if m.type=='error' else None)
    await pg.goto(SITE); await pg.wait_for_function('window.__sync&&window.__sync.ST.base',timeout=60000)
    return c,pg,erros
async def espera(pg,cond,ms=15000):
    if 'fila' in cond: await asyncio.sleep(1.3)
    try: await pg.wait_for_function(cond,timeout=ms)
    except Exception as e:
        print('ESPERA FALHOU',cond,await pg.evaluate("JSON.stringify({fila:__sync.ST.fila,rev:__sync.ST.rev,s:document.querySelector('#acct').dataset.s,pop:document.querySelector('#acctpop').textContent})"))
        raise
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path='/usr/bin/google-chrome',args=A)
        ca,A1,ea=await aparelho(b,'aerorio2024@gmail.com')
        cb,B1,eb=await aparelho(b,'fulano@gmail.com',True)
        ok(await A1.evaluate("__S.role")=='admin','admin entra como admin')
        ok(await B1.evaluate("__S.role")=='mem','membro aprovado entra como membro')
        ok(await A1.evaluate("Object.keys(__sync.ITEMS).length")==0,'nenhum item de demonstração com a planilha ligada')
        ok(await A1.evaluate("__sync.M.find(m=>m.id==='gazul').partes[1].etq!=null"),'etiquetas das gavetas vêm da planilha')
        # A cadastra um item contável e guarda numa gaveta (direto no estado, como a tela faz)
        await A1.evaluate("""()=>{const it={id:'Ixt',nome:'Conector XT60',cl:'eletro',modo:'contavel',un:'pares',min:4,desc:'',spec:{Tipo:'Par'},obs:''};__sync.ITEMS.Ixt=it;
          const p=__sync.M.find(m=>m.id==='gazul').partes.find(p=>p.id==='G3');p.itens.push({id:'Ext',ref:'Ixt',nf:false,t:Date.now(),qtd:10});__sync.log('Cadastrado: Conector XT60','Ixt');}""")
        await espera(A1,"__sync.ST.fila.length===0&&__sync.ST.rev>0")
        it=[r for r in aba('ITENS') if r['id']=='Ixt']; es=[r for r in aba('ESTOQUE') if r['id']=='Ext']
        ok(len(it)==1 and it[0]['classe']=='Eletrônica' and it[0]['modo']=='Contável','item gravado na planilha com classe e modo legíveis')
        ok(len(es)==1 and es[0]['local']=='MAN-012.G3' and es[0]['quantidade']==10,'estoque gravado na gaveta certa')
        mov=aba('MOVIMENTOS'); ok(any(r['resumo']=='Cadastrado: Conector XT60' for r in mov),'resumo da ação no histórico da planilha')
        # B recebe
        await B1.evaluate("__sync.puxa()")
        await espera(B1,"!!__sync.ITEMS.Ixt")
        ok(await B1.evaluate("__sync.M.find(m=>m.id==='gazul').partes.find(p=>p.id==='G3').itens.some(e=>e.id==='Ext'&&e.qtd===10)"),'o outro aparelho recebe e coloca na gaveta')
        # os dois tiram 1 ao mesmo tempo
        js="()=>{const e=__sync.M.find(m=>m.id==='gazul').partes.find(p=>p.id==='G3').itens.find(e=>e.id==='Ext');e.qtd-=1;__sync.log('Conector XT60: −1','Ixt');}"
        await asyncio.gather(A1.evaluate(js),B1.evaluate(js))
        await espera(A1,"__sync.ST.fila.length===0"); await espera(B1,"__sync.ST.fila.length===0")
        q=[r for r in aba('ESTOQUE') if r['id']=='Ext'][0]['quantidade']
        ok(q==8,f'dois −1 simultâneos somam (planilha: {q})')
        await A1.evaluate("__sync.puxa()"); await asyncio.sleep(1.5)
        await B1.evaluate("__sync.puxa()"); await asyncio.sleep(1.5)
        qa=await A1.evaluate("__sync.allLoc().find(x=>x.e.id==='Ext').e.qtd"); qb=await B1.evaluate("__sync.allLoc().find(x=>x.e.id==='Ext').e.qtd")
        ok(qa==8 and qb==8,f'os dois aparelhos convergem ({qa}, {qb})')
        # sem conexão: a mudança fica na fila e vai quando volta
        ctl('fora=1')
        await B1.evaluate("()=>{const e=__sync.allLoc().find(x=>x.e.id==='Ext').e;e.qtd+=5;__sync.log('Conector XT60: +5','Ixt');}")
        await asyncio.sleep(2.5)
        ok(await B1.evaluate("__sync.ST.fila.length")==1,'sem planilha: alteração fica na fila')
        fl=await B1.evaluate("JSON.stringify(JSON.parse(localStorage.getItem('aerorio-inventario-v1')).fila.map(l=>l.ops))")
        ok(len(json.loads(fl))>=1 and '"quantidade":5' in fl.replace(' ',''),'fila guardada no aparelho '+fl[:200])
        ok(await B1.evaluate("document.querySelector('#acct').dataset.s")in('erro','salvando'),'indicador mostra que não salvou')
        # recarregar sem conexão: abre do aparelho, com a mudança
        await B1.reload(wait_until='domcontentloaded',timeout=90000); await B1.wait_for_function('window.__sync&&window.__sync.ST.base',timeout=90000)
        ok(await B1.evaluate("__sync.allLoc().find(x=>x.e.id==='Ext').e.qtd")==13,'recarregado sem planilha: mostra a versão do aparelho com a mudança')
        ctl('fora=0')
        await B1.evaluate("__sync.envia()"); await espera(B1,"__sync.ST.fila.length===0",20000)
        ok([r for r in aba('ESTOQUE') if r['id']=='Ext'][0]['quantidade']==13,'ao voltar, a fila é enviada')
        # membro tenta mover móvel (só admin): servidor recusa e o app volta ao que está na planilha
        await B1.evaluate("()=>{const m=__sync.M.find(m=>m.id==='lixo');m.pos=[m.pos[0]+1,m.pos[1],m.pos[2]];__sync.log('mexeu','x');}")
        await espera(B1,"__sync.ST.fila.length===0",20000); await asyncio.sleep(4)
        x_planilha=[r for r in aba('MOVEIS') if r['modelo']=='lixo'][0]['x']
        x_b=await B1.evaluate("__sync.M.find(m=>m.id==='lixo').pos[0]")
        ok(abs(x_planilha-x_b)<1e-6,'mudança sem permissão é recusada e desfeita no aparelho')
        # admin move móvel; membro vê o móvel no novo lugar
        await A1.evaluate("()=>{const m=__sync.M.find(m=>m.id==='lixo');m.pos=[m.pos[0],m.pos[1],m.pos[2]+0.5];__sync.log('Área do lixo movida');}")
        await espera(A1,"__sync.ST.fila.length===0")
        await B1.evaluate("__sync.puxa()"); await asyncio.sleep(2)
        zb=await B1.evaluate("(()=>{const f=__dbg.byId('lixo');return [f.d.pos[2],f.g.position.z]})()")
        ok(abs(zb[0]-zb[1])<1e-6 and abs(zb[0]-[r for r in aba('MOVEIS') if r['modelo']=='lixo'][0]['z'])<1e-6,'móvel movido pelo admin muda de lugar no 3D do outro aparelho')
        # unidades com identificador e empréstimo
        await A1.evaluate("""()=>{__sync.ITEMS.Ies={id:'Ies',nome:'Estilete',cl:'ferr',modo:'unidades',un:'un.',min:0,desc:'',spec:{},obs:'',ident:{nome:'Cor',tipo:'cor',ops:[{n:'Amarelo',c:'#E0B12E'},{n:'Vermelho',c:'#C8553D'}]}};
          const p=__sync.M.find(m=>m.id==='gazul').partes.find(p=>p.id==='G2');p.itens.push({id:'Ees',ref:'Ies',nf:false,t:Date.now(),units:[{id:'U1',n:1,estado:'boa',emp:null,v:'Amarelo'},{id:'U2',n:2,estado:'desgastada',emp:{para:'Equipe X',tipo:'externa',desde:Date.now()},v:'Vermelho'}]});__sync.log('Cadastrado: Estilete','Ies');}""")
        await espera(A1,"__sync.ST.fila.length===0")
        us={r['id']:r for r in aba('UNIDADES')}
        if 'U2' not in us: print('DEBUG A', await A1.evaluate("JSON.stringify({h:__sync.ST.hist.slice(0,4),it:!!__sync.ITEMS.Ies})"))
        ok(us.get('U2',{}).get('com_quem')=='Equipe X' and us['U2']['tipo_emprestimo']=='Outra equipe' and us['U1']['identificador']=='Amarelo','unidades, identificador e empréstimo gravados legíveis')
        ok([r for r in aba('ITENS') if r['id']=='Ies'][0]['identificador']=='Cor: Amarelo=#E0B12E, Vermelho=#C8553D','identificador do item legível')
        await B1.evaluate("__sync.puxa()"); await asyncio.sleep(2)
        ok(await B1.evaluate("(()=>{const e=__sync.allLoc().find(x=>x.e.id==='Ees').e;return e.units.length===2&&e.units[1].emp.para==='Equipe X'&&__sync.ITEMS.Ies.ident.ops[1].c==='#C8553D'})()"),'o outro aparelho recebe unidades e identificador')
        # baixa de unidade
        await B1.evaluate("()=>{const e=__sync.allLoc().find(x=>x.e.id==='Ees').e;e.units=e.units.filter(u=>u.id!=='U1');__sync.log('Estilete: baixa da unidade 1','Ies');}")
        await espera(B1,"__sync.ST.fila.length===0")
        ok({r['id']:r for r in aba('UNIDADES')}['U1']['situacao']=='Baixada','baixa vira situação Baixada, sem apagar linha')
        # edição manual na planilha: os apps recarregam tudo
        # (simulado pelo gatilho onEdit do próprio Codigo.gs)
        # sem erros de script
        ok(not [e for e in ea+eb if 'Failed to load resource' not in e],'sem erros de script nos dois aparelhos: '+'; '.join((ea+eb)[:3]))
        print(f'\n{len(falhas)} falha(s)')
        await b.close()
asyncio.run(main())
