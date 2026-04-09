import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { getVisibleNews } from '../data/news';
import type { NewsEntry } from '../types/game';
import { AppFrame } from './AppFrame';

type Props = {
  onBack: () => void;
};

const TAG_COLORS: Record<string, string> = {
  战区: 'border-red-500/40 text-red-300 bg-red-500/10',
  本地: 'border-amber-500/40 text-amber-300 bg-amber-500/10',
  通告: 'border-emerald-500/40 text-emerald-300 bg-emerald-500/10',
  独家: 'border-purple-500/40 text-purple-300 bg-purple-500/10',
};

export function NewsApp({ onBack }: Props) {
  const chapter = useGameStore((s) => s.storyChapter);
  const news = getVisibleNews(chapter);
  const [openId, setOpenId] = useState<string | null>(null);
  const open = openId ? news.find((n) => n.id === openId) : null;

  return (
    <AppFrame
      title="世界新闻"
      subtitle="GLOBAL NEWS FEED"
      onBack={onBack}
    >
      {open ? (
        <ArticleView entry={open} onBack={() => setOpenId(null)} />
      ) : (
        <ListView entries={news} onOpen={setOpenId} />
      )}
    </AppFrame>
  );
}

function ListView({
  entries,
  onOpen,
}: {
  entries: NewsEntry[];
  onOpen: (id: string) => void;
}) {
  return (
    <div className="px-4 py-3 space-y-3">
      <div className="text-[10px] text-emerald-500/60 tracking-widest uppercase pb-1">
        共 {entries.length} 条
      </div>
      {entries.map((n) => (
        <button
          key={n.id}
          onClick={() => onOpen(n.id)}
          className="w-full text-left rounded-lg border border-emerald-500/30 bg-black/40 hover:border-emerald-400 hover:bg-emerald-500/5 p-3 transition-colors"
        >
          <div className="flex items-center gap-2 mb-1.5">
            {n.tag && (
              <span
                className={`text-[9px] px-1.5 py-0.5 rounded border ${TAG_COLORS[n.tag] ?? ''}`}
              >
                {n.tag}
              </span>
            )}
            <span className="text-[10px] text-emerald-500/60 tabular-nums">
              {n.date}
            </span>
          </div>
          <div className="text-sm text-emerald-100 leading-snug">{n.title}</div>
          <p className="text-xs text-emerald-500/60 mt-1 line-clamp-2 leading-relaxed">
            {n.body}
          </p>
        </button>
      ))}
      <div className="h-4" />
    </div>
  );
}

function ArticleView({
  entry,
  onBack,
}: {
  entry: NewsEntry;
  onBack: () => void;
}) {
  return (
    <div className="px-4 py-3 space-y-4">
      <button
        onClick={onBack}
        className="text-emerald-400/70 hover:text-emerald-300 text-xs"
      >
        ← 返回列表
      </button>
      <div className="flex items-center gap-2">
        {entry.tag && (
          <span
            className={`text-[9px] px-1.5 py-0.5 rounded border ${TAG_COLORS[entry.tag] ?? ''}`}
          >
            {entry.tag}
          </span>
        )}
        <span className="text-[10px] text-emerald-500/60 tabular-nums">
          {entry.date}
        </span>
      </div>
      <h2 className="text-base text-emerald-100 leading-snug">{entry.title}</h2>
      <p className="text-xs text-emerald-300/80 leading-relaxed whitespace-pre-line">
        {entry.body}
      </p>
      <div className="pt-2 text-[10px] text-emerald-500/40 italic">
        — RAH NEWS DESK
      </div>
    </div>
  );
}
