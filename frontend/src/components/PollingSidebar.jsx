import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, CheckCircle, AlertCircle, XCircle, MessageCircle, Users } from 'lucide-react';
import PollItem from './PollItem';

const PollingSidebar = ({ announcements, userId, isTeacher, onOpenThread, onViewHelpers, onViewStudentsByLevel }) => {
  const [expandedAnnouncements, setExpandedAnnouncements] = useState({});

  // Initialize all announcements as expanded
  useEffect(() => {
    const initialExpanded = {};
    announcements.forEach(announcement => {
      if (announcement.has_topics && announcement.threads?.length > 0) {
        initialExpanded[announcement.id] = true;
      }
    });
    setExpandedAnnouncements(initialExpanded);
  }, [announcements]);

  const toggleAnnouncement = (announcementId) => {
    setExpandedAnnouncements(prev => ({
      ...prev,
      [announcementId]: !prev[announcementId]
    }));
  };

  // Filter announcements that have topics
  const announcementsWithTopics = announcements.filter(
    announcement => announcement.has_topics && announcement.threads?.length > 0
  );

  if (announcementsWithTopics.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <CheckCircle className="w-6 h-6 text-gray-400" />
        </div>
        <p className="text-sm font-medium text-gray-700 mb-1">
          No Topics Yet
        </p>
        <p className="text-xs text-gray-500">
          Topics appear when PDFs are uploaded
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Legend - Compact info card */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg shadow-sm border border-indigo-200 p-3">
        <p className="text-xs font-bold text-gray-800 mb-2">📊 Polling Guide (Understanding Level)</p>

        {/* Understanding levels - Compact layout */}
        <div className="flex items-center gap-3 mb-2 flex-wrap">
          <div className="flex items-center gap-1">
            <div className="w-5 h-5 rounded bg-green-50 border border-green-200 flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-3 h-3 text-green-600" />
            </div>
            <span className="text-xs text-gray-600">Complete</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-5 h-5 rounded bg-yellow-50 border border-yellow-200 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-3 h-3 text-yellow-600" />
            </div>
            <span className="text-xs text-gray-600">Partial</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-5 h-5 rounded bg-red-50 border border-red-200 flex items-center justify-center flex-shrink-0">
              <XCircle className="w-3 h-3 text-red-600" />
            </div>
            <span className="text-xs text-gray-600">Need Help</span>
          </div>
        </div>

        {/* Action buttons - Compact layout */}
        <div className="flex items-center gap-3 pt-2 border-t border-indigo-200 flex-wrap">
          <div className="flex items-center gap-1">
            <div className="w-5 h-5 rounded bg-indigo-50 border border-indigo-200 flex items-center justify-center flex-shrink-0">
              <MessageCircle className="w-3 h-3 text-indigo-600" />
            </div>
            <span className="text-xs text-gray-600">Discuss</span>
          </div>
          {!isTeacher && (
            <div className="flex items-center gap-1">
              <div className="w-5 h-5 rounded bg-purple-50 border border-purple-200 flex items-center justify-center flex-shrink-0">
                <Users className="w-3 h-3 text-purple-600" />
              </div>
              <span className="text-xs text-gray-600">Get Help</span>
            </div>
          )}
        </div>
      </div>

      {/* Poll sections by announcement */}
      {announcementsWithTopics.map((announcement) => (
        <div key={announcement.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Collapsible Header */}
          <button
            onClick={() => toggleAnnouncement(announcement.id)}
            className="w-full px-3 py-2 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between text-left"
          >
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 text-sm truncate">
                {announcement.title}
              </h3>
              <span className="text-xs text-gray-500">
                {announcement.threads.length} {announcement.threads.length === 1 ? 'topic' : 'topics'}
              </span>
            </div>
            {expandedAnnouncements[announcement.id] ? (
              <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2" />
            )}
          </button>

          {/* Poll Items */}
          {expandedAnnouncements[announcement.id] && (
            <div className="p-2 space-y-2 bg-white">
              {announcement.threads.map((thread) => (
                <PollItem
                  key={thread.id}
                  thread={thread}
                  userId={userId}
                  isTeacher={isTeacher}
                  onOpenThread={onOpenThread}
                  onViewHelpers={onViewHelpers}
                  onViewStudentsByLevel={onViewStudentsByLevel}
                />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default PollingSidebar;
