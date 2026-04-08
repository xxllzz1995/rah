import { useState } from 'react';
import { useGameStore, UPGRADE_COST } from '../store/gameStore';
import type { AttributeKey } from '../types/game';

export function UpgradeScreen() {
  const stats = useGameStore((s) => s.stats);
  const upgrade = useGameStore((s) => s.upgradeAttribute);
  const [flash, setFlash] = useState<string | null>(null);

  const handleUpgrade = (attr: AttributeKey) => {
    const ok = upgrade(attr);
    setFlash(ok ? '升级成功' : '信用点不足');
    setTimeout(() => setFlash(null), 1400);
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
      <div className="text-[10px] text-emerald-500/60 tracking-widest uppercase pb-1">
        能力升级中心
      </div>

      <p className="text-xs text-emerald-500/70 leading-relaxed">
        花费信用点提升你的属性。更高的属性意味着更稳定的掷骰，能接更难的任务。
      </p>

      <AttributeRow
        name="💪 体能"
        description="影响所有体力劳动类任务（搬运、跑腿、护送）的判定"
        level={stats.physical}
        cost={UPGRADE_COST}
        canAfford={stats.credits >= UPGRADE_COST}
        onUpgrade={() => handleUpgrade('physical')}
      />

      <AttributeRow
        name="🧠 智力"
        description="影响所有脑力劳动类任务（校对、导航、潜入）的判定"
        level={stats.mental}
        cost={UPGRADE_COST}
        canAfford={stats.credits >= UPGRADE_COST}
        onUpgrade={() => handleUpgrade('mental')}
      />

      {flash && (
        <div className="text-center text-xs text-amber-300 italic">
          [ {flash} ]
        </div>
      )}

      <div className="h-4" />
    </div>
  );
}

function AttributeRow({
  name,
  description,
  level,
  cost,
  canAfford,
  onUpgrade,
}: {
  name: string;
  description: string;
  level: number;
  cost: number;
  canAfford: boolean;
  onUpgrade: () => void;
}) {
  return (
    <div className="rounded-lg border border-emerald-500/30 bg-black/40 p-3">
      <div className="flex items-start justify-between mb-1">
        <div className="text-sm text-emerald-100">{name}</div>
        <div className="text-emerald-300 tabular-nums">Lv {level}</div>
      </div>
      <p className="text-[11px] text-emerald-500/60 leading-relaxed mb-3">
        {description}
      </p>
      <button
        onClick={onUpgrade}
        disabled={!canAfford}
        className="w-full py-2 text-xs border border-emerald-500/40 text-emerald-200 rounded hover:bg-emerald-500/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        升级 · {cost}¢
      </button>
    </div>
  );
}
