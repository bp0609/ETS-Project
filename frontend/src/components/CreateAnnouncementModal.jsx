import React, { useState } from 'react';
import { X, Upload, FileText, Loader, AlertCircle, CheckCircle } from 'lucide-react';
import { createAnnouncement, createAnnouncementWithPDF } from '../api';

const CreateAnnouncementModal = ({ isOpen, onClose, teacherId, onAnnouncementCreated }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.type === 'application/pdf') {
        setFile(selectedFile);
        setError('');
        setSuccess('');
      } else {
        setError('Please select a PDF file');
        setFile(null);
        e.target.value = '';
      }
    }
  };

  const removeFile = () => {
    setFile(null);
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      setError('Title and content are required');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      let result;
      if (file) {
        // Create announcement with PDF
        setSuccess('Processing PDF... This may take 10-30 seconds');
        result = await createAnnouncementWithPDF(teacherId, title, content, file);
        setSuccess(`✅ Announcement created with ${result.topics?.length || 0} topics!`);
      } else {
        // Create text-only announcement
        result = await createAnnouncement(teacherId, title, content);
        setSuccess('✅ Announcement created successfully!');
      }

      onAnnouncementCreated(result);
      
      // Wait a moment to show success message
      setTimeout(() => {
        setTitle('');
        setContent('');
        setFile(null);
        setSuccess('');
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Error creating announcement:', err);
      setError(err.response?.data?.detail || 'Failed to create announcement. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setTitle('');
      setContent('');
      setFile(null);
      setError('');
      setSuccess('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-indigo-50 to-purple-50">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Create Announcement</h2>
            <p className="text-sm text-gray-600 mt-1">Share updates with your class</p>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Week 5 Lecture Materials"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              disabled={loading}
              required
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Content <span className="text-red-500">*</span>
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter your announcement message here..."
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none transition-all"
              disabled={loading}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              {content.length} characters
            </p>
          </div>

          {/* PDF Upload (Optional) */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              PDF Attachment (Optional)
            </label>
            
            {!file ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-indigo-500 hover:bg-indigo-50 transition-all cursor-pointer">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  id="pdf-upload"
                  disabled={loading}
                />
                <label
                  htmlFor="pdf-upload"
                  className="flex flex-col items-center cursor-pointer"
                >
                  <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-3">
                    <Upload className="w-8 h-8 text-indigo-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 mb-1">
                    Click to upload PDF
                  </span>
                  <span className="text-xs text-gray-500">
                    AI will automatically generate discussion topics
                  </span>
                </label>
              </div>
            ) : (
              <div className="border-2 border-green-300 bg-green-50 rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{file.name}</p>
                    <p className="text-xs text-gray-600">{(file.size / 1024).toFixed(2)} KB</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={removeFile}
                  disabled={loading}
                  className="text-red-500 hover:text-red-700 transition-colors disabled:opacity-50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}
            
            {file && (
              <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-800 flex items-start">
                  <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>AI Processing:</strong> Topics will be automatically extracted from this PDF 
                    and discussion threads will be created. This may take 10-30 seconds.
                  </span>
                </p>
              </div>
            )}
          </div>

          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm flex items-start">
              <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-start">
              <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-5 py-2.5 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !title.trim() || !content.trim()}
              className="flex items-center px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 mr-2 animate-spin" />
                  {file ? 'Processing PDF...' : 'Creating...'}
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Create Announcement
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAnnouncementModal;
