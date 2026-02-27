import { useState, useEffect, useRef } from 'react';
import type { OnboardingStep } from '../../stores/onboardingStore';

// Step metadata for backgrounds & progress
const STEP_CONFIG: Record<OnboardingStep, {
  gradient: string;
  accent: string;
}> = {
  welcome: {
    gradient: 'from-blue-50 via-primary-50 to-purple-50',
    accent: 'bg-primary-500',
  },
  grade: {
    gradient: 'from-emerald-50 via-teal-50 to-cyan-50',
    accent: 'bg-emerald-500',
  },
  mood: {
    gradient: 'from-pink-50 via-rose-50 to-orange-50',
    accent: 'bg-pink-500',
  },
  concerns: {
    gradient: 'from-teal-50 via-cyan-50 to-sky-50',
    accent: 'bg-teal-500',
  },
  signup: {
    gradient: 'from-violet-50 via-purple-50 to-fuchsia-50',
    accent: 'bg-violet-500',
  },
  permission: {
    gradient: 'from-amber-50 via-orange-50 to-rose-50',
    accent: 'bg-amber-500',
  },
};

const STEPS: OnboardingStep[] = ['welcome', 'grade', 'mood', 'concerns', 'signup', 'permission'];

interface OnboardingLayoutProps {
  currentStep: OnboardingStep;
  children: React.ReactNode;
}

export function OnboardingLayout({ currentStep, children }: OnboardingLayoutProps) {
  const config = STEP_CONFIG[currentStep];
  const currentIndex = STEPS.indexOf(currentStep);
  const [direction, setDirection] = useState<'right' | 'left'>('right');
  const [isAnimating, setIsAnimating] = useState(false);
  const [displayStep, setDisplayStep] = useState(currentStep);
  const prevStepRef = useRef(currentStep);

  useEffect(() => {
    if (currentStep !== prevStepRef.current) {
      const prevIndex = STEPS.indexOf(prevStepRef.current);
      const newIndex = STEPS.indexOf(currentStep);
      setDirection(newIndex > prevIndex ? 'right' : 'left');
      setIsAnimating(true);

      // Brief transition
      const timer = setTimeout(() => {
        setDisplayStep(currentStep);
        setIsAnimating(false);
      }, 80);

      prevStepRef.current = currentStep;
      return () => clearTimeout(timer);
    }
  }, [currentStep]);

  return (
    <div className={`min-h-screen bg-gradient-to-br ${config.gradient} transition-colors duration-700 relative overflow-hidden`}>
      {/* Floating decorative elements */}
      <FloatingElements step={currentStep} />

      {/* Progress dots */}
      <div className="fixed top-0 left-0 right-0 z-30 pt-4 pb-2 px-6">
        <div className="flex items-center justify-center gap-2">
          {STEPS.map((step, index) => (
            <div
              key={step}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                index === currentIndex
                  ? `w-8 ${config.accent}`
                  : index < currentIndex
                  ? 'w-4 bg-gray-300'
                  : 'w-4 bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Step content with animation */}
      <div
        key={displayStep}
        className={`
          min-h-screen
          ${isAnimating ? 'opacity-0' : 'opacity-100'}
          ${!isAnimating ? (direction === 'right' ? 'animate-slide-in-right' : 'animate-slide-in-left') : ''}
          transition-opacity duration-100
        `}
      >
        {children}
      </div>
    </div>
  );
}

// Floating decorative elements for background
function FloatingElements({ step }: { step: OnboardingStep }) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {/* Common floating shapes */}
      <div className="absolute top-[15%] left-[8%] w-16 h-16 rounded-full bg-primary-200/30 animate-float" />
      <div className="absolute top-[25%] right-[12%] w-10 h-10 rounded-full bg-secondary-200/25 animate-float-slow" />
      <div className="absolute bottom-[30%] left-[15%] w-8 h-8 rounded-full bg-emerald-200/30 animate-float-delay" />
      <div className="absolute top-[60%] right-[8%] w-14 h-14 rounded-full bg-amber-200/25 animate-float" />
      <div className="absolute bottom-[15%] right-[20%] w-6 h-6 rounded-full bg-rose-200/30 animate-float-slow" />

      {/* Step-specific decorations */}
      {step === 'welcome' && (
        <>
          <div className="absolute top-[12%] right-[25%] text-2xl animate-float opacity-40">
            <HeartSVG />
          </div>
          <div className="absolute bottom-[25%] left-[10%] text-xl animate-float-delay opacity-30">
            <StarSVG />
          </div>
          <div className="absolute top-[40%] left-[5%] text-lg animate-float-slow opacity-25">
            <SparklesSVG />
          </div>
        </>
      )}

      {step === 'grade' && (
        <>
          <div className="absolute top-[18%] left-[12%] animate-wiggle opacity-30">
            <BookSVG />
          </div>
          <div className="absolute bottom-[20%] right-[10%] animate-float opacity-25">
            <PencilSVG />
          </div>
        </>
      )}

      {step === 'mood' && (
        <>
          <div className="absolute top-[15%] right-[20%] animate-float opacity-30">
            <HeartSVG />
          </div>
          <div className="absolute bottom-[28%] left-[12%] animate-float-slow opacity-25">
            <SparklesSVG />
          </div>
        </>
      )}

      {step === 'concerns' && (
        <>
          <div className="absolute top-[18%] left-[10%] animate-wiggle opacity-30">
            <StarSVG />
          </div>
          <div className="absolute bottom-[22%] right-[12%] animate-float opacity-25">
            <BookSVG />
          </div>
        </>
      )}

      {step === 'permission' && (
        <>
          <div className="absolute top-[20%] right-[15%] animate-float opacity-30">
            <MusicNoteSVG />
          </div>
          <div className="absolute bottom-[30%] left-[8%] animate-float-delay opacity-25">
            <MusicNoteSVG />
          </div>
        </>
      )}
    </div>
  );
}

// Small SVG decorative icons
function HeartSVG() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-pink-400">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function StarSVG() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-amber-400">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function SparklesSVG() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-primary-400">
      <path d="M12 3v1m0 16v1m-8-9H3m18 0h-1M5.6 5.6l.7.7m12.4 12.4l-.7-.7M5.6 18.4l.7-.7M18.4 5.6l-.7.7" />
      <circle cx="12" cy="12" r="4" />
    </svg>
  );
}

function BookSVG() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-emerald-400">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}

function PencilSVG() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-teal-400">
      <path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
    </svg>
  );
}

function MusicNoteSVG() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-amber-400">
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  );
}
