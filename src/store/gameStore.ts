import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  GameState,
  Companion,
  ChatMessage,
  PlayerStats,
  TaskResolution,
} from '../types/game';
import { getTaskById } from '../data/tasks';
import { resolveTask } from '../lib/dice';

type Actions = {
  completeOnboarding: (companion: Companion) => void;
  addMessage: (message: ChatMessage) => void;
  resetAll: () => void;

  // 任务相关
  attemptTask: (taskId: string) => TaskResolution | null;
  rest: () => void;
  upgradeAttribute: (attr: 'physical' | 'mental') => boolean;
  clearLastResolution: () => void;
};

const initialStats: PlayerStats = {
  credits: 50,
  stamina: 10,
  staminaMax: 10,
  physical: 1,
  mental: 1,
};

const initial: GameState = {
  onboarded: false,
  companion: null,
  playerCode: 'A-7741',
  messages: [],
  stats: initialStats,
  completedTaskIds: [],
  lastResolution: null,
};

export const UPGRADE_COST = 40; // 升一级属性需要的信用点

export const useGameStore = create<GameState & Actions>()(
  persist(
    (set, get) => ({
      ...initial,

      completeOnboarding: (companion) =>
        set({ onboarded: true, companion }),

      addMessage: (message) =>
        set((s) => ({ messages: [...s.messages, message] })),

      resetAll: () => set(initial),

      attemptTask: (taskId) => {
        const task = getTaskById(taskId);
        if (!task) return null;
        const { stats } = get();
        if (stats.stamina < task.staminaCost) return null;

        const resolution = resolveTask(task, stats);

        set((s) => {
          const newStamina = Math.max(0, s.stats.stamina - resolution.staminaLost);
          const newCredits = s.stats.credits + resolution.rewardsGained.credits;
          const xp = resolution.rewardsGained.xp ?? {};
          return {
            stats: {
              ...s.stats,
              stamina: newStamina,
              credits: newCredits,
              physical: s.stats.physical + (xp.physical ?? 0),
              mental: s.stats.mental + (xp.mental ?? 0),
            },
            completedTaskIds: resolution.success
              ? [...s.completedTaskIds, taskId]
              : s.completedTaskIds,
            lastResolution: resolution,
          };
        });

        return resolution;
      },

      rest: () => {
        set((s) => ({
          stats: { ...s.stats, stamina: s.stats.staminaMax },
        }));
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
    }),
    { name: 'rah-game-state' }
  )
);
