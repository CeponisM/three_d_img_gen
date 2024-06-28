export const generateDepthMap = async (file) => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch('http://209.122.95.149:5000/api/depthmap', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to fetch depth map from server');
  }

  const depthMapData = await response.json();

  return {
    depthArray: depthMapData,
    shape: [512, 512],
  };
};
