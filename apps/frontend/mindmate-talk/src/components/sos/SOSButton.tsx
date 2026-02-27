import { useState } from 'react';
import { LifeBuoy } from 'lucide-react';
import { clsx } from 'clsx';
import { SOSModal } from './SOSModal';

interface SOSButtonProps {
  className?: string;
}

export function SOSButton({ className }: SOSButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className={clsx(
          'flex items-center gap-1.5',
          'p-2 rounded-lg',
          'text-teal-600 hover:bg-teal-50',
          'active:scale-95',
          'transition-all duration-200',
          className
        )}
        aria-label="Hỗ trợ khẩn cấp"
        title="Đường dây hỗ trợ"
      >
        <LifeBuoy className="w-5 h-5" />
        <span className="text-sm font-medium hidden sm:inline">SOS</span>
      </button>

      <SOSModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}

export default SOSButton;
