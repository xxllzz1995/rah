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

export const ONBOARDING_INITIAL_CREDITS = 87; // 玩家起始存款，开场剧情会引用

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
};

// ============ 玩家属性 ============
// 4 个属性参考了《极乐迪斯科》的人格化技能思路：每个属性既是数值，
// 也是玩家在判定时调用的"内心声音"。
export type AttributeKey = 'physical' | 'mental' | 'perception' | 'empathy';

export const ATTRIBUTE_LABELS: Record<AttributeKey, string> = {
  physical: '体能',
  mental: '智力',
  perception: '感知',
  empathy: '共情',
};

export const ATTRIBUTE_ICONS: Record<AttributeKey, string> = {
  physical: '💪',
  mental: '🧠',
  perception: '👁',
  empathy: '💗',
};

export const ATTRIBUTE_DESCRIPTIONS: Record<AttributeKey, string> = {
  physical: '体力劳动、耐力、武力。搬运、奔跑、护送、抵抗疲劳。',
  mental: '逻辑、推理、知识、技术。校对、破解、规划、推断。',
  perception: '观察、警觉、直觉。发现细节、识破谎言、躲避危险。',
  empathy: '共情、社交、操控人心。劝说、安抚、伪装、读懂他人。',
};

export type PlayerStats = {
  credits: number;      // 💰 信用点（货币）
  stamina: number;      // ⚡ 当前体力
  staminaMax: number;   // ⚡ 体力上限
  physical: number;     // 💪 体能
  mental: number;       // 🧠 智力
  perception: number;   // 👁 感知
  empathy: number;      // 💗 共情
};

// ============ 任务判定 ============
export type CheckType = 'white' | 'red';
// white = 白检：失败后属性提升或换条件可重试
// red  = 红检：一次性，无论成败都关闭

export type TaskCheck = {
  attribute: AttributeKey;
  difficulty: number; // 2d6 + 属性 ≥ difficulty 则成功
  type: CheckType;
};

// 一次结果分支（文案 + 奖惩）
// 用 staminaDelta 是因为既可以扣体力（负），未来也允许某些大成功"令你振奋"回体力（正）
export type Outcome = {
  text: string;            // 叙事结果文案（极乐迪斯科风格的一段话）
  credits: number;         // 信用点变化（可正可负）
  staminaDelta: number;    // 体力变化（一般为负数）
  xp?: Partial<Record<AttributeKey, number>>; // 属性 xp（成功时给）
};

export type TaskOutcomes = {
  critSuccess: Outcome;
  success: Outcome;
  fail: Outcome;
  critFail: Outcome;
};

export type Task = {
  id: string;
  title: string;
  description: string;
  level: number;
  staminaCost: number;     // 接任务的基础体力消耗
  check: TaskCheck;
  outcomes: TaskOutcomes;
  flavor?: string;         // 选择前的世界观补充
  sceneImage: string;      // 任务场景图（赛博朋克氛围图，URL 或本地路径）
};

export type OutcomeKey = 'critSuccess' | 'success' | 'fail' | 'critFail';

export type TaskResolution = {
  taskId: string;
  dice: [number, number];   // 两个 d6 的原始值
  diceSum: number;          // dice 之和
  attributeValue: number;
  total: number;            // dice 之和 + 属性
  difficulty: number;
  success: boolean;
  outcomeKey: OutcomeKey;
  outcome: Outcome;         // 命中的那个分支
  timestamp: number;
};

// ============ 新闻 / 地图（手机内 App 的内容） ============
// 解锁条件：'start' = 一开始就有；'chapter2' / 'chapter3' = 后续解锁
// 玩家章节由 storyChapter 控制；MVP 阶段先全部硬编码
export type UnlockKey = 'start' | 'chapter2' | 'chapter3';

export type NewsEntry = {
  id: string;
  date: string;        // 故事内日期
  title: string;
  body: string;        // 一段话
  tag?: string;        // 标签：战区/进程/通告/独家
  unlockedAt: UnlockKey;
};

export type MapRegion = {
  id: string;
  name: string;
  status: 'open' | 'restricted' | 'locked';
  description: string;
  unlockedAt: UnlockKey;
};

// ============ 外卖食物 ============
export type FoodItem = {
  id: string;
  name: string;
  description: string;
  icon: string;
  price: number;           // 信用点价格
  staminaRestore: number;  // 恢复体力值
};

// ============ 全局状态 ============
export type GameState = {
  onboarded: boolean;
  companion: Companion | null;
  playerName: string;        // 玩家自己的名字（开场起的）
  playerProfession: string;  // 玩家被替代前的职业（开场起的；学生/无业 → "无业游民"）
  playerCode: string;        // 系统分配的 RAH 代号
  messages: ChatMessage[];

  storyChapter: number;      // 当前章节，控制新闻/地图等的解锁

  stats: PlayerStats;
  completedTaskIds: string[];        // 已永久关闭（红检或白检大成功）的任务
  failedRedTaskIds: string[];        // 红检失败的任务（也关闭，但状态不同）
  lastResolution: TaskResolution | null;

  gameOver: boolean;         // 体力归零 → 游戏结束
  currentLocation: string | null; // 当前进入的地点 ID（Phaser → React）
};
