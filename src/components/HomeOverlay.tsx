import { useGameStore } from '../store/gameStore';

/**
 * 公寓场景：回到家的叙事 + 状态展示。
 * 未来可加"睡觉推进时间""查看物品"等功能。
 */
export function HomeOverlay() {
  const stats = useGameStore((s) => s.stats);
  const playerName = useGameStore((s) => s.playerName);
  const companion = useGameStore((s) => s.companion);
  const completedTaskIds = useGameStore((s) => s.completedTaskIds);

  return (
    <div className="px-5 pb-6 space-y-4">
      <div className="text-center pt-2">
        <div className="text-lg text-emerald-100">🏠 你的公寓</div>
        <div className="text-[10px] text-emerald-500/50 tracking-widest mt-1">
          BLOCK C · UNIT 307
        </div>
      </div>

      {/* 叙事 */}
      <div className="text-xs text-emerald-300/70 leading-relaxed">
        <p>
          十二平米的隔间，一张折叠床，一台永远在闪的旧显示器。
          墙上贴着房东（一个物业管理 AI）的告示：
          <span className="text-red-400/60 italic">「本月租金已逾期。」</span>
        </p>
        <p className="mt-2">
          但至少这里是你的。在这座城市里，有一扇能关上的门已经算是奢侈品了。
        </p>
      </div>

      {/* 状态面板 */}
      <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 space-y-2 text-xs">
        <div className="text-[10px] text-emerald-500/60 tracking-widest mb-2">
          状态概览
        </div>
        <Row label="住户" value={playerName} />
        <Row label="信用点" value={`${stats.credits}¢`} />
        <Row
          label="体力"
          value={`${stats.stamina}/${stats.staminaMax}`}
          danger={stats.stamina <= 2}
        />
        <Row label="已完成任务" value={`${completedTaskIds.length}`} />
        <Row label="管家" value={companion?.name ?? '未连接'} />
      </div>

      {/* 属性 */}
      <div className="grid grid-cols-4 gap-2 text-[10px]">
        <Stat icon="💪" label="体能" value={stats.physical} />
        <Stat icon="🧠" label="智力" value={stats.mental} />
        <Stat icon="👁" label="感知" value={stats.perception} />
        <Stat icon="💗" label="共情" value={stats.empathy} />
      </div>

      <div className="text-[10px] text-emerald-500/40 text-center italic">
        回到街上继续讨生活吧。
      </div>
    </div>
  );
}

function Row({ label, value, danger }: { label: string; value: string; danger?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-emerald-500/70">{label}</span>
      <span className={danger ? 'text-red-400' : 'text-emerald-200'}>{value}</span>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: string; label: string; value: number }) {
  return (
    <div className="flex flex-col items-center justify-center rounded border border-emerald-500/20 bg-emerald-500/5 py-1">
      <div className="text-[9px] text-emerald-500/70">{icon} {label}</div>
      <div className="text-emerald-200 tabular-nums text-xs">{value}</div>
    </div>
  );
}
