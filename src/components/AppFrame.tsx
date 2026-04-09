import type { ReactNode } from 'react';

/**
 * 通用 App 内部容器：所有手机内 App（NewsApp/MapApp 等）共用的外壳。
 * 提供统一的顶部栏（返回按钮 + 标题）和滚动内容区。
 *
 * RAH App 因为有自己的 StatusBar/BottomNav，不使用这个外壳。
 */
type Props = {
  title: string;
  subtitle?: string;
  onBack: () => void;
  rightSlot?: ReactNode;
  children: ReactNode;
};

export function AppFrame({ title, subtitle, onBack, rightSlot, children }: Props) {
  return (
    <div className="absolute inset-0 bg-black flex flex-col z-10">
      <div className="px-4 pt-8 pb-3 border-b border-emerald-500/20 flex items-center justify-between">
        <button
          onClick={onBack}
          className="text-emerald-400/70 hover:text-emerald-300 text-sm"
        >
          ← 主屏
        </button>
        <div className="text-center flex-1">
          <div className="text-xs text-emerald-200">{title}</div>
          {subtitle && (
            <div className="text-[9px] text-emerald-500/60 tracking-widest">
              {subtitle}
            </div>
          )}
        </div>
        <div className="w-10 flex justify-end">{rightSlot}</div>
      </div>
      <div className="flex-1 overflow-y-auto">{children}</div>
    </div>
  );
}
