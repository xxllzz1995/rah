import { useState } from 'react';
import { useGameStore } from './store/gameStore';
import { Onboarding } from './components/Onboarding';
import { PhoneFrame } from './components/PhoneFrame';
import { StatusBar } from './components/StatusBar';
import { TaskList } from './components/TaskList';
import { TaskDetail } from './components/TaskDetail';
import { CompanionChat } from './components/CompanionChat';
import { BottomNav } from './components/BottomNav';
import { UpgradeScreen } from './components/UpgradeScreen';
import type { Task } from './types/game';

type View = 'tasks' | 'upgrade';

function App() {
  const onboarded = useGameStore((s) => s.onboarded);
  const companion = useGameStore((s) => s.companion);
  const resetAll = useGameStore((s) => s.resetAll);

  const [view, setView] = useState<View>('tasks');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatFocusedTask, setChatFocusedTask] = useState<Task | null>(null);

  if (!onboarded || !companion) {
    return <Onboarding />;
  }

  const openChat = (focusedTask: Task | null = null) => {
    setChatFocusedTask(focusedTask);
    setChatOpen(true);
  };

  return (
    <PhoneFrame>
      <StatusBar />

      <div className="flex-1 overflow-hidden relative flex flex-col">
        {view === 'tasks' && (
          <TaskList onSelectTask={(t) => setSelectedTask(t)} />
        )}
        {view === 'upgrade' && <UpgradeScreen />}

        {selectedTask && (
          <TaskDetail
            task={selectedTask}
            onClose={() => setSelectedTask(null)}
            onAskAI={(t) => openChat(t)}
          />
        )}

        {chatOpen && (
          <CompanionChat
            focusedTask={chatFocusedTask}
            onClose={() => {
              setChatOpen(false);
              setChatFocusedTask(null);
            }}
          />
        )}
      </div>

      <BottomNav
        view={view}
        onChangeView={(v) => setView(v)}
        onOpenChat={() => openChat(null)}
      />

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
