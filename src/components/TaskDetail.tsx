import { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import type { Task, TaskResolution } from '../types/game';

type Props = {
  task: Task;
  onClose: () => void;
  onAskAI: (task: Task) => void;
};

type Phase = 'preview' | 'rolling' | 'result';

export function TaskDetail({ task, onClose, onAskAI }: Props) {
  const stats = useGameStore((s) => s.stats);
  const attemptTask = useGameStore((s) => s.attemptTask);

  const [phase, setPhase] = useState<Phase>('preview');
  const [rollDisplay, setRollDisplay] = useState(1);
  const [resolution, setResolution] = useState<TaskResolution | null>(null);

  const attrLabel = task.check.attribute === 'physical' ? '体能' : '智力';
  const attrValue = stats[task.check.attribute];
  const canAfford = stats.stamina >= task.staminaCost;
  const needed = task.check.difficulty - attrValue;
  const chance = Math.max(0, Math.min(100, ((21 - needed) / 20) * 100));

  // Dice animation while rolling
  useEffect(() => {
    if (phase !== 'rolling') return;
    const interval = setInterval(() => {
      setRollDisplay(Math.floor(Math.random() * 20) + 1);
    }, 60);
    return () => clearInterval(interval);
  }, [phase]);

  const handleAccept = () => {
    if (!canAfford) return;
    setPhase('rolling');
    // Dramatic pause, then resolve
    setTimeout(() => {
      const result = attemptTask(task.id);
      if (result) {
        setResolution(result);
        setRollDisplay(result.roll);
        setPhase('result');
      }
    }, 1400);
  };

  return (
    <div className="absolute inset-0 bg-black/95 backdrop-blur-sm z-10 flex flex-col">
      {/* Header */}
      <div className="px-4 pt-8 pb-3 border-b border-emerald-500/20 flex items-center justify-between">
        <button
          onClick={onClose}
          className="text-emerald-400/70 hover:text-emerald-300 text-sm"
        >
          ← 返回
        </button>
        <span className="text-[10px] text-emerald-500/60 tracking-widest">
          任务详情
        </span>
        <div className="w-10" />
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {phase === 'preview' && (
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] px-2 py-0.5 rounded border ${
                    task.level === 1
                      ? 'border-emerald-500/40 text-emerald-400'
                      : task.level === 2
                        ? 'border-amber-500/40 text-amber-400'
                        : 'border-red-500/40 text-red-400'
                  }`}
                >
                  Lv{task.level}
                </span>
                <h2 className="text-base text-emerald-100">{task.title}</h2>
              </div>
              <p className="text-xs text-emerald-300/70 mt-2 leading-relaxed">
                {task.description}
              </p>
              {task.flavor && (
                <p className="text-xs text-emerald-500/40 italic mt-2">
                  {task.flavor}
                </p>
              )}
            </div>

            <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 space-y-2 text-xs">
              <Row label="消耗体力" value={`${task.staminaCost} / ${stats.stamina}`} danger={!canAfford} />
              <Row label="判定属性" value={`${attrLabel} (${attrValue})`} />
              <Row label="难度" value={`${task.check.difficulty}`} />
              <Row
                label="预估成功率"
                value={`约 ${Math.round(chance)}%`}
                highlight={chance >= 70}
                danger={chance < 40}
              />
              <div className="pt-1 mt-1 border-t border-emerald-900/40">
                <Row
                  label="成功奖励"
                  value={`${task.rewards.credits}¢${
                    task.rewards.xp
                      ? Object.entries(task.rewards.xp)
                          .map(
                            ([k, v]) =>
                              ` + ${k === 'physical' ? '体能' : '智力'}${v}`
                          )
                          .join('')
                      : ''
                  }`}
                />
                <Row
                  label="失败扣体力"
                  value={`${task.failurePenalty.extraStaminaLoss} (额外)`}
                />
              </div>
            </div>

            <button
              onClick={() => onAskAI(task)}
              className="w-full py-2 border border-emerald-500/30 text-emerald-300 rounded text-xs hover:bg-emerald-500/10 transition-colors"
            >
              💬 问问管家怎么看
            </button>

            <button
              onClick={handleAccept}
              disabled={!canAfford}
              className="w-full py-3 bg-emerald-500/20 border border-emerald-400/60 text-emerald-100 rounded font-bold hover:bg-emerald-500/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {canAfford ? '接受任务 → 掷骰' : '体力不足'}
            </button>
          </div>
        )}

        {phase === 'rolling' && (
          <div className="flex flex-col items-center justify-center h-full">
            <p className="text-xs text-emerald-500/60 mb-6 tracking-widest">
              [ 判定中... ]
            </p>
            <div className="w-28 h-28 border-2 border-emerald-400 rounded-lg flex items-center justify-center text-4xl font-bold text-emerald-200 shadow-[0_0_30px_rgba(16,185,129,0.4)] animate-pulse">
              {rollDisplay}
            </div>
            <p className="text-[10px] text-emerald-500/50 mt-4">
              {attrLabel}骰 + {attrValue}
            </p>
          </div>
        )}

        {phase === 'result' && resolution && (
          <ResultScreen
            task={task}
            resolution={resolution}
            onClose={onClose}
          />
        )}
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  highlight,
  danger,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  danger?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-emerald-500/70">{label}</span>
      <span
        className={
          danger
            ? 'text-red-400'
            : highlight
              ? 'text-emerald-300'
              : 'text-emerald-200'
        }
      >
        {value}
      </span>
    </div>
  );
}

function ResultScreen({
  task,
  resolution,
  onClose,
}: {
  task: Task;
  resolution: TaskResolution;
  onClose: () => void;
}) {
  const { success, critical, roll, attributeValue, total, difficulty } =
    resolution;
  const attrLabel = task.check.attribute === 'physical' ? '体能' : '智力';

  const title = critical === 'success'
    ? '大成功！'
    : critical === 'fail'
      ? '大失败'
      : success
        ? '成功'
        : '失败';

  const titleColor = success
    ? critical === 'success'
      ? 'text-amber-300'
      : 'text-emerald-300'
    : critical === 'fail'
      ? 'text-red-400'
      : 'text-red-300';

  return (
    <div className="flex flex-col items-center space-y-5">
      <div
        className={`w-28 h-28 border-2 rounded-lg flex items-center justify-center text-4xl font-bold ${
          critical === 'success'
            ? 'border-amber-400 text-amber-200 shadow-[0_0_40px_rgba(245,158,11,0.5)]'
            : critical === 'fail'
              ? 'border-red-500 text-red-300 shadow-[0_0_40px_rgba(239,68,68,0.4)]'
              : success
                ? 'border-emerald-400 text-emerald-200 shadow-[0_0_30px_rgba(16,185,129,0.4)]'
                : 'border-red-500/60 text-red-300'
        }`}
      >
        {roll}
      </div>

      <div className={`text-2xl font-bold ${titleColor}`}>{title}</div>

      <div className="text-xs text-emerald-500/70 text-center space-y-1">
        <div>
          骰子 {roll} + {attrLabel} {attributeValue} = {total}
        </div>
        <div>目标 ≥ {difficulty}</div>
      </div>

      <div className="w-full rounded border border-emerald-500/20 bg-emerald-500/5 p-3 text-xs space-y-1">
        {resolution.rewardsGained.credits > 0 && (
          <div className="flex justify-between text-amber-300">
            <span>信用点</span>
            <span>+{resolution.rewardsGained.credits}¢</span>
          </div>
        )}
        {resolution.rewardsGained.xp &&
          Object.entries(resolution.rewardsGained.xp).map(([k, v]) => (
            <div key={k} className="flex justify-between text-emerald-300">
              <span>{k === 'physical' ? '体能' : '智力'}</span>
              <span>+{v}</span>
            </div>
          ))}
        <div className="flex justify-between text-red-400">
          <span>体力</span>
          <span>-{resolution.staminaLost}</span>
        </div>
      </div>

      <button
        onClick={onClose}
        className="w-full py-2 bg-emerald-500/20 border border-emerald-400/60 text-emerald-100 rounded hover:bg-emerald-500/30 transition-colors"
      >
        返回任务列表
      </button>
    </div>
  );
}
