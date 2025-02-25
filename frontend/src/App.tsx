import React, { useState, useRef } from 'react';
import axios from 'axios';
import { Upload, Image as ImageIcon, Loader2 } from 'lucide-react';
import type { Prediction } from './types';
import { ATHLETES } from './constants';

function App() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);





  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
        simulateClassification();
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
        simulateClassification();
      };
      reader.readAsDataURL(file);
    }
  };
 
  const simulateClassification = async () => {
    if (!selectedImage) return;
    
    setIsLoading(true);
    setError(null);
    setPredictions([]);

    try {
        const requestData = { image_data: selectedImage };

        // Log the request being sent
        console.log('Sending request with data:', requestData);

        const response = await axios.post('http://127.0.0.1:5000/classify_image', requestData);

        // Log the response status, headers, and body
        console.log('Response Status:', response.status);
        console.log('Response Headers:', response.headers);
        console.log('Response Data:', response.data);
        
        setPredictions(response.data);  // Assuming response.data contains the predictions
    } catch (error) {
        setError('Error during classification. Please try again.');
        console.error('Error during classification:', error);
    } finally {
        setIsLoading(false);
    }
};

  

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 md:p-10">
          <div className="max-w-2xl mx-auto text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
              Sports Athlete Classifier
            </h1>
            <p className="text-lg text-gray-600">
              Upload an image to identify famous athletes using advanced AI recognition
            </p>
          </div>

          {/* Upload Section */}
          <div className="mb-12">
            <div 
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`
                border-3 border-dashed rounded-xl p-10 text-center cursor-pointer
                transition-all duration-200 ease-in-out
                ${isDragging 
                  ? 'border-indigo-500 bg-indigo-50' 
                  : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'
                }
              `}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />
              <Upload className={`
                w-16 h-16 mx-auto mb-4 transition-colors duration-200
                ${isDragging ? 'text-indigo-500' : 'text-gray-400'}
              `} />
              <p className="text-lg font-medium text-gray-700 mb-2">
                Drop your image here or click to browse
              </p>
              <p className="text-sm text-gray-500">
                Supports PNG, JPG up to 5MB
              </p>
            </div>
          </div>

          {/* Preview and Results Section */}
          {selectedImage && (
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              {/* Image Preview */}
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="p-4 bg-gray-50 border-b">
                  <h2 className="text-lg font-semibold text-gray-800">Uploaded Image</h2>
                </div>
                <div className="p-4">
                  <img 
                    src={selectedImage} 
                    alt="Preview" 
                    className="w-full h-72 object-cover rounded-lg shadow-inner"
                  />
                </div>
              </div>

              {/* Results */}
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="p-4 bg-gray-50 border-b">
                  <h2 className="text-lg font-semibold text-gray-800">Classification Results</h2>
                </div>
                <div className="p-4">
                  {isLoading && (
                    <div className="flex flex-col items-center justify-center h-64">
                      <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mb-4" />
                      <p className="text-gray-600">Analyzing image...</p>
                    </div>
                  )}

                  {error && (
                    <div className="flex items-center justify-center h-64">
                      <div className="text-red-500 text-center">
                        <p className="font-medium mb-2">Error</p>
                        <p className="text-sm">{error}</p>
                      </div>
                    </div>
                  )}

                  {!isLoading && predictions.length > 0 && (
                    <div className="space-y-6">
                      {predictions.map((pred, index) => (
                        <div 
                          key={index} 
                          className="bg-gray-50 rounded-lg p-4 transition-all duration-300 hover:shadow-md"
                        >
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium text-gray-800">{pred.athlete}</span>
                            <span className="text-sm font-medium text-indigo-600">
                              {(pred.confidence * 100).toFixed(1)}%
                            </span>
                          </div>
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full transition-all duration-500 ease-out"
                              style={{ 
                                width: `${pred.confidence * 100}%`,
                                transform: 'translateX(0)'
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Athletes Gallery */}

          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">
              Supported Athletes
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
              {Object.entries(ATHLETES).map(([name, image]) => (
                <div 
                  key={name} 
                  className="bg-white rounded-xl shadow-sm p-4 transition-all duration-200 hover:shadow-md hover:transform hover:-translate-y-1"
                >
                  <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg mb-3 overflow-hidden flex items-center justify-center">
                    <ImageIcon className="w-2/3 h-2/3 text-gray-400" />
                  </div>
                  <p className="text-sm font-medium text-center text-gray-700">{name}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;