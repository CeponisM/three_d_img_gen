import React, { useRef, useEffect } from 'react';

const DepthMapView = ({ depthMap }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!depthMap || !depthMap.shape || !depthMap.depthArray) {
      console.error("Invalid depth map data", depthMap);
      return;
    }

    const canvas = canvasRef.current;
    if (canvas && canvas.getContext) {
      const context = canvas.getContext('2d');
      const { depthArray, shape } = depthMap;
      const [height, width] = shape;
      const imageData = context.createImageData(width, height);

      for (let i = 0; i < height; i++) {
        for (let j = 0; j < width; j++) {
          const depthValue = depthArray[i][j] * 255;
          const index = (i * width + j) * 4;
          imageData.data[index] = depthValue;
          imageData.data[index + 1] = depthValue;
          imageData.data[index + 2] = depthValue;
          imageData.data[index + 3] = 255;
        }
      }

      canvas.width = width;
      canvas.height = height;
      context.putImageData(imageData, 0, 0);
    }
  }, [depthMap]);

  return <canvas ref={canvasRef} style={{ width: '100%' }} />;
};

export default DepthMapView;
