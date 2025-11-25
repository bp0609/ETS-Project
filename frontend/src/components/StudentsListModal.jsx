import React, { useState, useEffect } from 'react';
import { X, User, Loader, Mail, Phone, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { getStudentsByLevel } from '../api';

const StudentsListModal = ({ isOpen, onClose, thread, understandingLevel }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && thread && understandingLevel) {
      fetchStudents();
    }
  }, [isOpen, thread, understandingLevel]);

  const fetchStudents = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getStudentsByLevel(thread.id, understandingLevel);
      setStudents(data.students);
    } catch (err) {
      console.error('Error fetching students:', err);
      setError('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !thread || !understandingLevel) return null;

  // Get the appropriate icon and color based on understanding level
  const getLevelInfo = () => {
    switch (understandingLevel) {
      case 'complete':
        return {
          icon: CheckCircle,
          color: 'green',
          label: 'Completely Understood',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          textColor: 'text-green-700',
          iconColor: 'text-green-600',
          hoverColor: 'hover:bg-green-100'
        };
      case 'partial':
        return {
          icon: AlertCircle,
          color: 'yellow',
          label: 'Partially Understood',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          textColor: 'text-yellow-700',
          iconColor: 'text-yellow-600',
          hoverColor: 'hover:bg-yellow-100'
        };
      case 'none':
        return {
          icon: XCircle,
          color: 'red',
          label: 'Need Help / Didn\'t Understand',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-700',
          iconColor: 'text-red-600',
          hoverColor: 'hover:bg-red-100'
        };
      default:
        return {
          icon: User,
          color: 'gray',
          label: 'Unknown',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          textColor: 'text-gray-700',
          iconColor: 'text-gray-600',
          hoverColor: 'hover:bg-gray-100'
        };
    }
  };

  const levelInfo = getLevelInfo();
  const LevelIcon = levelInfo.icon;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full my-8 max-h-[calc(100vh-4rem)] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <LevelIcon className={`w-6 h-6 mr-2 ${levelInfo.iconColor}`} />
              Students: {levelInfo.label}
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
          ) : students.length === 0 ? (
            <div className="text-center py-8">
              <LevelIcon className={`w-12 h-12 ${levelInfo.iconColor} mx-auto mb-3`} />
              <p className="text-gray-600">
                No students have selected this option yet
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-gray-600 mb-4">
                <strong>{students.length}</strong> {students.length === 1 ? 'student has' : 'students have'} marked this topic as "{levelInfo.label}".
              </p>
              <div className="space-y-3">
                {students.map((student) => (
                  <div
                    key={student.id}
                    className={`p-4 ${levelInfo.bgColor} border ${levelInfo.borderColor} rounded-lg ${levelInfo.hoverColor} transition-colors`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`flex-shrink-0 w-10 h-10 ${levelInfo.bgColor} border ${levelInfo.borderColor} rounded-full flex items-center justify-center`}>
                        <User className={`w-5 h-5 ${levelInfo.textColor}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 mb-2">{student.name}</p>
                        
                        {/* Contact Information */}
                        <div className="space-y-1.5">
                          {student.email && (
                            <div className="flex items-center space-x-2 text-sm">
                              <Mail className={`w-4 h-4 ${levelInfo.iconColor} flex-shrink-0`} />
                              <a 
                                href={`mailto:${student.email}`}
                                className="text-gray-700 hover:text-indigo-700 underline break-all"
                              >
                                {student.email}
                              </a>
                            </div>
                          )}
                          {student.phone && (
                            <div className="flex items-center space-x-2 text-sm">
                              <Phone className={`w-4 h-4 ${levelInfo.iconColor} flex-shrink-0`} />
                              <a 
                                href={`tel:${student.phone}`}
                                className="text-gray-700 hover:text-indigo-700 underline"
                              >
                                {student.phone}
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

export default StudentsListModal;

