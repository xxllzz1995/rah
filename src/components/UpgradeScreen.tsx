import { useState } from 'react';
import { useGameStore, UPGRADE_COST } from '../store/gameStore';
import {
  ATTRIBUTE_LABELS,
  ATTRIBUTE_ICONS,
  ATTRIBUTE_DESCRIPTIONS,
  type AttributeKey,
} from '../types/game';

const ATTR_ORDER: AttributeKey[] = ['physical', 'mental', 'perception', 'empathy'];

export function UpgradeScreen() {
  const stats = useGameStore((s) => s.stats);
  const upgrade = useGameStore((s) => s.upgradeAttribute);
  const [flash, setFlash] = useState<string | null>(null);

  const handleUpgrade = (attr: AttributeKey) => {
    const ok = upgrade(attr);
    setFlash(ok ? `${ATTRIBUTE_LABELS[attr]} 升级成功` : '信用点不足');
    setTimeout(() => setFlash(null), 1400);
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
      <div className="text-[10px] text-emerald-500/60 tracking-widest uppercase pb-1">
        能力升级中心
      </div>

      <p className="text-xs text-emerald-500/70 leading-relaxed">
        花费信用点提升属性。属性影响 2d6 判定的总和——更高的属性意味着更稳定地通过更难的检定。
      </p>

      {ATTR_ORDER.map((attr) => (
        <AttributeRow
          key={attr}
          name={`${ATTRIBUTE_ICONS[attr]} ${ATTRIBUTE_LABELS[attr]}`}
          description={ATTRIBUTE_DESCRIPTIONS[attr]}
          level={stats[attr]}
          cost={UPGRADE_COST}
          canAfford={stats.credits >= UPGRADE_COST}
          onUpgrade={() => handleUpgrade(attr)}
        />
      ))}

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
