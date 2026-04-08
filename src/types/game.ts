// ============ AI 管家 ============
export type PersonalityType = 'gentle_sister' | 'ceo' | 'bestie';

export const PERSONALITY_LABELS: Record<PersonalityType, string> = {
  gentle_sister: '温柔姐姐',
  ceo: '霸道总裁',
  bestie: '最佳损友',
};

export type Companion = {
  name: string;
  personality: PersonalityType;
  mbti: string;
};

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
};

// ============ 玩家属性 ============
export type AttributeKey = 'physical' | 'mental';

export const ATTRIBUTE_LABELS: Record<AttributeKey, string> = {
  physical: '体能',
  mental: '智力',
};

export type PlayerStats = {
  credits: number;      // 💰 信用点（货币）
  stamina: number;      // ⚡ 当前体力
  staminaMax: number;   // ⚡ 体力上限
  physical: number;     // 💪 体能属性
  mental: number;       // 🧠 智力属性
};

// ============ 任务 ============
export type TaskCheck = {
  attribute: AttributeKey;
  difficulty: number; // 掷骰 + 属性 ≥ difficulty 则成功
};

export type TaskRewards = {
  credits: number;
  xp?: Partial<Record<AttributeKey, number>>;
};

export type Task = {
  id: string;
  title: string;
  description: string;
  level: number;
  staminaCost: number;
  check: TaskCheck;
  rewards: TaskRewards;
  failurePenalty: {
    extraStaminaLoss: number; // 额外扣的体力
    credits?: number;          // 扣信用点（一般 0）
  };
  flavor?: string; // 任务的世界观小描述（可选）
};

export type TaskResolution = {
  taskId: string;
  roll: number;        // 骰子结果 1-20
  attributeValue: number;
  total: number;
  difficulty: number;
  success: boolean;
  critical: 'success' | 'fail' | null; // 大成功/大失败
  rewardsGained: TaskRewards;
  staminaLost: number;
  timestamp: number;
};

// ============ 全局状态 ============
export type GameState = {
  onboarded: boolean;
  companion: Companion | null;
  playerCode: string;
  messages: ChatMessage[];

  stats: PlayerStats;
  completedTaskIds: string[];        // 已完成任务
  lastResolution: TaskResolution | null; // 最近一次判定结果（用于展示）
};
