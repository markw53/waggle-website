import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
} from 'firebase/firestore';
import { db } from '@/firebase';
import { useAuth } from '@/context';
import { useMessaging } from '@/hooks/useMessaging';
import type { Message, Conversation } from '@/types/message';
import { ROUTES } from '@/config/routes'; // ✅ Added
import toast from 'react-hot-toast';

const ConversationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { sendMessage, markAsRead } = useMessaging();
  
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch conversation details
  useEffect(() => {
    if (!id || !user) return;

    const conversationRef = doc(db, 'conversations', id);
    
    const unsubscribe = onSnapshot(conversationRef, (doc) => {
      if (doc.exists()) {
        setConversation({ id: doc.id, ...doc.data() } as Conversation);
      } else {
        toast.error('Conversation not found');
        navigate(ROUTES.MESSAGES); // ✅ Updated
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [id, user, navigate]);

  // Fetch messages
  useEffect(() => {
    if (!id) return;

    const messagesRef = collection(db, 'conversations', id, 'messages');
    const q = query(messagesRef, orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs: Message[] = [];
      snapshot.forEach((doc) => {
        msgs.push({ id: doc.id, ...doc.data() } as Message);
      });
      setMessages(msgs);
    });

    return unsubscribe;
  }, [id]);

  // Mark as read when conversation is viewed
  useEffect(() => {
    if (id && user) {
      markAsRead(id);
    }
  }, [id, user, markAsRead]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !id || !user || !conversation) return;

    const otherUserId = conversation.participants.find(uid => uid !== user.uid);
    if (!otherUserId) return;

    setSending(true);
    try {
      await sendMessage(id, newMessage, otherUserId);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#8c5628] dark:border-amber-500 mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Loading conversation...</p>
      </div>
    );
  }

  if (!conversation || !user) return null;

  const otherUserId = conversation.participants.find(uid => uid !== user.uid);
  const otherUser = otherUserId ? conversation.participantDetails[otherUserId] : null;

  return (
    <div className="flex flex-col h-screen bg-zinc-50 dark:bg-zinc-900">
      {/* Header */}
      <div className="bg-white/95 dark:bg-zinc-800/95 border-b border-zinc-200 dark:border-zinc-700 px-4 py-4 shadow-sm backdrop-blur-sm">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          {/* Back Button */}
          <button
            type="button"
            onClick={() => navigate(ROUTES.MESSAGES)} // ✅ Updated
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-full transition-colors"
            aria-label="Go back to messages"
          >
            <svg className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Other User Info */}
          {otherUser && (
            <>
              {otherUser.photoURL ? (
                <img
                  src={otherUser.photoURL}
                  alt={otherUser.displayName}
                  className="w-10 h-10 rounded-full object-cover border-2 border-[#8c5628] dark:border-amber-600"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-kinear-to-br from-zinc-200 to-zinc-300 dark:from-zinc-700 dark:to-zinc-600 flex items-center justify-center text-xl border-2 border-[#8c5628] dark:border-amber-600"> {/* ✅ Fixed gradient class */}
                  👤
                </div>
              )}
              <div className="flex-1">
                <h2 className="font-semibold text-gray-900 dark:text-gray-100">
                  {otherUser.displayName}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {otherUser.email}
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">💬</div>
              <p className="text-gray-600 dark:text-gray-400">
                No messages yet. Start the conversation!
              </p>
            </div>
          ) : (
            messages.map((message) => {
              const isOwnMessage = message.fromUserId === user.uid;
              
              return (
                <div
                  key={message.id}
                  className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs sm:max-w-md lg:max-w-lg px-4 py-3 rounded-2xl ${
                      isOwnMessage
                        ? 'bg-[#8c5628] dark:bg-amber-700 text-white rounded-br-sm'
                        : 'bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100 border border-zinc-200 dark:border-zinc-700 rounded-bl-sm'
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-word">{message.text}</p>
                    <p
                      className={`text-xs mt-1 ${
                        isOwnMessage
                          ? 'text-amber-100'
                          : 'text-gray-500 dark:text-gray-400'
                      }`}
                    >
                      {message.createdAt?.toDate().toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <div className="bg-white/95 dark:bg-zinc-800/95 border-t border-zinc-200 dark:border-zinc-700 px-4 py-4 backdrop-blur-sm">
        <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto">
          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              disabled={sending}
              className="flex-1 px-4 py-3 border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8c5628] dark:focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed"
              maxLength={1000}
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || sending}
              className="px-6 py-3 bg-[#8c5628] dark:bg-amber-700 text-white rounded-lg hover:bg-[#6d4320] dark:hover:bg-amber-600 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {sending ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Sending...
                </>
              ) : (
                <>
                  <span className="hidden sm:inline">Send</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </>
              )}
            </button>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            {newMessage.length}/1000 characters
          </p>
        </form>
      </div>
    </div>
  );
};

export default ConversationPage;