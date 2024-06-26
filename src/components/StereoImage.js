import React, { useEffect, useRef } from 'react';

const StereoImage = ({ imageUrl, depthMap }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    const image = new Image();
    image.src = imageUrl;

    const drawImage = (dx = 0, dy = 0) => {
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, dx, dy, canvas.width, canvas.height);
    };

    image.onload = () => {
      drawImage();
    };

    const animate = () => {
      const elapsedTime = (Date.now() % 2000) / 2000; // Loop every 2 seconds
      const angle = elapsedTime * Math.PI * 2;
      const dx = Math.sin(angle) * 20; // Dynamic X offset based on angle
      const dy = Math.cos(angle) * 20; // Dynamic Y offset based on angle
      drawImage(dx, dy);

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;

      const dx = (x - 0.5) * 40; // Dynamic X offset based on mouse position
      const dy = (y - 0.5) * 40; // Dynamic Y offset based on mouse position
      drawImage(dx, dy);
    };

    canvas.addEventListener('mousemove', handleMouseMove);

    return () => {
      cancelAnimationFrame(animationRef.current);
      canvas.removeEventListener('mousemove', handleMouseMove);
    };
  }, [imageUrl, depthMap]);

  return <canvas ref={canvasRef} width="800" height="600" style={{ width: '100%', height: '100%' }} />;
};

export default StereoImage;
