export type PersonalityType = 'gentle_sister' | 'ceo' | 'bestie';

export const PERSONALITY_LABELS: Record<PersonalityType, string> = {
  gentle_sister: '温柔姐姐',
  ceo: '霸道总裁',
  bestie: '最佳损友',
};

export type Companion = {
  name: string;
  personality: PersonalityType;
  mbti: string; // 4-letter MBTI, e.g. "ENFP"
};

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
};

export type GameState = {
  onboarded: boolean;
  companion: Companion | null;
  playerCode: string;
  messages: ChatMessage[];
};
