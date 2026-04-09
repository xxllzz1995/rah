import { useState } from 'react';
import { StatusBar } from './StatusBar';
import { TaskList } from './TaskList';
import { TaskDetail } from './TaskDetail';
import { UpgradeScreen } from './UpgradeScreen';
import { BottomNav } from './BottomNav';
import type { Task } from '../types/game';

type Props = {
  onBack: () => void;
  onAskAI: (focusedTask: Task | null) => void;
};

type View = 'tasks' | 'upgrade';

/**
 * RAH App 内部的容器：包含 StatusBar、底部 Tab、任务/升级页面、任务详情。
 *
 * 这是从原来 App.tsx 抽出来的"任务系统"那一坨——把它当作手机里的一个 App，
 * 而不是整个应用的根。点 "← 主屏" 返回 PhoneHome。
 */
export function RahApp({ onBack, onAskAI }: Props) {
  const [view, setView] = useState<View>('tasks');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  return (
    <div className="absolute inset-0 bg-black flex flex-col z-10">
      {/* 顶部：返回主屏 + 标题 */}
      <div className="px-4 pt-8 pb-2 border-b border-emerald-500/20 flex items-center justify-between">
        <button
          onClick={onBack}
          className="text-emerald-400/70 hover:text-emerald-300 text-sm"
        >
          ← 主屏
        </button>
        <div className="text-[10px] text-emerald-500/60 tracking-widest">
          RAH · RENT-A-HUMAN
        </div>
        <div className="w-10" />
      </div>

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
            onAskAI={(t) => onAskAI(t)}
          />
        )}
      </div>

      <BottomNav
        view={view}
        onChangeView={(v) => setView(v)}
        onOpenChat={() => onAskAI(null)}
      />
    </div>
  );
}
