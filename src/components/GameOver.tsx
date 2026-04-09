import { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';

/**
 * 游戏结束画面 —— 体力耗尽结局。
 * 极乐迪斯科风格：缓慢浮现的文字，沉重的叙事，最后给一个重来按钮。
 */
export function GameOver() {
  const playerName = useGameStore((s) => s.playerName);
  const companion = useGameStore((s) => s.companion);
  const stats = useGameStore((s) => s.stats);
  const completedTaskIds = useGameStore((s) => s.completedTaskIds);
  const resetAll = useGameStore((s) => s.resetAll);

  const [visibleLines, setVisibleLines] = useState(0);

  const lines = [
    '你的身体终于不听使唤了。',
    '',
    `膝盖先着地，然后是手掌。人行道的温度透过皮肤传来——冰冷的，像这座城市对你的态度。`,
    '',
    `信用点余额：${stats.credits}¢。不够买一杯合成咖啡。`,
    `完成的任务：${completedTaskIds.length} 个。不够证明任何事。`,
    '',
    '路过的 AI 清洁车扫描了你一眼，判定你是"暂时性有机障碍物"，绕道而行。',
    '',
    companion
      ? `${companion.name}的语音消息在你口袋里的手机上响了三次。你没有力气接。`
      : '没有人给你打电话。',
    '',
    '你在 RAH 平台的状态被更新为 [INACTIVE — 体力耗尽]。',
    '系统自动发了一封邮件给你的紧急联系人。你没有设置紧急联系人。',
    '',
    `在 2045 年的这座城市里，${playerName}，`,
    '一个人类倒下并不是新闻。',
    '只是数据。',
  ];

  useEffect(() => {
    if (visibleLines >= lines.length) return;
    const delay = lines[visibleLines] === '' ? 400 : 1200;
    const timer = setTimeout(() => setVisibleLines((v) => v + 1), delay);
    return () => clearTimeout(timer);
  }, [visibleLines, lines.length]);

  const allShown = visibleLines >= lines.length;

  return (
    <div className="absolute inset-0 bg-black z-50 flex flex-col">
      {/* 背景：暗红色渐变 */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at bottom, rgba(127,29,29,0.15) 0%, rgba(0,0,0,1) 70%)',
        }}
      />
      {/* 扫描线 */}
      <div
        className="absolute inset-0 pointer-events-none opacity-10"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, rgba(239,68,68,0.2) 0px, rgba(239,68,68,0.2) 1px, transparent 1px, transparent 3px)',
        }}
      />

      {/* 顶部标签 */}
      <div className="relative px-6 pt-10 pb-4 z-10">
        <div className="text-[10px] text-red-500/60 tracking-[0.3em] uppercase">
          SYSTEM :: GAME OVER
        </div>
        <div className="text-xl text-red-300/90 font-light mt-2">
          体力耗尽
        </div>
      </div>

      {/* 叙事文字 */}
      <div className="relative flex-1 overflow-y-auto px-6 z-10">
        <div className="space-y-1 pb-8">
          {lines.slice(0, visibleLines).map((line, i) =>
            line === '' ? (
              <div key={i} className="h-3" />
            ) : (
              <p
                key={i}
                className="text-xs text-red-100/70 leading-relaxed animate-fade-in"
                style={{
                  animation: 'fadeIn 0.8s ease-in forwards',
                }}
              >
                {line}
              </p>
            )
          )}
        </div>
      </div>

      {/* 重来按钮 */}
      {allShown && (
        <div className="relative px-6 pb-8 z-10 space-y-3">
          <button
            onClick={() => {
              if (confirm('确定要重新开始吗？所有进度将被清除。')) {
                resetAll();
              }
            }}
            className="w-full py-3 border border-red-500/40 text-red-200 rounded text-sm hover:bg-red-500/10 transition-colors"
          >
            重新开始
          </button>
          <div className="text-center text-[9px] text-red-500/30 tracking-widest">
            RENT-A-HUMAN · 2045
          </div>
        </div>
      )}

      {/* fadeIn keyframes（内联） */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
