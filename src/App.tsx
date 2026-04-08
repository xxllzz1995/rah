import { useGameStore } from './store/gameStore';
import { Onboarding } from './components/Onboarding';
import { CompanionChat } from './components/CompanionChat';
import { PERSONALITY_LABELS } from './types/game';

function App() {
  const onboarded = useGameStore((s) => s.onboarded);
  const companion = useGameStore((s) => s.companion);
  const playerCode = useGameStore((s) => s.playerCode);
  const resetAll = useGameStore((s) => s.resetAll);

  if (!onboarded || !companion) {
    return <Onboarding />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="w-full max-w-2xl space-y-4">
        <div className="border border-emerald-500/30 bg-black/40 rounded-md">
          <div className="flex items-center gap-2 px-4 py-2 border-b border-emerald-500/30 bg-emerald-500/5">
            <div className="w-3 h-3 rounded-full bg-red-500/70" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
            <div className="w-3 h-3 rounded-full bg-green-500/70" />
            <span className="ml-2 text-xs text-emerald-400/70 tracking-widest">
              RAH://terminal — session_001
            </span>
          </div>
          <div className="p-6 text-sm text-emerald-300 space-y-2">
            <p className="text-emerald-500/60">
              [ RAH platform v0.0.1 online ]
            </p>
            <p className="text-emerald-500/60">
              [ AI companion:{' '}
              <span className="text-emerald-300">{companion.name}</span> (
              {PERSONALITY_LABELS[companion.personality]} / {companion.mbti}) ]
            </p>
            <p className="pt-2">
              欢迎回来，
              <span className="text-amber-300">#{playerCode}</span>。
            </p>
            <p className="text-emerald-500/50 text-xs italic pt-2">
              {companion.name} 正在线上，随时为您服务。
            </p>
          </div>
        </div>

        <CompanionChat />

        <div className="flex justify-end">
          <button
            onClick={() => {
              if (confirm('确定要重置所有进度吗？（仅用于测试）')) resetAll();
            }}
            className="text-xs text-emerald-500/40 hover:text-emerald-400 underline"
          >
            [重置测试数据]
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
