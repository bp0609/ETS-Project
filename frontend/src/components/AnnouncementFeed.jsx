import React from 'react';
import { Calendar, FileText, Clock, Download, Eye } from 'lucide-react';

const AnnouncementFeed = ({ announcements }) => {
  // Get API base URL dynamically (same as api.js logic)
  const API_BASE_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:8000`;

  const formatDate = (dateString) => {
    // The database stores time in IST format already (YYYY-MM-DD HH:MM:SS)
    // We just need to parse and display it
    const date = new Date(dateString);
    
    // Format the date nicely
    const options = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    };
    
    return date.toLocaleString('en-IN', options);
  };

  const handleViewPDF = (announcementId) => {
    // Open in new tab without triggering download
    window.open(`${API_BASE_URL}/api/announcements/${announcementId}/pdf?download=false`, '_blank');
  };

  const handleDownloadPDF = (announcementId, filename) => {
    // Trigger download
    window.open(`${API_BASE_URL}/api/announcements/${announcementId}/pdf?download=true`, '_blank');
  };

  if (announcements.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-16 text-center">
        <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          No Announcements Yet
        </h3>
        <p className="text-gray-500 text-sm">
          Your teacher will post announcements here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {announcements.map((announcement) => {
        const hasPDF = announcement.pdf_path || announcement.pdf_filename;
        
        return (
          <div
            key={announcement.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900 break-words mb-2">
                {announcement.title}
              </h2>
              <div className="flex items-center text-sm text-gray-500 space-x-3 flex-wrap">
                <span className="font-medium text-gray-700">{announcement.teacher_name}</span>
                <span className="text-gray-300">•</span>
                <span className="flex items-center">
                  <Clock className="w-3.5 h-3.5 mr-1" />
                  {formatDate(announcement.created_at)}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="px-6 py-4">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap break-words">
                {announcement.content}
              </p>
            </div>

            {/* PDF Section */}
            {hasPDF && (
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {announcement.pdf_filename || 'Attached PDF'}
                      </p>
                      <p className="text-xs text-gray-500">
                        Click to view or download
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleViewPDF(announcement.id)}
                      className="flex items-center space-x-1 px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors text-sm font-medium"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View</span>
                    </button>
                    <button
                      onClick={() => handleDownloadPDF(announcement.id, announcement.pdf_filename)}
                      className="flex items-center space-x-1 px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-sm font-medium"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default AnnouncementFeed;
