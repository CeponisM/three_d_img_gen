import styled, { keyframes } from 'styled-components';

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;
  box-sizing: border-box;
  background-color: #f0f0f0;
  animation: ${fadeIn} 0.5s ease-in-out;
`;

export const UploadContainer = styled.div`
  margin-bottom: 20px;
`;

export const ImageContainer = styled.div`
  width: 100%;
  max-width: 800px;
  height: 600px;
  border: 1px solid #ccc;
  border-radius: 10px;
  overflow: hidden;
  position: relative;
  background-color: #fff;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

export const LoadingBar = styled.div`
  width: 100%;
  height: 4px;
  background-color: #ccc;
  position: absolute;
  bottom: 0;
  left: 0;

  &::after {
    content: '';
    display: block;
    height: 100%;
    background-color: #007bff;
    animation: loading 2s infinite;
  }

  @keyframes loading {
    from {
      width: 0;
    }
    to {
      width: 100%;
    }
  }
`;

export const ControlPanel = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 20px;

  button {
    background-color: #007bff;
    color: white;
    border: none;
    padding: 10px 20px;
    margin: 0 5px;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s;

    &:hover {
      background-color: #0056b3;
    }
  }
`;

export const ImageList = styled.div`
  position: absolute;
  right: 10px;
  top: 50px;
  width: 150px;
  height: 80%;
  overflow-y: auto;
  border: 1px solid #ccc;
  border-radius: 10px;
  background-color: #fff;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  padding: 10px;
`;

export const Thumbnail = styled.img`
  width: 100%;
  margin-bottom: 10px;
  cursor: pointer;
  border: 2px solid transparent;

  &:hover {
    border-color: #007bff;
  }
`;