import { useState, useCallback, useEffect } from 'react';
import { MessageSquare, Phone } from 'lucide-react';
import { clsx } from 'clsx';
import { Header, Disclaimer } from '../components/layout';
import { MessageList, ChatInput, HotlineCard, VoiceAgent } from '../components/chat';
import { MoodButton, MoodCheckinModal } from '../components/mood';
import { useChatStore } from '../stores/chatStore';
import { useMoodStore } from '../stores/moodStore';
import { sendVoiceMessage } from '../services/api';

type ChatMode = 'text' | 'voice-agent';

export function ChatPage() {
  const {
    messages,
    isLoading,
    crisisLevel,
    error,
    sendMessage,
    clearConversation,
    conversationId,
  } = useChatStore();

  const {
    showMoodModal,
    hasRecordedToday,
    openMoodModal,
    closeMoodModal,
    fetchTodayMood,
  } = useMoodStore();

  const [showHotline, setShowHotline] = useState(true);
  const [chatMode, setChatMode] = useState<ChatMode>('voice-agent');

  // Check if user has recorded mood today on mount
  useEffect(() => {
    fetchTodayMood();
  }, [fetchTodayMood]);

  // Show mood modal prompt after first message if not recorded today
  useEffect(() => {
    if (messages.length === 2 && !hasRecordedToday) {
      // Small delay for better UX
      const timer = setTimeout(() => {
        openMoodModal();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [messages.length, hasRecordedToday, openMoodModal]);

  const handleSendText = async (text: string) => {
    await sendMessage(text);
  };

  const handleSendVoice = async (blob: Blob) => {
    try {
      useChatStore.setState({ isLoading: true });

      const response = await sendVoiceMessage(blob, conversationId);

      // Add both user and AI messages
      const userMessage = {
        id: `user-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        role: 'user' as const,
        content: response.userTranscript,
        timestamp: new Date(),
      };

      const aiMessage = {
        id: `ai-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        role: 'assistant' as const,
        content: response.aiResponse,
        audioUrl: response.audioUrl,
        timestamp: new Date(),
      };

      useChatStore.setState((state) => ({
        conversationId: response.conversationId,
        messages: [...state.messages, userMessage, aiMessage],
        isLoading: false,
        crisisLevel: response.crisisLevel,
      }));

      // Auto-play AI response if available
      if (response.audioUrl) {
        const audio = new Audio(response.audioUrl);
        audio.play().catch(console.error);
      }
    } catch (err) {
      useChatStore.setState({
        isLoading: false,
        error: err instanceof Error ? err.message : 'Có lỗi xảy ra',
      });
    }
  };

  const handleVoiceAgentMessage = useCallback((role: 'user' | 'assistant', content: string, id: string) => {
    useChatStore.setState((state) => ({
      messages: [...state.messages, {
        id,
        role,
        content,
        timestamp: new Date(),
      }],
    }));
  }, []);

  const handleNewChat = () => {
    clearConversation();
    setShowHotline(true);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Header onNewChat={handleNewChat} />
      <Disclaimer />

      <main className="flex-1 flex flex-col max-w-3xl mx-auto w-full bg-white shadow-sm overflow-hidden">
        {/* Mode toggle + Mood button */}
        <div className="flex items-center justify-between p-2 bg-gray-50 border-b">
          <div className="flex gap-2">
            <button
              onClick={() => setChatMode('text')}
              className={clsx(
                'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors',
                chatMode === 'text'
                  ? 'bg-primary-500 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              )}
            >
              <MessageSquare className="w-4 h-4" />
              Nhắn tin
            </button>
            <button
              onClick={() => setChatMode('voice-agent')}
              className={clsx(
                'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors',
                chatMode === 'voice-agent'
                  ? 'bg-primary-500 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              )}
            >
              <Phone className="w-4 h-4" />
              Gọi điện
            </button>
          </div>

          {/* Mood Check-in Button */}
          <MoodButton onClick={openMoodModal} />
        </div>

        {/* Hotline card for crisis */}
        {showHotline && (
          <HotlineCard
            level={crisisLevel}
            onDismiss={() => setShowHotline(false)}
          />
        )}

        {/* Error message */}
        {error && (
          <div className="mx-4 mb-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Messages */}
        <MessageList messages={messages} isLoading={isLoading} />

        {/* Input based on mode */}
        {chatMode === 'text' ? (
          <ChatInput
            onSendText={handleSendText}
            onSendVoice={handleSendVoice}
            disabled={isLoading}
          />
        ) : (
          <VoiceAgent onMessage={handleVoiceAgentMessage} />
        )}
      </main>

      {/* Mood Check-in Modal */}
      <MoodCheckinModal
        isOpen={showMoodModal}
        onClose={closeMoodModal}
      />
    </div>
  );
}
