import React, { useEffect, useRef } from 'react';

/**
 * FluidTideShader
 * High-performance WebGL GLSL fragment shader inspired by Scrolltide.co.
 * Renders an organic, glowing ocean/tide wave landscape in deep obsidian & luminescent cyan/foam.
 * Highly optimized, runs at 60fps with zero external dependencies.
 */
export const FluidTideShader: React.FC<{ className?: string }> = ({ className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl', { powerPreference: 'high-performance', alpha: true });
    if (!gl) return;

    // Vertex Shader: full-screen quad
    const vsSource = `
      attribute vec2 a_position;
      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    // Fragment Shader: procedural fluid waves with tide luminescent glow
    const fsSource = `
      precision mediump float;
      uniform vec2 u_resolution;
      uniform float u_time;
      uniform vec2 u_mouse;

      // Simplex-inspired procedural wave function
      float wave(vec2 p, float freq, float speed, float t) {
        return sin(p.x * freq + t * speed) * cos(p.y * freq * 0.8 + t * speed * 0.7);
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution.xy;
        vec2 p = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / min(u_resolution.x, u_resolution.y);

        // Subtle mouse influence
        vec2 mouse = (u_mouse * 2.0 - 1.0);
        p += mouse * 0.08;

        float t = u_time * 0.28;

        // Multi-octave wave interference
        float w1 = wave(p * 1.8, 1.2, 0.9, t);
        float w2 = wave(p * 2.6 + vec2(1.7, -1.2), 1.9, -0.7, t);
        float w3 = wave(p * 4.2 + vec2(-2.1, 3.4), 2.8, 1.1, t);
        
        float combined = (w1 * 0.5 + w2 * 0.35 + w3 * 0.15);

        // Distance from center for radial vignette
        float dist = length(uv - vec2(0.5, 0.35));
        float vignette = smoothstep(0.9, 0.2, dist);

        // Base obsidian black / deep cyan-ink
        vec3 colBg = vec3(0.027, 0.035, 0.047); // #07090c
        
        // Tide cyan (#46b7ff) & foam green-cyan (#8bf3e6)
        vec3 colTide = vec3(0.18, 0.62, 0.95);
        vec3 colFoam = vec3(0.0, 0.92, 0.68);
        vec3 colDeep = vec3(0.05, 0.12, 0.22);

        // Gradient color ramps based on wave height
        float waveBand = smoothstep(-0.35, 0.65, combined);
        float foamPeak = smoothstep(0.48, 0.75, combined);

        vec3 color = mix(colBg, colDeep, waveBand * 0.75);
        color = mix(color, colTide, waveBand * 0.35 * vignette);
        color += colFoam * (foamPeak * 0.45 * vignette);

        // Atmospheric glowing horizon line
        float horizon = smoothstep(0.4, 0.0, abs(uv.y - 0.45 - combined * 0.12));
        color += colTide * horizon * 0.18;

        // Subtle pulse
        float pulse = sin(u_time * 0.5) * 0.04 + 0.96;
        color *= pulse;

        // Output with smooth alpha
        gl_FragColor = vec4(color, 0.92);
      }
    `;

    function createShader(gl: WebGLRenderingContext, type: number, source: string) {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    }

    const vs = createShader(gl, gl.VERTEX_SHADER, vsSource);
    const fs = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      return;
    }

    const positionLoc = gl.getAttribLocation(program, 'a_position');
    const resLoc = gl.getUniformLocation(program, 'u_resolution');
    const timeLoc = gl.getUniformLocation(program, 'u_time');
    const mouseLoc = gl.getUniformLocation(program, 'u_mouse');

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        -1, -1,
         1, -1,
        -1,  1,
        -1,  1,
         1, -1,
         1,  1
      ]),
      gl.STATIC_DRAW
    );

    let animationFrameId: number;
    let startTime = performance.now();
    let mouseX = 0.5;
    let mouseY = 0.5;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        mouseX = (e.clientX - rect.left) / rect.width;
        mouseY = 1.0 - (e.clientY - rect.top) / rect.height;
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const width = Math.floor(canvas.clientWidth * dpr);
      const height = Math.floor(canvas.clientHeight * dpr);
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
      }
    };

    const render = () => {
      resize();
      gl.useProgram(program);

      gl.enableVertexAttribArray(positionLoc);
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

      const elapsed = (performance.now() - startTime) / 1000;
      gl.uniform2f(resLoc, canvas.width, canvas.height);
      gl.uniform1f(timeLoc, elapsed);
      gl.uniform2f(mouseLoc, mouseX, mouseY);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      if (buffer) gl.deleteBuffer(buffer);
      if (program) gl.deleteProgram(program);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 h-full w-full opacity-70 transition-opacity duration-1000 ${className}`}
      style={{ mixBlendMode: 'screen' }}
    />
  );
};
