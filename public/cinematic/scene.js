import * as THREE from 'three';
import { GLTFLoader } from './vendor/GLTFLoader.js';

export async function createScene(canvas, wordmark) {
  const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
  let reducedMotion = motionPreference.matches, mobile = innerWidth <= 650;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'low-power' });
  renderer.setClearColor(0x060609);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.22;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, innerWidth / innerHeight, .1, 60);
  camera.position.set(0, 0, 6);
  const uniforms = {
    time: { value: 0 }, resolution: { value: new THREE.Vector2() },
    progress: { value: 0 }, pointer: { value: new THREE.Vector2() }, quiet: { value: 0 },
  };
  const backdrop = new THREE.Mesh(new THREE.PlaneGeometry(50, 35), new THREE.ShaderMaterial({
    uniforms, depthWrite: false,
    vertexShader: 'void main(){gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
    fragmentShader: `
      uniform float time; uniform vec2 resolution; uniform float progress;
      uniform vec2 pointer; uniform float quiet;
      float grid(vec2 p, float width) {
        vec2 line=abs(fract(p-.5)-.5)/max(fwidth(p),vec2(.0001));
        return 1.-min(min(line.x,line.y)/width,1.);
      }
      void main(){
        vec2 uv=gl_FragCoord.xy/resolution;
        vec2 p=uv-.5;p.x*=resolution.x/resolution.y;p+=pointer*.012;
        vec2 curved=vec2(atan(p.x*1.05)*1.22,p.y/sqrt(1.+p.x*p.x*.82));
        curved.y+=progress*.014;
        float fine=grid(curved*48.,.5),medium=grid(curved*12.,.7),major=grid(curved*3.,.8);
        vec2 v=(p-vec2(-.24,.02))*vec2(1.8,2.5),b=(p-vec2(.28,-.2))*vec2(2.4,2.8);
        float violet=exp(-dot(v,v)),blue=exp(-dot(b,b));
        float breath=.93+.07*sin(time*.16);
        vec3 color=vec3(.014,.015,.021);
        color+=(vec3(.025,.013,.09)*violet+vec3(.003,.028,.043)*blue)*breath*(1.-quiet*.45);
        float falloff=1.-smoothstep(.28,1.45,length(p));
        color+=vec3(.17,.18,.2)*(fine*.105+medium*.12)*falloff;
        color*=1.-major*.55;
        vec2 cell=abs(fract(curved*3.+.5)-.5);
        float cross=(1.-smoothstep(.003,.006,min(cell.x,cell.y)))*(1.-smoothstep(.012,.022,max(cell.x,cell.y)));
        color+=vec3(.2,.22,.25)*cross*.55*falloff;
        color*=1.-smoothstep(.36,1.5,length(p))*.66;
        gl_FragColor=vec4(color,1.);
      }`,
  }));
  backdrop.position.z = -10; scene.add(backdrop);
  const [environment, gltf] = await Promise.all([
    new THREE.CubeTextureLoader().loadAsync(['px','nx','py','ny','pz','nz'].map(side => 'assets/env-'+side+'.png')),
    new GLTFLoader().loadAsync('assets/scene.glb'),
  ]);
  environment.colorSpace = THREE.SRGBColorSpace; scene.environment = environment;
  scene.add(new THREE.AmbientLight(0xf1f4ff, .8));
  const key = new THREE.DirectionalLight(0xffffff, 4.2); key.position.set(-3, 5, 4); scene.add(key);
  const fill = new THREE.DirectionalLight(0xf2f7ff, 2.2); fill.position.set(3, -2, 4); scene.add(fill);
  const violet = new THREE.PointLight(0x7861ff, 8, 15, 2); violet.position.set(-2.5, -.5, 1.5); scene.add(violet);
  const rim = new THREE.PointLight(0x94deff, 12, 15, 2); rim.position.set(2, 2, 1); scene.add(rim);
  const glass = new THREE.MeshPhysicalMaterial({
    color: 0xffffff, metalness: .025, roughness: .035, transmission: 1, thickness: .14,
    ior: 1.46, dispersion: .1, iridescence: .22, iridescenceIOR: 1.3,
    iridescenceThicknessRange: [140, 360], clearcoat: 1, clearcoatRoughness: .04,
    envMapIntensity: 2.15, side: THREE.FrontSide,
  });
  glass.onBeforeCompile = shader => {
    shader.fragmentShader = shader.fragmentShader.replace('#include <normal_fragment_maps>', `
      #include <normal_fragment_maps>
      float ripple=sin(vViewPosition.y*32.+sin(vViewPosition.x*19.)*.8);
      normal=normalize(normal+vec3(ripple*.004,sin(vViewPosition.x*46.)*.003,0.));
    `);
  };
  const geometry = gltf.scene.getObjectByName('Alche_A').geometry.clone();
  geometry.center(); geometry.computeBoundingBox();
  const logoSize = geometry.boundingBox.getSize(new THREE.Vector3());
  const logo = new THREE.Mesh(geometry, glass); scene.add(logo);
  const wire = new THREE.MeshBasicMaterial({ color: 0xdce8ff, wireframe: true, transparent: true, opacity: .48 });
  const particles = new THREE.Points(geometry, new THREE.PointsMaterial({ color: 0xe1edff, size: .006, sizeAttenuation: true, transparent: true, opacity: .82 }));
  particles.visible = false; scene.add(particles);
  const infinityMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xb9c1e8, roughness: .18, metalness: .78, clearcoat: 1,
    envMapIntensity: .7, transparent: true, opacity: .25, depthWrite: false,
  });
  const infinity = new THREE.Mesh(new THREE.TorusKnotGeometry(1, .032, 128, 8, 2, 3), infinityMaterial);
  infinity.visible = false; scene.add(infinity);
  const dustGeometry = new THREE.BufferGeometry();
  const positions = new Float32Array(72*3);
  for (let i=0; i<72; i++) {
    positions[i*3] = Math.sin(i*127.1)*8;
    positions[i*3+1] = Math.sin(i*311.7)*4.5;
    positions[i*3+2] = -4+(Math.sin(i*73.3)+1)*3;
  }
  dustGeometry.setAttribute('position', new THREE.BufferAttribute(positions,3));
  const dust = new THREE.Points(dustGeometry, new THREE.ShaderMaterial({
    uniforms: { time: uniforms.time, strength: { value: .5 } },
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: `uniform float time;varying float brightness;
      void main(){vec3 p=position;p.y+=sin(time*.07+position.x)*.12;
      vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;
      gl_PointSize=clamp(10./-mv.z,1.,2.4);brightness=.25+.35*(.5+.5*sin(position.x*8.+time*.15));}`,
    fragmentShader: `uniform float strength;varying float brightness;
      void main(){float a=1.-smoothstep(.08,.5,length(gl_PointCoord-.5));gl_FragColor=vec4(.63,.74,1.,a*brightness*strength);}`,
  }));
  scene.add(dust);
  const typeCanvas = document.createElement('canvas');
  typeCanvas.width = 2048; typeCanvas.height = 650;
  const context = typeCanvas.getContext('2d');
  context.fillStyle = '#f7f7fb'; context.textAlign = 'center'; context.textBaseline = 'middle';
  context.font = '600 540px Arial';
  context.translate(1024,340); context.scale(1900/Math.max(1,context.measureText(wordmark).width),1);
  context.fillText(wordmark,0,0);
  const typeTexture = new THREE.CanvasTexture(typeCanvas); typeTexture.colorSpace = THREE.SRGBColorSpace;
  // Keep type opaque and alpha-tested so it exists in the glass transmission buffer.
  const titleMaterial = new THREE.MeshBasicMaterial({ map: typeTexture, alphaTest: .1, depthWrite: false });
  const title = new THREE.Mesh(new THREE.PlaneGeometry(1,1),titleMaterial);
  title.position.z = -1.5; scene.add(title);

  const pointer = new THREE.Vector2();
  let previousTime=0, elapsed=0, viewMode='home', dirty=true, contextLost=false;
  let motion = { material: 'glass', speed: 1, paused: reducedMotion };
  let heroHeight=innerHeight, aboutTop=Infinity, visionBottom=Infinity, scrollPosition=scrollY;
  let heroScale=8, heroY=.1, titleWidth=10, titleY=0, frameInterval=16;
  function measure() {
    heroHeight = document.querySelector('#top')?.offsetHeight || innerHeight;
    aboutTop = document.querySelector('#about')?.offsetTop ?? Infinity;
    const vision = document.querySelector('#vision');
    visionBottom = vision ? vision.offsetTop+vision.offsetHeight : Infinity;
    dirty = true;
  }
  function resize() {
    mobile = innerWidth<=650;
    const lowBudget = mobile || (navigator.hardwareConcurrency || 8)<=4;
    // ponytail: one capped transmission pass avoids a postprocessing stack; profile before adding effects.
    renderer.setPixelRatio(Math.min(devicePixelRatio,lowBudget?1.35:1.6,Math.sqrt(1900000/(innerWidth*innerHeight))));
    renderer.transmissionResolutionScale = lowBudget?.7:.9;
    renderer.setSize(innerWidth,innerHeight,false);
    camera.aspect = innerWidth/innerHeight; camera.updateProjectionMatrix();
    uniforms.resolution.value.set(canvas.width,canvas.height);
    const worldHeight = 2*Math.tan(THREE.MathUtils.degToRad(20))*6;
    const safeTop = mobile?172:innerHeight*.13;
    const safeBottom = mobile?Math.max(safeTop+170,innerHeight-235):innerHeight*.9;
    const availableHeight = Math.min(innerHeight*.78,safeBottom-safeTop);
    heroScale = Math.min(worldHeight*availableHeight/innerHeight/logoSize.y,worldHeight*camera.aspect*(mobile?.8:.64)/logoSize.x);
    heroY = (.5-(safeTop+safeBottom)/(innerHeight*2))*worldHeight;
    titleY = heroY*1.25;
    titleWidth = worldHeight*1.25*camera.aspect*(mobile?.99:.96);
    title.scale.set(titleWidth,titleWidth*650/2048,1);
    frameInterval = lowBudget?32:15;
    dustGeometry.setDrawRange(0,mobile?28:72);
    measure();
  }
  addEventListener('resize',resize);
  addEventListener('scroll',()=>{dirty=true;},{passive:true});
  addEventListener('pointermove',event=>{
    if(event.pointerType==='touch'||reducedMotion)return;
    pointer.set(event.clientX/innerWidth*2-1,1-event.clientY/innerHeight*2);dirty=true;
  },{passive:true});
  addEventListener('blur',()=>{pointer.set(0,0);dirty=true;});
  document.addEventListener('visibilitychange',()=>{previousTime=0;dirty=true;});
  motionPreference.addEventListener('change',event=>{
    reducedMotion=event.matches;
    if(reducedMotion){motion.paused=true;pointer.set(0,0);uniforms.pointer.value.set(0,0);}
    dirty=true;
  });
  const home=document.querySelector('#home-page');
  if(home)new ResizeObserver(measure).observe(home);
  resize();
  function render(time) {
    if(document.hidden||contextLost||time-previousTime<(viewMode==='home'||viewMode==='motion'?frameInterval:50))return;
    const isMotion=viewMode==='motion',isHome=viewMode==='home';
    const animating=isMotion?!motion.paused:!reducedMotion;
    if(!animating&&!dirty)return;
    const delta=Math.min(previousTime?(time-previousTime)*.001:.016,.05);
    previousTime=time;dirty=false;
    if(animating)elapsed+=delta*(isMotion?motion.speed:1);
    const ease=1-Math.exp(-delta*4);
    if(!isMotion||!motion.paused)uniforms.pointer.value.lerp(pointer,reducedMotion?1:ease);
    scrollPosition=reducedMotion?scrollY:THREE.MathUtils.lerp(scrollPosition,scrollY,1-Math.exp(-delta*9));
    const scroll=isHome?scrollPosition/heroHeight:0;
    const departure=THREE.MathUtils.smoothstep(scroll,.06,1.3);
    const heroFade=1-THREE.MathUtils.smoothstep(scroll,.02,.75);
    const p=uniforms.pointer.value,t=elapsed*.28;
    uniforms.time.value=elapsed;uniforms.progress.value=scrollPosition/innerHeight;
    uniforms.quiet.value=isHome||isMotion?0:1;
    camera.position.x=reducedMotion?0:p.x*.055;camera.position.y=reducedMotion?0:p.y*.035;
    camera.position.z=6+(isHome?departure*.25:0);
    title.visible=isHome&&heroFade>.008;titleMaterial.color.setScalar(heroFade);
    title.position.set(0,titleY+departure*.7,-1.5-departure*2);
    const motionScale=mobile?heroScale*.95:Math.min(heroScale*.76,7.1);
    logo.scale.setScalar(isMotion?motionScale:heroScale*(1-departure*.24));
    logo.position.set(isMotion?(mobile?0:1.1):-departure*.9,isMotion?(mobile?-.05:.1):heroY+departure*.55,-departure*2.7);
    logo.rotation.set((reducedMotion?0:p.y*.12+Math.sin(t*.8)*.035),isMotion?t*.65+p.x*.22:p.x*.22+Math.sin(t)*.11+departure*.7,-.035+departure*.18);
    logo.visible=isHome?scroll<1.65:isMotion&&motion.material!=='points';
    logo.material=isMotion&&motion.material==='wire'?wire:glass;
    particles.visible=isMotion&&motion.material==='points';
    if(particles.visible){particles.position.copy(logo.position);particles.rotation.copy(logo.rotation);particles.scale.copy(logo.scale);}
    const aboutProgress=(scrollPosition-aboutTop)/innerHeight;
    const emerge=THREE.MathUtils.smoothstep(aboutProgress,-.9,.05);
    const leave=1-THREE.MathUtils.smoothstep(scrollPosition,visionBottom-innerHeight*.3,visionBottom);
    infinity.visible=isHome&&emerge*leave>.005;
    if(infinity.visible){
      infinityMaterial.opacity=emerge*leave*.24;infinity.scale.setScalar(mobile?1.25:2.25);
      infinity.position.set(Math.sin(aboutProgress*.4)*.3,-.08,-3.3);
      infinity.rotation.set(.4+Math.sin(t*.6)*.1,t*.25,.15+aboutProgress*.2);
    }
    dust.rotation.y=p.x*.02;dust.rotation.x=p.y*.015;
    dust.material.uniforms.strength.value=isHome||isMotion?.42:.12;
    violet.intensity=8+Math.sin(t*.65)*1.5;
    renderer.render(scene,camera);
  }
  renderer.setAnimationLoop(render);
  document.body.classList.add('scene-ready');
  canvas.addEventListener('webglcontextlost',event=>{
    event.preventDefault();contextLost=true;canvas.hidden=true;document.body.classList.remove('scene-ready');
    const fallback=document.querySelector('.motion-fallback');if(fallback)fallback.hidden=false;
  });
  canvas.addEventListener('webglcontextrestored',()=>{
    contextLost=false;dirty=true;canvas.hidden=false;document.body.classList.add('scene-ready');
    const fallback=document.querySelector('.motion-fallback');if(fallback)fallback.hidden=true;
  });
  return {
    setView(mode){viewMode=mode;scrollPosition=scrollY;pointer.set(0,0);uniforms.pointer.value.set(0,0);measure();},
    setMotion(settings){motion={...motion,...settings};dirty=true;if(settings.reset){elapsed=0;pointer.set(0,0);uniforms.pointer.value.set(0,0);}},
  };
}
