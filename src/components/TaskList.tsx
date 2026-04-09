import { TASKS } from '../data/tasks';
import { useGameStore } from '../store/gameStore';
import { ATTRIBUTE_LABELS, type Task } from '../types/game';
import { estimateSuccessChance } from '../lib/dice';

type Props = {
  onSelectTask: (task: Task) => void;
};

export function TaskList({ onSelectTask }: Props) {
  const stats = useGameStore((s) => s.stats);
  const completedTaskIds = useGameStore((s) => s.completedTaskIds);
  const failedRedTaskIds = useGameStore((s) => s.failedRedTaskIds);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
      <div className="text-[10px] text-emerald-500/60 tracking-widest uppercase pb-1">
        可用任务（{TASKS.length}）
      </div>

      {TASKS.map((task) => {
        const done = completedTaskIds.includes(task.id);
        const failedRed = failedRedTaskIds.includes(task.id);
        const closed = done || failedRed;
        const canAfford = stats.stamina >= task.staminaCost;
        const attrLabel = ATTRIBUTE_LABELS[task.check.attribute];
        const attrValue = stats[task.check.attribute];
        const chance = estimateSuccessChance(task.check.difficulty, attrValue);
        const isRed = task.check.type === 'red';

        return (
          <button
            key={task.id}
            onClick={() => !closed && onSelectTask(task)}
            disabled={closed}
            className={`
              w-full text-left rounded-lg border p-3 transition-colors
              ${
                closed
                  ? 'border-emerald-900/30 bg-black/40 opacity-40'
                  : canAfford
                    ? 'border-emerald-500/30 bg-black/40 hover:border-emerald-400 hover:bg-emerald-500/5'
                    : 'border-red-900/40 bg-black/40 opacity-70'
              }
            `}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded border ${
                      task.level === 1
                        ? 'border-emerald-500/40 text-emerald-400'
                        : task.level === 2
                          ? 'border-amber-500/40 text-amber-400'
                          : 'border-red-500/40 text-red-400'
                    }`}
                  >
                    Lv{task.level}
                  </span>
                  {isRed && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded border border-red-400/60 text-red-300 bg-red-500/10">
                      红检 · 一次性
                    </span>
                  )}
                  <span className="text-sm text-emerald-100">{task.title}</span>
                </div>
                <p className="text-xs text-emerald-500/60 mt-1 line-clamp-2">
                  {task.description}
                </p>
              </div>
              {done && (
                <span className="text-[9px] text-emerald-500/60 whitespace-nowrap">
                  已完成
                </span>
              )}
              {failedRed && (
                <span className="text-[9px] text-red-500/60 whitespace-nowrap">
                  已关闭
                </span>
              )}
            </div>

            <div className="flex items-center justify-between mt-2 pt-2 border-t border-emerald-900/40 text-[10px]">
              <div className="flex gap-3 text-emerald-500/70">
                <span>⚡ {task.staminaCost}</span>
                <span>
                  {attrLabel} {attrValue}
                </span>
                <span
                  className={
                    chance >= 70
                      ? 'text-emerald-300'
                      : chance >= 40
                        ? 'text-amber-300'
                        : 'text-red-400'
                  }
                >
                  {chance}%
                </span>
              </div>
              <div className="text-amber-300/80">
                +{task.outcomes.success.credits}¢
              </div>
            </div>
          </button>
        );
      })}

      <div className="h-4" />
    </div>
  );
}
