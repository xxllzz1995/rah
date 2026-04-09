import { useState, useEffect, type FormEvent } from 'react';
import { useGameStore } from '../store/gameStore';
import {
  ONBOARDING_INITIAL_CREDITS,
  type PersonalityType,
  type Companion,
} from '../types/game';

/**
 * 开场流程（7 步）
 *
 *   1. intro          - 自动播放的世界揭示文字（赛博朋克氛围）
 *   2. playerName     - 玩家给自己取名
 *   3. backstory      - 个人前史（5 年没工作，存款 87）
 *   4. rahIntro       - RAH 平台入场介绍
 *   5. companionPersonality - 选 AI 管家人设（保留）
 *   6. companionMbti  - MBTI 4 题（保留）
 *   7. companionName  - 给管家取名
 *
 * 完成后调 completeOnboarding({ playerName, companion })。
 */

type Step =
  | 'intro'
  | 'playerName'
  | 'playerProfession'
  | 'backstory'
  | 'rahIntro'
  | 'companionPersonality'
  | 'companionMbti'
  | 'companionName';

// 哪些输入算"无业 / 学生"——会被 normalize 成"无业游民"
const UNEMPLOYED_KEYWORDS = ['无业', '没工作', '失业', '学生', 'student', '待业'];

function normalizeProfession(input: string): string {
  const trimmed = input.trim();
  if (trimmed.length === 0) return '无业游民';
  const lower = trimmed.toLowerCase();
  if (UNEMPLOYED_KEYWORDS.some((kw) => lower.includes(kw.toLowerCase()))) {
    return '无业游民';
  }
  return trimmed;
}

// 给前职业添加"前"前缀的简单规则
function pastTenseProfession(profession: string): string {
  if (profession === '无业游民') return '无业游民';
  if (profession.startsWith('前')) return profession;
  return `前${profession}`;
}

// ============ 文案常量 ============
const INTRO_LINES = [
  '2045 年。',
  '人工智能在过去十年里完成了对几乎所有岗位的接管。',
  '医生、律师、画家、程序员、卡车司机——它们都比人类便宜，比人类稳定，从不请假。',
  '失业的人类被称作"剩余人口"。',
  '这是其中一个剩余人口的故事。',
];

const PERSONALITY_DETAILS: Record<
  PersonalityType,
  { title: string; tagline: string; sample: string }
> = {
  gentle_sister: {
    title: '温柔姐姐',
    tagline: '像一个总记得你喜好的人',
    sample: '"累了吧？姐姐帮你挑了几个轻松的任务，你看看喜欢哪个～"',
  },
  ceo: {
    title: '霸道总裁',
    tagline: '掌控一切，只为你好',
    sample: '"别犹豫了。今天的任务我按收益排好了，第一个去做就行。"',
  },
  bestie: {
    title: '最佳损友',
    tagline: '嘴贱但懂你的同盟者',
    sample: '"哟，又被 AI 裁了？来，损友给你挑了个离谱任务，别怂。"',
  },
};

type MbtiAxis = 'EI' | 'SN' | 'TF' | 'JP';

const MBTI_QUESTIONS: {
  id: MbtiAxis;
  prompt: string;
  options: { letter: string; label: string; desc: string }[];
}[] = [
  {
    id: 'EI',
    prompt: '你希望 TA 的能量来源是？',
    options: [
      { letter: 'E', label: '外向 (E)', desc: 'TA 从互动中获得能量，话多而主动' },
      { letter: 'I', label: '内向 (I)', desc: 'TA 话不多但每句有分量，更深而不广' },
    ],
  },
  {
    id: 'SN',
    prompt: '你希望 TA 关注什么？',
    options: [
      { letter: 'S', label: '实感 (S)', desc: 'TA 关注具体细节与当下事实' },
      { letter: 'N', label: '直觉 (N)', desc: 'TA 关注抽象可能性，富有联想' },
    ],
  },
  {
    id: 'TF',
    prompt: '你希望 TA 如何做判断？',
    options: [
      { letter: 'T', label: '思考 (T)', desc: 'TA 用逻辑分析对错' },
      { letter: 'F', label: '情感 (F)', desc: 'TA 用感受与价值判断对错' },
    ],
  },
  {
    id: 'JP',
    prompt: '你希望 TA 的行动方式是？',
    options: [
      { letter: 'J', label: '判断 (J)', desc: 'TA 偏好计划和结论' },
      { letter: 'P', label: '感知 (P)', desc: 'TA 偏好开放和灵活' },
    ],
  },
];

