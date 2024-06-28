import { auth } from '../firebase';

export const generateDepthMap = async (imageUrl) => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User not authenticated');
  }

  const token = await user.getIdToken();
  const response = await fetch('http://209.122.95.149:5000/api/depthmap', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ image_url: imageUrl })
  });

  if (!response.ok) {
    throw new Error('Failed to fetch depth map from server');
  }

  const depthMapData = await response.json();
  const flatDepthArray = depthMapData.flat();
  const minDepth = Math.min(...flatDepthArray);
  const maxDepth = Math.max(...flatDepthArray);

  // Normalize the depth array
  const normalizedDepthArray = depthMapData.map(row =>
    row.map(value => (value - minDepth) / (maxDepth - minDepth))
  );

  return {
    depthArray: depthMapData,
    normalizedDepthArray: normalizedDepthArray,
    shape: [384, 384],
  };
};
