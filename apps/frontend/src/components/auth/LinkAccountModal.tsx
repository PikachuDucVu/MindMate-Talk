import { useState } from 'react';
import { X, Mail, Lock, User as UserIcon } from 'lucide-react';
import { clsx } from 'clsx';
import { useAuthStore } from '../../stores/authStore';

interface LinkAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LinkAccountModal({ isOpen, onClose }: LinkAccountModalProps) {
  const { linkAccount, register, user, isLoading, error, clearError } = useAuthStore();

  const [mode, setMode] = useState<'link' | 'register'>('link');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (mode === 'link' && user?.isGuest) {
        await linkAccount(email, password);
      } else {
        await register(email, password, nickname || undefined);
      }
      onClose();
    } catch {
      // Error handled by store
    }
  };

  const handleClose = () => {
    clearError();
    setEmail('');
    setPassword('');
    setNickname('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">
            {user?.isGuest ? 'Lưu tài khoản' : 'Đăng ký'}
          </h2>
          <button
            onClick={handleClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {user?.isGuest && (
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-3 text-sm text-primary-700">
              Liên kết email để lưu lại lịch sử chat và truy cập từ thiết bị khác.
            </div>
          )}

          {/* Tabs for guest users */}
          {user?.isGuest && (
            <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
              <button
                type="button"
                onClick={() => setMode('link')}
                className={clsx(
                  'flex-1 py-2 text-sm font-medium rounded-md transition-colors',
                  mode === 'link' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-600'
                )}
              >
                Liên kết
              </button>
              <button
                type="button"
                onClick={() => setMode('register')}
                className={clsx(
                  'flex-1 py-2 text-sm font-medium rounded-md transition-colors',
                  mode === 'register' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-600'
                )}
              >
                Tạo mới
              </button>
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                required
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ít nhất 6 ký tự"
                required
                minLength={6}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Nickname (optional for register) */}
          {mode === 'register' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tên hiển thị (tùy chọn)
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="Tên của bạn"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className={clsx(
              'w-full py-2.5 text-white font-medium rounded-lg transition-colors',
              isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary-500 hover:bg-primary-600'
            )}
          >
            {isLoading ? 'Đang xử lý...' : user?.isGuest ? 'Lưu tài khoản' : 'Đăng ký'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default LinkAccountModal;
