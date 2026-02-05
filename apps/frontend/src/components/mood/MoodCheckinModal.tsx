import { X } from 'lucide-react';
import { clsx } from 'clsx';
import { useMoodStore } from '../../stores/moodStore';
import { ALL_EMOTIONS, EMOTION_DATA, type EmotionType } from '../../types';

interface EmotionChipProps {
  emotion: EmotionType;
  isSelected: boolean;
  onClick: () => void;
}

function EmotionChip({ emotion, isSelected, onClick }: EmotionChipProps) {
  const { label, emoji } = EMOTION_DATA[emotion];

  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        'flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all',
        'text-sm font-medium',
        isSelected
          ? 'border-primary-500 bg-primary-50 text-primary-700'
          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
      )}
    >
      <span className="text-lg">{emoji}</span>
      <span>{label}</span>
    </button>
  );
}

interface MoodCheckinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function MoodCheckinModal({ isOpen, onClose, onSuccess }: MoodCheckinModalProps) {
  const {
    selectedEmotions,
    note,
    isLoading,
    error,
    toggleEmotion,
    setNote,
    saveMood,
    closeMoodModal,
  } = useMoodStore();

  const handleSave = async () => {
    const success = await saveMood();
    if (success) {
      onSuccess?.();
    }
  };

  const handleClose = () => {
    closeMoodModal();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">
            Hôm nay bạn cảm thấy thế nào?
          </h2>
          <button
            onClick={handleClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4">
          <p className="text-sm text-gray-500 mb-4">
            Chọn 1-3 cảm xúc mô tả đúng nhất trạng thái của bạn
          </p>

          {/* Emotion Grid */}
          <div className="flex flex-wrap gap-2 mb-6">
            {ALL_EMOTIONS.map((emotion) => (
              <EmotionChip
                key={emotion}
                emotion={emotion}
                isSelected={selectedEmotions.includes(emotion)}
                onClick={() => toggleEmotion(emotion)}
              />
            ))}
          </div>

          {/* Note Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ghi chú (tùy chọn)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Điều gì đang diễn ra với bạn?"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              rows={3}
              maxLength={500}
            />
            <p className="text-xs text-gray-400 mt-1 text-right">
              {note.length}/500
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-4 border-t bg-gray-50 rounded-b-2xl">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Bỏ qua
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading || selectedEmotions.length === 0}
            className={clsx(
              'flex-1 px-4 py-2 text-white rounded-lg transition-colors',
              selectedEmotions.length > 0 && !isLoading
                ? 'bg-primary-500 hover:bg-primary-600'
                : 'bg-gray-300 cursor-not-allowed'
            )}
          >
            {isLoading ? 'Đang lưu...' : 'Lưu'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default MoodCheckinModal;
