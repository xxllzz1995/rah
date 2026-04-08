import { useState, type FormEvent } from 'react';
import { useGameStore } from '../store/gameStore';
import type { PersonalityType, Companion } from '../types/game';

type Step = 'name' | 'personality' | 'mbti';

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
      {
        letter: 'E',
        label: '外向 (E)',
        desc: 'TA 从互动中获得能量，话多而主动',
      },
      {
        letter: 'I',
        label: '内向 (I)',
        desc: 'TA 话不多但每句有分量，更深而不广',
      },
    ],
  },
  {
    id: 'SN',
    prompt: '你希望 TA 关注什么？',
    options: [
      {
        letter: 'S',
        label: '实感 (S)',
        desc: 'TA 关注具体细节与当下事实',
      },
      {
        letter: 'N',
        label: '直觉 (N)',
        desc: 'TA 关注抽象可能性，富有联想',
      },
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

export function Onboarding() {
  const completeOnboarding = useGameStore((s) => s.completeOnboarding);
  const [step, setStep] = useState<Step>('name');
  const [name, setName] = useState('');
  const [personality, setPersonality] = useState<PersonalityType | null>(null);
  const [mbtiAnswers, setMbtiAnswers] = useState<Record<string, string>>({});
  const [mbtiIndex, setMbtiIndex] = useState(0);

  const handleSubmitName = (e: FormEvent) => {
    e.preventDefault();
    if (name.trim().length === 0) return;
    setStep('personality');
  };

  const handleSelectPersonality = (p: PersonalityType) => {
    setPersonality(p);
    setStep('mbti');
  };

  const handleMbtiAnswer = (axisId: MbtiAxis, letter: string) => {
    const next = { ...mbtiAnswers, [axisId]: letter };
    setMbtiAnswers(next);
    if (mbtiIndex < MBTI_QUESTIONS.length - 1) {
      setMbtiIndex(mbtiIndex + 1);
    } else {
      const mbti = (['EI', 'SN', 'TF', 'JP'] as MbtiAxis[])
        .map((k) => next[k])
        .join('');
      const companion: Companion = {
        name: name.trim(),
        personality: personality!,
        mbti,
      };
      completeOnboarding(companion);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="w-full max-w-2xl border border-emerald-500/30 bg-black/40 rounded-md shadow-[0_0_40px_rgba(16,185,129,0.1)]">
        <div className="flex items-center gap-2 px-4 py-2 border-b border-emerald-500/30 bg-emerald-500/5">
          <div className="w-3 h-3 rounded-full bg-red-500/70" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
          <div className="w-3 h-3 rounded-full bg-green-500/70" />
          <span className="ml-2 text-xs text-emerald-400/70 tracking-widest">
            RAH://setup — 初始化你的 AI 管家
          </span>
        </div>

        <div className="p-6 text-sm text-emerald-300 min-h-[420px]">
          {step === 'name' && (
            <form onSubmit={handleSubmitName} className="space-y-4">
              <p className="text-emerald-500/60">
                [ 系统检测到新用户。正在为您分配专属 AI 管家... ]
              </p>
              <p className="pt-2">请为您的 AI 管家命名：</p>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="输入名字..."
                className="w-full bg-black/60 border border-emerald-500/40 rounded px-3 py-2 text-emerald-200 placeholder:text-emerald-700 focus:outline-none focus:border-emerald-400"
                autoFocus
                maxLength={20}
              />
              <p className="text-xs text-emerald-500/50 italic">
                提示：这个名字将伴随您的整个 RAH 平台体验。
              </p>
              <button
                type="submit"
                disabled={name.trim().length === 0}
                className="w-full bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-400/50 text-emerald-200 py-2 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                下一步 &gt;
              </button>
            </form>
          )}

          {step === 'personality' && (
            <div className="space-y-4">
              <p className="text-emerald-500/60">
                [ 请为 "
                <span className="text-emerald-300">{name}</span>" 选择基础人设 ]
              </p>
              <div className="border border-amber-500/30 bg-amber-500/5 rounded px-3 py-2 text-xs text-amber-300/80">
                ⚠ 注意：您是在塑造 <span className="font-bold">您的 AI 管家</span>{' '}
                的性格，<span className="underline">不是描述您自己</span>。
              </div>
              <div className="space-y-3 pt-1">
                {(Object.keys(PERSONALITY_DETAILS) as PersonalityType[]).map(
                  (key) => {
                    const d = PERSONALITY_DETAILS[key];
                    return (
                      <button
                        key={key}
                        onClick={() => handleSelectPersonality(key)}
                        className="w-full text-left border border-emerald-500/30 hover:border-emerald-400 hover:bg-emerald-500/10 rounded p-4 transition-colors"
                      >
                        <div className="text-emerald-200 font-bold">
                          {d.title}
                        </div>
                        <div className="text-xs text-emerald-500/70 mt-1">
                          {d.tagline}
                        </div>
                        <div className="text-xs text-emerald-400/60 italic mt-2">
                          {d.sample}
                        </div>
                      </button>
                    );
                  }
                )}
              </div>
            </div>
          )}

          {step === 'mbti' && (
            <div className="space-y-4">
              <p className="text-emerald-500/60">
                [ 第 {mbtiIndex + 1} / {MBTI_QUESTIONS.length} 步：为 "
                <span className="text-emerald-300">{name}</span>" 定义性格特质 ]
              </p>
              <div className="border border-amber-500/30 bg-amber-500/5 rounded px-3 py-2 text-xs text-amber-300/80">
                ⚠ 再次提醒：您正在为{' '}
                <span className="font-bold">您的 AI 管家</span>{' '}
                选择特质，而不是您自己。
              </div>

              <div className="pt-3">
                <p className="text-emerald-200 pb-3">
                  {MBTI_QUESTIONS[mbtiIndex].prompt}
                </p>
                <div className="space-y-3">
                  {MBTI_QUESTIONS[mbtiIndex].options.map((opt) => (
                    <button
                      key={opt.letter}
                      onClick={() =>
                        handleMbtiAnswer(
                          MBTI_QUESTIONS[mbtiIndex].id,
                          opt.letter
                        )
                      }
                      className="w-full text-left border border-emerald-500/30 hover:border-emerald-400 hover:bg-emerald-500/10 rounded p-3 transition-colors"
                    >
                      <div className="text-emerald-200 font-bold">
                        {opt.label}
                      </div>
                      <div className="text-xs text-emerald-500/70 mt-1">
                        {opt.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-1 pt-4">
                {MBTI_QUESTIONS.map((_, i) => (
                  <div
                    key={i}
                    className={`flex-1 h-1 rounded ${
                      i <= mbtiIndex ? 'bg-emerald-400' : 'bg-emerald-900'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
