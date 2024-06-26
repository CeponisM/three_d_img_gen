import * as tf from '@tensorflow/tfjs';
import * as depthEstimation from '@tensorflow-models/depth-estimation';

export const generateDepthMap = async (imageUrl) => {
  // Set the backend to WebGL for better performance
  await tf.setBackend('webgl');

  // Load the ARPortraitDepth model
  const model = depthEstimation.SupportedModels.ARPortraitDepth;
  const estimator = await depthEstimation.createEstimator(model);

  // Load the image
  const image = new Image();
  image.src = imageUrl;
  await new Promise((resolve) => (image.onload = resolve));

  // Estimate the depth
  const depthMapResult = await estimator.estimateDepth(image, { minDepth: 0.1, maxDepth: 1 });

  // Access the actual tensor from the result object
  const depthTensor = depthMapResult.depthTensor;

  // Invert the depth tensor values
  const invertedDepthTensor = tf.sub(tf.scalar(1), depthTensor);

  // Ensure the tensor object is correctly accessed
  console.log('depthTensor:', depthTensor);
  console.log('invertedDepthTensor:', invertedDepthTensor);

  const depthArrayFlat = depthTensor.dataSync();
  const shape = depthTensor.shape;

  // Correct reshaping of the flat array
  const depthArray = [];
  for (let i = 0; i < shape[0]; i++) {
    const row = depthArrayFlat.slice(i * shape[1], (i + 1) * shape[1]);
    depthArray.push(row);
  }

  // Normalize the depth array
  const normalizedDepthArray = depthArray.map(row => row.map(value => (value - 0.1) / (1 - 0.1)));

  // Clean up tensors
  depthTensor.dispose();
  invertedDepthTensor.dispose();

  return { depthArray: normalizedDepthArray, shape };
};
