import type {
  Task,
  PlayerStats,
  TaskResolution,
  TaskRewards,
} from '../types/game';

export function rollD20(): number {
  return Math.floor(Math.random() * 20) + 1;
}

/**
 * Resolve a task attempt using tabletop-style 1d20 + attribute vs difficulty.
 *
 * Critical rules:
 *   - Natural 20 → critical success (double credits, ignore difficulty)
 *   - Natural  1 → critical fail (fail + extra stamina loss)
 */
export function resolveTask(task: Task, stats: PlayerStats): TaskResolution {
  const attributeValue = stats[task.check.attribute];
  const roll = rollD20();
  const total = roll + attributeValue;

  let critical: 'success' | 'fail' | null = null;
  let success: boolean;

  if (roll === 20) {
    critical = 'success';
    success = true;
  } else if (roll === 1) {
    critical = 'fail';
    success = false;
  } else {
    success = total >= task.check.difficulty;
  }

  const rewardsGained: TaskRewards = success
    ? {
        credits:
          critical === 'success'
            ? task.rewards.credits * 2
            : task.rewards.credits,
        xp: task.rewards.xp,
      }
    : { credits: 0, xp: {} };

  const staminaLost =
    task.staminaCost +
    (success ? 0 : task.failurePenalty.extraStaminaLoss) +
    (critical === 'fail' ? 1 : 0);

  return {
    taskId: task.id,
    roll,
    attributeValue,
    total,
    difficulty: task.check.difficulty,
    success,
    critical,
    rewardsGained,
    staminaLost,
    timestamp: Date.now(),
  };
}
