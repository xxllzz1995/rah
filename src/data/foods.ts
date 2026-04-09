import type { FoodItem } from '../types/game';

/**
 * 外卖菜单
 *
 * 定价策略：起始 87¢，Lv1 任务成功奖 15-20¢，失败 0-5¢。
 * 食物是唯一恢复体力的方式，价格要让玩家感到经济压力。
 * 体力归零 = 游戏结束，所以玩家必须精打细算。
 */
export const FOODS: FoodItem[] = [
  {
    id: 'food_energy_drink',
    name: '罐装能量饮料',
    description: '廉价合成咖啡因，味道像电池酸液兑了糖浆。聊胜于无。',
    icon: '🥤',
    price: 10,
    staminaRestore: 2,
  },
  {
    id: 'food_synth_burger',
    name: '合成汉堡',
    description: '肉饼由大豆蛋白 3D 打印而成，番茄酱是真的——这年头算奢侈品了。',
    icon: '🍔',
    price: 18,
    staminaRestore: 3,
  },
  {
    id: 'food_fried_chicken',
    name: '炸鸡套餐',
    description: '老城区最后一家还用真油炸的店。鸡是克隆的，但那层酥皮是灵魂做的。',
    icon: '🍗',
    price: 28,
    staminaRestore: 5,
  },
  {
    id: 'food_ramen',
    name: '深夜拉面',
    description: '浓汤底、溏心蛋、叉烧两片。店主是个退役的烹饪 AI，自称"叛逃者"。',
    icon: '🍜',
    price: 24,
    staminaRestore: 4,
  },
  {
    id: 'food_deluxe_bento',
    name: '豪华便当',
    description: '三层保温盒，米饭、烤肉、味噌汤、腌菜。这是你能买到的最接近"好好吃一顿"的东西。',
    icon: '🍱',
    price: 45,
    staminaRestore: 8,
  },
];

export const CHEAPEST_FOOD_PRICE = Math.min(...FOODS.map((f) => f.price));

export function getFoodById(id: string): FoodItem | undefined {
  return FOODS.find((f) => f.id === id);
}
