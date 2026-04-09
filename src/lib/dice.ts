import type {
  Task,
  PlayerStats,
  TaskResolution,
  OutcomeKey,
} from '../types/game';

export function rollD6(): number {
  return Math.floor(Math.random() * 6) + 1;
}

/**
 * 2d6 判定系统（参考《极乐迪斯科》）
 *
 * 判定规则：
 *   - 掷 2 个 d6，得到 (d1, d2)
 *   - 总和 = d1 + d2 + 属性值
 *   - 总和 ≥ 难度 → 成功；否则失败
 *
 * 双骰特殊规则（强制覆盖普通判定）：
 *   - 双 1 (1+1=2) → 大失败 critFail
 *   - 双 6 (6+6=12) → 大成功 critSuccess
 *
 * 为什么用 2d6 而不是 1d20：
 *   2d6 是钟形分布（中间 7 最常出，两端最罕见），让"属性"对结果有可感知的重量；
 *   而 1d20 是均匀分布，技能等级的影响被随机性淹没，玩家会觉得"全靠运气"。
 */
export function resolveTask(task: Task, stats: PlayerStats): TaskResolution {
  const d1 = rollD6();
  const d2 = rollD6();
  const diceSum = d1 + d2;
  const attributeValue = stats[task.check.attribute];
  const total = diceSum + attributeValue;

  let outcomeKey: OutcomeKey;
  let success: boolean;

  if (d1 === 1 && d2 === 1) {
    outcomeKey = 'critFail';
    success = false;
  } else if (d1 === 6 && d2 === 6) {
    outcomeKey = 'critSuccess';
    success = true;
  } else if (total >= task.check.difficulty) {
    outcomeKey = 'success';
    success = true;
  } else {
    outcomeKey = 'fail';
    success = false;
  }

  return {
    taskId: task.id,
    dice: [d1, d2],
    diceSum,
    attributeValue,
    total,
    difficulty: task.check.difficulty,
    success,
    outcomeKey,
    outcome: task.outcomes[outcomeKey],
    timestamp: Date.now(),
  };
}

/**
 * 给 UI 预览成功率用：返回基于 2d6 钟形分布的命中概率（含双骰大成功）。
 *
 * 注意：双骰大成功/大失败有 1/36 的固定概率（无论数值），但他们会"覆盖"
 * 原本的成功/失败结果。所以严格来说：
 *   显示的"成功率" = P(2d6 + attr ≥ difficulty 且非双1) + P(双6 但本会失败)
 * 为了 UI 显示简洁，我们直接近似为基础成功率（数值线）即可。
 */
export function estimateSuccessChance(
  difficulty: number,
  attributeValue: number
): number {
  const needed = difficulty - attributeValue; // 需要 2d6 ≥ needed
  // 2d6 ≥ N 的概率表
  const table: Record<number, number> = {
    2: 36, 3: 35, 4: 33, 5: 30, 6: 26, 7: 21,
    8: 15, 9: 10, 10: 6, 11: 3, 12: 1,
  };
  if (needed <= 2) return 100;
  if (needed > 12) return 0;
  return Math.round((table[needed] / 36) * 100);
}
