import React from 'react';

const FileUpload = ({ onUpload }) => {
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      onUpload(file);
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} accept="image/*" />
    </div>
  );
};

export default FileUpload;
