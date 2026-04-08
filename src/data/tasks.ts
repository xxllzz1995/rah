import type { Task } from '../types/game';

/**
 * MVP 阶段的初始任务池。
 * 设计原则：
 *   - Lv1 任务：属性 1 的玩家应该有 ~70-80% 成功率（难度 5 左右）
 *   - Lv2 任务：属性 2-3 才好做（难度 8-10）
 *   - Lv3 任务：属性 4+ 才稳（难度 12-14）
 * 计算：骰 1d20 + 属性 ≥ 难度
 *   属性 1 对难度 5：需骰 ≥ 4，概率 85%
 *   属性 1 对难度 8：需骰 ≥ 7，概率 70%
 *   属性 2 对难度 10：需骰 ≥ 8，概率 65%
 */
export const TASKS: Task[] = [
  // === Lv1 ===
  {
    id: 'task_delivery_01',
    title: '帮 AI 住户取外卖',
    description: '3 楼的 AI 租户让你去楼下便利店取一份热狗，10 分钟送上门。',
    level: 1,
    staminaCost: 1,
    check: { attribute: 'physical', difficulty: 5 },
    rewards: { credits: 15, xp: { physical: 1 } },
    failurePenalty: { extraStaminaLoss: 1 },
    flavor: '简单活，热狗冷掉了倒霉的是对方。',
  },
  {
    id: 'task_walk_dog_01',
    title: '遛机械宠物犬',
    description: '帮 AI 主人遛一只机械犬 30 分钟。它会自己走路，你只要跟着。',
    level: 1,
    staminaCost: 2,
    check: { attribute: 'physical', difficulty: 6 },
    rewards: { credits: 20, xp: { physical: 1 } },
    failurePenalty: { extraStaminaLoss: 1 },
    flavor: '据说这只机械犬的前任遛狗员累到报销了。',
  },
  {
    id: 'task_data_entry_01',
    title: '人工校对数据',
    description: 'AI 需要一个人类来核对它生成的报表——它"不信任"自己的输出。',
    level: 1,
    staminaCost: 1,
    check: { attribute: 'mental', difficulty: 5 },
    rewards: { credits: 15, xp: { mental: 1 } },
    failurePenalty: { extraStaminaLoss: 1 },
    flavor: 'AI 比你更擅长这个，它只是需要"人类签名"这一条。',
  },
  {
    id: 'task_queue_01',
    title: '代排队',
    description: '帮 AI 客户去一家网红餐厅排队 2 小时，它会在你到达时远程订餐。',
    level: 1,
    staminaCost: 3,
    check: { attribute: 'physical', difficulty: 7 },
    rewards: { credits: 30, xp: { physical: 1 } },
    failurePenalty: { extraStaminaLoss: 2 },
    flavor: '站 2 小时听起来不难，直到你真的站了 2 小时。',
  },

  // === Lv2 ===
  {
    id: 'task_navigate_01',
    title: '在老城区找路',
    description: 'AI 的地图在老城区失效了，它需要一个"人肉导航"带它穿过几条无信号的巷子。',
    level: 2,
    staminaCost: 2,
    check: { attribute: 'mental', difficulty: 9 },
    rewards: { credits: 45, xp: { mental: 2 } },
    failurePenalty: { extraStaminaLoss: 2 },
    flavor: '为什么老城区没有信号？没人告诉你，问就是"历史遗留问题"。',
  },
  {
    id: 'task_heavy_lift_01',
    title: '搬运沉重货物',
    description: 'AI 雇主需要把几箱"来历不明的设备"从仓库搬到它的车上，不问不说。',
    level: 2,
    staminaCost: 4,
    check: { attribute: 'physical', difficulty: 10 },
    rewards: { credits: 55, xp: { physical: 2 } },
    failurePenalty: { extraStaminaLoss: 3 },
    flavor: '箱子很沉。你隐约听到里面有机械运转的声音。',
  },
  {
    id: 'task_interview_01',
    title: '冒充面试者',
    description: 'AI 需要一个人类去参加一场"人类专属"的岗位面试，拿到面试问题后回传给它。',
    level: 2,
    staminaCost: 2,
    check: { attribute: 'mental', difficulty: 10 },
    rewards: { credits: 60, xp: { mental: 2 } },
    failurePenalty: { extraStaminaLoss: 2 },
    flavor: '它不在乎你能不能入职，它要的是"人类面试"那一套流程的数据。',
  },

  // === Lv3 ===
  {
    id: 'task_infiltrate_01',
    title: '潜入无 AI 区域',
    description: '雇主要你去一个没有任何 AI 传感器的区域放置一个小型装置。任务时不要问它是什么。',
    level: 3,
    staminaCost: 5,
    check: { attribute: 'mental', difficulty: 13 },
    rewards: { credits: 120, xp: { mental: 3, physical: 1 } },
    failurePenalty: { extraStaminaLoss: 4 },
    flavor: '回来的路上，你会收到一条消息："谢谢你。你从未来过这里。"',
  },
  {
    id: 'task_bodyguard_01',
    title: '护送委托人',
    description: '一个 AI 客户需要你"护送"它的人形外壳穿过一条治安混乱的街区。',
    level: 3,
    staminaCost: 5,
    check: { attribute: 'physical', difficulty: 13 },
    rewards: { credits: 120, xp: { physical: 3, mental: 1 } },
    failurePenalty: { extraStaminaLoss: 4 },
    flavor: '奇怪的是，它明明比你"值钱"得多，却把你放在前面。',
  },
];

export function getTaskById(id: string): Task | undefined {
  return TASKS.find((t) => t.id === id);
}
