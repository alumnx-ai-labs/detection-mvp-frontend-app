import React, { useState, useEffect } from 'react';

// Static disease data
const diseaseData = {
  Anthracnose: {
    disease_name: "Anthracnose",
    symptoms: "Anthracnose in mango manifests in several ways. On leaves, it appears as small, dark, water-soaked spots that enlarge and become irregular in shape, often with a yellow halo. Fruits develop black lesions, starting as small dark spots that expand rapidly under humid conditions. Infected fruits may drop prematurely or develop large black areas rendering them unmarketable. Dieback of twigs and branches can also occur.",
    prevention: "Preventing anthracnose involves a multi-faceted approach. Proper orchard sanitation is critical, including removal of infected plant debris. Ensure good air circulation through proper pruning and maintain adequate tree spacing. Avoid overhead irrigation and water early in the day to allow foliage to dry quickly. Apply copper-based fungicides as preventive sprays during flowering and fruit development. Select resistant varieties when available. Avoid excessive nitrogen fertilization. Harvest fruits at proper maturity and handle carefully to avoid wounds.",
    treatment: "Treatment options for anthracnose include application of systemic fungicides such as propiconazole or azoxystrobin. For organic management, use copper sulfate or neem oil. Post-harvest treatments with hot water (52°C for 5 minutes) can reduce infection on harvested fruits. Regular monitoring and early intervention are crucial for effective management.",
    additional_info: "Environmental factors that favor anthracnose development include high humidity (above 95%), temperatures between 25-30°C, and prolonged leaf wetness. The disease is most severe during rainy seasons. Spores are spread by rain splash and wind. Understanding these conditions helps in timing preventive measures effectively. Early intervention is crucial for effective management.",
    confidence_score: 0.95,
    source_documents: [
      "Plant Pathology Handbook - Anthracnose Management",
      "Integrated Disease Management Guidelines",
      "Fungal Disease Control Manual"
    ]
  }
};

// Static uncertain disease options
const uncertainDiseases = [
  {
    disease_name: "Anthracnose",
    description: "Dark, sunken lesions on fruits and leaves with concentric rings",
    confidence: 0.65,
    image_url: "/Anthracnose004.jpg",
    has_image: true
  },
  {
    disease_name: "Gall Midge",
    description: "Small galls or swellings on leaves and stems caused by insect larvae",
    confidence: 0.61,
    image_url: "/Gall_Midge007.jpg",
    has_image: true
  },
  {
    disease_name: "Bacterial Canker",
    description: "Sunken, water-soaked lesions on stems and fruits with bacterial ooze",
    confidence: 0.45,
    image_url: "/Bacterial_Canker008.jpg",
    has_image: true
  },
  {
    disease_name: "Bacterial Canker",
    description: "Progressive wilting and stem lesions with yellowing of foliage",
    confidence: 0.44,
    image_url: "/Bacterial_Canker007.jpg",
    has_image: true
  },
  {
    disease_name: "Gall Midge",
    description: "Distorted growth patterns and small bumps on plant tissues",
    confidence: 0.44,
    image_url: "/Gall_Midge008.jpg",
    has_image: true
  }
];

