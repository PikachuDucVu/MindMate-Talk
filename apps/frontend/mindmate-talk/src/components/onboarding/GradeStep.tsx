import { clsx } from 'clsx';
import { ChevronLeft, BookOpen, GraduationCap, PenTool, FileText, School } from 'lucide-react';

interface GradeStepProps {
  selectedGrade: string | null;
  onSelect: (grade: string) => void;
  onNext: () => void;
  onBack: () => void;
}

const GRADES = [
  { value: 'GRADE_6_7', label: 'Lớp 6-7', subtitle: 'Trung học cơ sở', icon: BookOpen, color: 'text-emerald-500 bg-emerald-50 border-emerald-200', activeColor: 'border-emerald-500 bg-emerald-50 ring-emerald-500/20' },
  { value: 'GRADE_8_9', label: 'Lớp 8-9', subtitle: 'Chuẩn bị lên cấp 3', icon: PenTool, color: 'text-blue-500 bg-blue-50 border-blue-200', activeColor: 'border-blue-500 bg-blue-50 ring-blue-500/20' },
  { value: 'GRADE_10_11', label: 'Lớp 10-11', subtitle: 'Trung học phổ thông', icon: FileText, color: 'text-violet-500 bg-violet-50 border-violet-200', activeColor: 'border-violet-500 bg-violet-50 ring-violet-500/20' },
  { value: 'GRADE_12', label: 'Lớp 12', subtitle: 'Năm cuối cấp', icon: GraduationCap, color: 'text-amber-500 bg-amber-50 border-amber-200', activeColor: 'border-amber-500 bg-amber-50 ring-amber-500/20' },
  { value: 'UNIVERSITY', label: 'Đại học', subtitle: 'Sinh viên / Đã tốt nghiệp', icon: School, color: 'text-rose-500 bg-rose-50 border-rose-200', activeColor: 'border-rose-500 bg-rose-50 ring-rose-500/20' },
];

const ANIM_DELAYS = ['animate-pop', 'animate-pop-delay-1', 'animate-pop-delay-2', 'animate-pop-delay-3', 'animate-pop-delay-4'];

export function GradeStep({ selectedGrade, onSelect, onNext, onBack }: GradeStepProps) {
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
          Bạn đang học lớp mấy?
        </h2>
        <p className="text-gray-500 mb-8 animate-fade-in-up" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
          Để mình nói chuyện phù hợp với bạn hơn
        </p>

        {/* Grade options - staggered animation */}
        <div className="space-y-3 mb-8">
          {GRADES.map((grade, index) => {
            const Icon = grade.icon;
            const isSelected = selectedGrade === grade.value;
            return (
              <button
                key={grade.value}
                onClick={() => onSelect(grade.value)}
                className={clsx(
                  'w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl border-2 text-left transition-all duration-200 cursor-pointer',
                  ANIM_DELAYS[index],
                  isSelected
                    ? `${grade.activeColor} ring-4 scale-[1.02] shadow-sm`
                    : 'border-gray-100 bg-white/80 hover:border-gray-200 hover:bg-white hover:shadow-sm'
                )}
              >
                <div className={clsx(
                  'w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200',
                  isSelected ? grade.color : 'bg-gray-50 text-gray-400'
                )}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className={clsx(
                    'font-semibold transition-colors',
                    isSelected ? 'text-gray-900' : 'text-gray-700'
                  )}>{grade.label}</div>
                  <div className="text-sm text-gray-400">{grade.subtitle}</div>
                </div>
                {isSelected && (
                  <div className="animate-pop">
                    <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 20 20">
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
          disabled={!selectedGrade}
          className={clsx(
            'w-full py-4 font-bold rounded-2xl transition-all duration-300 text-lg',
            selectedGrade
              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 active:scale-[0.97] shadow-lg shadow-emerald-500/25'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          )}
        >
          Tiếp tục
        </button>
      </div>
    </div>
  );
}
