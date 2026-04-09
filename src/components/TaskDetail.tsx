import { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../store/gameStore';
import { ATTRIBUTE_LABELS, ATTRIBUTE_ICONS, type Task, type TaskResolution } from '../types/game';
import { estimateSuccessChance } from '../lib/dice';
import { getCheckCommentary } from '../lib/checkCommentary';

type Props = {
  task: Task;
  onClose: () => void;
  onAskAI: (task: Task) => void;
};

type Phase = 'preview' | 'rolling' | 'result';

export function TaskDetail({ task, onClose, onAskAI }: Props) {
  const stats = useGameStore((s) => s.stats);
  const companion = useGameStore((s) => s.companion);
  const attemptTask = useGameStore((s) => s.attemptTask);

  const [phase, setPhase] = useState<Phase>('preview');
  const [diceDisplay, setDiceDisplay] = useState<[number, number]>([1, 1]);
  const [resolution, setResolution] = useState<TaskResolution | null>(null);
  const [companionLine, setCompanionLine] = useState<string | null>(null);
  const [commentaryLoading, setCommentaryLoading] = useState(false);
  const commentaryRequestId = useRef(0);

  const attrKey = task.check.attribute;
  const attrLabel = ATTRIBUTE_LABELS[attrKey];
  const attrIcon = ATTRIBUTE_ICONS[attrKey];
  const attrValue = stats[attrKey];
  const canAfford = stats.stamina >= task.staminaCost;
  const chance = estimateSuccessChance(task.check.difficulty, attrValue);
  const isRed = task.check.type === 'red';

  // 滚动动画：rolling 阶段不停刷新两颗骰子的随机面
  useEffect(() => {
    if (phase !== 'rolling') return;
    const interval = setInterval(() => {
      setDiceDisplay([
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1,
      ]);
    }, 70);
    return () => clearInterval(interval);
  }, [phase]);

  const handleAccept = () => {
    if (!canAfford) return;
    setPhase('rolling');
    // 戏剧停顿后揭示
    setTimeout(() => {
      const result = attemptTask(task.id);
      if (result) {
        setResolution(result);
        setDiceDisplay(result.dice);
        setPhase('result');

        // 异步获取管家点评（混合：先用预写文案兜底，后续可由 LLM 替换）
        const reqId = ++commentaryRequestId.current;
        setCommentaryLoading(true);
        getCheckCommentary({
          task,
          resolution: result,
          companion,
        })
          .then((line) => {
            if (reqId === commentaryRequestId.current) {
              setCompanionLine(line);
              setCommentaryLoading(false);
            }
          })
          .catch(() => {
            if (reqId === commentaryRequestId.current) {
              setCommentaryLoading(false);
            }
          });
      }
    }, 1600);
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

      {/* 场景图（始终显示，叠加赛博朋克霓虹滤镜） */}
      <SceneImage src={task.sceneImage} title={task.title} />

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {phase === 'preview' && (
          <PreviewPanel
            task={task}
            attrLabel={attrLabel}
            attrIcon={attrIcon}
            attrValue={attrValue}
            chance={chance}
            isRed={isRed}
            canAfford={canAfford}
            currentStamina={stats.stamina}
            onAskAI={() => onAskAI(task)}
            onAccept={handleAccept}
          />
        )}

        {phase === 'rolling' && (
          <RollingPanel
            dice={diceDisplay}
            attrLabel={attrLabel}
            attrValue={attrValue}
          />
        )}

        {phase === 'result' && resolution && (
          <ResultPanel
            task={task}
            resolution={resolution}
            companionName={companion?.name ?? '管家'}
            companionLine={companionLine}
            commentaryLoading={commentaryLoading}
            onClose={onClose}
          />
        )}
      </div>
    </div>
  );
}

// ============ 场景图 ============
function SceneImage({ src, title }: { src: string; title: string }) {
  return (
    <div className="relative h-36 sm:h-44 overflow-hidden border-b border-emerald-500/20">
      <img
        src={src}
        alt={title}
        className="w-full h-full object-cover"
        // 赛博朋克霓虹滤镜：色相旋转 + 提升对比 + 饱和
        style={{
          filter: 'hue-rotate(220deg) saturate(1.6) contrast(1.15) brightness(0.85)',
        }}
      />
      {/* 顶部一圈渐变让标题可读 */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-black/40 pointer-events-none" />
      {/* 扫描线效果 */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, rgba(16,185,129,0.15) 0px, rgba(16,185,129,0.15) 1px, transparent 1px, transparent 3px)',
        }}
      />
      <div className="absolute bottom-2 left-3 right-3">
        <h2 className="text-base text-emerald-100 drop-shadow-[0_0_8px_rgba(0,0,0,0.9)]">
          {title}
        </h2>
      </div>
    </div>
  );
}

