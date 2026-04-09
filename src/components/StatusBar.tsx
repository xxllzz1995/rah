import { useGameStore } from '../store/gameStore';
import { CHEAPEST_FOOD_PRICE } from '../data/foods';

export function StatusBar() {
  const stats = useGameStore((s) => s.stats);
  const playerCode = useGameStore((s) => s.playerCode);
  const companion = useGameStore((s) => s.companion);

  const staminaRatio = stats.stamina / stats.staminaMax;
  const staminaColor =
    staminaRatio > 0.5
      ? 'bg-emerald-400'
      : staminaRatio > 0.25
        ? 'bg-amber-400'
        : 'bg-red-400';

  // 低体力警告：体力 ≤ 2 且还买得起食物
  const lowStamina = stats.stamina <= 2 && stats.credits >= CHEAPEST_FOOD_PRICE;
  // 危险：体力 ≤ 2 且快买不起食物
  const danger = stats.stamina <= 2 && stats.credits < CHEAPEST_FOOD_PRICE;

  return (
    <div className="border-b border-emerald-500/20 bg-black/80 backdrop-blur px-4 pt-8 pb-3">
      <div className="flex items-center justify-between text-[10px] text-emerald-500/60 tracking-widest mb-2">
        <span>RAH://{playerCode}</span>
        <span>{companion?.name ?? '未连接'}</span>
      </div>

      {/* 顶部一行：信用点 + 体力条 */}
      <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs mb-2">
        <StatRow label="信用点" value={stats.credits} icon="¢" />
        <div>
          <div className="flex items-center justify-between text-emerald-400/80">
            <span>⚡ 体力</span>
            <span>
              {stats.stamina}/{stats.staminaMax}
            </span>
          </div>
          <div className="mt-1 h-1 w-full bg-emerald-900/50 rounded overflow-hidden">
            <div
              className={`h-full ${staminaColor} transition-all`}
              style={{ width: `${staminaRatio * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* 4 属性紧凑展示 */}
      <div className="grid grid-cols-4 gap-2 text-[10px]">
        <AttrPill icon="💪" label="体能" value={stats.physical} />
        <AttrPill icon="🧠" label="智力" value={stats.mental} />
        <AttrPill icon="👁" label="感知" value={stats.perception} />
        <AttrPill icon="💗" label="共情" value={stats.empathy} />
      </div>

      {/* 低体力提醒 */}
      {danger && (
        <div className="mt-2 text-[10px] py-1.5 px-2 border border-red-500/40 bg-red-500/10 text-red-300 rounded text-center animate-pulse">
          ⚠ 体力即将耗尽，信用点不足购买食物——你快撑不住了
        </div>
      )}
      {lowStamina && !danger && (
        <div className="mt-2 text-[10px] py-1.5 px-2 border border-amber-500/30 bg-amber-500/5 text-amber-300/80 rounded text-center">
          ⚡ 体力不足，建议打开「闪送外卖」补充体力
        </div>
      )}
    </div>
  );
}

function StatRow({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: string;
}) {
  return (
    <div className="flex items-center justify-between text-emerald-400/80">
      <span>
        {icon} {label}
      </span>
      <span className="text-emerald-200 tabular-nums">{value}</span>
    </div>
  );
}

function AttrPill({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: number;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded border border-emerald-500/20 bg-emerald-500/5 py-1">
      <div className="text-[9px] text-emerald-500/70">
        {icon} {label}
      </div>
      <div className="text-emerald-200 tabular-nums text-xs">{value}</div>
    </div>
  );
}
