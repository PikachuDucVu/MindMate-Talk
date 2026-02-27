import { Phone, X, ExternalLink, LifeBuoy } from 'lucide-react';
import { clsx } from 'clsx';

interface SOSModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Hotline data from CRISIS-PROTOCOL.md
const HOTLINES = [
  {
    id: 'mental_health',
    name: 'Đường dây Sức khỏe Tâm thần',
    number: '1800-599-920',
    hours: '24/7',
    description: 'Miễn phí, bảo mật',
    primary: true,
  },
  {
    id: 'child_protection',
    name: 'Tổng đài bảo vệ trẻ em',
    number: '111',
    hours: '24/7',
    description: 'Miễn phí',
  },
  {
    id: 'blue_dragon',
    name: 'Blue Dragon Foundation',
    number: '1800-599-199',
    hours: '24/7',
    description: 'Hỗ trợ trẻ em và thanh thiếu niên',
  },
  {
    id: 'saigon_children',
    name: "Saigon Children's Charity",
    number: '(028) 3822-5065',
    hours: '8:00-17:00',
    description: 'Hỗ trợ giáo dục và tâm lý',
    website: 'https://saigonchildren.com',
  },
];

export function SOSModal({ isOpen, onClose }: SOSModalProps) {
  if (!isOpen) return null;

  const handleCall = (number: string) => {
    const cleanNumber = number.replace(/[^0-9+]/g, '');
    window.location.href = `tel:${cleanNumber}`;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-scale-in">
        {/* Header - Teal theme (warm, not alarming) */}
        <div className="bg-teal-600 text-white px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <LifeBuoy className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Bạn cần hỗ trợ?</h2>
                <p className="text-sm text-teal-100">Gọi ngay - Miễn phí, bảo mật</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
          {HOTLINES.map((hotline) => (
            <div
              key={hotline.id}
              className={clsx(
                'rounded-xl border-2 overflow-hidden',
                hotline.primary
                  ? 'border-teal-200 bg-teal-50'
                  : 'border-gray-200 bg-white'
              )}
            >
              <button
                onClick={() => handleCall(hotline.number)}
                className="w-full text-left p-4 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900">{hotline.name}</span>
                      {hotline.primary && (
                        <span className="px-2 py-0.5 bg-teal-500 text-white text-xs rounded-full">
                          Khuyên dùng
                        </span>
                      )}
                    </div>
                    <div className="text-lg font-bold text-teal-600 mt-1">
                      {hotline.number}
                    </div>
                    <div className="text-sm text-gray-500 mt-0.5">
                      {hotline.hours} • {hotline.description}
                    </div>
                  </div>
                  <div className="ml-3">
                    <div className="w-12 h-12 bg-teal-500 rounded-full flex items-center justify-center">
                      <Phone className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
              </button>

              {hotline.website && (
                <a
                  href={hotline.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 border-t border-gray-200 text-sm text-teal-600 hover:bg-teal-50 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink className="w-4 h-4" />
                  Xem website
                </a>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 bg-gray-50 border-t">
          <p className="text-xs text-gray-500 text-center">
            Tất cả cuộc gọi đều được bảo mật. Bạn không đơn độc.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes scale-in {
          from {
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}

export default SOSModal;
