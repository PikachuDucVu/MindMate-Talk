import { useState } from 'react';
import { ChevronLeft, Mail, Lock, Eye, EyeOff, UserPlus, LogIn } from 'lucide-react';
import { clsx } from 'clsx';
import { useAuthStore } from '../../stores/authStore';

interface SignupStepProps {
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}

export function SignupStep({ onNext, onBack, onSkip }: SignupStepProps) {
  const { register, login, isLoading, error, clearError } = useAuthStore();

  const [mode, setMode] = useState<'register' | 'login'>('register');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    clearError();

    if (mode === 'register' && password !== confirmPassword) {
      setLocalError('Mật khẩu xác nhận không khớp');
      return;
    }

    if (password.length < 6) {
      setLocalError('Mật khẩu cần ít nhất 6 ký tự');
      return;
    }

    try {
      if (mode === 'register') {
        await register(email, password);
      } else {
        await login(email, password);
      }
      onNext();
    } catch {
      // Error handled by store
    }
  };

  const displayError = localError || error;

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
        {/* Icon */}
        <div className="animate-scale-in mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center mx-auto">
            {mode === 'register' ? (
              <UserPlus className="w-8 h-8 text-violet-500" />
            ) : (
              <LogIn className="w-8 h-8 text-violet-500" />
            )}
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center animate-fade-in-up">
          {mode === 'register' ? 'Tạo tài khoản' : 'Đăng nhập'}
        </h2>
        <p className="text-gray-500 mb-6 text-center animate-fade-in-up" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
          {mode === 'register'
            ? 'Để mình nhớ và đồng hành cùng bạn lâu dài'
            : 'Chào mừng bạn trở lại!'}
        </p>

        {/* Mode toggle - pill style */}
        <div className="flex gap-1 p-1 bg-gray-100/80 rounded-2xl mb-6 animate-fade-in" style={{ animationDelay: '0.15s', animationFillMode: 'both' }}>
          <button
            type="button"
            onClick={() => { setMode('register'); clearError(); setLocalError(''); }}
            className={clsx(
              'flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200',
              mode === 'register' ? 'bg-white text-violet-600 shadow-sm' : 'text-gray-500 hover:text-gray-600'
            )}
          >
            Đăng ký
          </button>
          <button
            type="button"
            onClick={() => { setMode('login'); clearError(); setLocalError(''); }}
            className={clsx(
              'flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200',
              mode === 'login' ? 'bg-white text-violet-600 shadow-sm' : 'text-gray-500 hover:text-gray-600'
            )}
          >
            Đăng nhập
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Email */}
          <div className="animate-fade-in-up" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
            <div className="relative group">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-violet-400 transition-colors" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
                className="w-full pl-11 pr-4 py-3.5 bg-white/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all outline-none"
              />
            </div>
          </div>

          {/* Password */}
          <div className="animate-fade-in-up" style={{ animationDelay: '0.25s', animationFillMode: 'both' }}>
            <div className="relative group">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-violet-400 transition-colors" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mật khẩu (ít nhất 6 ký tự)"
                required
                minLength={6}
                className="w-full pl-11 pr-11 py-3.5 bg-white/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Confirm Password (register only) */}
          {mode === 'register' && (
            <div className="animate-fade-in-up" style={{ animationDelay: '0.3s', animationFillMode: 'both' }}>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-violet-400 transition-colors" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Xác nhận mật khẩu"
                  required
                  minLength={6}
                  className="w-full pl-11 pr-4 py-3.5 bg-white/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all outline-none"
                />
              </div>
            </div>
          )}

          {/* Error */}
          {displayError && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm animate-pop">
              {displayError}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className={clsx(
              'w-full py-4 font-bold rounded-2xl transition-all duration-200 text-lg',
              isLoading
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-violet-500 to-purple-500 text-white hover:from-violet-600 hover:to-purple-600 active:scale-[0.97] shadow-lg shadow-violet-500/25'
            )}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Đang xử lý...
              </span>
            ) : mode === 'register' ? 'Đăng ký' : 'Đăng nhập'}
          </button>
        </form>

        {/* Divider + Skip */}
        <div className="flex items-center gap-3 my-6 animate-fade-in" style={{ animationDelay: '0.4s', animationFillMode: 'both' }}>
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400 font-medium">HOẶC</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        <button
          onClick={onSkip}
          className="w-full py-3 border-2 border-dashed border-gray-200 text-gray-500 hover:text-gray-700 hover:border-gray-300 font-medium rounded-2xl transition-all animate-fade-in"
          style={{ animationDelay: '0.45s', animationFillMode: 'both' }}
        >
          Bỏ qua, dùng thử trước
        </button>
      </div>
    </div>
  );
}
