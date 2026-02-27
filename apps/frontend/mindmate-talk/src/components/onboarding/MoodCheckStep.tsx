import { clsx } from 'clsx';
import { ChevronLeft } from 'lucide-react';
import type { EmotionType } from '../../types';

interface MoodCheckStepProps {
  selectedMoods: EmotionType[];
  onToggle: (emotion: EmotionType) => void;
  onNext: () => void;
  onBack: () => void;
}

const MOOD_OPTIONS: { value: EmotionType; label: string; emoji: string; color: string; activeColor: string }[] = [
  { value: 'HAPPY', label: 'Vui vẻ', emoji: '😊', color: 'bg-amber-50 text-amber-600', activeColor: 'bg-amber-100 ring-amber-400 border-amber-400' },
  { value: 'CALM', label: 'Bình yên', emoji: '😌', color: 'bg-green-50 text-green-600', activeColor: 'bg-green-100 ring-green-400 border-green-400' },
  { value: 'NEUTRAL', label: 'Ổn thôi', emoji: '😐', color: 'bg-slate-50 text-slate-600', activeColor: 'bg-slate-100 ring-slate-400 border-slate-400' },
  { value: 'TIRED', label: 'Mệt mỏi', emoji: '😩', color: 'bg-orange-50 text-orange-600', activeColor: 'bg-orange-100 ring-orange-400 border-orange-400' },
  { value: 'ANXIOUS', label: 'Lo lắng', emoji: '😰', color: 'bg-yellow-50 text-yellow-600', activeColor: 'bg-yellow-100 ring-yellow-400 border-yellow-400' },
  { value: 'SAD', label: 'Buồn', emoji: '😢', color: 'bg-blue-50 text-blue-600', activeColor: 'bg-blue-100 ring-blue-400 border-blue-400' },
  { value: 'CONFUSED', label: 'Rối bời', emoji: '😵‍💫', color: 'bg-purple-50 text-purple-600', activeColor: 'bg-purple-100 ring-purple-400 border-purple-400' },
  { value: 'LONELY', label: 'Cô đơn', emoji: '🥺', color: 'bg-indigo-50 text-indigo-600', activeColor: 'bg-indigo-100 ring-indigo-400 border-indigo-400' },
  { value: 'ANGRY', label: 'Tức giận', emoji: '😤', color: 'bg-red-50 text-red-600', activeColor: 'bg-red-100 ring-red-400 border-red-400' },
  { value: 'OVERWHELMED', label: 'Quá tải', emoji: '🤯', color: 'bg-rose-50 text-rose-600', activeColor: 'bg-rose-100 ring-rose-400 border-rose-400' },
];

// Stagger animation delays
const ANIM_CLASSES = [
  'animate-pop',
  'animate-pop-delay-1',
  'animate-pop-delay-2',
  'animate-pop-delay-3',
  'animate-pop-delay-4',
];

export function MoodCheckStep({ selectedMoods, onToggle, onNext, onBack }: MoodCheckStepProps) {
  return (
    <div className="flex flex-col min-h-screen px-6 pt-10">
      {/* Header */}
      <div className="pt-4 pb-2">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="text-sm">Quay lại</span>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 animate-fade-in-up">
          Hôm nay bạn cảm thấy thế nào?
        </h2>
        <p className="text-gray-500 mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
          Chọn tất cả những gì phù hợp với bạn
        </p>

        {/* Mood grid */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          {MOOD_OPTIONS.map((mood, index) => {
            const isSelected = selectedMoods.includes(mood.value);
            return (
              <button
                key={mood.value}
                onClick={() => onToggle(mood.value)}
                className={clsx(
                  'flex items-center gap-3 px-4 py-3 rounded-2xl border-2 transition-all duration-200 cursor-pointer text-left',
                  ANIM_CLASSES[index % ANIM_CLASSES.length],
                  isSelected
                    ? `${mood.activeColor} ring-2 scale-[1.03] shadow-sm`
                    : 'border-gray-100 bg-white/80 hover:border-gray-200 hover:shadow-sm'
                )}
              >
                <span className={clsx(
                  'text-2xl transition-transform duration-200',
                  isSelected && 'scale-110'
                )}>
                  {mood.emoji}
                </span>
                <span className={clsx(
                  'text-sm font-medium transition-colors',
                  isSelected ? 'text-gray-900' : 'text-gray-600'
                )}>
                  {mood.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Continue */}
        <button
          onClick={onNext}
          disabled={selectedMoods.length === 0}
          className={clsx(
            'w-full py-4 font-bold rounded-2xl transition-all duration-300 text-lg',
            selectedMoods.length > 0
              ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:from-pink-600 hover:to-rose-600 active:scale-[0.97] shadow-lg shadow-pink-500/25'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          )}
        >
          Tiếp tục
        </button>

        {/* Skip */}
        <button
          onClick={onNext}
          className="mt-3 text-gray-400 hover:text-gray-600 text-sm font-medium transition-colors text-center"
        >
          Bỏ qua
        </button>
      </div>
    </div>
  );
}
