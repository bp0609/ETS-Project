import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MessageCircle, BarChart3, Home, Loader } from 'lucide-react';
import { getCourseThreads } from '../api';
import { useUser } from '../context/UserContext';

const ThreadsList = () => {
  const { lectureId } = useParams();
  const navigate = useNavigate();
  const { isTeacher } = useUser();
  const [threads, setThreads] = useState([]);
  const [lectureName, setLectureName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchThreads();
  }, [lectureId]);

  const fetchThreads = async () => {
    try {
      const data = await getCourseThreads(lectureId);
      setThreads(data.threads);
      setLectureName(data.course_name);
    } catch (err) {
      setError('Failed to load threads');
      console.error('Error fetching threads:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {lectureName}
              </h1>
              <p className="text-gray-600">
                {threads.length} Discussion Topics Available
              </p>
            </div>
            <div className="flex space-x-3">
              {isTeacher() && (
                <button
                  onClick={() => navigate('/dashboard')}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Dashboard
                </button>
              )}
              <button
                onClick={() => navigate('/home')}
                className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                <Home className="w-5 h-5 mr-2" />
                Back to Home
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Threads Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {threads.map((thread) => (
            <div
              key={thread.id}
              onClick={() => navigate(`/thread/${thread.id}`)}
              className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow border-l-4 border-indigo-500"
            >
              <div className="flex items-start justify-between mb-3">
                <MessageCircle className="w-6 h-6 text-indigo-600" />
                <span className="bg-indigo-100 text-indigo-700 text-xs font-semibold px-2 py-1 rounded">
                  {thread.message_count || 0} messages
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {thread.topic}
              </h3>
              <p className="text-sm text-gray-500">
                Created {new Date(thread.created_at).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {threads.length === 0 && !loading && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No threads yet
            </h3>
            <p className="text-gray-500">
              Upload a course PDF to create discussion threads
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ThreadsList;

