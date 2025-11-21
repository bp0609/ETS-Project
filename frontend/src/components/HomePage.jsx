import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Upload, BarChart3, LogOut, MessageCircle, Calendar, Loader } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { getAllLectures } from '../api';

const HomePage = () => {
  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user, logout, isTeacher } = useUser();

  useEffect(() => {
    fetchLectures();
  }, []);

  const fetchLectures = async () => {
    try {
      const data = await getAllLectures();
      setLectures(data.lectures);
    } catch (err) {
      setError('Failed to load lectures');
      console.error('Error fetching lectures:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleViewLecture = (lectureId) => {
    navigate(`/lecture/${lectureId}/threads`);
  };

  const handleUpload = () => {
    navigate('/upload');
  };

  const handleDashboard = () => {
    navigate('/dashboard');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <Loader className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <BookOpen className="w-8 h-8 text-indigo-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  IITGN Discussion Forum
                </h1>
                <p className="text-sm text-gray-600">
                  Welcome, <span className="font-semibold">{user?.name}</span>
                  {' '}
                  {isTeacher() && <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-semibold rounded">Instructor</span>}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {isTeacher() && (
                <>
                  <button
                    onClick={handleUpload}
                    className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    <Upload className="w-5 h-5 mr-2" />
                    Upload Lecture
                  </button>
                  <button
                    onClick={handleDashboard}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <BarChart3 className="w-5 h-5 mr-2" />
                    Dashboard
                  </button>
                </>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                <LogOut className="w-5 h-5 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Course Lectures
          </h2>
          <p className="text-gray-600">
            {lectures.length === 0 
              ? 'No lectures uploaded yet. Upload a lecture to get started!' 
              : 'Click on any lecture to view discussions and ask questions.'}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Lectures List */}
        {lectures.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No Lectures Yet
            </h3>
            <p className="text-gray-500 mb-6">
              {isTeacher() 
                ? 'Upload your first lecture to create discussion threads.' 
                : 'Your teacher will upload lectures soon.'}
            </p>
            {isTeacher() && (
              <button
                onClick={handleUpload}
                className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Upload className="w-5 h-5 mr-2" />
                Upload First Lecture
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {lectures.map((lecture) => (
              <div
                key={lecture.id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer overflow-hidden"
                onClick={() => handleViewLecture(lecture.id)}
              >
                <div className="flex items-center p-6">
                  {/* Lecture Icon */}
                  <div className="flex-shrink-0 w-16 h-16 bg-indigo-100 rounded-lg flex items-center justify-center mr-6">
                    <BookOpen className="w-8 h-8 text-indigo-600" />
                  </div>

                  {/* Lecture Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-semibold text-gray-900 mb-1 truncate">
                      {lecture.name}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDate(lecture.created_at)}
                      </div>
                      <div className="flex items-center">
                        <MessageCircle className="w-4 h-4 mr-1" />
                        {lecture.thread_count} {lecture.thread_count === 1 ? 'topic' : 'topics'}
                      </div>
                    </div>
                  </div>

                  {/* View Button */}
                  <div className="flex-shrink-0">
                    <div className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium">
                      View Discussions
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info Cards (Bottom) */}
        {lectures.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4 shadow">
              <h3 className="font-semibold text-gray-800 mb-2">📚 Browse Topics</h3>
              <p className="text-sm text-gray-600">
                Each lecture has AI-generated discussion topics
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow">
              <h3 className="font-semibold text-gray-800 mb-2">💬 Ask Questions</h3>
              <p className="text-sm text-gray-600">
                Get instant AI-powered answers from course material
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow">
              <h3 className="font-semibold text-gray-800 mb-2">🔍 Review History</h3>
              <p className="text-sm text-gray-600">
                See all previous questions and discussions
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;

