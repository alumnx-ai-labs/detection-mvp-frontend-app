// src/App.jsx
import React, { useState, useEffect } from 'react';
import DiseaseDetection from './components/DiseaseDetection';

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [managerThoughts, setManagerThoughts] = useState([]);

  // API Configuration - Update this to your server URL
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://your-ec2-server:8000';

  useEffect(() => {
    checkHealth();
  }, []);

  const checkHealth = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      const health = await response.json();
      if (health.status === 'healthy') {
        console.log('✅ System healthy');
      } else {
        console.warn('⚠️ System health issues:', health);
      }
    } catch (error) {
      console.error('❌ Health check failed:', error);
    }
  };

  const getUserId = () => {
    let userId = localStorage.getItem('diseaseDetectionUserId');
    if (!userId) {
      userId = 'user_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('diseaseDetectionUserId', userId);
    }
    return userId;
  };

  const showLoading = (message = 'Analyzing your crop image...') => {
    setIsLoading(true);
    setLoadingText(message);
    setResults(null);
    setError(null);
    startDiseaseAnalysisThoughts();
  };

  const startDiseaseAnalysisThoughts = () => {
    const thoughts = [
      "🤔 Analyzing your crop image...",
      "🎯 Identifying potential diseases...",
      "🔬 Consulting disease detection specialist...",
      "✅ Analysis complete! Preparing response..."
    ];

    setManagerThoughts([]);
    thoughts.forEach((thought, index) => {
      setTimeout(() => {
        setManagerThoughts(prev => [...prev, thought]);
      }, index * 2000);
    });
  };

  const handleAnalyze = async (requestData) => {
    showLoading('Analyzing disease in your crop image...');

    try {
      console.log('📤 Sending disease analysis request...');

      let endpoint, payload;

      if (requestData.inputType === 'image') {
        // Initial disease analysis
        endpoint = `${API_BASE_URL}/analyze-disease`;
        payload = {
          image_data: requestData.content,
          crop_type: requestData.cropType,
          sme_advisor: requestData.smeAdvisor || null
        };
      } else if (requestData.inputType === 'disease_selection') {
        // User selected a disease from uncertain results
        endpoint = `${API_BASE_URL}/get-disease-info`;
        payload = {
          disease_name: requestData.selectedDisease,
          crop_type: requestData.cropType,
          sme_advisor: requestData.smeAdvisor || null
        };
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (response.ok) {
        console.log('✅ Analysis successful:', result);
        setResults(result);
      } else {
        console.error('❌ Analysis failed:', result);
        setError(result.error_message || result.error || 'Analysis failed');
      }
    } catch (error) {
      console.error('❌ Request failed:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetInterface = () => {
    setIsLoading(false);
    setLoadingText('');
    setResults(null);
    setError(null);
    setManagerThoughts([]);
  };

  const renderResults = () => {
    if (!results) return null;

    // Handle uncertain diagnosis - show similar images for user selection
    if (results.workflow_status === 'UNCERTAIN' && results.image_rag_results) {
      return renderUncertainResults(results.image_rag_results);
    }

    // Handle confident diagnosis or user-selected disease info
    if (results.text_rag_results || results.disease_name) {
      return renderDiseaseInfo(results.text_rag_results || results);
    }

    // Handle error status
    if (results.workflow_status === 'ERROR') {
      setError(results.error_message || 'An error occurred during analysis');
      return null;
    }

    // Fallback - show raw response for debugging
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

  const renderUncertainResults = (imageResults) => {
    return (
      <div style={{ background: 'white', borderRadius: '15px', padding: '25px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: '25px' }}>
          <h2 style={{ color: '#4a7c59', marginBottom: '10px', fontSize: '1.8rem' }}>
            🔍 Similar Diseases Found
          </h2>
          <p style={{ color: '#666', fontSize: '1.1rem' }}>
            We found similar diseases. Please select the one that best matches your observation:
          </p>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '20px',
          marginBottom: '25px'
        }}>
          {imageResults.slice(0, 5).map((result, index) => (
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
                e.target.style.borderColor = '#4a7c59';
                e.target.style.boxShadow = '0 5px 15px rgba(0,0,0,0.1)';
              }}
              onMouseLeave={(e) => {
                e.target.style.borderColor = '#e0e0e0';
                e.target.style.boxShadow = 'none';
              }}
            >
              {result.image_url && (
                <div style={{ marginBottom: '15px' }}>
                  <img 
                    src={result.image_url} 
                    alt={result.disease_name}
                    style={{ 
                      width: '100%', 
                      height: '200px', 
                      objectFit: 'cover', 
                      borderRadius: '8px',
                      border: '1px solid #ddd'
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              )}
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

  const handleDiseaseSelection = (diseaseName) => {
    const requestData = {
      inputType: 'disease_selection',
      selectedDisease: diseaseName,
      cropType: results.crop_type || 'unknown',
      smeAdvisor: results.sme_advisor || null
    };
    handleAnalyze(requestData);
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
                {loadingText}
              </p>

              {managerThoughts.length > 0 && (
                <div style={{ textAlign: 'left', maxWidth: '400px', margin: '0 auto' }}>
                  {managerThoughts.map((thought, index) => (
                    <div
                      key={index}
                      style={{
                        background: '#e8f5e8',
                        padding: '10px 15px',
                        borderRadius: '20px',
                        margin: '10px 0',
                        borderLeft: '4px solid #4a7c59'
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