// ============ 准备面板 ============
function PreviewPanel({
  task,
  attrLabel,
  attrIcon,
  attrValue,
  chance,
  isRed,
  canAfford,
  currentStamina,
  onAskAI,
  onAccept,
}: {
  task: Task;
  attrLabel: string;
  attrIcon: string;
  attrValue: number;
  chance: number;
  isRed: boolean;
  canAfford: boolean;
  currentStamina: number;
  onAskAI: () => void;
  onAccept: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
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
        {isRed ? (
          <span className="text-[10px] px-2 py-0.5 rounded border border-red-400/60 text-red-300 bg-red-500/10">
            红检 · 机会只有一次
          </span>
        ) : (
          <span className="text-[10px] px-2 py-0.5 rounded border border-emerald-500/40 text-emerald-400">
            白检 · 失败可重试
          </span>
        )}
      </div>

      <p className="text-xs text-emerald-300/80 leading-relaxed">
        {task.description}
      </p>
      {task.flavor && (
        <p className="text-xs text-emerald-500/50 italic leading-relaxed">
          {task.flavor}
        </p>
      )}

      <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 space-y-2 text-xs">
        <Row
          label="消耗体力"
          value={`${task.staminaCost} / ${currentStamina}`}
          danger={!canAfford}
        />
        <Row
          label="判定属性"
          value={`${attrIcon} ${attrLabel} (${attrValue})`}
        />
        <Row label="难度" value={`2d6 + ${attrValue} ≥ ${task.check.difficulty}`} />
        <Row
          label="预估成功率"
          value={`约 ${chance}%`}
          highlight={chance >= 70}
          danger={chance < 40}
        />
      </div>

      <div className="rounded border border-amber-500/20 bg-amber-500/5 p-2 text-[10px] text-amber-200/70 leading-relaxed">
        提示：双 6 = 大成功（戏剧性反转），双 1 = 大失败（黑色幽默后果）。
        失败也是故事的一部分。
      </div>

      <button
        onClick={onAskAI}
        className="w-full py-2 border border-emerald-500/30 text-emerald-300 rounded text-xs hover:bg-emerald-500/10 transition-colors"
      >
        💬 问问管家怎么看
      </button>

      <button
        onClick={onAccept}
        disabled={!canAfford}
        className="w-full py-3 bg-emerald-500/20 border border-emerald-400/60 text-emerald-100 rounded font-bold hover:bg-emerald-500/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        {canAfford ? '接受任务 → 掷骰' : '体力不足'}
      </button>
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

// ============ 掷骰面板 ============
function RollingPanel({
  dice,
  attrLabel,
  attrValue,
}: {
  dice: [number, number];
  attrLabel: string;
  attrValue: number;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-10">
      <p className="text-xs text-emerald-500/60 mb-6 tracking-widest">
        [ 命运在滚动... ]
      </p>
      <div className="flex gap-4">
        <Die value={dice[0]} />
        <Die value={dice[1]} />
      </div>
      <p className="text-[10px] text-emerald-500/50 mt-6">
        2d6 + {attrLabel} {attrValue}
      </p>
    </div>
  );
}

function Die({ value, big = false }: { value: number; big?: boolean }) {
  return (
    <div
      className={`${big ? 'w-24 h-24 text-4xl' : 'w-20 h-20 text-3xl'} border-2 border-emerald-400 rounded-lg flex items-center justify-center font-bold text-emerald-200 bg-black/60 shadow-[0_0_25px_rgba(16,185,129,0.4)] animate-pulse`}
    >
      {value}
    </div>
  );
}

// ============ 结果面板 ============
function ResultPanel({
  task,
  resolution,
  companionName,
  companionLine,
  commentaryLoading,
  onClose,
}: {
  task: Task;
  resolution: TaskResolution;
  companionName: string;
  companionLine: string | null;
  commentaryLoading: boolean;
  onClose: () => void;
}) {
  const { dice, diceSum, attributeValue, total, difficulty, outcomeKey, outcome } =
    resolution;

  const titleMap = {
    critSuccess: '大成功！',
    success: '成功',
    fail: '失败',
    critFail: '大失败',
  };

  const colorMap = {
    critSuccess: 'text-amber-300',
    success: 'text-emerald-300',
    fail: 'text-red-300',
    critFail: 'text-red-400',
  };

  const borderMap = {
    critSuccess: 'border-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.5)]',
    success: 'border-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.4)]',
    fail: 'border-red-500/60',
    critFail: 'border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.4)]',
  };

  return (
    <div className="space-y-4">
      {/* 骰子 + 计算 */}
      <div className="flex flex-col items-center space-y-3">
        <div className="flex gap-3">
          <DieStatic value={dice[0]} className={borderMap[outcomeKey]} />
          <DieStatic value={dice[1]} className={borderMap[outcomeKey]} />
        </div>
        <div className={`text-2xl font-bold ${colorMap[outcomeKey]}`}>
          {titleMap[outcomeKey]}
        </div>
        <div className="text-[11px] text-emerald-500/60 text-center">
          {dice[0]} + {dice[1]} ({diceSum}) + {attributeValue} = <span className="text-emerald-300">{total}</span>
          <span className="mx-1">vs</span>
          目标 {difficulty}
        </div>
      </div>

      {/* 叙事分支文案 */}
      <div
        className={`rounded-lg border bg-black/60 p-3 text-xs leading-relaxed ${
          outcomeKey === 'critSuccess'
            ? 'border-amber-500/40 text-amber-100'
            : outcomeKey === 'success'
              ? 'border-emerald-500/40 text-emerald-100'
              : outcomeKey === 'fail'
                ? 'border-red-700/40 text-red-100/80'
                : 'border-red-500/60 text-red-100'
        }`}
      >
        {outcome.text}
      </div>

      {/* 管家点评气泡 */}
      <CompanionBubble
        name={companionName}
        line={companionLine}
        loading={commentaryLoading}
      />

      {/* 奖惩 */}
      <div className="rounded border border-emerald-500/20 bg-emerald-500/5 p-3 text-xs space-y-1">
        {outcome.credits !== 0 && (
          <div
            className={`flex justify-between ${
              outcome.credits > 0 ? 'text-amber-300' : 'text-red-400'
            }`}
          >
            <span>信用点</span>
            <span>
              {outcome.credits > 0 ? '+' : ''}
              {outcome.credits}¢
            </span>
          </div>
        )}
        {outcome.staminaDelta !== 0 && (
          <div
            className={`flex justify-between ${
              outcome.staminaDelta > 0 ? 'text-emerald-300' : 'text-red-400'
            }`}
          >
            <span>体力</span>
            <span>
              {outcome.staminaDelta > 0 ? '+' : ''}
              {outcome.staminaDelta}
            </span>
          </div>
        )}
        {outcome.xp &&
          Object.entries(outcome.xp).map(([k, v]) => (
            <div key={k} className="flex justify-between text-emerald-300">
              <span>{ATTRIBUTE_LABELS[k as keyof typeof ATTRIBUTE_LABELS]}</span>
              <span>+{v}</span>
            </div>
          ))}
        {task.check.type === 'white' && !resolution.success && (
          <div className="pt-1 mt-1 border-t border-emerald-900/40 text-[10px] text-emerald-500/60 italic">
            白检：提升属性后可以再试一次。
          </div>
        )}
        {task.check.type === 'red' && (
          <div className="pt-1 mt-1 border-t border-emerald-900/40 text-[10px] text-red-400/60 italic">
            红检：这件事不会再发生第二次。
          </div>
        )}
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

function DieStatic({ value, className }: { value: number; className: string }) {
  return (
    <div
      className={`w-16 h-16 border-2 rounded-lg flex items-center justify-center text-2xl font-bold text-emerald-200 bg-black/60 ${className}`}
    >
      {value}
    </div>
  );
}

function CompanionBubble({
  name,
  line,
  loading,
}: {
  name: string;
  line: string | null;
  loading: boolean;
}) {
  if (!line && !loading) return null;
  return (
    <div className="rounded-lg border border-purple-500/30 bg-purple-500/5 p-3">
      <div className="text-[10px] text-purple-300/70 tracking-wider mb-1">
        💬 {name}
      </div>
      {loading && !line ? (
        <div className="text-xs text-purple-300/40 italic">
          [ 正在打字... ]
        </div>
      ) : (
        <div className="text-xs text-purple-100/90 leading-relaxed">{line}</div>
      )}
    </div>
  );
}
