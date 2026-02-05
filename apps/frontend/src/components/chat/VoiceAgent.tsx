import { Phone, PhoneOff, Mic, Volume2 } from 'lucide-react';
import { clsx } from 'clsx';
import { useVoiceAgent, type AgentStatus, type AgentMode } from '../../hooks/useVoiceAgent';
import { VoiceWave } from './VoiceWave';

interface VoiceAgentProps {
  onMessage?: (role: 'user' | 'assistant', content: string, id: string) => void;
}

export function VoiceAgent({ onMessage }: VoiceAgentProps) {
  const { status, mode, error, connect, disconnect } = useVoiceAgent({ onMessage });

  const getStatusText = (status: AgentStatus, mode: AgentMode) => {
    if (status === 'connecting') return 'Đang kết nối...';
    if (status === 'error') return 'Lỗi kết nối';
    if (status === 'disconnected') return 'Nhấn để bắt đầu cuộc trò chuyện';
    if (mode === 'speaking') return 'MindMate đang nói...';
    if (mode === 'listening') return 'Đang lắng nghe...';
    return 'Đã kết nối';
  };

  const getStatusIcon = (status: AgentStatus, mode: AgentMode) => {
    if (status !== 'connected') return null;
    if (mode === 'speaking') return <Volume2 className="w-5 h-5 text-primary-500 animate-pulse" />;
    if (mode === 'listening') return <Mic className="w-5 h-5 text-green-500 animate-pulse" />;
    return null;
  };

  return (
    <div className="border-t border-gray-200 bg-white p-4">
      {error && (
        <div className="mb-2 text-sm text-red-500">{error}</div>
      )}

      {/* Voice wave animation when connected */}
      {status === 'connected' && mode === 'listening' && (
        <div className="mb-4 flex items-center justify-center gap-4">
          <VoiceWave isRecording={true} />
          <span className="text-sm text-gray-500">Hãy nói gì đó...</span>
        </div>
      )}

      {status === 'connected' && mode === 'speaking' && (
        <div className="mb-4 flex items-center justify-center gap-4">
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-1 bg-primary-400 rounded-full animate-pulse"
                style={{
                  height: `${12 + Math.random() * 12}px`,
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}
          </div>
          <span className="text-sm text-primary-600">MindMate đang trả lời...</span>
        </div>
      )}

      <div className="flex items-center justify-center gap-4">
        {/* Status indicator */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          {getStatusIcon(status, mode)}
          <span>{getStatusText(status, mode)}</span>
        </div>

        {/* Connect/Disconnect button */}
        <button
          onClick={status === 'connected' ? disconnect : connect}
          disabled={status === 'connecting'}
          className={clsx(
            'p-4 rounded-full transition-all shadow-lg',
            status === 'connected'
              ? 'bg-red-500 text-white hover:bg-red-600'
              : status === 'connecting'
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-primary-500 text-white hover:bg-primary-600'
          )}
        >
          {status === 'connected' ? (
            <PhoneOff className="w-6 h-6" />
          ) : (
            <Phone className="w-6 h-6" />
          )}
        </button>
      </div>
    </div>
  );
}
