import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, ArrowLeft, BookOpen } from 'lucide-react';
import { useUser } from '../context/UserContext';

const SignupPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signup } = useUser();

  const handleSignup = async (e) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }

    if (name.trim().length < 2) {
      setError('Name must be at least 2 characters');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    if (!phone.trim() || phone.trim().length < 10) {
      setError('Please enter a valid phone number (at least 10 digits)');
      return;
    }

    setLoading(true);
    setError('');

    const result = await signup(name.trim(), email.trim(), phone.trim());
    
    if (result.success) {
      navigate('/home');
    } else {
      setError(result.error);
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <BookOpen className="w-16 h-16 text-indigo-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Create Account
          </h1>
          <p className="text-lg text-gray-600">
            Join the IITGN Discussion Forum
          </p>
        </div>

        {/* Signup Card */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          <form onSubmit={handleSignup} className="space-y-6">
            {/* Name Input */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Your Name *
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                disabled={loading}
                autoFocus
              />
              <p className="mt-2 text-sm text-gray-500">
                This will be displayed in discussions
              </p>
            </div>

            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                disabled={loading}
              />
              <p className="mt-2 text-sm text-gray-500">
                Your contact email for collaboration
              </p>
            </div>

            {/* Phone Input */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter your phone number"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                disabled={loading}
              />
              <p className="mt-2 text-sm text-gray-500">
                Your contact number for peer help
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-blue-900 mb-2">
                Student Account
              </h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Access all course lectures</li>
                <li>• Ask questions in discussion threads</li>
                <li>• Get AI-powered answers instantly</li>
                <li>• View conversation history</li>
              </ul>
            </div>

            {/* Sign Up Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-6 rounded-lg font-medium text-white transition-colors flex items-center justify-center ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              <UserPlus className="w-5 h-5 mr-2" />
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>

          {/* Back to Login */}
          <button
            onClick={handleBack}
            disabled={loading}
            className="w-full mt-4 py-3 px-6 rounded-lg font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Login
          </button>

          {/* Terms Text */}
          <p className="mt-6 text-center text-xs text-gray-500">
            By signing up, you agree to use this platform for educational purposes only.
          </p>
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <button
              onClick={handleBack}
              className="text-indigo-600 font-semibold hover:text-indigo-700"
            >
              Login here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;

