import { useEffect } from 'react';
import { X, MessageSquare, Clock } from 'lucide-react';
import { clsx } from 'clsx';
import { useChatStore } from '../../stores/chatStore';

interface HistoryBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Vừa xong';
  if (diffMins < 60) return `${diffMins} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays === 1) return 'Hôm qua';
  if (diffDays < 7) return `${diffDays} ngày trước`;

  return date.toLocaleDateString('vi-VN', {
    day: 'numeric',
    month: 'short',
  });
}

export function HistoryBottomSheet({ isOpen, onClose }: HistoryBottomSheetProps) {
  const {
    conversations,
    isLoadingHistory,
    fetchHistory,
    loadConversation,
    clearConversation,
  } = useChatStore();

  useEffect(() => {
    if (isOpen) {
      fetchHistory();
    }
  }, [isOpen, fetchHistory]);

  const handleSelectConversation = (id: string) => {
    loadConversation(id);
    onClose();
  };

  const handleNewChat = () => {
    clearConversation();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />

      {/* Bottom Sheet */}
      <div
        className={clsx(
          'relative bg-white rounded-t-3xl shadow-xl',
          'max-h-[70vh] overflow-hidden',
          'animate-slide-up'
        )}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 pb-3 border-b">
          <h2 className="text-lg font-semibold text-gray-900">
            Cuộc trò chuyện
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="px-4 py-3 border-b bg-gray-50">
          <button
            onClick={handleNewChat}
            className={clsx(
              'w-full flex items-center justify-center gap-2',
              'px-4 py-3 rounded-xl',
              'bg-primary-500 text-white font-medium',
              'hover:bg-primary-600 active:bg-primary-700',
              'transition-colors'
            )}
          >
            <MessageSquare className="w-5 h-5" />
            Cuộc trò chuyện mới
          </button>
        </div>

        {/* Conversation List */}
        <div className="overflow-y-auto max-h-[50vh] px-4 py-2">
          {isLoadingHistory ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>Chưa có cuộc trò chuyện nào</p>
            </div>
          ) : (
            <div className="space-y-2">
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => handleSelectConversation(conv.id)}
                  className={clsx(
                    'w-full text-left p-3 rounded-xl',
                    'bg-white border border-gray-100',
                    'hover:bg-gray-50 hover:border-gray-200',
                    'active:bg-gray-100',
                    'transition-colors cursor-pointer'
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">
                        {conv.title || 'Cuộc trò chuyện'}
                      </h3>
                      {conv.lastMessage && (
                        <p className="text-sm text-gray-500 truncate mt-0.5">
                          {conv.lastMessage}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-400 whitespace-nowrap">
                      <Clock className="w-3 h-3" />
                      {formatTimeAgo(conv.updatedAt)}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Safe area padding for mobile */}
        <div className="h-6" />
      </div>

      <style>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

export default HistoryBottomSheet;
