import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { GameState, Companion, ChatMessage } from '../types/game';

type Actions = {
  completeOnboarding: (companion: Companion) => void;
  addMessage: (message: ChatMessage) => void;
  resetAll: () => void;
};

const initial: GameState = {
  onboarded: false,
  companion: null,
  playerCode: 'A-7741',
  messages: [],
};

export const useGameStore = create<GameState & Actions>()(
  persist(
    (set) => ({
      ...initial,
      completeOnboarding: (companion) =>
        set({ onboarded: true, companion }),
      addMessage: (message) =>
        set((s) => ({ messages: [...s.messages, message] })),
      resetAll: () => set(initial),
    }),
    { name: 'rah-game-state' }
  )
);
