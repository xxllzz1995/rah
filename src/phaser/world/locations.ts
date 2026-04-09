import type { AppId } from '../../App';

export type LocationDef = {
  id: string;
  label: string;
  x: number;         // 建筑中心 x
  width: number;      // 交互区宽度
  appId: AppId | null; // 对应的手机 App（null = 特殊场景）
  icon: string;
};

export const LOCATIONS: LocationDef[] = [
  {
    id: 'home',
    label: '你的公寓',
    x: 200,
    width: 120,
    appId: null,
    icon: '🏠',
  },
  {
    id: 'rah',
    label: 'RAH 任务中心',
    x: 700,
    width: 160,
    appId: 'rah',
    icon: '⚙',
  },
  {
    id: 'food',
    label: '美食街',
    x: 1200,
    width: 180,
    appId: 'food',
    icon: '🍔',
  },
  {
    id: 'alley',
    label: '???',
    x: 1700,
    width: 100,
    appId: null,
    icon: '?',
  },
];

export function getLocationById(id: string): LocationDef | undefined {
  return LOCATIONS.find((l) => l.id === id);
}
