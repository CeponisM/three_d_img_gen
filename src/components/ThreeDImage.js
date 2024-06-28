import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, extend } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

extend({ PlaneGeometry: THREE.PlaneGeometry });

const Plane = ({ imageFile, depthMap, speed }) => {
  const planeRef = useRef();
  const texture = new THREE.TextureLoader().load(URL.createObjectURL(imageFile));
  const depthTexture = useRef(new THREE.DataTexture());
  const [depthData, setDepthData] = useState(new Float32Array());

  useEffect(() => {
    if (depthMap) {
      const { normalizedDepthArray, shape } = depthMap;
      const [height, width] = shape;
      const size = width * height;
      const data = new Float32Array(size);

      for (let i = 0; i < height; i++) {
        for (let j = 0; j < width; j++) {
          data[i * width + j] = normalizedDepthArray[i][j];
        }
      }

      depthTexture.current.image = { data, width, height };
      depthTexture.current.format = THREE.RedFormat;
      depthTexture.current.type = THREE.FloatType;
      depthTexture.current.minFilter = THREE.LinearFilter;
      depthTexture.current.magFilter = THREE.LinearFilter;
      depthTexture.current.wrapS = THREE.ClampToEdgeWrapping;
      depthTexture.current.wrapT = THREE.ClampToEdgeWrapping;
      depthTexture.current.needsUpdate = true;

      setDepthData(data);
    }
  }, [depthMap]);

  useFrame(() => {
    if (planeRef.current) {
      const elapsedTime = (Date.now() % 2000) / 2000;
      const angle = elapsedTime * Math.PI * 2;

      planeRef.current.position.x = Math.sin(angle) * speed;
      planeRef.current.position.y = Math.cos(angle) * speed;
    }
  });

  return (
    <mesh ref={planeRef} scale={[10, 10, 10]}>
      <planeGeometry attach="geometry" args={[1, 1, 1024, 1024]} />
      <meshStandardMaterial
        attach="material"
        map={texture}
        displacementMap={depthTexture.current}
        displacementScale={0.3}
        color="white"
      />
    </mesh>
  );
};

const ThreeDImage = ({ imageFile, depthMap }) => {
  const [speed, setSpeed] = useState(0.05);
  const [zoom, setZoom] = useState(1);

  return (
    <div>
      <Canvas style={{ width: '100%', height: '100%' }}>
        <ambientLight />
        <pointLight position={[10, 10, 10]} />
        <Plane imageFile={imageFile} depthMap={depthMap} speed={speed} />
        <OrbitControls enableZoom={true} zoomSpeed={zoom} />
      </Canvas>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
        <div>
          <label>Speed:</label>
          <input type="range" min="0.01" max="0.1" step="0.01" value={speed} onChange={(e) => setSpeed(e.target.value)} />
        </div>
        <div>
          <label>Zoom:</label>
          <input type="range" min="0.5" max="2" step="0.1" value={zoom} onChange={(e) => setZoom(e.target.value)} />
        </div>
      </div>
    </div>
  );
};

export default ThreeDImage;
