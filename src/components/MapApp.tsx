import { useGameStore } from '../store/gameStore';
import { getVisibleRegions } from '../data/regions';
import type { MapRegion } from '../types/game';
import { AppFrame } from './AppFrame';

type Props = {
  onBack: () => void;
};

const STATUS_LABEL: Record<MapRegion['status'], string> = {
  open: '开放',
  restricted: '限制',
  locked: '封锁',
};

const STATUS_COLOR: Record<MapRegion['status'], string> = {
  open: 'border-emerald-500/40 text-emerald-300 bg-emerald-500/10',
  restricted: 'border-amber-500/40 text-amber-300 bg-amber-500/10',
  locked: 'border-red-500/40 text-red-300 bg-red-500/10',
};

export function MapApp({ onBack }: Props) {
  const chapter = useGameStore((s) => s.storyChapter);
  const regions = getVisibleRegions(chapter);

  return (
    <AppFrame title="地图" subtitle="REGION STATUS" onBack={onBack}>
      <div className="px-4 py-3 space-y-3">
        <p className="text-xs text-emerald-500/60 leading-relaxed">
          以下是你当前可见的区域。开放区域可承接 RAH 任务；
          限制区域需要满足条件才能进入；封锁区域将随剧情推进解锁。
        </p>

        {regions.map((r) => (
          <div
            key={r.id}
            className={`rounded-lg border p-3 ${
              r.status === 'locked'
                ? 'border-red-900/40 bg-black/40 opacity-60'
                : 'border-emerald-500/30 bg-black/40'
            }`}
          >
            <div className="flex items-center justify-between gap-2 mb-1">
              <div className="text-sm text-emerald-100">{r.name}</div>
              <span
                className={`text-[9px] px-1.5 py-0.5 rounded border ${STATUS_COLOR[r.status]}`}
              >
                {STATUS_LABEL[r.status]}
              </span>
            </div>
            <p className="text-xs text-emerald-500/70 leading-relaxed">
              {r.description}
            </p>
          </div>
        ))}

        <div className="h-4" />
      </div>
    </AppFrame>
  );
}
