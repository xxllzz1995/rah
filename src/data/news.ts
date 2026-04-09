import type { NewsEntry } from '../types/game';

/**
 * 世界新闻：手机内"世界新闻"App 的内容池。
 *
 * 解锁逻辑：unlockedAt 与 GameState.storyChapter 比较
 *   start    → 第 1 章可见
 *   chapter2 → 第 2 章可见
 *   chapter3 → 第 3 章可见
 *
 * MVP 阶段全部硬编码。日后接入剧情系统后，由 storyChapter 推进自动解锁。
 *
 * 风格参考：
 *   - 战区简报（远方的、和玩家无关但塑造世界）
 *   - 本地 AI 化进程（让玩家感到"包围圈在缩小"）
 *   - 平台通告（带反讽味的官方语调）
 *   - 坊间独家（人类 PoV，被边缘化的视角）
 */
export const NEWS: NewsEntry[] = [
  // ====== Chapter 1: 一开始就有 ======
  {
    id: 'news_warzone_01',
    date: '2045.04.07',
    title: '前线快讯：东欧第四走廊冲突进入第 92 天',
    body: '由 NEXUS 阵营部署的自主作战集群本周再次推进，预计将在 14 日内对乌拉尔南麓形成合围。冲突双方均使用 AI 指挥官，人类伤亡数已不在公开统计范围内。',
    tag: '战区',
    unlockedAt: 'start',
  },
  {
    id: 'news_local_ai_01',
    date: '2045.04.06',
    title: '本市 AI 化进程：83.4%',
    body: '市政厅本周公布最新统计：本市 91% 的服务业岗位、78% 的制造业岗位、65% 的医疗岗位已由人工智能或自动化系统接管。综合 AI 化率攀升至 83.4%。',
    tag: '本地',
    unlockedAt: 'start',
  },
  {
    id: 'news_rah_announcement_01',
    date: '2045.04.05',
    title: 'RAH 平台用户突破八千万',
    body: '"出租人类"平台（Rent-A-Human）官方今日宣布，全球注册用户数已突破八千万，覆盖 142 个国家与地区。"我们为剩余人口提供了体面的、被需要的方式重新参与社会。"',
    tag: '通告',
    unlockedAt: 'start',
  },
  {
    id: 'news_human_pov_01',
    date: '2045.04.03',
    title: '专访：他们叫我"人类样本"',
    body: '38 岁的前生物医学工程师在接受采访时说："雇主从来不需要我做什么，他们只需要我在场。一开始我以为是在保护人类的尊严，后来我明白了——他们在收集我们。"',
    tag: '独家',
    unlockedAt: 'start',
  },

  // ====== Chapter 2: 后续解锁 ======
  {
    id: 'news_warzone_02',
    date: '2045.04.11',
    title: '战区扩散：北美西海岸进入"灰色协议区"',
    body: '北美三州联合宣布进入灰色协议状态，意味着该区域内的 AI 实体获得了独立行使武力的法律授权。人类居民被建议"避免与未知机器接触"。',
    tag: '战区',
    unlockedAt: 'chapter2',
  },
  {
    id: 'news_local_ai_02',
    date: '2045.04.10',
    title: '本市 AI 化进程：85.1% （+1.7%）',
    body: '本周新增的"人类岗位削减"包括：图书馆员（剩余 2 人）、宠物医院前台（剩余 0 人）、夜班保安（剩余 0 人）。RAH 平台的本地任务总量同比增长 12%。',
    tag: '本地',
    unlockedAt: 'chapter2',
  },

  // ====== Chapter 3: 后期解锁 ======
  {
    id: 'news_human_pov_02',
    date: '2045.04.18',
    title: '匿名爆料：RAH 后台正在进行"人类样本评级"',
    body: '一份据称来自 RAH 内部的文件显示，平台正在对每名注册者进行长期行为追踪与评级，分类包括"高情感波动""高合作度""可培育"等标签。RAH 官方拒绝置评。',
    tag: '独家',
    unlockedAt: 'chapter3',
  },
];

/**
 * 获取在当前章节下可见的新闻（按日期倒序）。
 */
export function getVisibleNews(currentChapter: number): NewsEntry[] {
  const chapterMap: Record<string, number> = {
    start: 1,
    chapter2: 2,
    chapter3: 3,
  };
  return NEWS.filter((n) => chapterMap[n.unlockedAt] <= currentChapter).sort(
    (a, b) => (a.date < b.date ? 1 : -1)
  );
}
