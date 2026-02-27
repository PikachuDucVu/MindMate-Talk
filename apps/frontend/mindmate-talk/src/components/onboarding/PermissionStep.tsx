import { useState } from 'react';
import { Mic, MessageSquare, ChevronLeft, Check } from 'lucide-react';
import { clsx } from 'clsx';
import { MindMateMascot } from './MindMateMascot';

interface PermissionStepProps {
  onComplete: (preferVoice: boolean) => void;
  onBack: () => void;
}

export function PermissionStep({ onComplete, onBack }: PermissionStepProps) {
  const [permissionState, setPermissionState] = useState<'idle' | 'requesting' | 'granted' | 'denied'>('idle');

  const handleAllowMic = async () => {
    setPermissionState('requesting');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      setPermissionState('granted');
      setTimeout(() => onComplete(true), 1200);
    } catch {
      setPermissionState('denied');
    }
  };

  const handleUseText = () => {
    onComplete(false);
  };

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
      <div className="flex-1 flex flex-col items-center justify-center max-w-sm mx-auto w-full">
        {/* Animated mic with ripples */}
        {permissionState === 'granted' ? (
          <div className="animate-scale-in mb-8">
            <MindMateMascot size="md" expression="celebrate" />
          </div>
        ) : (
          <div className="relative mb-8 animate-scale-in">
            {/* Ripple rings */}
            {permissionState !== 'denied' && (
              <>
                <div className={clsx(
                  'absolute inset-0 rounded-full',
                  permissionState === 'idle' ? 'bg-amber-200/30 animate-ripple' : 'bg-primary-200/30 animate-ripple'
                )} />
                <div className={clsx(
                  'absolute inset-0 rounded-full',
                  permissionState === 'idle' ? 'bg-amber-200/20 animate-ripple-delay' : 'bg-primary-200/20 animate-ripple-delay'
                )} />
              </>
            )}

            {/* Main mic circle */}
            <div className={clsx(
              'relative w-28 h-28 rounded-full flex items-center justify-center transition-all duration-500',
              permissionState === 'denied'
                ? 'bg-gray-100'
                : permissionState === 'requesting'
                ? 'bg-gradient-to-br from-primary-100 to-primary-200'
                : 'bg-gradient-to-br from-amber-100 to-orange-100'
            )}>
              <Mic className={clsx(
                'w-12 h-12 transition-all duration-300',
                permissionState === 'denied'
                  ? 'text-gray-400'
                  : permissionState === 'requesting'
                  ? 'text-primary-500 animate-pulse'
                  : 'text-amber-500'
              )} />
            </div>
          </div>
        )}

        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-900 mb-3 text-center animate-fade-in-up">
          {permissionState === 'granted'
            ? 'Tuyệt vời! Mình sẵn sàng rồi!'
            : permissionState === 'denied'
            ? 'Không sao cả!'
            : 'Cho phép MindMate nghe bạn nói?'}
        </h2>

        <p className="text-gray-500 text-center mb-8 leading-relaxed animate-fade-in-up"
          style={{ animationDelay: '0.1s', animationFillMode: 'both' }}
        >
          {permissionState === 'granted'
            ? 'Bạn có thể nói chuyện với mình bằng giọng nói luôn nhé.'
            : permissionState === 'denied'
            ? 'Bạn vẫn có thể chat bằng text. Nếu muốn dùng voice sau, bạn có thể bật trong cài đặt trình duyệt.'
            : 'Để mình có thể lắng nghe và trò chuyện bằng giọng nói với bạn.'}
        </p>

        {/* Actions */}
        {permissionState === 'idle' && (
          <div className="w-full space-y-3 animate-fade-in-up" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
            <button
              onClick={handleAllowMic}
              className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-2xl
                hover:from-amber-600 hover:to-orange-600 active:scale-[0.97]
                transition-all duration-200 text-lg shadow-lg shadow-amber-500/25
                flex items-center justify-center gap-2"
            >
              <Mic className="w-5 h-5" />
              Cho phép micro
            </button>

            <button
              onClick={handleUseText}
              className="w-full py-3 flex items-center justify-center gap-2 text-gray-500 hover:text-gray-700 font-medium transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              Mình muốn chat bằng text
            </button>
          </div>
        )}

        {permissionState === 'requesting' && (
          <div className="flex items-center gap-3 text-primary-600 font-medium animate-fade-in">
            <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            Đang yêu cầu quyền...
          </div>
        )}

        {permissionState === 'granted' && (
          <div className="w-full space-y-4 animate-fade-in-up">
            {/* Confetti-like celebration */}
            <div className="flex items-center justify-center gap-2 relative">
              <div className="w-3 h-3 bg-amber-400 rounded-full animate-confetti-1" />
              <div className="w-3 h-3 bg-primary-400 rounded-full animate-confetti-2" />
              <div className="w-3 h-3 bg-emerald-400 rounded-full animate-confetti-3" />
              <div className="w-3 h-3 bg-rose-400 rounded-full animate-confetti-1" style={{ animationDelay: '0.15s' }} />
              <div className="w-3 h-3 bg-violet-400 rounded-full animate-confetti-2" style={{ animationDelay: '0.1s' }} />
            </div>
            <div className="flex items-center justify-center gap-2 text-emerald-600 font-semibold text-lg">
              <Check className="w-6 h-6" />
              Đang chuyển bạn đến MindMate...
            </div>
          </div>
        )}

        {permissionState === 'denied' && (
          <button
            onClick={handleUseText}
            className="w-full py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-bold rounded-2xl
              hover:from-primary-600 hover:to-primary-700 active:scale-[0.97]
              transition-all duration-200 text-lg shadow-lg shadow-primary-500/25
              flex items-center justify-center gap-2 animate-pop"
          >
            <MessageSquare className="w-5 h-5" />
            Tiếp tục bằng text
          </button>
        )}
      </div>
    </div>
  );
}
