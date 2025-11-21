import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Loader } from 'lucide-react';
import { getThreadMessages, askQuestion } from '../api';
import { useUser } from '../context/UserContext';
import Message from './Message';

const ThreadChat = () => {
  const { threadId } = useParams();
  const navigate = useNavigate();
  const { user, isTeacher } = useUser();
  const [messages, setMessages] = useState([]);
  const [threadInfo, setThreadInfo] = useState(null);
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchMessages();
  }, [threadId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    try {
      const data = await getThreadMessages(threadId);
      setMessages(data.messages);
      setThreadInfo({
        title: data.thread_title,
        topic: data.thread_topic,
      });
    } catch (err) {
      setError('Failed to load messages');
      console.error('Error fetching messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendQuestion = async (e) => {
    e.preventDefault();
    
    if (!question.trim() || sending || !user) return;

    setSending(true);
    setError('');

    try {
      const data = await askQuestion(threadId, question.trim(), user.id);
      setMessages(data.messages);
      setQuestion('');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to send question');
      console.error('Error sending question:', err);
    } finally {
      setSending(false);
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
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-md p-4">
        <div className="max-w-4xl mx-auto flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {threadInfo?.topic}
            </h1>
            <p className="text-sm text-gray-500">{threadInfo?.title}</p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto py-6 px-4 scrollbar-hide">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                No messages yet. Be the first to ask a question!
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <Message key={message.id} message={message} />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="max-w-4xl mx-auto px-4 py-2">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
            {error}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="bg-white border-t shadow-lg p-4">
        <form onSubmit={handleSendQuestion} className="max-w-4xl mx-auto">
          <div className="flex space-x-3">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask a question about this topic..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={sending}
            />
            <button
              type="submit"
              disabled={!question.trim() || sending}
              className={`px-6 py-3 rounded-lg font-medium text-white transition-colors flex items-center ${
                !question.trim() || sending
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              {sending ? (
                <>
                  <Loader className="w-5 h-5 mr-2 animate-spin" />
                  Asking AI...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5 mr-2" />
                  Send
                </>
              )}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            💡 {isTeacher() ? 'AI Assistant can help with quizzes, summaries, and more' : 'AI TA will answer based on the uploaded course material'}
          </p>
        </form>
      </div>
    </div>
  );
};

export default ThreadChat;

