// src/components/DiseaseDetection.jsx
import React, { useState } from 'react';

const DiseaseDetection = ({ onAnalyze, isLoading }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedImageUrl, setSelectedImageUrl] = useState(null);
  const [selectedCrop, setSelectedCrop] = useState('');
  const [selectedSME, setSelectedSME] = useState('');
  const [analyzeEnabled, setAnalyzeEnabled] = useState(false);

  // Hardcoded crop options (since backend doesn't have /available-crops endpoint)
  const availableCrops = [
    'Mango'
  ];

  // Hardcoded SME options (since backend doesn't have /available-smes endpoint)
  const availableSMEs = [
    'Dr. Plant Pathologist',
    'Dr. Crop Expert',
    'Agricultural Specialist'
  ];

  const handleCropChange = (event) => {
    const newCrop = event.target.value;
    setSelectedCrop(newCrop);
    updateAnalyzeEnabled(selectedFile, newCrop);
  };

  const handleSMEChange = (event) => {
    setSelectedSME(event.target.value);
  };

  const updateAnalyzeEnabled = (file, crop) => {
    setAnalyzeEnabled(file && crop);
  };

  const handleImageSelection = (event) => {
    const file = event.target.files[0];
    
    if (!file) {
      setSelectedFile(null);
      setSelectedImageUrl(null);
      setAnalyzeEnabled(false);
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      alert('Image size should be less than 10MB.');
      return;
    }

    setSelectedFile(file);
    setSelectedImageUrl(URL.createObjectURL(file));
    updateAnalyzeEnabled(file, selectedCrop);
    console.log('Image selected for upload');
  };

  const analyzeImage = async () => {
    if (!selectedFile) {
      alert('Please select an image first.');
      return;
    }
    
    if (!selectedCrop) {
      alert('Please select a crop before analyzing.');
      return;
    }

    try {
      // Convert file to base64 for the onAnalyze callback
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64Data = e.target.result.split(',')[1];
        
        const requestData = {
          inputType: 'image',
          content: base64Data,
          cropType: selectedCrop,
          smeAdvisor: selectedSME || null,
          file: selectedFile // Include the actual file for FormData
        };
        
        await onAnalyze(requestData);
      };
      
      reader.readAsDataURL(selectedFile);

    } catch (error) {
      console.error('Error during image analysis:', error);
      alert('An error occurred during analysis. Please try again.');
    }
  };

  const clearImage = () => {
    setSelectedFile(null);
    setSelectedImageUrl(null);
    setAnalyzeEnabled(false);
  };

  const isAnalyzeButtonDisabled = !analyzeEnabled || isLoading;

  return (
    <div style={{ 
      background: 'white', 
      padding: '30px', 
      borderRadius: '15px', 
      boxShadow: '0 10px 30px rgba(0,0,0,0.1)', 
      marginBottom: '30px' 
    }}>
      <div style={{ marginBottom: '30px', textAlign: 'center' }}>
        <h2 style={{ color: '#4a7c59', marginBottom: '10px', fontSize: '1.8rem' }}>
          Crop Disease Detection
        </h2>
        <p style={{ color: '#666', fontSize: '1rem', margin: 0 }}>
          Select your crop and upload an image to get an instant diagnosis
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
        
        {/* Crop Selection */}
        <div>
          <label htmlFor="cropSelect" style={{ 
            display: 'block',
            color: '#4a7c59', 
            fontWeight: '600', 
            marginBottom: '10px',
            fontSize: '1.1rem'
          }}>
            1. Select Your Crop *
          </label>
          <select
            id="cropSelect"
            value={selectedCrop}
            onChange={handleCropChange}
            style={{
              width: '100%',
              padding: '15px',
              border: '2px solid #e0e0e0',
              borderRadius: '10px',
              fontSize: '1rem',
              fontFamily: 'inherit',
              backgroundColor: 'white',
              cursor: 'pointer',
              boxSizing: 'border-box'
            }}
          >
            <option value="" disabled>-- Choose a crop --</option>
            {availableCrops.map(cropName => (
              <option key={cropName} value={cropName}>
                {cropName.charAt(0).toUpperCase() + cropName.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* SME Selection (Optional) */}
        <div>
          <label htmlFor="smeSelect" style={{ 
            display: 'block',
            color: '#4a7c59', 
            fontWeight: '600', 
            marginBottom: '10px',
            fontSize: '1.1rem'
          }}>
            2. Select SME Advisor (Optional)
          </label>
          <select
            id="smeSelect"
            value={selectedSME}
            onChange={handleSMEChange}
            style={{
              width: '100%',
              padding: '15px',
              border: '2px solid #e0e0e0',
              borderRadius: '10px',
              fontSize: '1rem',
              fontFamily: 'inherit',
              backgroundColor: 'white',
              cursor: 'pointer',
              boxSizing: 'border-box'
            }}
          >
            <option value="">-- No specific advisor --</option>
            {availableSMEs.map((sme, index) => (
              <option key={index} value={sme}>
                {sme}
              </option>
            ))}
          </select>
        </div>

        {/* Image Upload Section */}
        <div style={{ 
          border: selectedImageUrl ? '2px solid #4a7c59' : '2px dashed #cbd5e0',
          borderRadius: '15px',
          padding: '30px',
          textAlign: 'center',
          background: selectedImageUrl ? '#f0fdf4' : '#fafafa',
          transition: 'all 0.3s ease',
          position: 'relative',
          opacity: selectedCrop ? 1 : 0.5,
          pointerEvents: selectedCrop ? 'auto' : 'none'
        }}>
          {!selectedImageUrl ? (
            <div>
              <div style={{ fontSize: '3rem', marginBottom: '15px' }}>📸</div>
              <h3 style={{ color: '#4a7c59', marginBottom: '10px', fontSize: '1.2rem' }}>
                3. Upload Crop Image *
              </h3>
              <p style={{ color: '#666', marginBottom: '20px', fontSize: '0.9rem' }}>
                {selectedCrop 
                  ? `Take a clear photo of your ${selectedCrop} for accurate diagnosis`
                  : 'Please select a crop first'
                }
              </p>
              <label 
                htmlFor="imageInput" 
                style={{
                  display: 'inline-block',
                  padding: '12px 30px',
                  border: 'none',
                  borderRadius: '10px',
                  background: '#4a7c59',
                  color: 'white',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  textDecoration: 'none'
                }}
              >
                Choose Image
                <input
                  id="imageInput"
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelection}
                  style={{ display: 'none' }}
                />
              </label>
              <p style={{ color: '#999', fontSize: '0.8rem', marginTop: '15px' }}>
                Supports JPG, PNG, WEBP • Max 10MB
              </p>
            </div>
          ) : (
            <div>
              <div style={{ 
                background: 'white',
                borderRadius: '10px', 
                overflow: 'hidden',
                marginBottom: '15px',
                boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
              }}>
                <img
                  src={selectedImageUrl}
                  alt="Selected crop"
                  style={{ 
                    width: '100%', 
                    maxHeight: '300px', 
                    objectFit: 'contain',
                    display: 'block'
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <label 
                  htmlFor="imageInput" 
                  style={{
                    display: 'inline-block',
                    padding: '8px 20px',
                    border: '2px solid #4a7c59',
                    borderRadius: '8px',
                    background: 'white',
                    color: '#4a7c59',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  Change Image
                  <input
                    id="imageInput"
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelection}
                    style={{ display: 'none' }}
                  />
                </label>
                <button
                  onClick={clearImage}
                  style={{
                    padding: '8px 20px',
                    border: '2px solid #dc3545',
                    borderRadius: '8px',
                    background: 'white',
                    color: '#dc3545',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  Remove
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Analyze Button */}
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={analyzeImage}
            disabled={isAnalyzeButtonDisabled}
            style={{
              padding: '15px 40px',
              border: 'none',
              borderRadius: '10px',
              fontSize: '1.2rem',
              fontWeight: '600',
              cursor: isAnalyzeButtonDisabled ? 'not-allowed' : 'pointer',
              background: isAnalyzeButtonDisabled ? '#ccc' : '#28a745',
              color: 'white',
              opacity: isAnalyzeButtonDisabled ? 0.6 : 1,
              transition: 'all 0.3s ease',
              minWidth: '250px'
            }}
          >
            {isLoading ? '🔄 Analyzing...' : '🔍 Analyze Crop Disease'}
          </button>
          
          {(!selectedCrop || !selectedFile) && (
            <p style={{ color: '#999', fontSize: '0.9rem', marginTop: '10px' }}>
              {!selectedCrop 
                ? 'Please select a crop to begin' 
                : 'Please upload an image to start analysis'
              }
            </p>
          )}
        </div>

        {/* Tips Section */}
        <div style={{ 
          background: '#e3f2fd', 
          border: '1px solid #bbdefb', 
          borderRadius: '10px', 
          padding: '20px',
          marginTop: '20px'
        }}>
          <h4 style={{ color: '#1976d2', marginBottom: '15px', fontSize: '1.1rem' }}>
            📋 Tips for Better Results:
          </h4>
          <ul style={{ paddingLeft: '20px', margin: 0, color: '#1565c0' }}>
            <li style={{ marginBottom: '8px' }}>Take photos in good lighting conditions</li>
            <li style={{ marginBottom: '8px' }}>Focus on affected areas (leaves, fruits, stems)</li>
            <li style={{ marginBottom: '8px' }}>Avoid blurry or very dark images</li>
            <li style={{ marginBottom: '8px' }}>Include multiple symptoms if visible</li>
            <li>Choose the correct crop type for accurate results</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DiseaseDetection;