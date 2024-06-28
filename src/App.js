import React, { useState } from 'react';
import FileUpload from './components/FileUpload';
import ThreeDImage from './components/ThreeDImage';
import StereoImage from './components/StereoImage';
import DepthMapView from './components/DepthMapView';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import { generateDepthMap } from './utils/depthMap';
import { Container, LoadingBar, ControlPanel, ImageList, Thumbnail, ImageContainer } from './styles';

const App = () => {
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [depthMap, setDepthMap] = useState(null);
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('Original');
  const [imageHistory, setImageHistory] = useState([]);
  const [normalized, setNormalized] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleImageUpload = async (file, url) => {
    setIsConverting(true);
    setError(null);
    setImageFile(file);
    try {
      const depthMap = await generateDepthMap(url);
      setImageUrl(url);
      setDepthMap(depthMap);
      setImageHistory((prevHistory) => [...prevHistory, { file, depthMap }]);
    } catch (error) {
      console.error("Error in handleImageUpload:", error);
      setError(error.message);
    }
    setIsConverting(false);
  };

  const handleThumbnailClick = (image) => {
    setImageFile(image.file);
    setImageUrl(image.url);
    setDepthMap(image.depthMap);
  };

  const handleSignIn = () => {
    setIsAuthenticated(true);
  };

  const handleSignOut = () => {
    setIsAuthenticated(false);
  };

  return (
    <Container>
      {isAuthenticated ? (
        <>
          <FileUpload onUpload={handleImageUpload} />
          {isConverting && <LoadingBar />}
          {error && <p>Error: {error}</p>}
          {imageFile && (
            <>
              <ControlPanel>
                <button onClick={() => setViewMode('Original')}>Original</button>
                {depthMap && (
                  <>
                    <button onClick={() => setViewMode('3D')}>3D View</button>
                    <button onClick={() => setViewMode('Stereo')}>Stereo View</button>
                    <button onClick={() => setViewMode('Depth Map')}>Depth Map View</button>
                    <button onClick={() => setNormalized(!normalized)}>
                      {normalized ? 'Show Raw Depth Map' : 'Show Normalized Depth Map'}
                    </button>
                  </>
                )}
              </ControlPanel>
              {viewMode === 'Original' && (
                <ImageContainer>
                  <img src={imageUrl} alt="Original" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </ImageContainer>
              )}
              {viewMode === '3D' && <ThreeDImage imageFile={imageFile} depthMap={depthMap} />}
              {viewMode === 'Stereo' && <StereoImage imageFile={imageFile} imageURL={imageUrl} depthMap={depthMap} />}
              {viewMode === 'Depth Map' && <DepthMapView depthMap={depthMap} normalized={normalized} />}
            </>
          )}
          <ImageList>
            {imageHistory.map((image, index) => (
              <Thumbnail key={index} src={URL.createObjectURL(image.file)} alt={`Thumbnail ${index}`} onClick={() => handleThumbnailClick(image)} />
            ))}
          </ImageList>
        </>
      ) : (
        <>
          <SignIn onSignIn={handleSignIn} />
          <SignUp onSignUp={handleSignIn} />
        </>
      )}
    </Container>
  );
};

export default App;
