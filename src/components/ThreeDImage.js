import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame, extend } from '@react-three/fiber';
import { OrbitControls, useTexture } from '@react-three/drei';
import * as THREE from 'three';

extend({ PlaneGeometry: THREE.PlaneGeometry });

const Plane = ({ imageUrl, depthMap }) => {
  const planeRef = useRef();
  const texture = useTexture(imageUrl);
  const depthTexture = useRef(new THREE.DataTexture());

  useEffect(() => {
    console.log('Plane useEffect triggered with depthMap:', depthMap);

    if (depthMap) {
      const { depthArray, shape } = depthMap;
      const [height, width] = shape;
      const size = width * height;
      const data = new Float32Array(size);

      // Adjust depth values as needed (right-side up)
      for (let i = 0; i < height; i++) {
        for (let j = 0; j < width; j++) {
          data[i * width + j] = depthArray[height - 1 - i][j]; // Flip vertically
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

      console.log('Depth Texture Updated:', depthTexture.current);
    }
  }, [depthMap]);

  useFrame(() => {
    if (planeRef.current) {
      const elapsedTime = (Date.now() % 2000) / 2000;
      const angle = elapsedTime * Math.PI * 2;

      planeRef.current.position.x = Math.sin(angle) * 0.05;
      planeRef.current.position.y = Math.cos(angle) * 0.05;
    }
  });

  return (
    <mesh ref={planeRef} scale={[10, 10, 10]}>
      <planeGeometry attach="geometry" args={[1, 1, 1024, 1024]} />
      <meshStandardMaterial
        attach="material"
        map={texture}
        displacementMap={depthTexture.current}
        displacementScale={0.3} // Adjust displacement scale as needed
        color="white"
      />
    </mesh>
  );
};

const ThreeDImage = ({ imageUrl, depthMap }) => {
  useEffect(() => {
    console.log('ThreeDImage props - imageUrl:', imageUrl, 'depthMap:', depthMap);
  }, [imageUrl, depthMap]);

  return (
    <Canvas style={{ width: '100%', height: '100%' }}>
      <ambientLight />
      <pointLight position={[10, 10, 10]} />
      <Plane imageUrl={imageUrl} depthMap={depthMap} />
      <OrbitControls enableZoom={true} />
    </Canvas>
  );
};

export default ThreeDImage;
