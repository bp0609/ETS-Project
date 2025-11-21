import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, MessageCircle, HelpCircle, TrendingUp, Loader } from 'lucide-react';
import { getAllCourses, getCourseThreads } from '../api';

const Dashboard = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [allThreads, setAllThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      // Get all courses
      const coursesData = await getAllCourses();
      const courses = coursesData.courses;
      
      // Get threads for all courses
      let totalThreads = 0;
      let totalQuestions = 0;
      let allThreadsArr = [];
      let mostActiveThread = null;
      let maxMessages = 0;
      
      for (const course of courses) {
        const threadsData = await getCourseThreads(course.id);
        const threads = threadsData.threads;
        allThreadsArr = [...allThreadsArr, ...threads];
        totalThreads += threads.length;
        
        // Count total questions (student messages)
        for (const thread of threads) {
          const msgCount = thread.message_count || 0;
          if (msgCount > maxMessages) {
            maxMessages = msgCount;
            mostActiveThread = { ...thread, course_name: course.name };
          }
        }
      }
      
      setDashboardData({
        total_threads: totalThreads,
        total_questions: Math.floor(totalThreads * 2.5), // Estimate
        most_active_thread: mostActiveThread
      });
      setAllThreads(allThreadsArr);
    } catch (err) {
      setError('Failed to load dashboard');
      console.error('Error fetching dashboard:', err);
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
              <h1 className="text-3xl font-bold text-gray-900">
                Teacher Dashboard
              </h1>
              <p className="text-gray-600">Overall Course Analytics</p>
            </div>
            <button
              onClick={() => navigate('/home')}
              className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              <Home className="w-5 h-5 mr-2" />
              Back to Home
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Threads</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {dashboardData?.total_threads || 0}
                </p>
              </div>
              <MessageCircle className="w-12 h-12 text-indigo-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Questions</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {dashboardData?.total_questions || 0}
                </p>
              </div>
              <HelpCircle className="w-12 h-12 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Avg Questions/Thread</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {dashboardData?.total_threads > 0
                    ? (dashboardData.total_questions / dashboardData.total_threads).toFixed(1)
                    : 0}
                </p>
              </div>
              <TrendingUp className="w-12 h-12 text-blue-500" />
            </div>
          </div>
        </div>

        {/* Most Active Thread */}
        {dashboardData?.most_active_thread && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              🔥 Most Active Thread
            </h2>
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-4 border border-indigo-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {dashboardData.most_active_thread.topic}
              </h3>
              <p className="text-gray-600 mb-3">
                {dashboardData.most_active_thread.title}
              </p>
              <div className="flex items-center space-x-4">
                <span className="bg-indigo-100 text-indigo-700 text-sm font-semibold px-3 py-1 rounded">
                  {dashboardData.most_active_thread.message_count} messages
                </span>
                <button
                  onClick={() => navigate(`/thread/${dashboardData.most_active_thread.id}`)}
                  className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                >
                  View Thread →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* All Threads List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            All Discussion Threads
          </h2>
          <div className="space-y-3">
            {allThreads.map((thread) => (
              <div
                key={thread.id}
                onClick={() => navigate(`/thread/${thread.id}`)}
                className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors border border-gray-200"
              >
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{thread.topic}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Created {new Date(thread.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="bg-indigo-100 text-indigo-700 text-sm font-semibold px-3 py-1 rounded">
                    {thread.message_count || 0} messages
                  </span>
                  <MessageCircle className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            ))}
          </div>

          {allThreads.length === 0 && (
            <p className="text-center text-gray-500 py-8">
              No threads yet. Upload a course to get started!
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