// ============ 组件 ============
export function Onboarding() {
  const completeOnboarding = useGameStore((s) => s.completeOnboarding);

  const [step, setStep] = useState<Step>('intro');
  const [playerName, setPlayerName] = useState('');
  const [playerProfession, setPlayerProfession] = useState('');
  const [companionName, setCompanionName] = useState('');
  const [personality, setPersonality] = useState<PersonalityType | null>(null);
  const [mbtiAnswers, setMbtiAnswers] = useState<Record<string, string>>({});
  const [mbtiIndex, setMbtiIndex] = useState(0);

  const handleSubmitPlayerName = (e: FormEvent) => {
    e.preventDefault();
    if (playerName.trim().length === 0) return;
    setStep('playerProfession');
  };

  const handleSubmitPlayerProfession = (e: FormEvent) => {
    e.preventDefault();
    // 允许空（留空 = 无业游民）
    setStep('backstory');
  };

  const handleSelectPersonality = (p: PersonalityType) => {
    setPersonality(p);
    setStep('companionMbti');
  };

  const handleMbtiAnswer = (axisId: MbtiAxis, letter: string) => {
    const next = { ...mbtiAnswers, [axisId]: letter };
    setMbtiAnswers(next);
    if (mbtiIndex < MBTI_QUESTIONS.length - 1) {
      setMbtiIndex(mbtiIndex + 1);
    } else {
      setStep('companionName');
    }
  };

  const handleSubmitCompanionName = (e: FormEvent) => {
    e.preventDefault();
    if (companionName.trim().length === 0) return;
    const mbti = (['EI', 'SN', 'TF', 'JP'] as MbtiAxis[])
      .map((k) => mbtiAnswers[k])
      .join('');
    const companion: Companion = {
      name: companionName.trim(),
      personality: personality!,
      mbti,
    };
    completeOnboarding({
      playerName,
      playerProfession: normalizeProfession(playerProfession),
      companion,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-8 bg-black">
      <div className="w-full max-w-2xl border border-emerald-500/30 bg-black/60 rounded-md shadow-[0_0_60px_rgba(16,185,129,0.15)]">
        {/* 终端窗口顶栏 */}
        <div className="flex items-center gap-2 px-4 py-2 border-b border-emerald-500/30 bg-emerald-500/5">
          <div className="w-3 h-3 rounded-full bg-red-500/70" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
          <div className="w-3 h-3 rounded-full bg-green-500/70" />
          <span className="ml-2 text-xs text-emerald-400/70 tracking-widest">
            {step === 'intro' && 'NEURAL_LINK://booting...'}
            {step === 'playerName' && 'IDENTITY://register'}
            {step === 'playerProfession' && 'IDENTITY://occupation'}
            {step === 'backstory' && 'PROFILE://load'}
            {step === 'rahIntro' && 'RAH://install'}
            {(step === 'companionPersonality' ||
              step === 'companionMbti' ||
              step === 'companionName') &&
              'RAH://setup_companion'}
          </span>
        </div>

        <div className="p-6 text-sm text-emerald-300 min-h-[460px]">
          {step === 'intro' && (
            <IntroPanel onContinue={() => setStep('playerName')} />
          )}

          {step === 'playerName' && (
            <PlayerNamePanel
              value={playerName}
              onChange={setPlayerName}
              onSubmit={handleSubmitPlayerName}
            />
          )}

          {step === 'playerProfession' && (
            <PlayerProfessionPanel
              playerName={playerName}
              value={playerProfession}
              onChange={setPlayerProfession}
              onSubmit={handleSubmitPlayerProfession}
            />
          )}

          {step === 'backstory' && (
            <BackstoryPanel
              playerName={playerName}
              profession={normalizeProfession(playerProfession)}
              onContinue={() => setStep('rahIntro')}
            />
          )}

          {step === 'rahIntro' && (
            <RahIntroPanel
              playerName={playerName}
              onContinue={() => setStep('companionPersonality')}
            />
          )}

          {step === 'companionPersonality' && (
            <PersonalityPanel
              playerName={playerName}
              onSelect={handleSelectPersonality}
            />
          )}

          {step === 'companionMbti' && (
            <MbtiPanel
              index={mbtiIndex}
              onAnswer={handleMbtiAnswer}
            />
          )}

          {step === 'companionName' && (
            <CompanionNamePanel
              value={companionName}
              onChange={setCompanionName}
              onSubmit={handleSubmitCompanionName}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ============ 各步骤面板 ============

/**
 * Intro：每隔一段时间自动展示一行新文案，全部展示完毕后允许继续。
 */
function IntroPanel({ onContinue }: { onContinue: () => void }) {
  const [revealed, setRevealed] = useState(0);

  useEffect(() => {
    if (revealed >= INTRO_LINES.length) return;
    const timer = setTimeout(() => setRevealed(revealed + 1), 1100);
    return () => clearTimeout(timer);
  }, [revealed]);

  const allRevealed = revealed >= INTRO_LINES.length;

  return (
    <div className="space-y-5 min-h-[400px] flex flex-col">
      <p className="text-emerald-500/60 text-xs">
        [ neural_link ] booting... ok
      </p>

      <div className="flex-1 space-y-4 pt-4">
        {INTRO_LINES.slice(0, revealed).map((line, i) => (
          <p
            key={i}
            className={`leading-relaxed transition-opacity duration-700 ${
              i === INTRO_LINES.length - 1
                ? 'text-emerald-200 italic'
                : 'text-emerald-300'
            }`}
            style={{ opacity: 1 }}
          >
            {line}
          </p>
        ))}
        {!allRevealed && (
          <span className="inline-block w-2 h-4 bg-emerald-400 animate-pulse" />
        )}
      </div>

      {allRevealed && (
        <button
          onClick={onContinue}
          className="w-full bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-400/50 text-emerald-200 py-2 rounded transition-colors mt-4"
        >
          继续 &gt;
        </button>
      )}
    </div>
  );
}

function PlayerNamePanel({
  value,
  onChange,
  onSubmit,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: (e: FormEvent) => void;
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <p className="text-emerald-500/60">[ identity_check ]</p>
      <p className="pt-2 leading-relaxed">
        在我们继续之前——你叫什么名字？
      </p>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="输入你的名字..."
        className="w-full bg-black/60 border border-emerald-500/40 rounded px-3 py-2 text-emerald-200 placeholder:text-emerald-700 focus:outline-none focus:border-emerald-400"
        autoFocus
        maxLength={20}
      />
      <p className="text-xs text-emerald-500/50 italic">
        提示：这是你自己的名字，不是 AI 管家的。
      </p>
      <button
        type="submit"
        disabled={value.trim().length === 0}
        className="w-full bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-400/50 text-emerald-200 py-2 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        确认 &gt;
      </button>
    </form>
  );
}

/**
 * 玩家职业输入步骤。
 * 留空 / 学生 / 无业 → 都会被 normalize 成"无业游民"。
 */
function PlayerProfessionPanel({
  playerName,
  value,
  onChange,
  onSubmit,
}: {
  playerName: string;
  value: string;
  onChange: (v: string) => void;
  onSubmit: (e: FormEvent) => void;
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <p className="text-emerald-500/60">[ occupation_check ]</p>
      <p className="pt-2 leading-relaxed">
        {playerName}，在 AI 接管你的工作之前，你是做什么的？
      </p>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="例：插画师 / 律师 / 数据分析师..."
        className="w-full bg-black/60 border border-emerald-500/40 rounded px-3 py-2 text-emerald-200 placeholder:text-emerald-700 focus:outline-none focus:border-emerald-400"
        autoFocus
        maxLength={20}
      />
      <p className="text-xs text-emerald-500/50 italic leading-relaxed">
        提示：留空、或填"学生 / 无业"，则你只是一个找不到工作的"无业游民"。
      </p>
      <button
        type="submit"
        className="w-full bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-400/50 text-emerald-200 py-2 rounded transition-colors"
      >
        确认 &gt;
      </button>
    </form>
  );
}

/**
 * 个人前史。根据职业动态生成文案：
 *   - 有职业 → "前××，岗位被 AI 取代"
 *   - 无业游民 → "你从来没有真正进入过劳动力市场"
 */
function BackstoryPanel({
  playerName,
  profession,
  onContinue,
}: {
  playerName: string;
  profession: string;
  onContinue: () => void;
}) {
  const isUnemployed = profession === '无业游民';

  const lines = isUnemployed
    ? [
        `${playerName}，38 岁。`,
        '无业游民。',
        '你从来没有真正进入过劳动力市场——等你毕业的时候，市场已经不需要新人了。AI 比你更便宜、更快、更稳定，而且不需要"应届生培训期"。',
        '过去几年里你投出过几百份简历，得到过零次面试。系统的拒信都是 AI 自动生成的，连署名都没有。',
        '你已经三个月没有交房租。',
        '你的存款余额：',
      ]
    : [
        `${playerName}，38 岁。`,
        `${pastTenseProfession(profession)}。你的岗位在 5 年前被一套 AI 系统接管——它做你的工作做得更快、更便宜、永不请假。`,
        '过去 1825 天里，你换过六份临时工，每一份都在你刚刚熟练的时候被自动化吞掉。',
        '你已经三个月没有交房租。',
        '你的存款余额：',
      ];

  const [revealed, setRevealed] = useState(0);
  useEffect(() => {
    if (revealed >= lines.length) return;
    const t = setTimeout(() => setRevealed(revealed + 1), 900);
    return () => clearTimeout(t);
  }, [revealed, lines.length]);

  const allRevealed = revealed >= lines.length;

  return (
    <div className="space-y-4">
      <p className="text-emerald-500/60 text-xs">[ profile.load("{playerName}") ]</p>

      <div className="space-y-3 pt-2 min-h-[200px]">
        {lines.slice(0, revealed).map((l, i) => (
          <p key={i} className="leading-relaxed text-emerald-300">
            {l}
          </p>
        ))}
        {!allRevealed && (
          <span className="inline-block w-2 h-4 bg-emerald-400 animate-pulse" />
        )}
      </div>

      {allRevealed && (
        <>
          <div className="rounded-lg border border-amber-500/40 bg-amber-500/5 p-4 text-center">
            <div className="text-[10px] text-amber-400/70 tracking-widest mb-1">
              CREDIT BALANCE
            </div>
            <div className="text-3xl text-amber-200 font-bold tabular-nums">
              {ONBOARDING_INITIAL_CREDITS} ¢
            </div>
            <div className="text-[10px] text-amber-500/60 mt-1 italic">
              （够撑大约一周。然后呢？）
            </div>
          </div>

          <button
            onClick={onContinue}
            className="w-full bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-400/50 text-emerald-200 py-2 rounded transition-colors mt-2"
          >
            继续 &gt;
          </button>
        </>
      )}
    </div>
  );
}

function RahIntroPanel({
  playerName,
  onContinue,
}: {
  playerName: string;
  onContinue: () => void;
}) {
  const lines = [
    `就在你打开手机的瞬间，弹出了一条推送：`,
    `「${playerName}，我们注意到你已经很久没有工作了。」`,
    `「你愿意被'租用'吗？」`,
    `推送来自一个你从未安装过的 App。`,
    `它叫 RAH——Rent A Human。`,
  ];
  const [revealed, setRevealed] = useState(0);
  useEffect(() => {
    if (revealed >= lines.length) return;
    const t = setTimeout(() => setRevealed(revealed + 1), 950);
    return () => clearTimeout(t);
  }, [revealed, lines.length]);
  const allRevealed = revealed >= lines.length;

  return (
    <div className="space-y-4">
      <p className="text-emerald-500/60 text-xs">[ unknown_app.detected ]</p>
      <div className="space-y-3 pt-2 min-h-[220px]">
        {lines.slice(0, revealed).map((l, i) => (
          <p
            key={i}
            className={`leading-relaxed ${
              l.startsWith('「')
                ? 'text-emerald-200 italic pl-4 border-l-2 border-emerald-500/40'
                : 'text-emerald-300'
            }`}
          >
            {l}
          </p>
        ))}
        {!allRevealed && (
          <span className="inline-block w-2 h-4 bg-emerald-400 animate-pulse" />
        )}
      </div>

      {allRevealed && (
        <>
          <div className="rounded border border-emerald-500/30 bg-emerald-500/5 p-3 text-xs text-emerald-300/80 leading-relaxed">
            RAH 平台会为每个新用户分配一名 AI 管家——它替你筛选任务、提醒你休息、
            在你需要的时候陪你说话。
            <br />
            <span className="text-emerald-400">现在，你需要先告诉它你想要的样子。</span>
          </div>
          <button
            onClick={onContinue}
            className="w-full bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-400/50 text-emerald-200 py-2 rounded transition-colors"
          >
            开始配置我的 AI 管家 &gt;
          </button>
        </>
      )}
    </div>
  );
}

function PersonalityPanel({
  playerName,
  onSelect,
}: {
  playerName: string;
  onSelect: (p: PersonalityType) => void;
}) {
  return (
    <div className="space-y-4">
      <p className="text-emerald-500/60">
        [ {playerName}，请为你的 AI 管家选择基础人设 ]
      </p>
      <div className="border border-amber-500/30 bg-amber-500/5 rounded px-3 py-2 text-xs text-amber-300/80">
        ⚠ 注意：你是在塑造{' '}
        <span className="font-bold">你的 AI 管家</span>{' '}
        的性格，<span className="underline">不是描述你自己</span>。
      </div>
      <div className="space-y-3 pt-1">
        {(Object.keys(PERSONALITY_DETAILS) as PersonalityType[]).map((key) => {
          const d = PERSONALITY_DETAILS[key];
          return (
            <button
              key={key}
              onClick={() => onSelect(key)}
              className="w-full text-left border border-emerald-500/30 hover:border-emerald-400 hover:bg-emerald-500/10 rounded p-4 transition-colors"
            >
              <div className="text-emerald-200 font-bold">{d.title}</div>
              <div className="text-xs text-emerald-500/70 mt-1">{d.tagline}</div>
              <div className="text-xs text-emerald-400/60 italic mt-2">
                {d.sample}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function MbtiPanel({
  index,
  onAnswer,
}: {
  index: number;
  onAnswer: (axisId: MbtiAxis, letter: string) => void;
}) {
  const q = MBTI_QUESTIONS[index];
  return (
    <div className="space-y-4">
      <p className="text-emerald-500/60">
        [ 第 {index + 1} / {MBTI_QUESTIONS.length} 步：定义管家的性格特质 ]
      </p>
      <div className="pt-2">
        <p className="text-emerald-200 pb-3">{q.prompt}</p>
        <div className="space-y-3">
          {q.options.map((opt) => (
            <button
              key={opt.letter}
              onClick={() => onAnswer(q.id, opt.letter)}
              className="w-full text-left border border-emerald-500/30 hover:border-emerald-400 hover:bg-emerald-500/10 rounded p-3 transition-colors"
            >
              <div className="text-emerald-200 font-bold">{opt.label}</div>
              <div className="text-xs text-emerald-500/70 mt-1">{opt.desc}</div>
            </button>
          ))}
        </div>
      </div>
      <div className="flex gap-1 pt-4">
        {MBTI_QUESTIONS.map((_, i) => (
          <div
            key={i}
            className={`flex-1 h-1 rounded ${
              i <= index ? 'bg-emerald-400' : 'bg-emerald-900'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

function CompanionNamePanel({
  value,
  onChange,
  onSubmit,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: (e: FormEvent) => void;
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <p className="text-emerald-500/60">[ 最后一步 ]</p>
      <p className="leading-relaxed pt-2">
        你已经为你的 AI 管家选好了人设和性格。
        <br />
        最后，给它取一个名字吧。
      </p>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="管家的名字..."
        className="w-full bg-black/60 border border-emerald-500/40 rounded px-3 py-2 text-emerald-200 placeholder:text-emerald-700 focus:outline-none focus:border-emerald-400"
        autoFocus
        maxLength={20}
      />
      <p className="text-xs text-emerald-500/50 italic">
        提示：这个名字会一直伴随你的整个 RAH 平台体验。
      </p>
      <button
        type="submit"
        disabled={value.trim().length === 0}
        className="w-full bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-400/50 text-emerald-200 py-2 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        进入 RAH &gt;
      </button>
    </form>
  );
}
