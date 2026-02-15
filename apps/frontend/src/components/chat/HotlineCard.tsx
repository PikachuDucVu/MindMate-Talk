import { Phone, X } from 'lucide-react';
import type { CrisisLevel } from '../../types';
import { clsx } from 'clsx';
import { reportHotlineClick } from '../../services/api';

interface HotlineCardProps {
  level: CrisisLevel;
  crisisEventId?: string | null;
  onDismiss?: () => void;
}

const HOTLINES = [
  {
    number: '1800-599-920',
    name: 'Đường dây Sức khỏe Tâm thần',
    hours: '24/7',
    cost: 'Miễn phí',
  },
  {
    number: '111',
    name: 'Tổng đài Bảo vệ Trẻ em',
    hours: '24/7',
    cost: 'Miễn phí',
  },
];

export function HotlineCard({ level, crisisEventId, onDismiss }: HotlineCardProps) {
  if (level !== 'HIGH' && level !== 'CRITICAL') {
    return null;
  }

  const isCritical = level === 'CRITICAL';

  const handleCall = (number: string) => {
    // Report hotline click (fire and forget)
    if (crisisEventId) {
      reportHotlineClick(crisisEventId).catch(() => {});
    }
    window.location.href = `tel:${number.replace(/-/g, '')}`;
  };

  return (
    <div
      className={clsx(
        'mx-4 my-3 p-4 rounded-xl border-2',
        isCritical
          ? 'bg-red-50 border-red-300'
          : 'bg-teal-50 border-teal-200'
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p
            className={clsx(
              'font-medium mb-1',
              isCritical ? 'text-red-800' : 'text-teal-800'
            )}
          >
            {isCritical
              ? 'Mình muốn bạn được an toàn.'
              : 'Nếu bạn cần hỗ trợ chuyên sâu hơn:'}
          </p>

          <div className="space-y-2 mt-2">
            {HOTLINES.map((hotline) => (
              <button
                key={hotline.number}
                onClick={() => handleCall(hotline.number)}
                className={clsx(
                  'flex items-center gap-2 w-full px-3 py-2 rounded-lg font-medium text-sm transition-colors text-left',
                  isCritical
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-teal-600 text-white hover:bg-teal-700'
                )}
              >
                <Phone className="w-4 h-4 flex-shrink-0" />
                <div>
                  <div>{hotline.number} - {hotline.name}</div>
                  <div className="text-xs opacity-80">{hotline.hours} - {hotline.cost}</div>
                </div>
              </button>
            ))}
          </div>

          <p className={clsx(
            'text-xs mt-2',
            isCritical ? 'text-red-500' : 'text-teal-600'
          )}>
            Tất cả cuộc gọi đều được bảo mật.
          </p>
        </div>

        {onDismiss && !isCritical && (
          <button
            onClick={onDismiss}
            className="text-teal-400 hover:text-teal-600 p-1 ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
