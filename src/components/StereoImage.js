import React, { useEffect, useRef, useState } from 'react';
import * as PIXI from 'pixi.js';

const vertexShaderSrc = `
  attribute vec2 aVertexPosition;
  attribute vec2 aTextureCoord;

  uniform mat3 projectionMatrix;

  varying vec2 vTextureCoord;

  void main(void){
    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
    vTextureCoord = aTextureCoord;
  }
`;

const fragmentShaderSrc = `
  precision mediump float;

  varying vec2 vTextureCoord;
  uniform sampler2D uSampler;
  uniform sampler2D displacementMap;
  uniform float strength;
  uniform int viewMode;

  void main(void) {
    float depth = texture2D(displacementMap, vTextureCoord).r;
    vec2 displacement = vec2(depth * strength, 0.0);

    if (viewMode == 1) {  // Regular Stereo
      vec2 displacedCoord = vTextureCoord + displacement;
      gl_FragColor = texture2D(uSampler, displacedCoord);
    } else if (viewMode == 2) {  // Anaglyph
      vec2 leftCoord = vTextureCoord - displacement;
      vec2 rightCoord = vTextureCoord + displacement;
      vec4 leftColor = texture2D(uSampler, leftCoord);
      vec4 rightColor = texture2D(uSampler, rightCoord);
      gl_FragColor = vec4(leftColor.r, rightColor.g, rightColor.b, 1.0);
    } else {
      gl_FragColor = texture2D(uSampler, vTextureCoord);
    }
  }
`;

const StereoImage = ({ imageFile, depthMap }) => {
  const canvasRef = useRef(null);
  const [strength, setStrength] = useState(0.05);
  const [viewMode, setViewMode] = useState(1); // 1: Regular, 2: Anaglyph

  useEffect(() => {
    if (!(imageFile instanceof Blob)) {
      console.error("Invalid image file data", imageFile);
      return;
    }

    const app = new PIXI.Application({
      width: window.innerWidth,
      height: window.innerHeight,
      autoStart: true,
    });

    console.log("PIXI application initialized:", app);

    canvasRef.current.appendChild(app.view);
    console.log("Canvas appended to DOM:", app.view);

    const imageUrl = URL.createObjectURL(imageFile);

    // Load image texture directly
    const imageTexture = PIXI.Texture.from(imageUrl);

    // Convert depth map to a texture
    const depthMapCanvas = document.createElement('canvas');
    const depthMapContext = depthMapCanvas.getContext('2d');
    depthMapCanvas.width = depthMap.shape[1];
    depthMapCanvas.height = depthMap.shape[0];
    const depthImageData = depthMapContext.createImageData(depthMapCanvas.width, depthMapCanvas.height);

    for (let i = 0; i < depthMap.depthArray.length; i++) {
      const value = depthMap.depthArray[i] * 255;
      depthImageData.data[i * 4] = value;       // Red
      depthImageData.data[i * 4 + 1] = value;   // Green
      depthImageData.data[i * 4 + 2] = value;   // Blue
      depthImageData.data[i * 4 + 3] = 255;     // Alpha
    }

    depthMapContext.putImageData(depthImageData, 0, 0);
    const depthMapTexture = PIXI.Texture.from(depthMapCanvas);

    const uniforms = {
      uSampler: imageTexture,
      displacementMap: depthMapTexture,
      strength: strength,
      viewMode: viewMode,
    };

    const shader = new PIXI.Filter(vertexShaderSrc, fragmentShaderSrc, uniforms);
    const sprite = new PIXI.Sprite(imageTexture);

    sprite.width = app.screen.width;
    sprite.height = app.screen.height;
    sprite.filters = [shader];

    app.stage.addChild(sprite);

    // Update uniforms when state changes
    const updateUniforms = () => {
      shader.uniforms.strength = strength;
      shader.uniforms.viewMode = viewMode;
      console.log("Uniforms updated:", { strength, viewMode });
    };

    updateUniforms();

    return () => {
      app.destroy(true, { children: true, texture: true, baseTexture: true });
      console.log("PIXI application destroyed");
    };
  }, [imageFile, depthMap, strength, viewMode]);

  const handleStrengthChange = (e) => {
    setStrength(parseFloat(e.target.value));
  };

  const toggleViewMode = () => {
    setViewMode(viewMode === 1 ? 2 : 1);
  };

  return (
    <div>
      <div ref={canvasRef} style={{ width: '100%', height: '100%' }} />
      <div style={{ marginTop: '10px', textAlign: 'center' }}>
        <label>
          Strength:
          <input
            type="range"
            min="0.01"
            max="0.1"
            step="0.01"
            value={strength}
            onChange={handleStrengthChange}
            style={{ marginLeft: '10px' }}
          />
        </label>
        <button onClick={toggleViewMode} style={{ marginLeft: '20px' }}>
          Toggle View Mode
        </button>
      </div>
    </div>
  );
};

export default StereoImage;
