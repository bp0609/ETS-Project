import React, { useState, useEffect } from 'react';
import { MessageCircle, Users, CheckCircle, AlertCircle, XCircle, Loader } from 'lucide-react';
import { voteOnTopic, getPollResults } from '../api';

const PollItem = ({ thread, userId, isTeacher, onOpenThread, onViewHelpers, onViewStudentsByLevel }) => {
  const [pollResults, setPollResults] = useState({ complete: 0, partial: 0, none: 0 });
  const [currentVote, setCurrentVote] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPollResults();
  }, [thread.id, userId]);

  const fetchPollResults = async () => {
    try {
      const data = await getPollResults(thread.id, userId);
      setPollResults(data.results);
      if (data.student_vote) {
        setCurrentVote(data.student_vote);
      }
    } catch (err) {
      console.error('Error fetching poll results:', err);
    }
  };

  const handleVote = async (level) => {
    if (isTeacher || loading) return;

    setLoading(true);
    try {
      const result = await voteOnTopic(thread.id, userId, level);
      setPollResults(result.results);
      setCurrentVote(level);
    } catch (err) {
      console.error('Error voting:', err);
    } finally {
      setLoading(false);
    }
  };

  const getVoteButtonClass = (level) => {
    const isSelected = currentVote === level;
    const baseClass = "w-8 h-8 rounded-md flex items-center justify-center transition-all";

    if (isTeacher) {
      return `${baseClass} bg-gray-100 cursor-default`;
    }

    if (isSelected) {
      if (level === 'complete') return `${baseClass} bg-green-600 text-white ring-2 ring-green-300`;
      if (level === 'partial') return `${baseClass} bg-yellow-500 text-white ring-2 ring-yellow-300`;
      if (level === 'none') return `${baseClass} bg-red-500 text-white ring-2 ring-red-300`;
    }

    if (level === 'complete') return `${baseClass} bg-green-50 text-green-700 hover:bg-green-100 border border-green-200`;
    if (level === 'partial') return `${baseClass} bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border border-yellow-200`;
    if (level === 'none') return `${baseClass} bg-red-50 text-red-700 hover:bg-red-100 border border-red-200`;

    return baseClass;
  };

  return (
    <div className="bg-gray-50 rounded-md p-2 border border-gray-200 hover:border-indigo-300 transition-colors">
      {/* Single row with topic, voting, and action buttons */}
      <div className="flex items-center gap-2">
        {/* Topic name */}
        <span className="text-sm font-medium text-gray-900 flex-1 break-words min-w-0">
          {thread.topic}
        </span>

        {/* Voting Buttons (Students) or Results (Teachers) */}
        {isTeacher ? (
          <div className="flex items-center gap-1 text-xs flex-shrink-0">
            <button
              onClick={() => onViewStudentsByLevel(thread, 'complete')}
              className="flex items-center text-green-600 hover:bg-green-50 px-1.5 py-1 rounded transition-colors"
              title="Click to view students who completely understood"
            >
              <CheckCircle className="w-3.5 h-3.5 mr-0.5" />
              <span className="font-medium">{pollResults.complete}</span>
            </button>
            <span className="text-gray-300">|</span>
            <button
              onClick={() => onViewStudentsByLevel(thread, 'partial')}
              className="flex items-center text-yellow-600 hover:bg-yellow-50 px-1.5 py-1 rounded transition-colors"
              title="Click to view students who partially understood"
            >
              <AlertCircle className="w-3.5 h-3.5 mr-0.5" />
              <span className="font-medium">{pollResults.partial}</span>
            </button>
            <span className="text-gray-300">|</span>
            <button
              onClick={() => onViewStudentsByLevel(thread, 'none')}
              className="flex items-center text-red-600 hover:bg-red-50 px-1.5 py-1 rounded transition-colors"
              title="Click to view students who need help"
            >
              <XCircle className="w-3.5 h-3.5 mr-0.5" />
              <span className="font-medium">{pollResults.none}</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1 flex-shrink-0">
            {loading ? (
              <Loader className="w-4 h-4 animate-spin text-indigo-600" />
            ) : (
              <>
                <button
                  onClick={() => handleVote('complete')}
                  className={getVoteButtonClass('complete')}
                  disabled={loading}
                  title="I understand completely"
                >
                  <CheckCircle className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleVote('partial')}
                  className={getVoteButtonClass('partial')}
                  disabled={loading}
                  title="I partially understand"
                >
                  <AlertCircle className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleVote('none')}
                  className={getVoteButtonClass('none')}
                  disabled={loading}
                  title="I didn't understand"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        )}

        {/* Separator */}
        <div className="h-6 w-px bg-gray-300 flex-shrink-0"></div>

        {/* Action Buttons - Same size as voting buttons */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => onOpenThread(thread.id)}
            className="w-8 h-8 rounded-md flex items-center justify-center bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition-all"
            title="Open discussion thread"
          >
            <MessageCircle className="w-4 h-4" />
          </button>
          {!isTeacher && (
            <button
              onClick={() => onViewHelpers(thread)}
              className="w-8 h-8 rounded-md flex items-center justify-center bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 transition-all"
              title="View students who can help"
            >
              <Users className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PollItem;
