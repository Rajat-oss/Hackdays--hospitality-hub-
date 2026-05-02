import { useEffect, useRef } from 'react'

interface Props {
  color?: string
  horizontalBeamOffset?: number
  verticalBeamOffset?: number
  horizontalSizing?: number
  verticalSizing?: number
  wispDensity?: number
  wispSpeed?: number
  wispIntensity?: number
  flowSpeed?: number
  flowStrength?: number
  fogIntensity?: number
  fogScale?: number
  fogFallSpeed?: number
  decay?: number
  falloffStart?: number
}

export default function LaserFlow({
  color = '#5A9690',
  horizontalBeamOffset = 0,
  verticalBeamOffset = 0,
  horizontalSizing = 1,
  verticalSizing = 1,
  wispDensity = 1,
  wispSpeed = 10,
  wispIntensity = 3,
  flowSpeed = 0.3,
  flowStrength = 0.2,
  fogIntensity = 0.4,
  fogScale = 0.25,
  fogFallSpeed = 0.5,
  decay = 1,
  falloffStart = 1,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const raf = useRef(0)

  function hexToVec3(hex: string): [number, number, number] {
    const c = hex.replace('#', '')
    return [parseInt(c.slice(0,2),16)/255, parseInt(c.slice(2,4),16)/255, parseInt(c.slice(4,6),16)/255]
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const gl = canvas.getContext('webgl') as WebGLRenderingContext | null
    if (!gl) return

    const [cr, cg, cb] = hexToVec3(color)

    const vSrc = `attribute vec2 p; void main(){gl_Position=vec4(p,0,1);}`
    const fSrc = `
      precision highp float;
      uniform vec2 u_res; uniform float u_t; uniform vec3 u_col;
      uniform float u_hOff,u_vOff,u_hSz,u_vSz,u_wD,u_wS,u_wI,u_fS,u_fSt,u_fogI,u_fogSc,u_fogF,u_dec,u_fall;
      float hash(vec2 p){p=fract(p*vec2(127.1,311.7));p+=dot(p,p+45.32);return fract(p.x*p.y);}
      float noise(vec2 p){vec2 i=floor(p),f=fract(p),u=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),u.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),u.x),u.y);}
      float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*noise(p);p=p*2.1+vec2(1.3,.7);a*=.5;}return v;}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_res;
        vec2 c=(uv-vec2(.5+u_hOff,.5+u_vOff));
        c.x/=u_hSz; c.y/=u_vSz;
        vec2 fUv=uv*3.; fUv.y-=u_t*u_fS;
        float fn=fbm(fUv+vec2(fbm(fUv+u_t*.1),fbm(fUv-u_t*.07)));
        c+=vec2(fn-.5)*u_fSt;
        float beamY=abs(c.y);
        float beam=exp(-beamY*beamY*80.);
        float wuv=uv.x*u_wD*4.+u_t*u_wS*.05;
        float wisp=pow(noise(vec2(wuv,u_t*u_wS*.02)),2.)*u_wI*exp(-beamY*beamY*15.);
        vec2 fogUv=uv*u_fogSc+vec2(0.,u_t*u_fogF*-.04);
        float fog=fbm(fogUv)*exp(-beamY*beamY*3.)*u_fogI;
        float xd=abs(c.x);
        float side=exp(-xd*xd*.3)*.5;
        float tot=beam*1.4+wisp+fog+side*beam;
        tot*=pow(max(1.-xd*u_fall*.3,0.),u_dec);
        vec3 col=u_col*tot+u_col*beam*.4;
        col=min(col,vec3(1.));
        float alpha=min(tot*.85,1.);
        gl_FragColor=vec4(col,alpha);
      }
    `

    function compile(type: number, src: string) {
      const s = gl!.createShader(type)!
      gl!.shaderSource(s,src); gl!.compileShader(s)
      if(!gl!.getShaderParameter(s,gl!.COMPILE_STATUS)) console.error(gl!.getShaderInfoLog(s))
      return s
    }

    const prog = gl.createProgram()!
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, vSrc))
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, fSrc))
    gl.linkProgram(prog); gl.useProgram(prog)

    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,1,1]), gl.STATIC_DRAW)
    const pos = gl.getAttribLocation(prog, 'p')
    gl.enableVertexAttribArray(pos)
    gl.vertexAttribPointer(pos,2,gl.FLOAT,false,0,0)

    const U = (n: string) => gl.getUniformLocation(prog, n)
    gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
    const start = performance.now()

    function draw() {
      const w = canvas!.clientWidth, h = canvas!.clientHeight
      if (canvas!.width!==w||canvas!.height!==h){canvas!.width=w;canvas!.height=h}
      gl!.viewport(0,0,w,h)
      gl!.clearColor(0,0,0,0); gl!.clear(gl!.COLOR_BUFFER_BIT)
      const t = (performance.now()-start)/1000
      gl!.uniform2f(U('u_res'),w,h); gl!.uniform1f(U('u_t'),t)
      gl!.uniform3f(U('u_col'),cr,cg,cb)
      gl!.uniform1f(U('u_hOff'),horizontalBeamOffset); gl!.uniform1f(U('u_vOff'),verticalBeamOffset)
      gl!.uniform1f(U('u_hSz'),horizontalSizing); gl!.uniform1f(U('u_vSz'),verticalSizing)
      gl!.uniform1f(U('u_wD'),wispDensity); gl!.uniform1f(U('u_wS'),wispSpeed); gl!.uniform1f(U('u_wI'),wispIntensity)
      gl!.uniform1f(U('u_fS'),flowSpeed); gl!.uniform1f(U('u_fSt'),flowStrength)
      gl!.uniform1f(U('u_fogI'),fogIntensity); gl!.uniform1f(U('u_fogSc'),fogScale); gl!.uniform1f(U('u_fogF'),fogFallSpeed)
      gl!.uniform1f(U('u_dec'),decay); gl!.uniform1f(U('u_fall'),falloffStart)
      gl!.drawArrays(gl!.TRIANGLE_STRIP,0,4)
      raf.current = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(raf.current)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <canvas ref={canvasRef} style={{position:'absolute',inset:0,width:'100%',height:'100%',pointerEvents:'none'}} />
  )
}
