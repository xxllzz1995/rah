import { useState } from 'react';
import { AppFrame } from './AppFrame';
import { FOODS } from '../data/foods';
import { useGameStore } from '../store/gameStore';

type Props = {
  onBack: () => void;
};

export function FoodApp({ onBack }: Props) {
  const stats = useGameStore((s) => s.stats);
  const buyFood = useGameStore((s) => s.buyFood);
  const [lastBought, setLastBought] = useState<string | null>(null);
  const [flash, setFlash] = useState(false);

  const handleBuy = (foodId: string) => {
    const ok = buyFood(foodId);
    if (ok) {
      setLastBought(foodId);
      setFlash(true);
      setTimeout(() => setFlash(false), 600);
    }
  };

  return (
    <AppFrame
      title="闪送外卖"
      subtitle="FLASH DELIVERY · 2045"
      onBack={onBack}
    >
      {/* 顶部状态 */}
      <div className="px-4 pt-3 pb-2 border-b border-emerald-500/10">
        <div className="flex items-center justify-between text-xs">
          <span className="text-emerald-500/70">
            ⚡ 体力 {stats.stamina}/{stats.staminaMax}
          </span>
          <span
            className={`tabular-nums transition-colors ${flash ? 'text-amber-300' : 'text-emerald-400/80'}`}
          >
            ¢ {stats.credits}
          </span>
        </div>
        <div className="mt-1.5 h-1 w-full bg-emerald-900/50 rounded overflow-hidden">
          <div
            className={`h-full transition-all ${
              stats.stamina / stats.staminaMax > 0.5
                ? 'bg-emerald-400'
                : stats.stamina / stats.staminaMax > 0.25
                  ? 'bg-amber-400'
                  : 'bg-red-400'
            }`}
            style={{
              width: `${(stats.stamina / stats.staminaMax) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* 菜单列表 */}
      <div className="px-4 py-3 space-y-3">
        <div className="text-[10px] text-emerald-500/60 tracking-widest uppercase">
          外卖菜单
        </div>

        {FOODS.map((food) => {
          const canAfford = stats.credits >= food.price;
          const staminaFull = stats.stamina >= stats.staminaMax;
          const disabled = !canAfford || staminaFull;
          const justBought = lastBought === food.id;

          return (
            <div
              key={food.id}
              className={`rounded-lg border p-3 transition-colors ${
                disabled
                  ? 'border-emerald-900/30 bg-black/40 opacity-50'
                  : 'border-emerald-500/30 bg-black/40'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="text-2xl mt-0.5">{food.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-emerald-100">
                      {food.name}
                    </span>
                    <span className="text-xs text-emerald-400/80 tabular-nums flex items-center gap-1">
                      <span className="text-emerald-300">+{food.staminaRestore}⚡</span>
                    </span>
                  </div>
                  <p className="text-[10px] text-emerald-500/50 mt-1 leading-relaxed">
                    {food.description}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span
                      className={`text-xs tabular-nums ${canAfford ? 'text-amber-300/80' : 'text-red-400/70'}`}
                    >
                      ¢{food.price}
                    </span>
                    <button
                      onClick={() => handleBuy(food.id)}
                      disabled={disabled}
                      className={`text-[10px] px-3 py-1 rounded border transition-all ${
                        justBought
                          ? 'border-emerald-400 bg-emerald-500/20 text-emerald-200'
                          : disabled
                            ? 'border-emerald-900/40 text-emerald-700 cursor-not-allowed'
                            : 'border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10 hover:border-emerald-400'
                      }`}
                    >
                      {justBought ? '已下单 ✓' : staminaFull ? '体力已满' : !canAfford ? '余额不足' : '下单'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* 底部提示 */}
        <div className="rounded border border-red-500/20 bg-red-500/5 p-2 text-[10px] text-red-300/60 leading-relaxed">
          警告：体力归零且无力购买食物时，你将因体力耗尽而倒下——游戏结束。请合理安排饮食与任务。
        </div>

        <div className="h-4" />
      </div>
    </AppFrame>
  );
}
