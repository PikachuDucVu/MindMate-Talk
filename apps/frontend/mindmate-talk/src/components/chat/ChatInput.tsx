import { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Square } from 'lucide-react';
import { clsx } from 'clsx';
import { useVoiceRecorder } from '../../hooks/useVoiceRecorder';
import { VoiceWave } from './VoiceWave';

interface ChatInputProps {
  onSendText: (text: string) => void;
  onSendVoice: (blob: Blob) => void;
  disabled?: boolean;
}

export function ChatInput({ onSendText, onSendVoice, disabled }: ChatInputProps) {
  const [text, setText] = useState('');
  const [mode, setMode] = useState<'text' | 'voice'>('text');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { isRecording, startRecording, stopRecording, error } = useVoiceRecorder();

  const handleSubmit = () => {
    if (text.trim() && !disabled) {
      onSendText(text.trim());
      setText('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleVoiceToggle = async () => {
    if (isRecording) {
      const blob = await stopRecording();
      if (blob) {
        onSendVoice(blob);
      }
    } else {
      await startRecording();
    }
  };

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`;
    }
  }, [text]);

  return (
    <div className="border-t border-gray-200 bg-white p-4">
      {error && (
        <div className="mb-2 text-sm text-red-500">{error}</div>
      )}

      {isRecording && (
        <div className="mb-4 flex items-center justify-center gap-4">
          <VoiceWave isRecording={isRecording} />
          <span className="text-sm text-gray-500">Đang ghi âm...</span>
        </div>
      )}

      <div className="flex items-end gap-2">
        {/* Mode toggle */}
        <button
          onClick={() => setMode(mode === 'text' ? 'voice' : 'text')}
          className={clsx(
            'p-2 rounded-full transition-colors',
            mode === 'voice'
              ? 'bg-primary-100 text-primary-600'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          )}
          title={mode === 'text' ? 'Chuyển sang ghi âm' : 'Chuyển sang nhập text'}
        >
          {mode === 'voice' ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
        </button>

        {mode === 'text' ? (
          <>
            {/* Text input */}
            <textarea
              ref={inputRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Nhập tin nhắn..."
              disabled={disabled}
              rows={1}
              className="flex-1 resize-none input min-h-[44px] max-h-[120px]"
            />

            {/* Send button */}
            <button
              onClick={handleSubmit}
              disabled={!text.trim() || disabled}
              className={clsx(
                'p-3 rounded-full transition-colors',
                text.trim() && !disabled
                  ? 'bg-primary-500 text-white hover:bg-primary-600'
                  : 'bg-gray-100 text-gray-400'
              )}
            >
              <Send className="w-5 h-5" />
            </button>
          </>
        ) : (
          <>
            {/* Voice recording */}
            <div className="flex-1 flex items-center justify-center">
              {isRecording ? (
                <span className="text-primary-600 font-medium">
                  Nhấn để dừng ghi âm
                </span>
              ) : (
                <span className="text-gray-500">
                  Nhấn nút mic để bắt đầu ghi âm
                </span>
              )}
            </div>

            {/* Record button */}
            <button
              onClick={handleVoiceToggle}
              disabled={disabled}
              className={clsx(
                'p-3 rounded-full transition-all',
                isRecording
                  ? 'bg-red-500 text-white hover:bg-red-600 animate-pulse'
                  : 'bg-primary-500 text-white hover:bg-primary-600'
              )}
            >
              {isRecording ? (
                <Square className="w-5 h-5" />
              ) : (
                <Mic className="w-5 h-5" />
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
