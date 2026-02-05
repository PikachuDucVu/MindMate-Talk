import { clsx } from 'clsx';

interface VoiceWaveProps {
  isRecording: boolean;
}

export function VoiceWave({ isRecording }: VoiceWaveProps) {
  return (
    <div className="flex items-center justify-center gap-1 h-8">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className={clsx(
            'w-1 bg-primary-500 rounded-full transition-all duration-200',
            isRecording ? 'voice-wave-bar' : 'h-2'
          )}
          style={{
            height: isRecording ? `${Math.random() * 20 + 10}px` : '8px',
          }}
        />
      ))}
    </div>
  );
}
