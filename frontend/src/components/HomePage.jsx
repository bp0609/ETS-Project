import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, LogOut, BarChart3, Loader, Plus } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { getAllAnnouncements } from '../api';
import AnnouncementFeed from './AnnouncementFeed';
import PollingSidebar from './PollingSidebar';
import CreateAnnouncementModal from './CreateAnnouncementModal';
import HelpersModal from './HelpersModal';

const HomePage = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [showHelpersModal, setShowHelpersModal] = useState(false);
  const [selectedThread, setSelectedThread] = useState(null);
  const navigate = useNavigate();
  const { user, logout, isTeacher } = useUser();

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const data = await getAllAnnouncements();
      setAnnouncements(data.announcements);
    } catch (err) {
      setError('Failed to load announcements');
      console.error('Error fetching announcements:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleDashboard = () => {
    navigate('/dashboard');
  };

  const handleAnnouncementCreated = (result) => {
    // Refresh announcements
    fetchAnnouncements();
  };

  const handleOpenThread = (threadId) => {
    navigate(`/thread/${threadId}`);
  };

  const handleViewHelpers = (thread) => {
    setSelectedThread(thread);
    setShowHelpersModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo and Title */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  IITGN Classroom
                </h1>
                <p className="text-xs text-gray-500">
                  {user?.name}
                  {isTeacher() && <span className="ml-1 text-indigo-600">• Instructor</span>}
                </p>
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex items-center space-x-2">
              {isTeacher() && (
                <>
                  <button
                    onClick={() => setShowAnnouncementModal(true)}
                    className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                  >
                    <Plus className="w-4 h-4 mr-1.5" />
                    New Post
                  </button>
                  <button
                    onClick={handleDashboard}
                    className="flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                  >
                    <BarChart3 className="w-4 h-4 mr-1.5" />
                    Analytics
                  </button>
                </>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                <LogOut className="w-4 h-4 mr-1.5" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Announcements Feed (2/3 width) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold text-gray-900">
                Announcements
              </h2>
              {announcements.length > 0 && (
                <span className="text-sm text-gray-500">
                  {announcements.length} {announcements.length === 1 ? 'post' : 'posts'}
                </span>
            )}
          </div>

            <AnnouncementFeed announcements={announcements} />

            {announcements.length === 0 && isTeacher() && (
              <div className="text-center py-8">
                <button
                  onClick={() => setShowAnnouncementModal(true)}
                  className="inline-flex items-center px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Create Your First Announcement
                </button>
              </div>
            )}
          </div>

          {/* Right Column - Polling Sidebar (1/3 width) */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                Topic Polls
              </h2>
              <PollingSidebar
                announcements={announcements}
                userId={user?.id}
                isTeacher={isTeacher()}
                onOpenThread={handleOpenThread}
                onViewHelpers={handleViewHelpers}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <CreateAnnouncementModal
        isOpen={showAnnouncementModal}
        onClose={() => setShowAnnouncementModal(false)}
        teacherId={user?.id}
        onAnnouncementCreated={handleAnnouncementCreated}
      />

      <HelpersModal
        isOpen={showHelpersModal}
        onClose={() => setShowHelpersModal(false)}
        thread={selectedThread}
      />
    </div>
  );
};

export default HomePage;
