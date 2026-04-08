import { useState, useRef, useEffect, type FormEvent } from 'react';
import { useGameStore } from '../store/gameStore';
import { sendChatMessage } from '../lib/llm';
import type { ChatMessage, Task } from '../types/game';

type Props = {
  focusedTask?: Task | null;
  onClose: () => void;
};

export function CompanionChat({ focusedTask, onClose }: Props) {
  const companion = useGameStore((s) => s.companion);
  const playerCode = useGameStore((s) => s.playerCode);
  const stats = useGameStore((s) => s.stats);
  const messages = useGameStore((s) => s.messages);
  const addMessage = useGameStore((s) => s.addMessage);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, loading]);

  if (!companion) return null;

  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };
    addMessage(userMsg);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      const allMessages = [...messages, userMsg];
      const result = await sendChatMessage({
        companion,
        playerCode,
        messages: allMessages,
        stats,
        focusedTask: focusedTask ?? null,
      });
      const aiMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: result.text,
        timestamp: Date.now(),
      };
      addMessage(aiMsg);
    } catch (err) {
      setError(err instanceof Error ? err.message : '未知错误');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="absolute inset-0 bg-black/95 backdrop-blur-sm z-20 flex flex-col">
      <div className="px-4 pt-8 pb-3 border-b border-emerald-500/20 flex items-center justify-between">
        <button
          onClick={onClose}
          className="text-emerald-400/70 hover:text-emerald-300 text-sm"
        >
          ← 返回
        </button>
        <span className="text-[10px] text-emerald-500/60 tracking-widest">
          {companion.name} · {companion.mbti}
        </span>
        <div className="w-10" />
      </div>

      {focusedTask && (
        <div className="mx-4 mt-3 rounded border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-[10px] text-amber-300/80">
          正在咨询任务：{focusedTask.title}
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-3 text-sm">
        {messages.length === 0 && (
          <p className="text-emerald-500/40 italic text-center py-8">
            [ {companion.name} 正在等待您的第一句话... ]
          </p>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${
              m.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-3 py-2 ${
                m.role === 'user'
                  ? 'bg-emerald-500/20 text-emerald-100 border border-emerald-500/40'
                  : 'bg-black/60 text-emerald-200 border border-emerald-800/60'
              }`}
            >
              <div className="text-[10px] text-emerald-500/60 mb-1">
                {m.role === 'user' ? `#${playerCode}` : companion.name}
              </div>
              <div className="whitespace-pre-wrap">{m.content}</div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-black/60 border border-emerald-800/60 rounded-lg px-3 py-2 text-emerald-500/60 text-xs italic">
              {companion.name} 正在输入
              <span className="inline-block w-1 h-3 ml-1 bg-emerald-400 animate-pulse align-middle" />
            </div>
          </div>
        )}
        {error && (
          <div className="text-red-400 text-xs italic">
            [ 连接异常：{error} ]
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={handleSend}
        className="border-t border-emerald-500/20 p-3 flex gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`对 ${companion.name} 说点什么...`}
          disabled={loading}
          className="flex-1 bg-black/60 border border-emerald-500/40 rounded px-3 py-2 text-emerald-200 placeholder:text-emerald-700 focus:outline-none focus:border-emerald-400 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={loading || input.trim().length === 0}
          className="bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-400/50 text-emerald-200 px-4 rounded transition-colors disabled:opacity-30"
        >
          发送
        </button>
      </form>
    </div>
  );
}
