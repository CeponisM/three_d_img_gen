import React, { useEffect, useRef, useState } from 'react';
import { fragmentShaderSrc } from '../shaders/Shaders';

const vertexShaderSrc = `
    attribute vec2 a_position;
    void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
    }
`;

const StereoImage = ({ imageFile, depthMap }) => {
  const canvasRef = useRef(null);
  const glRef = useRef(null);
  const programRef = useRef(null);
  const [state, setState] = useState({
    depthHeight: 0.35,
    depthFocus: 0.5,
    depthZoom: 1.0,
    depthIsometric: 0.0,
    depthDolly: 0.0,
    depthCenter: [0, 0],
    depthOffset: [0, 0],
    depthStatic: 0.25,
    depthOrigin: [0, 0],
    depthInvert: 0,
    depthMirror: 1,
    quality: 0.5,
    dofEnable: 0,
    dofIntensity: 1.0,
    dofStart: 0.6,
    dofEnd: 1.0,
    dofExponent: 2.0,
    dofQuality: 4,
    dofDirections: 16,
    vignetteEnable: 0,
    vignetteIntensity: 30,
    vignetteDecay: 0.1,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const gl = canvas.getContext('webgl');
    glRef.current = gl;

    if (!gl) {
      console.error('WebGL not supported');
      return;
    }

    const program = createShaderProgram(gl, vertexShaderSrc, fragmentShaderSrc);
    if (!program) {
      console.error('Failed to create shader program');
      return;
    }
    programRef.current = program;

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    const positions = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

    loadImageAndDepthMap(gl, imageFile, depthMap);

    requestAnimationFrame(render);

    return () => {
      gl.deleteProgram(program);
      gl.deleteBuffer(positionBuffer);
    };
  }, [imageFile, depthMap]);

  const createShaderProgram = (gl, vsSource, fsSource) => {
    const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fsSource);

    if (!vertexShader || !fragmentShader) {
      return null;
    }

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Unable to initialize the shader program:', gl.getProgramInfoLog(program));
      return null;
    }

    return program;
  };

  const compileShader = (gl, type, source) => {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('An error occurred compiling the shaders:', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }

    return shader;
  };

  const loadImageAndDepthMap = (gl, imageFile, depthMap) => {
    const imageTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, imageTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 255, 255]));

    const image = new Image();
    image.onload = () => {
      gl.bindTexture(gl.TEXTURE_2D, imageTexture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
      gl.generateMipmap(gl.TEXTURE_2D);
    };
    image.src = URL.createObjectURL(imageFile);

    const depthTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, depthTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, depthMap.width, depthMap.height, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, depthMap.data);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    const program = programRef.current;
    gl.useProgram(program);
    gl.uniform1i(gl.getUniformLocation(program, 'image'), 0);
    gl.uniform1i(gl.getUniformLocation(program, 'depth'), 1);
  };

  const render = (time) => {
    const gl = glRef.current;
    const program = programRef.current;

    if (!gl || !program) return;

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(program);

    gl.uniform2f(gl.getUniformLocation(program, 'iResolution'), gl.canvas.width, gl.canvas.height);
    gl.uniform1f(gl.getUniformLocation(program, 'iTime'), time * 0.001);

    Object.entries(state).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        gl.uniform2f(gl.getUniformLocation(program, `i${key[0].toUpperCase() + key.slice(1)}`), value[0], value[1]);
      } else {
        gl.uniform1f(gl.getUniformLocation(program, `i${key[0].toUpperCase() + key.slice(1)}`), value);
      }
    });

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    requestAnimationFrame(render);
  };

  const handleSliderChange = (key, value) => {
    setState(prevState => ({
      ...prevState,
      [key]: parseFloat(value),
    }));
  };

  const handleCheckboxChange = (key, checked) => {
    setState(prevState => ({
      ...prevState,
      [key]: checked ? 1 : 0,
    }));
  };

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
      <div style={{ position: 'absolute', top: 10, left: 10, color: 'white' }}>
        {Object.entries(state).map(([key, value]) => (
          <div key={key}>
            <label>
              {key}:
              {typeof value === 'number' ? (
                <input
                  type="range"
                  min="0"
                  max={key.includes('Enable') ? "1" : "2"}
                  step="0.01"
                  value={value}
                  onChange={(e) => handleSliderChange(key, e.target.value)}
                />
              ) : (
                <input
                  type="checkbox"
                  checked={value === 1}
                  onChange={(e) => handleCheckboxChange(key, e.target.checked)}
                />
              )}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StereoImage;
