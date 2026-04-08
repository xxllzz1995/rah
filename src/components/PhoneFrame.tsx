import type { ReactNode } from 'react';

/**
 * 手机外壳容器：在桌面上显示为竖屏"伪手机"，营造"我在用 RAH App"的代入感。
 * 在移动端自适应为全屏（去掉外壳）。
 */
export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-8">
      <div
        className="
          w-full max-w-[390px] sm:max-w-[390px]
          h-screen sm:h-[800px] sm:max-h-[calc(100vh-4rem)]
          bg-black
          sm:border-[10px] sm:border-neutral-800
          sm:rounded-[44px]
          sm:shadow-[0_0_60px_rgba(16,185,129,0.15),inset_0_0_0_2px_rgba(16,185,129,0.15)]
          overflow-hidden
          relative
          flex flex-col
        "
      >
        {/* 顶部刘海（仅桌面显示） */}
        <div className="hidden sm:flex absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-black rounded-b-2xl z-20 items-end justify-center pb-1">
          <div className="w-2 h-2 rounded-full bg-emerald-500/40 mr-2" />
          <div className="w-10 h-1 rounded-full bg-neutral-700" />
        </div>

        {/* 内容区 */}
        <div className="flex-1 overflow-hidden flex flex-col">{children}</div>
      </div>
    </div>
  );
}
