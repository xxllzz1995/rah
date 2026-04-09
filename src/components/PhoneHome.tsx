import { useGameStore } from '../store/gameStore';
import type { AppId } from '../App';

type Props = {
  onOpenApp: (appId: AppId) => void;
};

type AppDef = {
  id: AppId;
  name: string;
  icon: string;       // emoji 占位（之后可替换为 SVG/PNG）
  bg: string;         // 图标背景渐变
  badge?: string;     // 角标
};

const APPS: AppDef[] = [
  {
    id: 'rah',
    name: 'RAH',
    icon: '⚙',
    bg: 'from-emerald-500/40 to-emerald-700/40',
    badge: 'NEW',
  },
  {
    id: 'food',
    name: '闪送外卖',
    icon: '🍔',
    bg: 'from-orange-500/40 to-red-700/40',
  },
  {
    id: 'companion',
    name: '私人管家',
    icon: '◉',
    bg: 'from-purple-500/40 to-purple-700/40',
  },
  {
    id: 'news',
    name: '世界新闻',
    icon: '📰',
    bg: 'from-amber-500/40 to-amber-700/40',
  },
  {
    id: 'map',
    name: '地图',
    icon: '◈',
    bg: 'from-cyan-500/40 to-cyan-700/40',
  },
];

/**
 * 手机主屏：模拟"打开手机看到一堆 App 图标"的体验。
 * 顶部有伪状态栏（时间、信号、电量），中间是 App 网格，底部是 Home Bar。
 */
export function PhoneHome({ onOpenApp }: Props) {
  const playerName = useGameStore((s) => s.playerName);
  const playerCode = useGameStore((s) => s.playerCode);

  // 故事内伪时钟：固定 2045-04-09，时间随真实时间变（仅作装饰）
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');

  return (
    <div className="absolute inset-0 flex flex-col">
      {/* 桌面背景：深色 + 微弱网格 */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at top, rgba(16,185,129,0.12) 0%, rgba(0,0,0,1) 60%)',
        }}
      />
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(16,185,129,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.2) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* 顶部伪状态栏 */}
      <div className="relative px-6 pt-8 pb-2 flex items-center justify-between text-[10px] text-emerald-300/80 z-10">
        <span className="tabular-nums">{hh}:{mm}</span>
        <div className="flex items-center gap-1.5">
          <span>5G</span>
          <span>▓▓▓▓░</span>
          <span>87%</span>
        </div>
      </div>

      {/* 锁屏式问候 */}
      <div className="relative px-6 pt-6 pb-4 z-10">
        <div className="text-[10px] text-emerald-500/60 tracking-widest">
          {now.getFullYear() - 0}.04.09 · WED
        </div>
        <div className="text-2xl text-emerald-100 font-light mt-1">
          你好，{playerName || '...'}
        </div>
        <div className="text-[10px] text-emerald-500/50 mt-1">
          RAH://{playerCode}
        </div>
      </div>

      {/* App 网格 */}
      <div className="relative flex-1 px-6 pt-4 z-10">
        <div className="grid grid-cols-3 gap-x-4 gap-y-6">
          {APPS.map((app) => (
            <button
              key={app.id}
              onClick={() => onOpenApp(app.id)}
              className="flex flex-col items-center gap-1.5 group"
            >
              <div className="relative">
                <div
                  className={`w-14 h-14 rounded-2xl border border-emerald-500/30 bg-gradient-to-br ${app.bg} flex items-center justify-center text-2xl text-emerald-100 shadow-[0_0_20px_rgba(16,185,129,0.15)] group-hover:shadow-[0_0_30px_rgba(16,185,129,0.35)] group-hover:scale-105 transition-all`}
                >
                  {app.icon}
                </div>
                {app.badge && (
                  <span className="absolute -top-1 -right-1 text-[8px] bg-red-500 text-white px-1 rounded-full font-bold">
                    {app.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] text-emerald-200/90">
                {app.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 底部 Home Bar */}
      <div className="relative px-6 pb-3 z-10 flex justify-center">
        <div className="w-24 h-1 rounded-full bg-emerald-500/40" />
      </div>
    </div>
  );
}
