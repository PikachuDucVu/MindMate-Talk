import { RotateCcw, Settings, Info } from 'lucide-react';

interface HeaderProps {
  onNewChat: () => void;
}

export function Header({ onNewChat }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between max-w-3xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center">
            <span className="text-white text-lg font-bold">M</span>
          </div>
          <div>
            <h1 className="font-semibold text-gray-800">MindMate</h1>
            <p className="text-xs text-gray-500">Người bạn đồng hành</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onNewChat}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
            title="Cuộc trò chuyện mới"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
          <button
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
            title="Cài đặt"
          >
            <Settings className="w-5 h-5" />
          </button>
          <button
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
            title="Thông tin"
          >
            <Info className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
