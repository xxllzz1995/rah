import type {
  Companion,
  PersonalityType,
  Task,
  TaskResolution,
  OutcomeKey,
} from '../types/game';

/**
 * 管家点评系统（混合方案）
 *
 * 设计思路：
 *   1. 预写骨架：每种 personality × 每种 outcomeKey 各有几句话池子。
 *      立刻可用、零延迟、零成本。绝大多数判定走这条路。
 *   2. LLM 钩子：留一个 USE_LLM 开关。开启后，关键时刻（critSuccess/critFail）
 *      或随机命中时调用 /api/chat 让管家"现场"点评。
 *      默认关闭——先用预写跑通，确认体验后再说要不要烧 token。
 *
 * 切换方式：把 USE_LLM 改成 true 即可。
 * 也可以单独控制 LLM_FOR_CRITS 和 LLM_RANDOM_RATE。
 */
const USE_LLM = false;          // 主开关
const LLM_FOR_CRITS = true;     // 大成功/大失败优先走 LLM
const LLM_RANDOM_RATE = 0.0;    // 普通成功/失败时调 LLM 的随机概率

type CommentaryArgs = {
  task: Task;
  resolution: TaskResolution;
  companion: Companion | null;
};

// ============ 预写骨架 ============
// 每条文案保持 1-2 句话，符合 prompts.ts 的"简短自然"要求。
type PoolMap = Record<PersonalityType, Record<OutcomeKey, string[]>>;

const POOL: PoolMap = {
  gentle_sister: {
    critSuccess: [
      '哎呀，你今天好厉害呀。我都替你紧张了一下下呢。',
      '看吧，我就说你可以的。这一次的运气也站在你这边哦。',
      '你脸上有光的样子，姐姐这边也能感觉到呢。',
    ],
    success: [
      '做得好。回来歇一会儿吧，别撑着。',
      '稳稳的，正合适。要不要我给你订点吃的？',
      '我就在这儿，做完就回来。',
    ],
    fail: [
      '没事的，下次再来。先把体力补回来好吗？',
      '不是你的错呀。今天的风向不对而已。',
      '回来吧。我泡好热的了。',
    ],
    critFail: [
      '别说话，先回来。其他的我们之后再说。',
      '我看到了。这不是你的错。是这个世界今天对你太狠了。',
      '深呼吸。我在。',
    ],
  },
  ceo: {
    critSuccess: [
      '不错。这才是我要的结果。',
      '记住这种感觉。我希望你每次都这样。',
      '看，我没看错人。',
    ],
    success: [
      '完成了就好。下一个。',
      '及格。但还能更好。',
      '继续。',
    ],
    fail: [
      '可以接受。但下次别犯同样的错。',
      '失败本身不重要。重要的是你从中学到了什么。',
      '回来。我们重新部署。',
    ],
    critFail: [
      '这种事不该发生。我们需要谈谈。',
      '我会处理后续。你现在的任务是回来。',
      '把脑袋抬起来。这点事不至于让你垮掉。',
    ],
  },
  bestie: {
    critSuccess: [
      '卧槽？？你今天吃了什么？这运气也太离谱了吧。',
      '行啊老六，闷声发大财呗。',
      '我赌你下一次掉链子。先记下来。',
    ],
    success: [
      '凑合凑合，过了就行。',
      '行了行了，别在外面晃了，回来打游戏。',
      '看你这表情我就知道成了。',
    ],
    fail: [
      '哈哈哈哈——不好意思我笑了一下。但确实蠢。',
      '没事，反正这平台早晚要塌。多输几次也无所谓。',
      '回来吧，我请你喝劣质合成酒。',
    ],
    critFail: [
      '......你没事吧？说真的。',
      '行，这事咱不提了。回来。',
      '这种霉运得有人记下来。我先记一笔。',
    ],
  },
};

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getPrewrittenLine(
  personality: PersonalityType,
  outcomeKey: OutcomeKey
): string {
  return pickRandom(POOL[personality][outcomeKey]);
}

// ============ LLM 钩子 ============
async function getLLMLine(args: CommentaryArgs): Promise<string | null> {
  const { task, resolution, companion } = args;
  if (!companion) return null;

  const outcomeWord = {
    critSuccess: '大成功',
    success: '成功',
    fail: '失败',
    critFail: '大失败',
  }[resolution.outcomeKey];

  // 给管家一段简短的"刚刚发生了什么"的上下文，让它用人设语气说一句话
  const userPrompt = `[系统消息：玩家刚刚尝试了任务"${task.title}"。判定结果是 ${outcomeWord}。
任务过程：${resolution.outcome.text}

请你以管家的身份对玩家说一句话（1-2 句，简短自然，严格符合你的人设语气）。不要重复任务文案里的内容，只表达你的反应或情绪。]`;

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        companion,
        playerCode: 'A-7741',
        messages: [
          {
            id: `commentary_${Date.now()}`,
            role: 'user',
            content: userPrompt,
            timestamp: Date.now(),
          },
        ],
      }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { text?: string };
    return data.text?.trim() || null;
  } catch {
    return null;
  }
}

// ============ 入口 ============
export async function getCheckCommentary(args: CommentaryArgs): Promise<string> {
  const { resolution, companion } = args;
  if (!companion) {
    return '...';
  }

  const isCrit =
    resolution.outcomeKey === 'critSuccess' ||
    resolution.outcomeKey === 'critFail';

  const shouldUseLLM =
    USE_LLM &&
    ((LLM_FOR_CRITS && isCrit) ||
      (!isCrit && Math.random() < LLM_RANDOM_RATE));

  if (shouldUseLLM) {
    const llmLine = await getLLMLine(args);
    if (llmLine) return llmLine;
    // LLM 失败兜底：用预写
  }

  return getPrewrittenLine(companion.personality, resolution.outcomeKey);
}
