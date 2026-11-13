import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { GTAOPass } from 'three/addons/postprocessing/GTAOPass.js';
import { OutlinePass } from 'three/addons/postprocessing/OutlinePass.js';
import { BokehPass } from 'three/addons/postprocessing/BokehPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { FullScreenQuad } from 'three/addons/postprocessing/Pass.js';
import { F, FADE, LITE, S, app } from './state.js';
import { BGS, camera, labG, renderer, scene } from './scene.js';

/* ================= pós-processamento ================= */
export const FSVS='varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}';
export let post=null;
export function setupPost(){const w=app.clientWidth,h=app.clientHeight;const c=new EffectComposer(renderer);c.addPass(new RenderPass(scene,camera));
 const gtao=new GTAOPass(scene,camera,w,h);gtao.updateGtaoMaterial({radius:.5,distanceExponent:1.2,thickness:1.2,scale:1,samples:16,screenSpaceRadius:false});gtao.updatePdMaterial({lumaPhi:10,depthPhi:2,normalPhi:3,radius:6,rings:2,samples:16});/* mais amostras e denoise: some o listrado nas faces finas (fundo das bancadas) */gtao.blendIntensity=.8;c.addPass(gtao);
 const outline=new OutlinePass(new THREE.Vector2(w,h),scene,camera);Object.assign(outline,{edgeStrength:3.2,edgeGlow:.6,edgeThickness:1.6,pulsePeriod:0});outline.visibleEdgeColor.set('#2f8cff');outline.hiddenEdgeColor.set('#1f5fae');c.addPass(outline);
 const bokeh=new BokehPass(scene,camera,{focus:10,aperture:0,maxblur:.012});bokeh.enabled=false;c.addPass(bokeh);
 const bloom=new UnrealBloomPass(new THREE.Vector2(w,h),.42,.3,.9);c.addPass(bloom);c.addPass(new OutputPass());
 /* passes que renderam a cena com overrideMaterial desenhariam o plano do fundo (CanvasTexture) e os sprites como quadrados pretos no G-buffer: ambos desligados durante esses passes */
 for(const ps of [gtao,outline,bokeh]){const r0=ps.render.bind(ps);ps.render=(...a)=>{const bg=scene.background;scene.background=null;const hid=[];scene.traverse(o=>{if((o.isSprite||o.userData.noOverride)&&o.visible){o.visible=false;hid.push(o);}});try{r0(...a);}finally{scene.background=bg;hid.forEach(o=>o.visible=true);}};}
 post={c,gtao,outline,bokeh,bloom};}
if(!LITE)setupPost();
/* lab não selecionado no modo completo: desenhado sozinho em meia resolução, desfocado e usado como fundo do quadro principal. Nunca cobre o lab ativo. */
export const GH={amt:0,lab:null,other:null,rt:null,a:null,b:null,c:null,q:new FullScreenQuad(null),
 blur:new THREE.ShaderMaterial({uniforms:{t:{value:null},dir:{value:new THREE.Vector2()}},vertexShader:FSVS,fragmentShader:'uniform sampler2D t;uniform vec2 dir;varying vec2 vUv;void main(){float w0=.227,w1=.195,w2=.122,w3=.054,w4=.016;vec4 c=texture2D(t,vUv)*w0;c+=(texture2D(t,vUv+dir)+texture2D(t,vUv-dir))*w1;c+=(texture2D(t,vUv+2.*dir)+texture2D(t,vUv-2.*dir))*w2;c+=(texture2D(t,vUv+3.*dir)+texture2D(t,vUv-3.*dir))*w3;c+=(texture2D(t,vUv+4.*dir)+texture2D(t,vUv-4.*dir))*w4;gl_FragColor=c;}'}),
 fin:new THREE.ShaderMaterial({uniforms:{t:{value:null},wash:{value:new THREE.Color()},k:{value:0},d:{value:0}},vertexShader:FSVS,fragmentShader:'uniform sampler2D t;uniform vec3 wash;uniform float k,d;varying vec2 vUv;void main(){vec3 c=texture2D(t,vUv).rgb;float l=dot(c,vec3(.3,.59,.11));c=mix(c,vec3(l),d);gl_FragColor=vec4(mix(c,wash,k),1.);}'})};
export function ghostSize(){const v=renderer.getDrawingBufferSize(new THREE.Vector2());const w=Math.max(2,v.x>>1),h=Math.max(2,v.y>>1);
 if(!GH.rt){GH.rt=new THREE.WebGLRenderTarget(w,h,{type:THREE.HalfFloatType});for(const k of['a','b','c'])GH[k]=new THREE.WebGLRenderTarget(w,h,{type:THREE.HalfFloatType,depthBuffer:false});}
 else for(const k of['rt','a','b','c'])GH[k].setSize(w,h);}
export function ghostPre(dt){if(FADE!==3)return null;
 if(S.lab!==GH.lab){GH.lab=S.lab;if(S.lab){GH.other=S.lab==='man'?'ele':'man';GH.amt=0;}}
 GH.amt+=((S.lab?1:0)-GH.amt)*Math.min(1,dt*.005);if(GH.amt<.02||!GH.other)return null;
 const keep=new Set([labG[GH.other],...F.filter(f=>f.d.lab===GH.other).map(f=>f.g)]);const hid=[];
 for(const c of scene.children){if(c.isLight||keep.has(c)||!c.visible)continue;c.visible=false;hid.push(c);}
 const st=S.edit?'e':S.style,au=renderer.shadowMap.autoUpdate,bg=scene.background;renderer.shadowMap.autoUpdate=false;scene.background=BGS[st];
 renderer.setRenderTarget(GH.rt);renderer.render(scene,camera);hid.forEach(c=>c.visible=true);renderer.shadowMap.autoUpdate=au;
 const px=1/GH.rt.width,py=1/GH.rt.height,r=GH.amt,bu=GH.blur.uniforms;GH.q.material=GH.blur;
 for(const [src,dst,dx,dy] of[[GH.rt,GH.a,.8*px,0],[GH.a,GH.b,0,.8*py],[GH.b,GH.a,1.7*px,0],[GH.a,GH.b,0,1.7*py]]){bu.t.value=src.texture;bu.dir.value.set(dx*r,dy*r);renderer.setRenderTarget(dst);GH.q.render(renderer);}
 const fu=GH.fin.uniforms;fu.t.value=GH.b.texture;fu.wash.value.set(st==='a'?'#141a21':st==='c'?'#f3e3c0':'#eef2f6');fu.k.value=(st==='a'?.18:.2)*r;fu.d.value=.45*r;GH.q.material=GH.fin;renderer.setRenderTarget(GH.c);GH.q.render(renderer);renderer.setRenderTarget(null);
 const hid2=[];for(const c of keep)if(c.visible){c.visible=false;hid2.push(c);}scene.background=GH.c.texture;return {hid:hid2,bg};}
export function ghostPost(g){if(!g)return;g.hid.forEach(c=>c.visible=true);scene.background=g.bg;}
export function resize(){const w=app.clientWidth,h=app.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();if(post)post.c.setSize(w,h);ghostSize();}
new ResizeObserver(resize).observe(app);resize();

