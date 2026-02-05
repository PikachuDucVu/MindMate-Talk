import { clsx } from 'clsx';
import type { Message as MessageType } from '../../types';
import { useAudioPlayer } from '../../hooks/useAudioPlayer';
import { Play, Pause, Volume2 } from 'lucide-react';

interface MessageProps {
  message: MessageType;
}

export function Message({ message }: MessageProps) {
  const isUser = message.role === 'user';
  const { isPlaying, play, pause } = useAudioPlayer();

  const handlePlayAudio = () => {
    if (message.audioUrl) {
      if (isPlaying) {
        pause();
      } else {
        play(message.audioUrl);
      }
    }
  };

  return (
    <div
      className={clsx(
        'flex w-full mb-4',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      <div
        className={clsx(
          'max-w-[80%] rounded-2xl px-4 py-3',
          isUser
            ? 'bg-primary-500 text-white rounded-br-md'
            : 'bg-gray-100 text-gray-800 rounded-bl-md'
        )}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap">
          {message.content}
        </p>

        {message.audioUrl && (
          <button
            onClick={handlePlayAudio}
            className={clsx(
              'mt-2 flex items-center gap-2 text-xs',
              isUser
                ? 'text-white/80 hover:text-white'
                : 'text-gray-500 hover:text-gray-700'
            )}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            <Volume2 className="w-4 h-4" />
            <span>Nghe</span>
          </button>
        )}

        <span
          className={clsx(
            'block text-xs mt-1',
            isUser ? 'text-white/60' : 'text-gray-400'
          )}
        >
          {new Date(message.timestamp).toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      </div>
    </div>
  );
}
