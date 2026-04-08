import { useGameStore } from '../store/gameStore';

export function StatusBar() {
  const stats = useGameStore((s) => s.stats);
  const playerCode = useGameStore((s) => s.playerCode);
  const companion = useGameStore((s) => s.companion);
  const rest = useGameStore((s) => s.rest);

  const staminaRatio = stats.stamina / stats.staminaMax;
  const staminaColor =
    staminaRatio > 0.5
      ? 'bg-emerald-400'
      : staminaRatio > 0.25
        ? 'bg-amber-400'
        : 'bg-red-400';

  return (
    <div className="border-b border-emerald-500/20 bg-black/80 backdrop-blur px-4 pt-8 pb-3">
      <div className="flex items-center justify-between text-[10px] text-emerald-500/60 tracking-widest mb-2">
        <span>RAH://{playerCode}</span>
        <span>{companion?.name ?? '未连接'}</span>
      </div>

      <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
        <StatRow label="信用点" value={stats.credits} icon="¢" />
        <StatRow label="体能" value={stats.physical} icon="△" />
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
        <StatRow label="智力" value={stats.mental} icon="◇" />
      </div>

      {stats.stamina < stats.staminaMax && (
        <button
          onClick={rest}
          className="mt-2 w-full text-[10px] py-1 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 rounded transition-colors"
        >
          [休息] 恢复体力至上限
        </button>
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
