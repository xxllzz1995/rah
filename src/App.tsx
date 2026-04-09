import { useState, useEffect } from 'react';
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
import { PhaserGame } from './phaser/PhaserGame';
import { LocationOverlay } from './components/LocationOverlay';
import { HomeOverlay } from './components/HomeOverlay';
import { AlleyOverlay } from './components/AlleyOverlay';
import { eventBus } from './phaser/eventBus';
import type { Task } from './types/game';

export type AppId = 'rah' | 'companion' | 'news' | 'map' | 'food';

function App() {
  const onboarded = useGameStore((s) => s.onboarded);
  const companion = useGameStore((s) => s.companion);
  const gameOver = useGameStore((s) => s.gameOver);
  const resetAll = useGameStore((s) => s.resetAll);
  const setCurrentLocation = useGameStore((s) => s.setCurrentLocation);
  const currentLocation = useGameStore((s) => s.currentLocation);

  // 手机模式（全屏手机 UI）
  const [phoneOpen, setPhoneOpen] = useState(false);
  const [phoneApp, setPhoneApp] = useState<AppId | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatFocusedTask, setChatFocusedTask] = useState<Task | null>(null);

  // 监听 Phaser 事件
  useEffect(() => {
    const unsub = eventBus.on('enter-location', (locationId: string) => {
      setCurrentLocation(locationId);
    });
    return unsub;
  }, [setCurrentLocation]);

  const closeLocation = () => {
    setCurrentLocation(null);
    eventBus.emit('close-overlay');
  };

  // ── 开场 ──────────────────────────────────
  if (!onboarded || !companion) {
    return <Onboarding />;
  }

  // ── 游戏结束 ──────────────────────────────
  if (gameOver) {
    return (
      <PhoneFrame>
        <GameOver />
      </PhoneFrame>
    );
  }

  // ── 手机 UI ───────────────────────────────
  const handleOpenPhoneApp = (id: AppId) => {
    if (id === 'companion') {
      setChatFocusedTask(null);
      setChatOpen(true);
      return;
    }
    setPhoneApp(id);
  };

  const handleAskAI = (focusedTask: Task | null) => {
    setChatFocusedTask(focusedTask);
    setChatOpen(true);
  };

  const closePhone = () => {
    setPhoneOpen(false);
    setPhoneApp(null);
    eventBus.emit('close-overlay');
  };

  // ── 场景浮层内容 ──────────────────────────
  const renderLocationContent = () => {
    switch (currentLocation) {
      case 'home':
        return <HomeOverlay />;
      case 'rah':
        return (
          <RahApp
            onBack={closeLocation}
            onAskAI={handleAskAI}
            embedded
          />
        );
      case 'food':
        return <FoodApp onBack={closeLocation} embedded />;
      case 'alley':
        return <AlleyOverlay />;
      default:
        return null;
    }
  };

  return (
    <PhoneFrame>
      {/* Phaser 游戏画布（底层） */}
      <PhaserGame />

      {/* 浮动 HUD */}
      <WorldHUD onPhoneOpen={() => setPhoneOpen(true)} />

      {/* 场景交互浮层 */}
      {currentLocation && (
        <LocationOverlay onClose={closeLocation}>
          {renderLocationContent()}
        </LocationOverlay>
      )}

      {/* 手机全屏模式 */}
      {phoneOpen && (
        <div className="absolute inset-0 z-30 bg-black flex flex-col">
          <PhoneHome onOpenApp={handleOpenPhoneApp} />

          {phoneApp === 'rah' && (
            <RahApp onBack={() => setPhoneApp(null)} onAskAI={handleAskAI} />
          )}
          {phoneApp === 'food' && <FoodApp onBack={() => setPhoneApp(null)} />}
          {phoneApp === 'news' && <NewsApp onBack={() => setPhoneApp(null)} />}
          {phoneApp === 'map' && <MapApp onBack={() => setPhoneApp(null)} />}

          {/* 关闭手机按钮 */}
          <button
            onClick={closePhone}
            className="absolute bottom-3 left-1/2 -translate-x-1/2 z-40 px-4 py-1.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] rounded-full hover:bg-emerald-500/30 transition-colors"
          >
            收起手机
          </button>
        </div>
      )}

      {/* 管家聊天浮层 */}
      {chatOpen && (
        <CompanionChat
          focusedTask={chatFocusedTask}
          onClose={() => {
            setChatOpen(false);
            setChatFocusedTask(null);
          }}
        />
      )}

      {/* Dev reset */}
      <button
        onClick={() => {
          if (confirm('确定要重置所有进度吗？（仅用于测试）')) resetAll();
        }}
        className="absolute bottom-1 left-1 text-[9px] text-emerald-500/20 hover:text-emerald-400 z-50"
      >
        reset
      </button>
    </PhoneFrame>
  );
}

// ── 浮动 HUD ──────────────────────────────────
function WorldHUD({ onPhoneOpen }: { onPhoneOpen: () => void }) {
  const stats = useGameStore((s) => s.stats);

  const staminaRatio = stats.stamina / stats.staminaMax;
  const staminaColor =
    staminaRatio > 0.5
      ? 'bg-emerald-400'
      : staminaRatio > 0.25
        ? 'bg-amber-400'
        : 'bg-red-400';

  return (
    <div className="absolute top-0 left-0 right-0 z-10 pointer-events-none">
      <div className="flex items-center justify-between px-3 py-2 pointer-events-auto">
        {/* 左：信用点 + 体力 */}
        <div className="flex items-center gap-3 bg-black/70 backdrop-blur-sm rounded-lg border border-emerald-500/20 px-3 py-1.5">
          <span className="text-[10px] text-amber-300/80 tabular-nums">
            ¢{stats.credits}
          </span>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-emerald-400/80">⚡</span>
            <div className="w-16 h-1.5 bg-emerald-900/50 rounded overflow-hidden">
              <div
                className={`h-full ${staminaColor} transition-all`}
                style={{ width: `${staminaRatio * 100}%` }}
              />
            </div>
            <span className="text-[9px] text-emerald-400/60 tabular-nums">
              {stats.stamina}
            </span>
          </div>
        </div>

        {/* 右：手机按钮 */}
        <button
          onClick={onPhoneOpen}
          className="bg-black/70 backdrop-blur-sm rounded-lg border border-emerald-500/20 px-3 py-1.5 text-emerald-300 text-xs hover:bg-emerald-500/10 transition-colors"
        >
          📱
        </button>
      </div>

      {/* 操作提示 */}
      <div className="flex justify-center mt-1">
        <span className="text-[8px] text-emerald-500/30 bg-black/40 px-2 py-0.5 rounded">
          ← A/D → 移动 · E 交互 · 📱 手机
        </span>
      </div>
    </div>
  );
}

export default App;
