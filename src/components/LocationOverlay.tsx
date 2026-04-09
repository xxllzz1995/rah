import type { ReactNode } from 'react';
import { eventBus } from '../phaser/eventBus';

type Props = {
  children: ReactNode;
  onClose: () => void;
};

/**
 * 通用场景浮层容器：半透明背景 + 从底部滑入的面板。
 * 用于在 Phaser 画布上弹出 React UI。
 */
export function LocationOverlay({ children, onClose }: Props) {
  const handleClose = () => {
    eventBus.emit('close-overlay');
    onClose();
  };

  return (
    <div className="absolute inset-0 z-20 flex flex-col">
      {/* 背景遮罩 */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={handleClose}
      />
      {/* 面板 */}
      <div className="relative mt-auto max-h-[85%] flex flex-col bg-black/95 border-t border-emerald-500/30 rounded-t-2xl overflow-hidden animate-slide-up z-10">
        {/* 拖拽条 */}
        <div className="flex justify-center py-2">
          <div className="w-10 h-1 rounded-full bg-emerald-500/40" />
        </div>
        {/* 关闭按钮 */}
        <button
          onClick={handleClose}
          className="absolute top-2 right-4 text-emerald-500/60 hover:text-emerald-300 text-sm z-10"
        >
          ✕
        </button>
        {/* 内容 */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slideUp 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
