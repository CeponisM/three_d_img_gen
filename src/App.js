import React, { useState } from 'react';
import FileUpload from './components/FileUpload';
import ThreeDImage from './components/ThreeDImage';
import StereoImage from './components/StereoImage';
import DepthMapView from './components/DepthMapView';
import { generateDepthMap } from './utils/depthMap';
import { Container, LoadingBar, ControlPanel, ImageList, Thumbnail, ImageContainer } from './styles';

const App = () => {
  const [imageUrl, setImageUrl] = useState('');
  const [depthMap, setDepthMap] = useState(null);
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('Original');
  const [imageHistory, setImageHistory] = useState([]);

  const handleImageUpload = async (file) => {
    setIsConverting(true);
    setError(null);
    try {
      const depthMap = await generateDepthMap(file);
      const imageUrl = URL.createObjectURL(file);
      setImageUrl(imageUrl);
      setDepthMap(depthMap);
      setImageHistory((prevHistory) => [...prevHistory, { url: imageUrl, depthMap }]);
    } catch (error) {
      console.error("Error in handleImageUpload:", error);
      setError(error.message);
    }
    setIsConverting(false);
  };

  const handleThumbnailClick = (image) => {
    setImageUrl(image.url);
    setDepthMap(image.depthMap);
  };

  return (
    <Container>
      <FileUpload onUpload={handleImageUpload} />
      {isConverting && <LoadingBar />}
      {error && <p>Error: {error}</p>}
      {imageUrl && (
        <>
          <ControlPanel>
            <button onClick={() => setViewMode('Original')}>Original</button>
            {depthMap && (
              <>
                <button onClick={() => setViewMode('3D')}>3D View</button>
                <button onClick={() => setViewMode('Stereo')}>Stereo View</button>
                <button onClick={() => setViewMode('Depth Map')}>Depth Map View</button>
              </>
            )}
          </ControlPanel>
          {viewMode === 'Original' && (
            <ImageContainer>
              <img src={imageUrl} alt="Original" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </ImageContainer>
          )}
          {viewMode === '3D' && <ThreeDImage imageUrl={imageUrl} depthMap={depthMap} />}
          {viewMode === 'Stereo' && <StereoImage imageUrl={imageUrl} depthMap={depthMap} />}
          {viewMode === 'Depth Map' && <DepthMapView depthMap={depthMap} />}
        </>
      )}
      <ImageList>
        {imageHistory.map((image, index) => (
          <Thumbnail key={index} src={image.url} alt={`Thumbnail ${index}`} onClick={() => handleThumbnailClick(image)} />
        ))}
      </ImageList>
    </Container>
  );
};

export default App;
