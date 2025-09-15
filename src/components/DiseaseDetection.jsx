// src/components/DiseaseDetection.jsx
import React, { useState, useCallback, useEffect } from 'react';

const DiseaseDetection = ({ onAnalyze, isLoading }) => {
  const [selectedImageData, setSelectedImageData] = useState(null);
  const [selectedImageUrl, setSelectedImageUrl] = useState(null);
  const [selectedCrop, setSelectedCrop] = useState('');
  const [selectedSME, setSelectedSME] = useState('');
  const [textDescription, setTextDescription] = useState('');
  const [analyzeEnabled, setAnalyzeEnabled] = useState(false);
  
  // Available options (these would typically come from API endpoints)
  const [availableCrops, setAvailableCrops] = useState([]);
  const [availableSMEs, setAvailableSMEs] = useState([]);
  
  // Teachable Machine integration states
  const [model, setModel] = useState(null);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [predictions, setPredictions] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // API Configuration
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://your-ec2-server:8000';

  // Hardcoded Teachable Machine models for different crops
  const CROP_MODELS = {
    'tomato': {
      url: 'https://teachablemachine.withgoogle.com/models/ufKan6pzm/'
    },
    'potato': {
      url: 'https://teachablemachine.withgoogle.com/models/6UdJBojDI/'
    },
    'mango': {
      url: 'https://teachablemachine.withgoogle.com/models/ufKan6pzm/'
    },
    'sweet_lime': {
      url: 'https://teachablemachine.withgoogle.com/models/6UdJBojDI/'
    },
    'wheat': {
      url: 'https://teachablemachine.withgoogle.com/models/ufKan6pzm/'
    },
    'rice': {
      url: 'https://teachablemachine.withgoogle.com/models/6UdJBojDI/'
    }
  };

  // Load available crops and SMEs on component mount
  useEffect(() => {
    loadAvailableOptions();
  }, []);

  const loadAvailableOptions = async () => {
    try {
      // Load available crops
      const cropsResponse = await fetch(`${API_BASE_URL}/available-crops`);
      if (cropsResponse.ok) {
        const crops = await cropsResponse.json();
        setAvailableCrops(crops);
      } else {
        // Fallback to hardcoded options
        setAvailableCrops(['tomato', 'potato', 'mango', 'sweet_lime', 'wheat', 'rice']);
      }

      // Load available SMEs
      const smesResponse = await fetch(`${API_BASE_URL}/available-smes`);
      if (smesResponse.ok) {
        const smes = await smesResponse.json();
        setAvailableSMEs(smes);
      } else {
        // Fallback to hardcoded options
        setAvailableSMEs(['Dr. Smith - Plant Pathologist', 'Dr. Johnson - Crop Expert', null]);
      }
    } catch (error) {
      console.error('Error loading available options:', error);
      // Use fallback options
      setAvailableCrops(['tomato', 'potato', 'mango', 'sweet_lime', 'wheat', 'rice']);
      setAvailableSMEs(['Dr. Smith - Plant Pathologist', 'Dr. Johnson - Crop Expert', null]);
    }
  };

  // Load Teachable Machine model based on selectedCrop
  const loadDiseaseModel = useCallback(async () => {
    if (model || !selectedCrop || !CROP_MODELS[selectedCrop]) return model;
    
    setIsModelLoading(true);
    try {
      if (!window.tmImage) {
        throw new Error('Teachable Machine library not loaded. Please include the script in your HTML.');
      }

      const modelBaseURL = CROP_MODELS[selectedCrop].url;
      const modelURL = modelBaseURL + "model.json";
      const metadataURL = modelBaseURL + "metadata.json";

      console.log(`Loading ${selectedCrop} disease detection model from:`, modelURL);
      const loadedModel = await window.tmImage.load(modelURL, metadataURL);
      setModel(loadedModel);
      console.log(`Model loaded successfully for ${selectedCrop}`);
      return loadedModel;
    } catch (error) {
      console.error(`Error loading ${selectedCrop} disease detection model:`, error);
      return null;
    } finally {
      setIsModelLoading(false);
    }
  }, [model, selectedCrop]);

  const handleCropChange = (event) => {
    const newCrop = event.target.value;
    setSelectedCrop(newCrop);
    // Reset model and predictions when crop changes
    setModel(null);
    setPredictions(null);
    updateAnalyzeEnabled(selectedImageData, newCrop);
  };

  const handleSMEChange = (event) => {
    setSelectedSME(event.target.value);
  };

  const updateAnalyzeEnabled = (imageData, crop) => {
    setAnalyzeEnabled(imageData && crop);
  };

  const handleImageSelection = (event) => {
    const file = event.target.files[0];
    
    if (!file) {
      setSelectedImageData(null);
      setSelectedImageUrl(null);
      setAnalyzeEnabled(false);
      setPredictions(null);
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

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64Data = e.target.result.split(',')[1];
      setSelectedImageData(base64Data);
      setSelectedImageUrl(URL.createObjectURL(file));
      updateAnalyzeEnabled(base64Data, selectedCrop);
      setPredictions(null);
      console.log('Image selected and converted to base64');
    };

    reader.onerror = () => {
      alert('Error reading image file.');
      setSelectedImageData(null);
      setSelectedImageUrl(null);
      setAnalyzeEnabled(false);
      setPredictions(null);
    };

    reader.readAsDataURL(file);
  };

  const classifyDiseaseImage = async (imageElement, loadedModel) => {
    try {
      const predictions = await loadedModel.predict(imageElement);
      return predictions.map(pred => ({
        className: pred.className,
        probability: pred.probability
      }));
    } catch (error) {
      console.error('Error classifying disease image:', error);
      return null;
    }
  };

  const analyzeImage = async () => {
    if (!selectedImageData || !selectedImageUrl) {
      alert('Please select an image first.');
      return;
    }
    
    if (!selectedCrop) {
      alert('Please select a crop before analyzing.');
      return;
    }

    setIsAnalyzing(true);

    try {
      // Try to load and run Teachable Machine model for immediate feedback
      let tmPredictions = null;
      if (CROP_MODELS[selectedCrop]) {
        const loadedModel = await loadDiseaseModel();
        if (loadedModel) {
          const img = new Image();
          img.crossOrigin = 'anonymous';

          tmPredictions = await new Promise((resolve) => {
            img.onload = async () => {
              try {
                const result = await classifyDiseaseImage(img, loadedModel);
                resolve(result);
              } catch (error) {
                console.error('TM classification error:', error);
                resolve(null);
              }
            };
            
            img.onerror = () => resolve(null);
            img.src = selectedImageUrl;
          });

          if (tmPredictions) {
            const sortedPredictions = tmPredictions.sort((a, b) => b.probability - a.probability);
            setPredictions(sortedPredictions);
            console.log('Teachable Machine results:', sortedPredictions);
          }
        }
      }

      // Send to main API for comprehensive analysis
      if (onAnalyze) {
        const requestData = {
          inputType: 'image',
          content: selectedImageData,
          cropType: selectedCrop,
          smeAdvisor: selectedSME || null,
          textDescription: textDescription.trim(),
          tmPredictions: tmPredictions // Include TM predictions
        };
        
        await onAnalyze(requestData);
      }
    } catch (error) {
      console.error('Error during image analysis:', error);
      alert('An error occurred during analysis. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearImage = () => {
    setSelectedImageUrl(null);
    setSelectedImageData(null);
    setAnalyzeEnabled(false);
    setPredictions(null);
  };

  const isProcessing = isLoading || isModelLoading || isAnalyzing;
  const isAnalyzeButtonDisabled = !analyzeEnabled || isProcessing;

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
                {cropName.charAt(0).toUpperCase() + cropName.slice(1).replace('_', ' ')}
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
              <option key={index} value={sme || ''}>
                {sme || 'General Analysis'}
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

        {/* Text Description */}
        <div>
          <label style={{ 
            display: 'block',
            color: '#4a7c59', 
            fontWeight: '600', 
            marginBottom: '10px',
            fontSize: '1.1rem'
          }}>
            4. Additional Symptoms (Optional)
          </label>
          <textarea
            value={textDescription}
            onChange={(e) => setTextDescription(e.target.value)}
            placeholder="Describe any additional symptoms you notice (leaf spots, wilting, discoloration, etc.)..."
            style={{
              width: '100%',
              padding: '15px',
              border: '2px solid #e0e0e0',
              borderRadius: '10px',
              fontSize: '1rem',
              resize: 'vertical',
              minHeight: '100px',
              boxSizing: 'border-box',
              fontFamily: 'inherit'
            }}
          />
        </div>

        {/* Teachable Machine Results */}
        {predictions && (
          <div style={{ 
            background: '#f8f9fa', 
            border: '1px solid #dee2e6', 
            borderRadius: '10px', 
            padding: '20px' 
          }}>
            <h4 style={{ 
              color: '#4a7c59', 
              marginBottom: '15px', 
              fontSize: '1.2rem',
              fontWeight: '600',
            }}>
              🎯 Quick AI Prediction for {selectedCrop}
            </h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {predictions.slice(0, 3).map((prediction, index) => (
                <div 
                  key={index}
                  style={{
                    background: 'white',
                    padding: '15px',
                    borderRadius: '8px',
                    border: index === 0 ? '2px solid #28a745' : '1px solid #e0e0e0',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ 
                      fontWeight: index === 0 ? '700' : '600',
                      color: index === 0 ? '#28a745' : '#333',
                      fontSize: index === 0 ? '1.1rem' : '1rem'
                    }}>
                      {index === 0 && '🏆 '}{prediction.className}
                    </span>
                    <span style={{ 
                      fontWeight: '700',
                      color: index === 0 ? '#28a745' : '#666',
                    }}>
                      {(prediction.probability * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div style={{ 
                    background: '#f1f3f4', 
                    borderRadius: '10px', 
                    overflow: 'hidden',
                    height: '6px'
                  }}>
                    <div 
                      style={{ 
                        background: index === 0 ? '#28a745' : '#6c757d',
                        height: '100%',
                        width: `${prediction.probability * 100}%`,
                        transition: 'width 0.5s ease'
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <p style={{ 
              color: '#666', 
              fontSize: '0.9rem', 
              marginTop: '15px',
              fontStyle: 'italic',
              textAlign: 'center'
            }}>
              This is a preliminary AI analysis. Click "Get Detailed Analysis" for comprehensive expert diagnosis.
            </p>
          </div>
        )}

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
            {isModelLoading ? '⏳ Loading AI Model...' : 
             isAnalyzing ? '🔄 Analyzing Image...' : 
             predictions ? '🔬 Get Detailed Analysis' :
             '🔍 Analyze Crop Disease'}
          </button>
          
          {(!selectedCrop || !selectedImageUrl) && (
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
            <li>Describe additional observations in the text field</li>
          </ul>
        </div>

        {/* Model Status */}
        {isModelLoading && (
          <div style={{ 
            background: '#fff3cd', 
            border: '1px solid #ffeaa7', 
            borderRadius: '10px', 
            padding: '15px',
            textAlign: 'center'
          }}>
            <p style={{ color: '#856404', margin: 0, fontWeight: '600' }}>
              ⏳ Loading AI model for {selectedCrop}...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiseaseDetection;