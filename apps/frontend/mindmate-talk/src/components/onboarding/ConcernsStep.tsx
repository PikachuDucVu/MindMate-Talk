import { clsx } from 'clsx';
import { ChevronLeft, BookOpen, Home, Users, Heart, Frown, Compass, Moon, Zap, ShieldAlert, UserX } from 'lucide-react';

interface ConcernsStepProps {
  selectedConcerns: string[];
  onToggle: (concern: string) => void;
  onNext: () => void;
  onBack: () => void;
}

const CONCERNS = [
  { value: 'STUDY', label: 'Học tập & Thi cử', icon: BookOpen, color: 'text-blue-500 bg-blue-50', activeColor: 'border-blue-400 bg-blue-50 ring-blue-400/20' },
  { value: 'FAMILY', label: 'Gia đình', icon: Home, color: 'text-emerald-500 bg-emerald-50', activeColor: 'border-emerald-400 bg-emerald-50 ring-emerald-400/20' },
  { value: 'FRIENDS', label: 'Bạn bè', icon: Users, color: 'text-cyan-500 bg-cyan-50', activeColor: 'border-cyan-400 bg-cyan-50 ring-cyan-400/20' },
  { value: 'ROMANCE', label: 'Tình cảm', icon: Heart, color: 'text-pink-500 bg-pink-50', activeColor: 'border-pink-400 bg-pink-50 ring-pink-400/20' },
  { value: 'SELF_ESTEEM', label: 'Tự tin / Ngoại hình', icon: Frown, color: 'text-violet-500 bg-violet-50', activeColor: 'border-violet-400 bg-violet-50 ring-violet-400/20' },
  { value: 'FUTURE', label: 'Tương lai / Nghề nghiệp', icon: Compass, color: 'text-amber-500 bg-amber-50', activeColor: 'border-amber-400 bg-amber-50 ring-amber-400/20' },
  { value: 'SLEEP', label: 'Giấc ngủ', icon: Moon, color: 'text-indigo-500 bg-indigo-50', activeColor: 'border-indigo-400 bg-indigo-50 ring-indigo-400/20' },
  { value: 'STRESS', label: 'Stress / Áp lực', icon: Zap, color: 'text-orange-500 bg-orange-50', activeColor: 'border-orange-400 bg-orange-50 ring-orange-400/20' },
  { value: 'BULLYING', label: 'Bị bắt nạt', icon: ShieldAlert, color: 'text-red-500 bg-red-50', activeColor: 'border-red-400 bg-red-50 ring-red-400/20' },
  { value: 'LONELINESS', label: 'Cô đơn', icon: UserX, color: 'text-slate-500 bg-slate-50', activeColor: 'border-slate-400 bg-slate-50 ring-slate-400/20' },
];

const ANIM_CLASSES = [
  'animate-pop',
  'animate-pop-delay-1',
  'animate-pop-delay-2',
  'animate-pop-delay-3',
  'animate-pop-delay-4',
];

export function ConcernsStep({ selectedConcerns, onToggle, onNext, onBack }: ConcernsStepProps) {
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
          Bạn đang quan tâm điều gì?
        </h2>
        <p className="text-gray-500 mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
          Chọn các chủ đề để mình hiểu bạn hơn
        </p>

        {/* Concerns grid */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          {CONCERNS.map((concern, index) => {
            const Icon = concern.icon;
            const isSelected = selectedConcerns.includes(concern.value);
            return (
              <button
                key={concern.value}
                onClick={() => onToggle(concern.value)}
                className={clsx(
                  'flex flex-col items-center gap-2 px-3 py-4 rounded-2xl border-2 transition-all duration-200 cursor-pointer',
                  ANIM_CLASSES[index % ANIM_CLASSES.length],
                  isSelected
                    ? `${concern.activeColor} ring-2 scale-[1.03] shadow-sm`
                    : 'border-gray-100 bg-white/80 hover:border-gray-200 hover:shadow-sm'
                )}
              >
                <div className={clsx(
                  'w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200',
                  isSelected ? concern.color : 'bg-gray-50 text-gray-400'
                )}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={clsx(
                  'text-xs font-medium text-center leading-tight transition-colors',
                  isSelected ? 'text-gray-900' : 'text-gray-500'
                )}>
                  {concern.label}
                </span>
                {isSelected && (
                  <div className="animate-pop">
                    <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Continue */}
        <button
          onClick={onNext}
          disabled={selectedConcerns.length === 0}
          className={clsx(
            'w-full py-4 font-bold rounded-2xl transition-all duration-300 text-lg',
            selectedConcerns.length > 0
              ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white hover:from-teal-600 hover:to-cyan-600 active:scale-[0.97] shadow-lg shadow-teal-500/25'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          )}
        >
          Tiếp tục ({selectedConcerns.length} đã chọn)
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
