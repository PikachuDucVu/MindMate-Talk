import { AlertTriangle } from 'lucide-react';

export function Disclaimer() {
  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-2">
      <div className="flex items-center gap-2 max-w-3xl mx-auto">
        <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
        <p className="text-xs text-amber-700">
          MindMate là ứng dụng hỗ trợ tinh thần, không thay thế tư vấn y tế chuyên nghiệp.
          Nếu bạn cần hỗ trợ khẩn cấp, gọi <strong>1800-599-920</strong> (miễn phí, 24/7).
        </p>
      </div>
    </div>
  );
}
