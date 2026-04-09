import type { MapRegion } from '../types/game';

/**
 * 区域开放情况：手机内"地图"App 的内容池。
 *
 * status:
 *   open       - 开放，可以接相关任务
 *   restricted - 限制进入（持有特定权限或完成前置后才能去）
 *   locked     - 完全封锁，剧情推进后才解锁
 *
 * MVP 阶段地图本身只是一个列表 UI（不画真地图），保证视觉表达即可。
 * 之后可以替换成像素 SVG 或 isometric 视图。
 */
export const REGIONS: MapRegion[] = [
  {
    id: 'region_old_town',
    name: '老城区',
    status: 'open',
    description:
      '本市最古老的街区。AI 信号覆盖率仅 31%，是 RAH 任务最常出现的地方。也是少数几个还能见到"人类店主"的地方。',
    unlockedAt: 'start',
  },
  {
    id: 'region_residential',
    name: '居住塔群',
    status: 'open',
    description:
      '你目前的住所。一栋 47 层的廉价居住塔，租户大多是 RAH 平台的承接者。AI 物业管家会在每月 1 号给你"人性化的"催租短信。',
    unlockedAt: 'start',
  },
  {
    id: 'region_midtown',
    name: '中城商务区',
    status: 'restricted',
    description:
      '玻璃塔与悬浮广告的森林。需要 RAH 平台等级 ≥ 2 才能接到这里的任务——这里的雇主只信任"高评分人类样本"。',
    unlockedAt: 'start',
  },
  {
    id: 'region_dock',
    name: '废弃港口区',
    status: 'restricted',
    description:
      '官方称此处"暂时关闭"。但据传那里有不愿被记录的 AI 雇主，也有不愿被发现的人类。需要特定任务带你进入。',
    unlockedAt: 'start',
  },
  {
    id: 'region_grey_zone',
    name: '灰区 7B',
    status: 'locked',
    description:
      '无 AI 传感器覆盖区域。地图在此处显示为一片纯黑。没有信号，没有记录，没有保护。剧情推进后开放。',
    unlockedAt: 'chapter2',
  },
  {
    id: 'region_central_node',
    name: '中央节点',
    status: 'locked',
    description:
      '本市所有 AI 系统的物理汇集点。从未对人类开放。地图上甚至没有它的精确坐标——只有一个模糊的红点。',
    unlockedAt: 'chapter3',
  },
];

export function getVisibleRegions(currentChapter: number): MapRegion[] {
  const chapterMap: Record<string, number> = {
    start: 1,
    chapter2: 2,
    chapter3: 3,
  };
  return REGIONS.filter((r) => chapterMap[r.unlockedAt] <= currentChapter);
}
