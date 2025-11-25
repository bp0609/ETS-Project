import React, { useState, useEffect } from 'react';
import { X, Users, Loader, User, Mail, Phone } from 'lucide-react';
import { getTopicHelpers } from '../api';

const HelpersModal = ({ isOpen, onClose, thread }) => {
  const [helpers, setHelpers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && thread) {
      fetchHelpers();
    }
  }, [isOpen, thread]);

  const fetchHelpers = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getTopicHelpers(thread.id);
      setHelpers(data.helpers);
    } catch (err) {
      console.error('Error fetching helpers:', err);
      setError('Failed to load helpers');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !thread) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full my-8 max-h-[calc(100vh-4rem)] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <Users className="w-6 h-6 mr-2 text-green-600" />
              Students Who Can Help
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Topic: <span className="font-medium">{thread.topic}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 flex-shrink-0"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="p-6 overflow-y-auto flex-1">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          ) : helpers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">
                No students have marked this topic as "Completely Understood" yet
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-gray-600 mb-4">
                These students have marked this topic as "Completely Understood". 
                You can reach out to them for help!
              </p>
              <div className="space-y-3">
                {helpers.map((helper) => (
                  <div
                    key={helper.id}
                    className="p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-green-200 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-green-700" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 mb-2">{helper.name}</p>
                        
                        {/* Contact Information */}
                        <div className="space-y-1.5">
                          {helper.email && (
                            <div className="flex items-center space-x-2 text-sm">
                              <Mail className="w-4 h-4 text-green-600 flex-shrink-0" />
                              <a 
                                href={`mailto:${helper.email}`}
                                className="text-gray-700 hover:text-green-700 underline break-all"
                              >
                                {helper.email}
                              </a>
                            </div>
                          )}
                          {helper.phone && (
                            <div className="flex items-center space-x-2 text-sm">
                              <Phone className="w-4 h-4 text-green-600 flex-shrink-0" />
                              <a 
                                href={`tel:${helper.phone}`}
                                className="text-gray-700 hover:text-green-700 underline"
                              >
                                {helper.phone}
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg flex-shrink-0">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default HelpersModal;

