import { MindMateMascot } from './MindMateMascot';

interface WelcomeStepProps {
  onNext: () => void;
  onLogin: () => void;
}

export function WelcomeStep({ onNext, onLogin }: WelcomeStepProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 pt-10">
      <div className="flex-1 flex flex-col items-center justify-center max-w-sm w-full">
        {/* Animated mascot */}
        <div className="animate-scale-in mb-6">
          <MindMateMascot size="lg" expression="wave" />
        </div>

        {/* Waving hand emoji */}
        <div className="animate-pop text-4xl mb-4">
          <span className="inline-block animate-wave-hand" style={{ transformOrigin: '70% 70%' }}>
            👋
          </span>
        </div>

        {/* Title with gradient */}
        <h1
          className="text-3xl font-bold mb-3 text-center animate-fade-in-up bg-gradient-to-r from-primary-600 via-primary-500 to-secondary-500 bg-clip-text text-transparent"
        >
          Chào bạn, mình là MindMate
        </h1>

        {/* Description */}
        <p
          className="text-gray-500 text-center text-lg mb-10 leading-relaxed animate-fade-in-up"
          style={{ animationDelay: '0.15s', animationFillMode: 'both' }}
        >
          Một người bạn sẵn sàng lắng nghe bạn bất cứ lúc nào, về bất cứ điều gì.
        </p>

        {/* CTA - bouncy */}
        <button
          onClick={onNext}
          className="w-full py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-bold rounded-2xl
            hover:from-primary-600 hover:to-primary-700 active:scale-[0.97]
            transition-all duration-200 text-lg shadow-lg shadow-primary-500/25
            animate-fade-in-up"
          style={{ animationDelay: '0.3s', animationFillMode: 'both' }}
        >
          Bắt đầu thôi!
        </button>

        {/* Login link */}
        <button
          onClick={onLogin}
          className="mt-5 text-primary-500 hover:text-primary-600 font-medium transition-colors animate-fade-in"
          style={{ animationDelay: '0.5s', animationFillMode: 'both' }}
        >
          Đã có tài khoản? <span className="underline underline-offset-2">Đăng nhập</span>
        </button>
      </div>

      {/* Disclaimer */}
      <p className="text-xs text-gray-400 text-center pb-6 px-4 animate-fade-in"
        style={{ animationDelay: '0.6s', animationFillMode: 'both' }}
      >
        MindMate là bạn đồng hành, không thay thế tư vấn y tế chuyên nghiệp.
      </p>
    </div>
  );
}
