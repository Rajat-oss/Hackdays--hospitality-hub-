import { useEffect, useRef } from 'react'

interface Props {
  DENSITY_DISSIPATION?: number
  VELOCITY_DISSIPATION?: number
  PRESSURE?: number
  PRESSURE_ITERATIONS?: number
  CURL?: number
  SPLAT_RADIUS?: number
  SPLAT_FORCE?: number
  SHADING?: boolean
  COLOR_UPDATE_SPEED?: number
}

export default function SplashCursor({
  DENSITY_DISSIPATION = 3.5,
  VELOCITY_DISSIPATION = 2,
  PRESSURE = 0.1,
  PRESSURE_ITERATIONS = 20,
  CURL = 3,
  SPLAT_RADIUS = 0.2,
  SPLAT_FORCE = 6000,
  SHADING = true,
  COLOR_UPDATE_SPEED = 10,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    let active = true

    const cfg = {
      SIM_RESOLUTION: 128, DYE_RESOLUTION: 1024,
      DENSITY_DISSIPATION, VELOCITY_DISSIPATION, PRESSURE, PRESSURE_ITERATIONS,
      CURL, SPLAT_RADIUS, SPLAT_FORCE, SHADING, COLOR_UPDATE_SPEED,
      BACK_COLOR: { r: 0, g: 0, b: 0 }, TRANSPARENT: true,
    }

    function Ptr(this: any) {
      this.id=-1; this.texcoordX=0; this.texcoordY=0; this.prevTexcoordX=0; this.prevTexcoordY=0;
      this.deltaX=0; this.deltaY=0; this.down=false; this.moved=false; this.color=[0,0,0];
    }
    const pointers: any[] = [new (Ptr as any)()]

    const { gl, ext } = getCtx(canvas)
    if (!ext.supportLinearFiltering) { cfg.DYE_RESOLUTION = 256; cfg.SHADING = false; }

    function getCtx(c: HTMLCanvasElement) {
      const p = { alpha: true, depth: false, stencil: false, antialias: false, preserveDrawingBuffer: false }
      let g: any = c.getContext('webgl2', p)
      const isGL2 = !!g
      if (!isGL2) g = c.getContext('webgl', p)
      let hf: any, slF: any
      if (isGL2) { g.getExtension('EXT_color_buffer_float'); slF = g.getExtension('OES_texture_float_linear') }
      else { hf = g.getExtension('OES_texture_half_float'); slF = g.getExtension('OES_texture_half_float_linear') }
      g.clearColor(0,0,0,1)
      const hft = isGL2 ? g.HALF_FLOAT : hf?.HALF_FLOAT_OES
      const sf = (iF: any, f: any, t: any): any => {
        if (!supFmt(g, iF, f, t)) {
          if (iF === g.R16F) return sf(g.RG16F, g.RG, t)
          if (iF === g.RG16F) return sf(g.RGBA16F, g.RGBA, t)
          return null
        }
        return { internalFormat: iF, format: f }
      }
      let fmtRGBA: any, fmtRG: any, fmtR: any
      if (isGL2) {
        fmtRGBA = sf(g.RGBA16F, g.RGBA, hft); fmtRG = sf(g.RG16F, g.RG, hft); fmtR = sf(g.R16F, g.RED, hft)
      } else {
        fmtRGBA = sf(g.RGBA, g.RGBA, hft); fmtRG = sf(g.RGBA, g.RGBA, hft); fmtR = sf(g.RGBA, g.RGBA, hft)
      }
      return { gl: g, ext: { fmtRGBA, fmtRG, fmtR, hft, supportLinearFiltering: slF } }
    }

    function supFmt(g: any, iF: any, f: any, t: any) {
      const tex = g.createTexture(); g.bindTexture(g.TEXTURE_2D, tex)
      g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MIN_FILTER, g.NEAREST)
      g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MAG_FILTER, g.NEAREST)
      g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_S, g.CLAMP_TO_EDGE)
      g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_T, g.CLAMP_TO_EDGE)
      g.texImage2D(g.TEXTURE_2D, 0, iF, 4, 4, 0, f, t, null)
      const fb = g.createFramebuffer(); g.bindFramebuffer(g.FRAMEBUFFER, fb)
      g.framebufferTexture2D(g.FRAMEBUFFER, g.COLOR_ATTACHMENT0, g.TEXTURE_2D, tex, 0)
      return g.checkFramebufferStatus(g.FRAMEBUFFER) === g.FRAMEBUFFER_COMPLETE
    }

    function cShader(type: number, src: string, kw?: string[]) {
      if (kw) src = kw.map(k => `#define ${k}\n`).join('') + src
      const s = gl.createShader(type)!; gl.shaderSource(s, src); gl.compileShader(s)
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) console.error(gl.getShaderInfoLog(s))
      return s
    }

    function cProg(vs: any, fs: any) {
      const p = gl.createProgram()!; gl.attachShader(p, vs); gl.attachShader(p, fs); gl.linkProgram(p)
      return p
    }

    function getUni(p: any) {
      const u: any = {}; const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS)
      for (let i=0;i<n;i++) { const nm = gl.getActiveUniform(p,i)!.name; u[nm]=gl.getUniformLocation(p,nm) }
      return u
    }

    const BASE_V = `precision highp float;attribute vec2 aPosition;varying vec2 vUv,vL,vR,vT,vB;uniform vec2 texelSize;void main(){vUv=aPosition*.5+.5;vL=vUv-vec2(texelSize.x,0);vR=vUv+vec2(texelSize.x,0);vT=vUv+vec2(0,texelSize.y);vB=vUv-vec2(0,texelSize.y);gl_Position=vec4(aPosition,0,1);}`
    const COPY_F = `precision mediump float;precision mediump sampler2D;varying highp vec2 vUv;uniform sampler2D uTexture;void main(){gl_FragColor=texture2D(uTexture,vUv);}`
    const CLEAR_F = `precision mediump float;precision mediump sampler2D;varying highp vec2 vUv;uniform sampler2D uTexture;uniform float value;void main(){gl_FragColor=value*texture2D(uTexture,vUv);}`
    const DISPLAY_F = `precision highp float;precision highp sampler2D;varying vec2 vUv,vL,vR,vT,vB;uniform sampler2D uTexture;uniform vec2 texelSize;void main(){vec3 c=texture2D(uTexture,vUv).rgb;#ifdef SHADING\nvec3 lc=texture2D(uTexture,vL).rgb,rc=texture2D(uTexture,vR).rgb,tc=texture2D(uTexture,vT).rgb,bc=texture2D(uTexture,vB).rgb;float dx=length(rc)-length(lc),dy=length(tc)-length(bc);vec3 n=normalize(vec3(dx,dy,length(texelSize)));float diffuse=clamp(dot(n,vec3(0,0,1))+.7,.7,1.);c*=diffuse;#endif\nfloat a=max(c.r,max(c.g,c.b));gl_FragColor=vec4(c,a);}`
    const SPLAT_F = `precision highp float;precision highp sampler2D;varying vec2 vUv;uniform sampler2D uTarget;uniform float aspectRatio;uniform vec3 color;uniform vec2 point;uniform float radius;void main(){vec2 p=vUv-point;p.x*=aspectRatio;vec3 sp=exp(-dot(p,p)/radius)*color;gl_FragColor=vec4(texture2D(uTarget,vUv).xyz+sp,1);}`
    const ADV_F = `precision highp float;precision highp sampler2D;varying vec2 vUv;uniform sampler2D uVelocity,uSource;uniform vec2 texelSize,dyeTexelSize;uniform float dt,dissipation;vec4 bilerp(sampler2D s,vec2 uv,vec2 ts){vec2 st=uv/ts-.5,iuv=floor(st),fuv=fract(st);return mix(mix(texture2D(s,(iuv+vec2(.5,.5))*ts),texture2D(s,(iuv+vec2(1.5,.5))*ts),fuv.x),mix(texture2D(s,(iuv+vec2(.5,1.5))*ts),texture2D(s,(iuv+vec2(1.5,1.5))*ts),fuv.x),fuv.y);}void main(){#ifdef MANUAL_FILTERING\nvec2 coord=vUv-dt*bilerp(uVelocity,vUv,texelSize).xy*texelSize;vec4 r=bilerp(uSource,coord,dyeTexelSize);#else\nvec2 coord=vUv-dt*texture2D(uVelocity,vUv).xy*texelSize;vec4 r=texture2D(uSource,coord);#endif\ngl_FragColor=r/(1.+dissipation*dt);}`
    const DIV_F = `precision mediump float;precision mediump sampler2D;varying highp vec2 vUv,vL,vR,vT,vB;uniform sampler2D uVelocity;void main(){float L=texture2D(uVelocity,vL).x,R=texture2D(uVelocity,vR).x,T=texture2D(uVelocity,vT).y,B=texture2D(uVelocity,vB).y;vec2 C=texture2D(uVelocity,vUv).xy;if(vL.x<0.)L=-C.x;if(vR.x>1.)R=-C.x;if(vT.y>1.)T=-C.y;if(vB.y<0.)B=-C.y;gl_FragColor=vec4(.5*(R-L+T-B),0,0,1);}`
    const CURL_F = `precision mediump float;precision mediump sampler2D;varying highp vec2 vUv,vL,vR,vT,vB;uniform sampler2D uVelocity;void main(){gl_FragColor=vec4(.5*(texture2D(uVelocity,vR).y-texture2D(uVelocity,vL).y-texture2D(uVelocity,vT).x+texture2D(uVelocity,vB).x),0,0,1);}`
    const VORT_F = `precision highp float;precision highp sampler2D;varying vec2 vUv,vL,vR,vT,vB;uniform sampler2D uVelocity,uCurl;uniform float curl,dt;void main(){float L=texture2D(uCurl,vL).x,R=texture2D(uCurl,vR).x,T=texture2D(uCurl,vT).x,B=texture2D(uCurl,vB).x,C=texture2D(uCurl,vUv).x;vec2 f=.5*vec2(abs(T)-abs(B),abs(R)-abs(L));f/=length(f)+.0001;f*=curl*C;f.y*=-1.;vec2 v=texture2D(uVelocity,vUv).xy+f*dt;v=min(max(v,-1000.),1000.);gl_FragColor=vec4(v,0,1);}`
    const PRES_F = `precision mediump float;precision mediump sampler2D;varying highp vec2 vUv,vL,vR,vT,vB;uniform sampler2D uPressure,uDivergence;void main(){gl_FragColor=vec4((.25*(texture2D(uPressure,vL).x+texture2D(uPressure,vR).x+texture2D(uPressure,vT).x+texture2D(uPressure,vB).x-texture2D(uDivergence,vUv).x)),0,0,1);}`
    const GRAD_F = `precision mediump float;precision mediump sampler2D;varying highp vec2 vUv,vL,vR,vT,vB;uniform sampler2D uPressure,uVelocity;void main(){vec2 v=texture2D(uVelocity,vUv).xy;v.xy-=vec2(texture2D(uPressure,vR).x-texture2D(uPressure,vL).x,texture2D(uPressure,vT).x-texture2D(uPressure,vB).x);gl_FragColor=vec4(v,0,1);}`

    const bv = cShader(gl.VERTEX_SHADER, BASE_V)

    // Programs
    function Prog(fs: any, kw?: string[]) {
      const p = cProg(bv, cShader(gl.FRAGMENT_SHADER, fs, kw))
      return { prog: p, u: getUni(p), bind() { gl.useProgram(p) } }
    }

    const copyP = Prog(COPY_F), clearP = Prog(CLEAR_F), splatP = Prog(SPLAT_F)
    const advP = Prog(ADV_F, ext.supportLinearFiltering ? undefined : ['MANUAL_FILTERING'])
    const divP = Prog(DIV_F), curlP = Prog(CURL_F), vortP = Prog(VORT_F), presP = Prog(PRES_F), gradP = Prog(GRAD_F)

    // Display material with keywords
    const dispKw = cfg.SHADING ? ['SHADING'] : []
    const dispProg = cProg(bv, cShader(gl.FRAGMENT_SHADER, DISPLAY_F, dispKw))
    const dispU = getUni(dispProg)

    // Blit
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,-1,1,1,1,1,-1]), gl.STATIC_DRAW)
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer())
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0,1,2,0,2,3]), gl.STATIC_DRAW)
    gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0); gl.enableVertexAttribArray(0)

    function blit(tgt: any, clear=false) {
      if (!tgt) { gl.viewport(0,0,gl.drawingBufferWidth,gl.drawingBufferHeight); gl.bindFramebuffer(gl.FRAMEBUFFER,null) }
      else { gl.viewport(0,0,tgt.width,tgt.height); gl.bindFramebuffer(gl.FRAMEBUFFER,tgt.fbo) }
      if (clear) { gl.clearColor(0,0,0,1); gl.clear(gl.COLOR_BUFFER_BIT) }
      gl.drawElements(gl.TRIANGLES,6,gl.UNSIGNED_SHORT,0)
    }

    function mkFBO(w: number, h: number, iF: any, f: any, t: any, param: any) {
      gl.activeTexture(gl.TEXTURE0)
      const tex=gl.createTexture()!; gl.bindTexture(gl.TEXTURE_2D,tex)
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,param); gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,param)
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE)
      gl.texImage2D(gl.TEXTURE_2D,0,iF,w,h,0,f,t,null)
      const fbo=gl.createFramebuffer()!; gl.bindFramebuffer(gl.FRAMEBUFFER,fbo)
      gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,tex,0)
      gl.viewport(0,0,w,h); gl.clear(gl.COLOR_BUFFER_BIT)
      return { texture:tex, fbo, width:w, height:h, texelSizeX:1/w, texelSizeY:1/h, attach(id:number){gl.activeTexture(gl.TEXTURE0+id);gl.bindTexture(gl.TEXTURE_2D,tex);return id} }
    }

    function mkDbl(w:number,h:number,iF:any,f:any,t:any,p:any) {
      let a=mkFBO(w,h,iF,f,t,p), b=mkFBO(w,h,iF,f,t,p)
      return { width:w,height:h,texelSizeX:a.texelSizeX,texelSizeY:a.texelSizeY,get read(){return a},set read(v){a=v},get write(){return b},set write(v){b=v},swap(){const tmp=a;a=b;b=tmp} }
    }

    function res(r:number){const ar=gl.drawingBufferWidth/gl.drawingBufferHeight>1?gl.drawingBufferWidth/gl.drawingBufferHeight:gl.drawingBufferHeight/gl.drawingBufferWidth;const min=Math.round(r),max=Math.round(r*ar);return gl.drawingBufferWidth>gl.drawingBufferHeight?{w:max,h:min}:{w:min,h:max}}
    function px(n:number){return Math.floor(n*(window.devicePixelRatio||1))}

    const filt = ext.supportLinearFiltering ? gl.LINEAR : gl.NEAREST
    let dye:any, vel:any, div:any, curl:any, pres:any

    function initFBOs(){
      const sr=res(cfg.SIM_RESOLUTION), dr=res(cfg.DYE_RESOLUTION)
      const {fmtRGBA,fmtRG,fmtR,hft}=ext
      gl.disable(gl.BLEND)
      if(!dye)dye=mkDbl(dr.w,dr.h,fmtRGBA.internalFormat,fmtRGBA.format,hft,filt)
      if(!vel)vel=mkDbl(sr.w,sr.h,fmtRG.internalFormat,fmtRG.format,hft,filt)
      div=mkFBO(sr.w,sr.h,fmtR.internalFormat,fmtR.format,hft,gl.NEAREST)
      curl=mkFBO(sr.w,sr.h,fmtR.internalFormat,fmtR.format,hft,gl.NEAREST)
      pres=mkDbl(sr.w,sr.h,fmtR.internalFormat,fmtR.format,hft,gl.NEAREST)
    }
    initFBOs()

    function splat(x:number,y:number,dx:number,dy:number,col:any){
      splatP.bind()
      gl.uniform1i(splatP.u.uTarget,vel.read.attach(0)); gl.uniform1f(splatP.u.aspectRatio,canvas!.width/canvas!.height)
      gl.uniform2f(splatP.u.point,x,y); gl.uniform3f(splatP.u.color,dx,dy,0)
      let r=cfg.SPLAT_RADIUS/100; if(canvas!.width/canvas!.height>1)r*=canvas!.width/canvas!.height
      gl.uniform1f(splatP.u.radius,r); blit(vel.write); vel.swap()
      gl.uniform1i(splatP.u.uTarget,dye.read.attach(0)); gl.uniform3f(splatP.u.color,col.r,col.g,col.b); blit(dye.write); dye.swap()
    }

    function HSV(h:number,s:number,v:number){let r=0,g=0,b=0,i=Math.floor(h*6),f=h*6-i,p=v*(1-s),q=v*(1-f*s),t=v*(1-(1-f)*s);switch(i%6){case 0:r=v;g=t;b=p;break;case 1:r=q;g=v;b=p;break;case 2:r=p;g=v;b=t;break;case 3:r=p;g=q;b=v;break;case 4:r=t;g=p;b=v;break;case 5:r=v;g=p;b=q;break;}return{r:r*.15,g:g*.15,b:b*.15}}
    function genCol(){return HSV(Math.random(),1,1)}
    function wrap(v:number,mn:number,mx:number){const r=mx-mn;return r===0?mn:((v-mn)%r)+mn}

    let lastTime=Date.now(), colorTimer=0

    function step(dt:number){
      gl.disable(gl.BLEND)
      curlP.bind();gl.uniform2f(curlP.u.texelSize,vel.texelSizeX,vel.texelSizeY);gl.uniform1i(curlP.u.uVelocity,vel.read.attach(0));blit(curl)
      vortP.bind();gl.uniform2f(vortP.u.texelSize,vel.texelSizeX,vel.texelSizeY);gl.uniform1i(vortP.u.uVelocity,vel.read.attach(0));gl.uniform1i(vortP.u.uCurl,curl.attach(1));gl.uniform1f(vortP.u.curl,cfg.CURL);gl.uniform1f(vortP.u.dt,dt);blit(vel.write);vel.swap()
      divP.bind();gl.uniform2f(divP.u.texelSize,vel.texelSizeX,vel.texelSizeY);gl.uniform1i(divP.u.uVelocity,vel.read.attach(0));blit(div)
      clearP.bind();gl.uniform1i(clearP.u.uTexture,pres.read.attach(0));gl.uniform1f(clearP.u.value,cfg.PRESSURE);blit(pres.write);pres.swap()
      presP.bind();gl.uniform2f(presP.u.texelSize,vel.texelSizeX,vel.texelSizeY);gl.uniform1i(presP.u.uDivergence,div.attach(0))
      for(let i=0;i<cfg.PRESSURE_ITERATIONS;i++){gl.uniform1i(presP.u.uPressure,pres.read.attach(1));blit(pres.write);pres.swap()}
      gradP.bind();gl.uniform2f(gradP.u.texelSize,vel.texelSizeX,vel.texelSizeY);gl.uniform1i(gradP.u.uPressure,pres.read.attach(0));gl.uniform1i(gradP.u.uVelocity,vel.read.attach(1));blit(vel.write);vel.swap()
      advP.bind();gl.uniform2f(advP.u.texelSize,vel.texelSizeX,vel.texelSizeY)
      if(!ext.supportLinearFiltering)gl.uniform2f(advP.u.dyeTexelSize,vel.texelSizeX,vel.texelSizeY)
      const vid=vel.read.attach(0);gl.uniform1i(advP.u.uVelocity,vid);gl.uniform1i(advP.u.uSource,vid);gl.uniform1f(advP.u.dt,dt);gl.uniform1f(advP.u.dissipation,cfg.VELOCITY_DISSIPATION);blit(vel.write);vel.swap()
      if(!ext.supportLinearFiltering)gl.uniform2f(advP.u.dyeTexelSize,dye.texelSizeX,dye.texelSizeY)
      gl.uniform1i(advP.u.uVelocity,vel.read.attach(0));gl.uniform1i(advP.u.uSource,dye.read.attach(1));gl.uniform1f(advP.u.dissipation,cfg.DENSITY_DISSIPATION);blit(dye.write);dye.swap()
    }

    function frame(){
      if(!active)return
      const now=Date.now(), dt=Math.min((now-lastTime)/1000,.016666); lastTime=now
      const w=px(canvas!.clientWidth), h=px(canvas!.clientHeight)
      if(canvas!.width!==w||canvas!.height!==h){canvas!.width=w;canvas!.height=h;initFBOs()}
      colorTimer+=dt*cfg.COLOR_UPDATE_SPEED
      if(colorTimer>=1){colorTimer=wrap(colorTimer,0,1);pointers.forEach(p=>{p.color=genCol()})}
      pointers.forEach(p=>{if(p.moved){p.moved=false;splat(p.texcoordX,p.texcoordY,p.deltaX*cfg.SPLAT_FORCE,p.deltaY*cfg.SPLAT_FORCE,p.color)}})
      step(dt)
      gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA); gl.enable(gl.BLEND)
      gl.useProgram(dispProg)
      if(cfg.SHADING)gl.uniform2f(dispU.texelSize,1/gl.drawingBufferWidth,1/gl.drawingBufferHeight)
      gl.uniform1i(dispU.uTexture,dye.read.attach(0)); blit(null)
      rafRef.current=requestAnimationFrame(frame)
    }

    function cdx(d:number){const ar=canvas!.width/canvas!.height;return ar<1?d*ar:d}
    function cdy(d:number){const ar=canvas!.width/canvas!.height;return ar>1?d/ar:d}

    let firstMove=false
    function onMouseDown(e:MouseEvent){const p=pointers[0];p.id=-1;p.down=true;p.moved=false;p.texcoordX=px(e.clientX)/canvas!.width;p.texcoordY=1-px(e.clientY)/canvas!.height;p.prevTexcoordX=p.texcoordX;p.prevTexcoordY=p.texcoordY;p.deltaX=0;p.deltaY=0;p.color=genCol();const c=genCol();c.r*=10;c.g*=10;c.b*=10;splat(p.texcoordX,p.texcoordY,10*(Math.random()-.5),30*(Math.random()-.5),c)}
    function onMouseMove(e:MouseEvent){const p=pointers[0];const nx=px(e.clientX)/canvas!.width,ny=1-px(e.clientY)/canvas!.height;if(!firstMove){firstMove=true;p.texcoordX=nx;p.texcoordY=ny;p.prevTexcoordX=nx;p.prevTexcoordY=ny}else{p.prevTexcoordX=p.texcoordX;p.prevTexcoordY=p.texcoordY;p.texcoordX=nx;p.texcoordY=ny;p.deltaX=cdx(nx-p.prevTexcoordX);p.deltaY=cdy(ny-p.prevTexcoordY);p.moved=Math.abs(p.deltaX)>0||Math.abs(p.deltaY)>0}}
    function onTouchStart(e:TouchEvent){const p=pointers[0];const t=e.targetTouches[0];p.texcoordX=px(t.clientX)/canvas!.width;p.texcoordY=1-px(t.clientY)/canvas!.height;p.prevTexcoordX=p.texcoordX;p.prevTexcoordY=p.texcoordY;p.deltaX=0;p.deltaY=0;p.color=genCol()}
    function onTouchMove(e:TouchEvent){const p=pointers[0];const t=e.targetTouches[0];const nx=px(t.clientX)/canvas!.width,ny=1-px(t.clientY)/canvas!.height;p.prevTexcoordX=p.texcoordX;p.prevTexcoordY=p.texcoordY;p.texcoordX=nx;p.texcoordY=ny;p.deltaX=cdx(nx-p.prevTexcoordX);p.deltaY=cdy(ny-p.prevTexcoordY);p.moved=Math.abs(p.deltaX)>0||Math.abs(p.deltaY)>0}

    window.addEventListener('mousedown',onMouseDown)
    window.addEventListener('mousemove',onMouseMove)
    window.addEventListener('touchstart',onTouchStart)
    window.addEventListener('touchmove',onTouchMove,{passive:false})

    frame()

    return () => {
      active=false
      if(rafRef.current)cancelAnimationFrame(rafRef.current)
      window.removeEventListener('mousedown',onMouseDown)
      window.removeEventListener('mousemove',onMouseMove)
      window.removeEventListener('touchstart',onTouchStart)
      window.removeEventListener('touchmove',onTouchMove)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[])

  return (
    <div style={{position:'fixed',top:0,left:0,width:'100%',height:'100%',zIndex:50,pointerEvents:'none'}}>
      <canvas ref={canvasRef} id="fluid" style={{display:'block',width:'100vw',height:'100vh'}} />
    </div>
  )
}
