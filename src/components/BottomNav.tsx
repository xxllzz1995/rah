type View = 'tasks' | 'upgrade';

type Props = {
  view: View;
  onChangeView: (v: View) => void;
  onOpenChat: () => void;
};

export function BottomNav({ view, onChangeView, onOpenChat }: Props) {
  return (
    <div className="border-t border-emerald-500/20 bg-black/80 backdrop-blur flex items-stretch">
      <NavButton
        active={view === 'tasks'}
        onClick={() => onChangeView('tasks')}
        label="任务"
        icon="▤"
      />
      <NavButton
        active={view === 'upgrade'}
        onClick={() => onChangeView('upgrade')}
        label="升级"
        icon="↑"
      />
      <NavButton active={false} onClick={onOpenChat} label="管家" icon="◉" />
    </div>
  );
}

function NavButton({
  active,
  onClick,
  label,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  icon: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        flex-1 py-3 flex flex-col items-center justify-center gap-1 transition-colors
        ${
          active
            ? 'text-emerald-300 bg-emerald-500/10'
            : 'text-emerald-500/60 hover:text-emerald-300 hover:bg-emerald-500/5'
        }
      `}
    >
      <span className="text-lg leading-none">{icon}</span>
      <span className="text-[10px] tracking-widest">{label}</span>
    </button>
  );
}
