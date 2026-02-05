import { Heart } from 'lucide-react';
import { clsx } from 'clsx';
import { useMoodStore } from '../../stores/moodStore';
import { EMOTION_DATA } from '../../types';

interface MoodButtonProps {
  onClick: () => void;
  className?: string;
}

export function MoodButton({ onClick, className }: MoodButtonProps) {
  const { todayMood, hasRecordedToday } = useMoodStore();

  // Show today's mood if already recorded
  if (hasRecordedToday && todayMood) {
    const primaryEmotion = todayMood.emotions[0];
    const emotionData = EMOTION_DATA[primaryEmotion];

    return (
      <button
        onClick={onClick}
        className={clsx(
          'flex items-center gap-2 px-3 py-1.5 rounded-full',
          'bg-primary-50 text-primary-700 border border-primary-200',
          'hover:bg-primary-100 transition-colors',
          className
        )}
      >
        <span className="text-lg">{emotionData.emoji}</span>
        <span className="text-sm font-medium">{emotionData.label}</span>
      </button>
    );
  }

  // Show prompt to record mood
  return (
    <button
      onClick={onClick}
      className={clsx(
        'flex items-center gap-2 px-3 py-1.5 rounded-full',
        'bg-gray-100 text-gray-600 border border-gray-200',
        'hover:bg-gray-200 hover:text-gray-700 transition-colors',
        className
      )}
    >
      <Heart className="w-4 h-4" />
      <span className="text-sm font-medium">Mood hôm nay?</span>
    </button>
  );
}

export default MoodButton;
