import { useNavigate } from 'react-router-dom';
import { useMessaging } from '@/hooks/useMessaging';
import { useAuth } from '@/context';
import { useEffect } from 'react';
import type { Conversation } from '@/types/message';
import { ROUTES, getConversationRoute } from '@/config/routes';

const Messages: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { conversations, loading } = useMessaging();

  useEffect(() => {
    if (!user) {
      navigate(ROUTES.HOME); 
    }
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#8c5628] dark:border-amber-500 mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Loading messages...</p>
      </div>
    );
  }

  const getOtherUser = (conversation: Conversation) => {
    const otherUserId = conversation.participants.find((id: string) => id !== user?.uid);
    return otherUserId ? conversation.participantDetails[otherUserId] : null;
  };

  const getUnreadCount = (conversation: Conversation) => {
    return conversation.unreadCount[user?.uid || ''] || 0;
  };

  return (
    <div className="max-w-4xl mx-auto my-10 p-6 sm:p-8">
      <div className="bg-white/95 dark:bg-zinc-800/95 rounded-xl shadow-xl backdrop-blur-sm border border-zinc-200 dark:border-zinc-700">
        {/* Header */}
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-700">
          <h1 className="text-3xl font-bold text-[#573a1c] dark:text-amber-200 flex items-center gap-3">
            <span>💬</span> Messages
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Conversations List */}
        <div className="divide-y divide-zinc-200 dark:divide-zinc-700">
          {conversations.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-6xl mb-4">💬</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                No Messages Yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Start a conversation by contacting a dog owner
              </p>
              <button
                type="button"
                onClick={() => navigate(ROUTES.DOGS)} 
                className="px-6 py-3 bg-[#8c5628] dark:bg-amber-700 text-white rounded-lg hover:bg-[#6d4320] dark:hover:bg-amber-600 transition-colors font-semibold"
              >
                Browse Dogs
              </button>
            </div>
          ) : (
            conversations.map((conversation) => {
              const otherUser = getOtherUser(conversation);
              const unreadCount = getUnreadCount(conversation);

              // Add null check for otherUser
              if (!otherUser) return null;

              return (
                <button
                  key={conversation.id}
                  type="button"
                  onClick={() => navigate(getConversationRoute(conversation.id))} 
                  className="w-full p-4 hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-colors flex items-center gap-4 text-left"
                >
                  {/* Avatar */}
                  {otherUser.photoURL ? (
                    <img
                      src={otherUser.photoURL}
                      alt={otherUser.displayName}
                      className="w-14 h-14 rounded-full object-cover border-2 border-[#8c5628] dark:border-amber-600"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-linear-to-br from-zinc-200 to-zinc-300 dark:from-zinc-700 dark:to-zinc-600 flex items-center justify-center text-2xl border-2 border-[#8c5628] dark:border-amber-600"> {/* ✅ Fixed gradient class */}
                      👤
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                        {otherUser.displayName}
                      </h3>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {conversation.lastMessageAt?.toDate().toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className={`text-sm truncate ${unreadCount > 0 ? 'font-semibold text-gray-900 dark:text-gray-100' : 'text-gray-600 dark:text-gray-400'}`}>
                        {conversation.lastMessage || 'No messages yet'}
                      </p>
                      {unreadCount > 0 && (
                        <span className="ml-2 px-2 py-1 bg-[#8c5628] dark:bg-amber-600 text-white text-xs font-bold rounded-full">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;