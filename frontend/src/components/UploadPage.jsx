import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, Loader, Home } from 'lucide-react';
import { uploadCourse } from '../api';

const UploadPage = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadResult, setUploadResult] = useState(null);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setError('');
    } else {
      setError('Please select a valid PDF file');
      setFile(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await uploadCourse(file);
      setUploadResult(result);
      
      // Navigate to home page after 2 seconds
      setTimeout(() => {
        navigate('/home');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to upload lecture. Please try again.');
      console.error('Upload error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Upload New Lecture
          </h1>
          <button
            onClick={() => navigate('/home')}
            className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            <Home className="w-5 h-5 mr-2" />
            Back to Home
          </button>
        </div>

        {/* Upload Card */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">
            Upload Lecture PDF
          </h2>

          <div className="space-y-6">
            {/* File Upload Area */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-indigo-500 transition-colors">
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center"
              >
                {file ? (
                  <>
                    <FileText className="w-16 h-16 text-green-500 mb-4" />
                    <p className="text-lg font-medium text-gray-700">{file.name}</p>
                    <p className="text-sm text-gray-500 mt-2">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </>
                ) : (
                  <>
                    <Upload className="w-16 h-16 text-gray-400 mb-4" />
                    <p className="text-lg font-medium text-gray-700">
                      Click to upload PDF
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      Lecture notes, slides, or course material
                    </p>
                  </>
                )}
              </label>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Upload Button */}
            <button
              onClick={handleUpload}
              disabled={!file || loading}
              className={`w-full py-3 px-6 rounded-lg font-medium text-white transition-colors ${
                !file || loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <Loader className="w-5 h-5 mr-2 animate-spin" />
                  Processing...
                </span>
              ) : (
                'Upload and Generate Discussions'
              )}
            </button>
          </div>

          {/* Processing Status */}
          {loading && (
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 mb-2">Processing your file...</h3>
              <ul className="space-y-1 text-sm text-blue-700">
                <li>✓ Extracting text from PDF</li>
                <li>✓ Analyzing course content with AI</li>
                <li>✓ Generating discussion topics</li>
                <li>✓ Creating discussion threads</li>
              </ul>
            </div>
          )}

          {/* Success Result */}
          {uploadResult && (
            <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-medium text-green-900 mb-2">
                ✓ Course Created Successfully!
              </h3>
              <p className="text-sm text-green-700 mb-3">
                Generated {uploadResult.topics_extracted} topics and created {uploadResult.threads_created} discussion threads.
              </p>
              <div className="bg-white rounded p-3">
                <p className="text-xs font-medium text-gray-600 mb-2">Topics:</p>
                <ul className="space-y-1">
                  {uploadResult.topics.map((topic, idx) => (
                    <li key={idx} className="text-sm text-gray-700">
                      {idx + 1}. {topic}
                    </li>
                  ))}
                </ul>
              </div>
              <p className="text-sm text-green-600 mt-3 font-medium">
                Redirecting to discussions...
              </p>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">What happens next?</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• AI extracts text from your PDF</li>
            <li>• 5-10 key topics are automatically identified</li>
            <li>• Discussion threads are created for each topic</li>
            <li>• Students can start asking questions immediately</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default UploadPage;

