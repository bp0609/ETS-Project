import React from 'react';
import { User, Bot, GraduationCap } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const Message = ({ message }) => {
  const isAI = message.sender_type === 'ai';
  const isTeacher = message.sender_type === 'teacher';
  const isStudent = message.sender_type === 'student';
  
  // Get user name
  const userName = message.user_name || (isTeacher ? 'Teacher' : 'Student');
  
  // Get initials for avatar
  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Determine display name and styling
  const getDisplayInfo = () => {
    if (isAI) {
      return {
        name: '🤖 AI TA',
        bgColor: 'bg-blue-500',
        messageBg: 'bg-blue-50 border-blue-200',
        icon: <Bot className="w-6 h-6 text-white" />
      };
    } else if (isTeacher) {
      return {
        name: userName,
        bgColor: 'bg-purple-500',
        messageBg: 'bg-purple-50 border-purple-200',
        icon: <GraduationCap className="w-6 h-6 text-white" />
      };
    } else {
      return {
        name: userName,
        bgColor: 'bg-gray-500',
        messageBg: 'bg-gray-200 border-gray-300',
        icon: null // Will use initials
      };
    }
  };

  const displayInfo = getDisplayInfo();
  const alignRight = isStudent || isTeacher;

  return (
    <div className={`flex ${alignRight ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`flex max-w-[70%] ${
          alignRight ? 'flex-row-reverse' : 'flex-row'
        }`}
      >
        {/* Avatar */}
        <div
          className={`flex-shrink-0 ${alignRight ? 'ml-3' : 'mr-3'}`}
        >
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center ${displayInfo.bgColor}`}
          >
            {displayInfo.icon || (
              <span className="text-white font-semibold text-sm">
                {getInitials(userName)}
              </span>
            )}
          </div>
        </div>

        {/* Message Content */}
        <div>
          <div
            className={`px-4 py-3 rounded-lg border ${displayInfo.messageBg}`}
          >
            <p className="text-sm font-medium text-gray-800 mb-1">
              {displayInfo.name}
              {' '}
              {isTeacher && <span className="text-xs px-2 py-0.5 bg-purple-200 text-purple-700 rounded">Instructor</span>}
            </p>
            <div className="text-gray-900 prose prose-sm max-w-none">
              <ReactMarkdown
                components={{
                  // Style markdown elements
                  p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                  ul: ({node, ...props}) => <ul className="list-disc ml-4 mb-2" {...props} />,
                  ol: ({node, ...props}) => <ol className="list-decimal ml-4 mb-2" {...props} />,
                  li: ({node, ...props}) => <li className="mb-1" {...props} />,
                  code: ({node, inline, ...props}) => 
                    inline 
                      ? <code className="bg-gray-200 px-1 py-0.5 rounded text-sm" {...props} />
                      : <code className="block bg-gray-200 p-2 rounded text-sm my-2 overflow-x-auto" {...props} />,
                  strong: ({node, ...props}) => <strong className="font-semibold" {...props} />,
                  em: ({node, ...props}) => <em className="italic" {...props} />,
                  h1: ({node, ...props}) => <h1 className="text-lg font-bold mb-2" {...props} />,
                  h2: ({node, ...props}) => <h2 className="text-base font-bold mb-2" {...props} />,
                  h3: ({node, ...props}) => <h3 className="text-sm font-bold mb-1" {...props} />,
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1 px-1">
            {new Date(message.created_at).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Message;

