import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  ONBOARDING_INITIAL_CREDITS,
  type GameState,
  type Companion,
  type ChatMessage,
  type PlayerStats,
  type TaskResolution,
  type AttributeKey,
} from '../types/game';
import { getTaskById } from '../data/tasks';
import { getFoodById, CHEAPEST_FOOD_PRICE } from '../data/foods';
import { resolveTask } from '../lib/dice';

export type OnboardingPayload = {
  playerName: string;
  playerProfession: string;
  companion: Companion;
};

type Actions = {
  completeOnboarding: (payload: OnboardingPayload) => void;
  addMessage: (message: ChatMessage) => void;
  resetAll: () => void;

  // 任务相关
  attemptTask: (taskId: string) => TaskResolution | null;
  buyFood: (foodId: string) => boolean;
  upgradeAttribute: (attr: AttributeKey) => boolean;
  clearLastResolution: () => void;

  // 世界探索
  setCurrentLocation: (id: string | null) => void;
};

const initialStats: PlayerStats = {
  credits: ONBOARDING_INITIAL_CREDITS, // 与开场剧情数字保持一致
  stamina: 10,
  staminaMax: 10,
  physical: 1,
  mental: 1,
  perception: 1,
  empathy: 1,
};

// 根据玩家名字生成一个 RAH 系统代号（"A-" + 名字首字母 + 4 位随机）
function generatePlayerCode(playerName: string): string {
  const firstChar = (playerName.trim()[0] ?? 'X').toUpperCase();
  const num = Math.floor(1000 + Math.random() * 9000);
  return `${firstChar}-${num}`;
}

const initial: GameState = {
  onboarded: false,
  companion: null,
  playerName: '',
  playerProfession: '',
  playerCode: '',
  messages: [],
  storyChapter: 1,
  stats: initialStats,
  completedTaskIds: [],
  failedRedTaskIds: [],
  lastResolution: null,
  gameOver: false,
  currentLocation: null,
};

export const UPGRADE_COST = 40; // 升一级属性需要的信用点

export const useGameStore = create<GameState & Actions>()(
  persist(
    (set, get) => ({
      ...initial,

      completeOnboarding: ({ playerName, playerProfession, companion }) =>
        set({
          onboarded: true,
          companion,
          playerName: playerName.trim(),
          playerProfession: playerProfession.trim(),
          playerCode: generatePlayerCode(playerName),
        }),

      addMessage: (message) =>
        set((s) => ({ messages: [...s.messages, message] })),

      resetAll: () => set(initial),

      attemptTask: (taskId) => {
        const task = getTaskById(taskId);
        if (!task) return null;
        const { stats, gameOver } = get();
        if (gameOver) return null;
        if (stats.stamina < task.staminaCost) return null;

        const resolution = resolveTask(task, stats);
        const outcome = resolution.outcome;

        set((s) => {
          const newStamina = Math.max(
            0,
            Math.min(s.stats.staminaMax, s.stats.stamina + outcome.staminaDelta)
          );
          const newCredits = Math.max(0, s.stats.credits + outcome.credits);
          const xp = outcome.xp ?? {};

          // 任务关闭逻辑：
          //   - 红检：无论成败，都关闭一次性任务
          //   - 白检大成功：任务彻底完成
          //   - 白检普通成功：任务也完成
          //   - 白检失败：保持开放，可重试（提升属性后再来）
          let newCompleted = s.completedTaskIds;
          let newFailedRed = s.failedRedTaskIds;
          if (task.check.type === 'red') {
            if (resolution.success) {
              newCompleted = [...s.completedTaskIds, taskId];
            } else {
              newFailedRed = [...s.failedRedTaskIds, taskId];
            }
          } else {
            // white check
            if (resolution.success) {
              newCompleted = [...s.completedTaskIds, taskId];
            }
          }

          // 体力归零检测：体力 ≤ 0 且买不起最便宜的食物 → 游戏结束
          const isGameOver =
            newStamina <= 0 && newCredits < CHEAPEST_FOOD_PRICE;

          return {
            stats: {
              ...s.stats,
              stamina: newStamina,
              credits: newCredits,
              physical: s.stats.physical + (xp.physical ?? 0),
              mental: s.stats.mental + (xp.mental ?? 0),
              perception: s.stats.perception + (xp.perception ?? 0),
              empathy: s.stats.empathy + (xp.empathy ?? 0),
            },
            completedTaskIds: newCompleted,
            failedRedTaskIds: newFailedRed,
            lastResolution: resolution,
            gameOver: isGameOver,
          };
        });

        return resolution;
      },

      buyFood: (foodId) => {
        const food = getFoodById(foodId);
        if (!food) return false;
        const { stats, gameOver } = get();
        if (gameOver) return false;
        if (stats.credits < food.price) return false;

        set((s) => ({
          stats: {
            ...s.stats,
            credits: s.stats.credits - food.price,
            stamina: Math.min(
              s.stats.staminaMax,
              s.stats.stamina + food.staminaRestore
            ),
          },
        }));
        return true;
      },

      upgradeAttribute: (attr) => {
        const { stats } = get();
        if (stats.credits < UPGRADE_COST) return false;
        set((s) => ({
          stats: {
            ...s.stats,
            credits: s.stats.credits - UPGRADE_COST,
            [attr]: s.stats[attr] + 1,
          },
        }));
        return true;
      },

      clearLastResolution: () => set({ lastResolution: null }),

      setCurrentLocation: (id) => set({ currentLocation: id }),
    }),
    {
      name: 'rah-game-state',
      // 版本 6：加世界探索 (Phaser) + currentLocation
      // 旧存档字段不兼容，直接重置避免 undefined 崩溃
      version: 6,
      migrate: (_persisted: unknown, version: number) => {
        if (version < 6) {
          return initial;
        }
        return _persisted as GameState;
      },
    }
  )
);