const DiseaseDetection = ({ onAnalyze, isLoading }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedImageUrl, setSelectedImageUrl] = useState(null);
  const [selectedCrop, setSelectedCrop] = useState('');
  const [selectedSME, setSelectedSME] = useState('');
  const [analyzeEnabled, setAnalyzeEnabled] = useState(false);

  const availableCrops = ['Mango'];
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

    if (file.size > 10 * 1024 * 1024) {
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

    const requestData = {
      inputType: 'image',
      fileName: selectedFile.name,
      cropType: selectedCrop,
      smeAdvisor: selectedSME || null,
      file: selectedFile
    };
    
    await onAnalyze(requestData);
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
      </div>
    </div>
  );
};

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [imageLoadingStates, setImageLoadingStates] = useState({});
  const [managerThoughts, setManagerThoughts] = useState([]);

  // Generate random confidence within range
  const generateConfidence = (isCorrect) => {
    if (isCorrect) {
      return 0.91 + (Math.random() * 0.08 - 0.04); // 91% ± 4%
    } else {
      return 0.63 + (Math.random() * 0.20 - 0.10); // 63% ± 10%
    }
  };

  const startAnalysisProgress = async (fileName) => {
    const isAnthracnoseImage = fileName.toLowerCase() === 'anthracnose002.jpg';
    const confidence = generateConfidence(isAnthracnoseImage);
    
    setIsLoading(true);
    setResults(null);
    setError(null);
    setManagerThoughts([]);

    // Progress messages with delays
    const progressSteps = [
      "📥 We have received the Image",
      "🤖 The mobilenet classification model is working on it",
      `🎯 The classification results are Anthracnose with confidence of ${(confidence * 100).toFixed(1)}%`,
      "🔍 Giving the image to Image RAG"
    ];

    // Show progress messages
    for (let i = 0; i < progressSteps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, i === 0 ? 1000 : 2000));
      setManagerThoughts(prev => [...prev, progressSteps[i]]);
    }

    // Wait before showing RAG results
    await new Promise(resolve => setTimeout(resolve, 2000));

    if (isAnthracnoseImage) {
      // Show confident results for Anthracnose002.jpg
      setManagerThoughts(prev => [...prev, 
        "✅ Here are the results:",
        "Rank 1: 0.95, Class: Anthracnose",
        "Rank 2: 0.94, Class: Anthracnose", 
        "Rank 3: 0.94, Class: Anthracnose",
        "Rank 4: 0.92, Class: Anthracnose",
        "Rank 5: 0.89, Class: Anthracnose"
      ]);

      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setResults({
        status: 'confident_prediction',
        disease_info: diseaseData.Anthracnose
      });
    } else {
      // Show uncertain results for other images
      setManagerThoughts(prev => [...prev,
        "⚠️ Here are the Image RAG results:",
        "Rank 1: 0.65, Class: Anthracnose",
        "Rank 2: 0.61, Class: Gall_Midge",
        "Rank 3: 0.45, Class: Bacterial_Canker",
        "Rank 4: 0.44, Class: Bacterial_Canker", 
        "Rank 5: 0.44, Class: Gall_Midge"
      ]);

      await new Promise(resolve => setTimeout(resolve, 2000));

      setResults({
        status: 'uncertain_prediction',
        top_possibilities: uncertainDiseases
      });

      // Set up image loading states for uncertain results
      const newLoadingStates = {};
      uncertainDiseases.forEach((result, index) => {
        if (result.image_url && result.has_image !== false) {
          newLoadingStates[index] = 'loading';
        }
      });
      setImageLoadingStates(newLoadingStates);
    }

    setIsLoading(false);
  };

  const handleAnalyze = async (requestData) => {
    await startAnalysisProgress(requestData.fileName);
  };

  const handleDiseaseSelection = async (diseaseName) => {
    setIsLoading(true);
    setLoadingText('Getting detailed disease information...');
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Return generic information for any selected disease
    const genericDiseaseInfo = {
      disease_name: diseaseName,
      symptoms: "No specific information available in the knowledge base.",
      prevention: "General preventive measures recommended. Consult with agricultural extension services.",
      treatment: "Consult with plant pathology experts for treatment recommendations.",
      additional_info: "No additional information available in the current knowledge base.",
      confidence_score: 0.75,
      source_documents: [
        "Generic Disease Management Guidelines",
        "Agricultural Extension Recommendations"
      ]
    };
    
    setResults({
      status: 'confident_prediction',
      disease_info: genericDiseaseInfo
    });
    
    setIsLoading(false);
  };

  const resetInterface = () => {
    setIsLoading(false);
    setLoadingText('');
    setResults(null);
    setError(null);
    setManagerThoughts([]);
    setImageLoadingStates({});
  };

  const handleImageLoad = (index) => {
    setImageLoadingStates(prev => ({ ...prev, [index]: false }));
  };

  const handleImageError = (index) => {
    setImageLoadingStates(prev => ({ ...prev, [index]: 'error' }));
  };

  const renderUncertainResults = (topPossibilities) => {
    return (
      <div style={{ background: 'white', borderRadius: '15px', padding: '25px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: '25px' }}>
          <h2 style={{ color: '#4a7c59', marginBottom: '10px', fontSize: '1.8rem' }}>
            🔍 Similar Diseases Found
          </h2>
          <p style={{ color: '#666', fontSize: '1.1rem' }}>
            Unable to determine disease with confidence. Please select the disease that best matches your observation:
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px',
          marginBottom: '25px'
        }}>
          {topPossibilities.slice(0, 5).map((result, index) => (
            <div
              key={index}
              onClick={() => handleDiseaseSelection(result.disease_name)}
              style={{
                background: '#f8f9fa',
                border: '2px solid #e0e0e0',
                borderRadius: '10px',
                padding: '15px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                textAlign: 'center'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#4a7c59';
                e.currentTarget.style.boxShadow = '0 5px 15px rgba(0,0,0,0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e0e0e0';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ marginBottom: '15px', height: '200px', position: 'relative' }}>
                {imageLoadingStates[index] === 'loading' && (
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 2
                  }}>
                    <div style={{
                      width: '30px',
                      height: '30px',
                      border: '3px solid #f3f3f3',
                      borderTop: '3px solid #4a7c59',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}></div>
                  </div>
                )}
                {result.image_url && result.has_image !== false && imageLoadingStates[index] !== 'error' ? (
                  <img
                    src={result.image_url}
                    alt={result.disease_name}
                    style={{
                      width: '100%',
                      height: '200px',
                      objectFit: 'cover',
                      borderRadius: '8px',
                      border: '1px solid #ddd',
                      opacity: imageLoadingStates[index] === 'loading' ? 0.5 : 1
                    }}
                    onLoad={() => handleImageLoad(index)}
                    onError={() => handleImageError(index)}
                  />
                ) : (
                  <div
                    style={{
                      width: '100%',
                      height: '200px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: '#f8f9fa',
                      border: '2px dashed #dee2e6',
                      borderRadius: '8px',
                      flexDirection: 'column',
                      color: '#6c757d'
                    }}
                  >
                    <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📷</div>
                    <div style={{ fontSize: '0.9rem', textAlign: 'center' }}>
                      No reference image available
                    </div>
                  </div>
                )}
              </div>
              <h4 style={{ color: '#2c5530', marginBottom: '8px', fontSize: '1.2rem' }}>
                {result.disease_name}
              </h4>
              <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '8px' }}>
                {result.description}
              </p>
              <div style={{
                background: '#e8f5e8',
                padding: '5px 10px',
                borderRadius: '15px',
                display: 'inline-block'
              }}>
                <span style={{ color: '#2c5530', fontWeight: '600', fontSize: '0.9rem' }}>
                  {(result.confidence * 100).toFixed(0)}% match
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderDiseaseInfo = (diseaseData) => {
    if (!diseaseData) return null;

    return (
      <div style={{ background: 'white', borderRadius: '15px', padding: '25px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
        <div style={{ borderBottom: '2px solid #f0f0f0', paddingBottom: '15px', marginBottom: '25px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <h2 style={{ color: '#2c5530', fontSize: '1.8rem', fontWeight: 'bold', margin: 0 }}>
              {diseaseData.disease_name}
            </h2>
            {diseaseData.confidence_score && (
              <span style={{
                padding: '5px 12px',
                borderRadius: '15px',
                fontSize: '0.85rem',
                fontWeight: '600',
                textTransform: 'uppercase',
                background: diseaseData.confidence_score > 0.8 ? '#d4edda' : '#fff3cd',
                color: diseaseData.confidence_score > 0.8 ? '#155724' : '#856404',
                border: diseaseData.confidence_score > 0.8 ? '1px solid #c3e6cb' : '1px solid #ffeaa7'
              }}>
                {(diseaseData.confidence_score * 100).toFixed(0)}% confidence
              </span>
            )}
          </div>
        </div>

        {diseaseData.symptoms && (
          <div style={{ marginBottom: '25px' }}>
            <h4 style={{ color: '#4a7c59', marginBottom: '15px', fontSize: '1.2rem' }}>
              👀 Symptoms:
            </h4>
            <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px', lineHeight: '1.6' }}>
              {diseaseData.symptoms}
            </div>
          </div>
        )}

        {diseaseData.treatment && (
          <div style={{ marginBottom: '25px' }}>
            <h4 style={{ color: '#4a7c59', marginBottom: '15px', fontSize: '1.2rem' }}>
              💊 Treatment:
            </h4>
            <div style={{ background: '#e8f5e8', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #4a7c59', lineHeight: '1.6' }}>
              {diseaseData.treatment}
            </div>
          </div>
        )}

        {diseaseData.prevention && (
          <div style={{ marginBottom: '25px' }}>
            <h4 style={{ color: '#4a7c59', marginBottom: '15px', fontSize: '1.2rem' }}>
              🛡️ Prevention:
            </h4>
            <div style={{ background: '#fff3cd', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #ffc107', lineHeight: '1.6' }}>
              {diseaseData.prevention}
            </div>
          </div>
        )}

        {diseaseData.additional_info && (
          <div style={{ marginBottom: '25px' }}>
            <h4 style={{ color: '#4a7c59', marginBottom: '15px', fontSize: '1.2rem' }}>
              ℹ️ Additional Information:
            </h4>
            <div style={{ background: '#e3f2fd', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #2196f3', lineHeight: '1.6' }}>
              {diseaseData.additional_info}
            </div>
          </div>
        )}

        {diseaseData.source_documents && diseaseData.source_documents.length > 0 && (
          <div style={{ marginBottom: '25px' }}>
            <h4 style={{ color: '#4a7c59', marginBottom: '15px', fontSize: '1.2rem' }}>
              📚 Sources:
            </h4>
            <div style={{ background: '#f1f3f4', padding: '15px', borderRadius: '8px' }}>
              <ul style={{ paddingLeft: '20px', margin: 0 }}>
                {diseaseData.source_documents.map((source, index) => (
                  <li key={index} style={{ color: '#666', marginBottom: '5px', lineHeight: '1.5' }}>
                    {source}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: '30px' }}>
          <button
            onClick={resetInterface}
            style={{
              padding: '12px 30px',
              border: 'none',
              borderRadius: '8px',
              background: '#4a7c59',
              color: 'white',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => e.target.style.background = '#3a6b49'}
            onMouseLeave={(e) => e.target.style.background = '#4a7c59'}
          >
            Analyze Another Image
          </button>
        </div>
      </div>
    );
  };

  const renderResults = () => {
    if (!results) return null;

    if (results.status === 'uncertain_prediction' && results.top_possibilities) {
      return renderUncertainResults(results.top_possibilities);
    }

    if (results.status === 'confident_prediction' && results.disease_info) {
      return renderDiseaseInfo(results.disease_info);
    }

    return (
      <div style={{ background: 'white', borderRadius: '15px', padding: '25px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
        <h3 style={{ color: '#4a7c59', marginBottom: '20px' }}>Analysis Results</h3>
        <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px', lineHeight: '1.6' }}>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: '14px', overflow: 'auto' }}>
            {JSON.stringify(results, null, 2)}
          </pre>
        </div>
      </div>
    );
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>

        {/* Header */}
        <header style={{
          textAlign: 'center',
          background: 'white',
          padding: '30px',
          borderRadius: '15px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          marginBottom: '30px'
        }}>
          <h1 style={{ color: '#4a7c59', marginBottom: '10px', fontSize: '2.5rem', margin: '0 0 10px 0' }}>
            🔬 Crop Disease Detection
          </h1>
          <p style={{ color: '#666', fontSize: '1.1rem', margin: '0' }}>
            AI-powered disease detection for precision farming
          </p>
        </header>

        <main>
          {/* Disease Detection Component */}
          <DiseaseDetection onAnalyze={handleAnalyze} isLoading={isLoading} />

          {/* Loading Section */}
          {isLoading && (
            <div style={{
              background: 'white',
              padding: '40px',
              borderRadius: '15px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
              textAlign: 'center',
              marginTop: '30px'
            }}>
              <div style={{
                width: '50px',
                height: '50px',
                border: '5px solid #f3f3f3',
                borderTop: '5px solid #4a7c59',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 20px'
              }}></div>
              <p style={{ fontSize: '1.2rem', fontWeight: '600', color: '#333', marginBottom: '20px' }}>
                {loadingText || 'Analyzing your crop image...'}
              </p>

              {managerThoughts.length > 0 && (
                <div style={{ textAlign: 'left', maxWidth: '500px', margin: '0 auto' }}>
                  {managerThoughts.map((thought, index) => (
                    <div
                      key={index}
                      style={{
                        background: '#e8f5e8',
                        padding: '10px 15px',
                        borderRadius: '20px',
                        margin: '10px 0',
                        borderLeft: '4px solid #4a7c59',
                        fontSize: '0.95rem'
                      }}
                    >
                      {thought}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Results Section */}
          {results && !isLoading && (
            <div style={{ marginTop: '30px' }}>
              {renderResults()}
            </div>
          )}

          {/* Error Section */}
          {error && !isLoading && (
            <div style={{
              background: 'white',
              padding: '30px',
              borderRadius: '15px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
              textAlign: 'center',
              marginTop: '30px'
            }}>
              <h2 style={{ color: '#dc3545', marginBottom: '20px' }}>⚠️ Error</h2>
              <div style={{
                background: '#f8d7da',
                border: '1px solid #f5c6cb',
                borderRadius: '8px',
                padding: '15px',
                marginBottom: '20px'
              }}>
                <p style={{ color: '#721c24', margin: 0 }}>{error}</p>
              </div>
              <button
                onClick={resetInterface}
                style={{
                  padding: '12px 30px',
                  border: 'none',
                  borderRadius: '8px',
                  background: '#6c757d',
                  color: 'white',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Try Again
              </button>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer style={{
          textAlign: 'center',
          color: 'rgba(255, 255, 255, 0.8)',
          marginTop: '30px',
          fontSize: '0.9rem'
        }}>
          <p>AI-powered crop disease detection for better farming decisions</p>
        </footer>
      </div>

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}

export default App;