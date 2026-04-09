import { useState } from 'react';
import { useGameStore } from './store/gameStore';
import { Onboarding } from './components/Onboarding';
import { PhoneFrame } from './components/PhoneFrame';
import { PhoneHome } from './components/PhoneHome';
import { RahApp } from './components/RahApp';
import { NewsApp } from './components/NewsApp';
import { MapApp } from './components/MapApp';
import { FoodApp } from './components/FoodApp';
import { CompanionChat } from './components/CompanionChat';
import { GameOver } from './components/GameOver';
import type { Task } from './types/game';

/**
 * App ID 列表。新增 App 时只需在这里加一个字符串字面量，
 * 然后在 PhoneHome 的 APPS 数组里加图标，再在 App.tsx 的 switch 里加渲染。
 */
export type AppId = 'rah' | 'companion' | 'news' | 'map' | 'food';

function App() {
  const onboarded = useGameStore((s) => s.onboarded);
  const companion = useGameStore((s) => s.companion);
  const gameOver = useGameStore((s) => s.gameOver);
  const resetAll = useGameStore((s) => s.resetAll);

  // 当前打开的 App；null = 在主屏
  const [openApp, setOpenApp] = useState<AppId | null>(null);
  // CompanionChat 是个 modal 风格的浮层，可以从 RahApp 内部"问管家"，
  // 也可以从主屏直接打开"私人管家"App。统一用一个 state。
  const [chatOpen, setChatOpen] = useState(false);
  const [chatFocusedTask, setChatFocusedTask] = useState<Task | null>(null);

  if (!onboarded || !companion) {
    return <Onboarding />;
  }

  // 游戏结束 → 显示结局画面
  if (gameOver) {
    return (
      <PhoneFrame>
        <GameOver />
      </PhoneFrame>
    );
  }

  const goHome = () => setOpenApp(null);

  const handleOpenApp = (id: AppId) => {
    if (id === 'companion') {
      // 私人管家 = 直接打开聊天浮层
      setChatFocusedTask(null);
      setChatOpen(true);
      return;
    }
    setOpenApp(id);
  };

  const handleAskAI = (focusedTask: Task | null) => {
    setChatFocusedTask(focusedTask);
    setChatOpen(true);
  };

  return (
    <PhoneFrame>
      {/* 主屏 */}
      <PhoneHome onOpenApp={handleOpenApp} />

      {/* 各 App 浮层 */}
      {openApp === 'rah' && (
        <RahApp onBack={goHome} onAskAI={handleAskAI} />
      )}
      {openApp === 'food' && <FoodApp onBack={goHome} />}
      {openApp === 'news' && <NewsApp onBack={goHome} />}
      {openApp === 'map' && <MapApp onBack={goHome} />}

      {/* 管家聊天浮层（z-index 比 App 高） */}
      {chatOpen && (
        <CompanionChat
          focusedTask={chatFocusedTask}
          onClose={() => {
            setChatOpen(false);
            setChatFocusedTask(null);
          }}
        />
      )}

      {/* Dev reset button */}
      <button
        onClick={() => {
          if (confirm('确定要重置所有进度吗？（仅用于测试）')) resetAll();
        }}
        className="absolute bottom-1 left-1 text-[9px] text-emerald-500/20 hover:text-emerald-400 z-30"
      >
        reset
      </button>
    </PhoneFrame>
  );
}

export default App;
