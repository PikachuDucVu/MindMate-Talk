import { Phone, X } from 'lucide-react';
import type { CrisisLevel } from '../../types';
import { clsx } from 'clsx';

interface HotlineCardProps {
  level: CrisisLevel;
  onDismiss?: () => void;
}

const HOTLINE = {
  number: '1800-599-920',
  name: 'Đường dây Sức khỏe Tâm thần',
  hours: '24/7',
  cost: 'Miễn phí',
};

export function HotlineCard({ level, onDismiss }: HotlineCardProps) {
  if (level !== 'HIGH' && level !== 'CRITICAL') {
    return null;
  }

  const isCritical = level === 'CRITICAL';

  return (
    <div
      className={clsx(
        'mx-4 mb-4 p-4 rounded-xl border-2',
        isCritical
          ? 'bg-red-50 border-red-300'
          : 'bg-blue-50 border-blue-200'
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p
            className={clsx(
              'font-medium mb-1',
              isCritical ? 'text-red-800' : 'text-blue-800'
            )}
          >
            {isCritical
              ? 'Mình muốn bạn được an toàn.'
              : 'Nếu bạn cần hỗ trợ chuyên sâu hơn:'}
          </p>
          <p
            className={clsx(
              'text-sm mb-3',
              isCritical ? 'text-red-700' : 'text-blue-700'
            )}
          >
            {HOTLINE.name} - {HOTLINE.hours}, {HOTLINE.cost}
          </p>

          <a
            href={`tel:${HOTLINE.number.replace(/-/g, '')}`}
            className={clsx(
              'inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors',
              isCritical
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            )}
          >
            <Phone className="w-4 h-4" />
            Gọi {HOTLINE.number}
          </a>
        </div>

        {onDismiss && !isCritical && (
          <button
            onClick={onDismiss}
            className="text-blue-400 hover:text-blue-600 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
