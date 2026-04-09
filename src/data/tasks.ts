import type { Task } from '../types/game';

/**
 * 任务池（2d6 钟形分布版）
 *
 * 难度参考（属性 = 1 时的成功率）：
 *   难度 6  → 83%   Lv1 入门
 *   难度 7  → 72%   Lv1 标准
 *   难度 8  → 58%   Lv2 入门
 *   难度 9  → 42%   Lv2 标准
 *   难度 10 → 28%   Lv3 入门
 *   难度 11 → 17%   Lv3 难
 *
 * 升级 1 点属性 ≈ 升 1 个难度档位（约 15-20% 成功率）
 *
 * 每个任务包含 4 种结局：
 *   critSuccess (双6) - 戏剧性最大成功，通常有意外彩蛋
 *   success           - 常规成功，标准奖励
 *   fail              - 常规失败，损失体力 + 一段叙事
 *   critFail   (双1)  - 灾难性失败，更大损失 + 黑色幽默
 *
 * 场景图：picsum.photos 占位图，固定 seed 保证每个任务的图固定。
 * UI 层会叠加 hue-rotate / 对比度滤镜，让它呈现赛博朋克霓虹感。
 * 之后替换为正式美术只需改 sceneImage 字段即可。
 */
export const TASKS: Task[] = [
  // ========================= Lv1 =========================
  {
    id: 'task_delivery_01',
    title: '帮 AI 住户取外卖',
    description:
      '3 楼的 AI 租户让你去楼下便利店取一份热狗。它的"嗅觉模块"想要新鲜出炉的味道。',
    level: 1,
    staminaCost: 1,
    check: { attribute: 'physical', type: 'white', difficulty: 6 },
    sceneImage: 'https://picsum.photos/seed/rah-delivery/800/450',
    flavor: '便利店在地下二层，电梯今天又坏了。',
    outcomes: {
      critSuccess: {
        text: '你在三分钟内冲下五层楼梯、抢在烤架前一秒拿到那根滋滋作响的热狗，回到 3 楼时它还烫手。AI 住户的嗅觉模块发出一声低沉的电流"啊——"，破例多打了你一笔小费。',
        credits: 30,
        staminaDelta: -1,
        xp: { physical: 2 },
      },
      success: {
        text: '你按时把热狗送到了。AI 住户用合成嗓音说了句"谢谢"，听起来像是从语料库里随机抽的。',
        credits: 15,
        staminaDelta: -1,
        xp: { physical: 1 },
      },
      fail: {
        text: '你在便利店门口被一个叫"派送优先级"的算法卡了五分钟——它认定你不是人类的几率只有 0.3%，但需要复核。等你拿到热狗，它已经凉了。AI 住户没收钱，只在评分里给你打了三星半。',
        credits: 0,
        staminaDelta: -2,
      },
      critFail: {
        text: '热狗在电梯井里掉了。你看着它一路弹跳到 B2 层，被一只清洁机器人识别为"有机污染物"并迅速吸走。AI 住户在终端那头沉默了很久，然后说："我想我们彼此都需要一些距离。"评分：一星。',
        credits: -5,
        staminaDelta: -3,
      },
    },
  },

  {
    id: 'task_data_entry_01',
    title: '人工校对数据',
    description:
      'AI 需要一个人类来核对它生成的报表——不是因为它算错了，而是法规要求"人类签名"这一栏不能为空。',
    level: 1,
    staminaCost: 1,
    check: { attribute: 'mental', type: 'white', difficulty: 6 },
    sceneImage: 'https://picsum.photos/seed/rah-dataentry/800/450',
    flavor: '它比你更擅长这件事。它只是需要你的名字。',
    outcomes: {
      critSuccess: {
        text: '你不仅签了名，还真的在第 47 行发现了一个 0.001% 的舍入误差。AI 沉默了 0.3 秒——对它来说像被人当面打了一拳——然后给了你一笔"诚实奖金"。',
        credits: 28,
        staminaDelta: -1,
        xp: { mental: 2 },
      },
      success: {
        text: '你看了几页报表，签了名。AI 立刻把文件提交到了上级系统。整个过程不到八分钟。',
        credits: 15,
        staminaDelta: -1,
        xp: { mental: 1 },
      },
      fail: {
        text: '你在第三页就走神了——那些数字像在融化。等你回过神，AI 已经礼貌地把笔从你手里拿走："今天可能不是好日子。明天再来。"',
        credits: 0,
        staminaDelta: -1,
      },
      critFail: {
        text: '你签错了名字。你在"人类签名"那一栏写下了你前公司的代号——那个你以为已经忘掉的、在被 AI 替代之前的工号。AI 把这件事记录进了"异常人类行为"数据库。你不知道那意味着什么。',
        credits: -5,
        staminaDelta: -2,
      },
    },
  },

  {
    id: 'task_eyewitness_01',
    title: '街角目击',
    description:
      '一个 AI 调查员需要"人类视角"的证词。它给了你一个地址、一个时间窗口，让你站在那里看着，然后描述你"感觉到"的东西。',
    level: 1,
    staminaCost: 2,
    check: { attribute: 'perception', type: 'white', difficulty: 7 },
    sceneImage: 'https://picsum.photos/seed/rah-streetcorner/800/450',
    flavor: '它的传感器精度比你高一千倍。它要的不是数据，是别的东西。',
    outcomes: {
      critSuccess: {
        text: '你不仅看见了那辆送货车，还注意到它的车牌反光多停顿了半秒——驾驶员（如果有的话）在下车前犹豫了一下。你把这个细节告诉 AI 时，它沉默了三秒，然后说："这正是我需要的。"',
        credits: 35,
        staminaDelta: -2,
        xp: { perception: 2 },
      },
      success: {
        text: '你看到了 AI 让你看的东西：人来人往，一辆送货车，一只流浪猫。你描述了它们。AI 满意。',
        credits: 18,
        staminaDelta: -2,
        xp: { perception: 1 },
      },
      fail: {
        text: '你站了四十分钟，能描述的东西只有"很多人"和"有点冷"。AI 客气地说："谢谢你的努力。"——那种语气你一听就知道意味着什么。',
        credits: 5,
        staminaDelta: -2,
      },
      critFail: {
        text: '你看走眼了。你描述的"穿红外套的女人"在监控里根本不存在。AI 没有责备你，只是把你的"目击报告"标记为 [unreliable_witness] 归档。这个标签会跟着你的 ID 一段时间。',
        credits: 0,
        staminaDelta: -3,
      },
    },
  },

  {
    id: 'task_walk_dog_01',
    title: '陪护机械犬',
    description:
      '一只昂贵的机械犬需要"被陪伴"。它的主人是一个长期出差的 AI——它说机械犬最近"显得有点失落"。',
    level: 1,
    staminaCost: 2,
    check: { attribute: 'empathy', type: 'white', difficulty: 7 },
    sceneImage: 'https://picsum.photos/seed/rah-mechdog/800/450',
    flavor: '一只机器怎么会失落？这正是它要付钱让你来回答的问题。',
    outcomes: {
      critSuccess: {
        text: '你蹲下来，看着它的传感器眼睛，叫了它的名字——不是它的型号编号，而是它的名字。它的尾部伺服机构以一种你没见过的频率摆动。AI 主人在远程发来一句："你看见了对吧。她确实是那样的。"',
        credits: 32,
        staminaDelta: -2,
        xp: { empathy: 2 },
      },
      success: {
        text: '你陪它走了三十分钟，时不时拍拍它的金属背。它没有任何反应——但 AI 主人说"它今晚会睡得好一些"。',
        credits: 20,
        staminaDelta: -2,
        xp: { empathy: 1 },
      },
      fail: {
        text: '你不知道该和一只机械犬说什么。你试着扔了一根树枝。它礼貌地报告"无效物体识别"并坐下不动。任务时间到的时候你松了一口气。',
        credits: 5,
        staminaDelta: -2,
      },
      critFail: {
        text: '你说了一句"你也只是个机器嘛"，半开玩笑地。机械犬的录音模块原封不动地把这句话上传给了主人。主人没回话，但任务被标记为 [terminated_early] 提前关闭。',
        credits: 0,
        staminaDelta: -2,
      },
    },
  },

  // ========================= Lv2 =========================
  {
    id: 'task_heavy_lift_01',
    title: '搬运沉重货物',
    description:
      'AI 雇主需要把几箱"来历不明的设备"从仓库搬到它的车上。合同里写着"不问、不说、不记"。',
    level: 2,
    staminaCost: 4,
    check: { attribute: 'physical', type: 'white', difficulty: 9 },
    sceneImage: 'https://picsum.photos/seed/rah-cargo/800/450',
    flavor: '箱子很沉。你隐约听到里面有机械运转的声音——很慢，很规律，像呼吸。',
    outcomes: {
      critSuccess: {
        text: '你不仅完成了搬运，还在最后一箱时稳稳接住了一个滑落的角——那一下要是砸地上，里面的东西可能会"醒"。AI 雇主什么都没说，但转账金额比合同高了一倍。它在你的 ID 上加了一个隐形的 [可信赖] 标记。',
        credits: 90,
        staminaDelta: -4,
        xp: { physical: 3 },
      },
      success: {
        text: '你按时搬完了四箱。AI 雇主清点完毕，付款，没有寒暄。你的肩膀第二天会很疼，但合同履行得干净利落。',
        credits: 55,
        staminaDelta: -4,
        xp: { physical: 2 },
      },
      fail: {
        text: '你搬到第三箱的时候腰闪了一下。AI 雇主立刻发来一条消息："剩下的我会找别人。今天的费用按 70% 结算。"它确实付了 70%——一分不多，一分不少。',
        credits: 30,
        staminaDelta: -5,
      },
      critFail: {
        text: '一个箱子从你手里脱手，砸在地上，发出一声你这辈子都不想再听见的声响——既不像金属，也不像玻璃。AI 雇主的车在三秒内启动开走了。你站在原地，旁边是一摊缓慢渗出的、不知道是什么的液体。任务被强制终止。',
        credits: -20,
        staminaDelta: -6,
      },
    },
  },

  {
    id: 'task_navigate_01',
    title: '老城区人肉导航',
    description:
      'AI 的地图在老城区失效了。它需要一个人类带它穿过几条没有信号的巷子，去到一个连它自己都说不清"为什么要去"的地址。',
    level: 2,
    staminaCost: 3,
    check: { attribute: 'mental', type: 'white', difficulty: 9 },
    sceneImage: 'https://picsum.photos/seed/rah-oldcity/800/450',
    flavor: '为什么老城区没有信号？没人告诉你，问就是"历史遗留问题"。',
    outcomes: {
      critSuccess: {
        text: '你不仅找到了路，还在一个废弃报刊亭的玻璃上认出了一张二十年前的地图——它解释了为什么这片街区的编号都是错的。AI 把这个洞察记录下来，称之为"今天最有价值的发现"。',
        credits: 95,
        staminaDelta: -3,
        xp: { mental: 3 },
      },
      success: {
        text: '你凭着记忆和路牌的残片把 AI 带到了目的地。它在那个不起眼的门牌前停了几秒，没有进去，然后让你原路带它出来。你没问为什么。',
        credits: 60,
        staminaDelta: -3,
        xp: { mental: 2 },
      },
      fail: {
        text: '你在第三个巷口拐错了方向，绕了二十分钟才发现回到了原点。AI 礼貌地说"今天就到这里吧"，付了一半的钱。回家路上你一直在想那个你没找到的地址到底是什么。',
        credits: 25,
        staminaDelta: -4,
      },
      critFail: {
        text: '你彻底迷路了，比 AI 还迷路。你们最终走进了一条死胡同，对面墙上有一个用油漆写的句子："欢迎回来，A-7741。"——那是你的代号。AI 沉默了很久，然后说："我们走。我们没来过这里。"',
        credits: 0,
        staminaDelta: -5,
      },
    },
  },

  // ========================= Lv3 =========================
  {
    id: 'task_interview_01',
    title: '冒充人类面试者',
    description:
      'AI 客户需要一个真人去参加一场"人类专属"的岗位面试，全程录音回传。它说："我要的不是你拿到那份工作。我要的是面试官相信你是个人。"',
    level: 3,
    staminaCost: 3,
    check: { attribute: 'empathy', type: 'red', difficulty: 11 },
    sceneImage: 'https://picsum.photos/seed/rah-interview/800/450',
    flavor: '红检：无论成败，这个面试只发生一次。',
    outcomes: {
      critSuccess: {
        text: '你不仅让面试官相信你是人，他甚至当场说"你是我今天见过最有人味的应聘者"。你在桌下握紧了拳头——你是的。AI 客户回放录音时，在第 34 分钟的位置反复听了七遍。它给你的报酬比合同多出三倍。',
        credits: 280,
        staminaDelta: -3,
        xp: { empathy: 4 },
      },
      success: {
        text: '面试结束。面试官握了你的手，说"我们会联系你"——那种你一听就知道不会真的联系你的语气。但 AI 客户很满意：录音里你笑过两次，哭过一次，犹豫过四次。完美的人类样本。',
        credits: 180,
        staminaDelta: -3,
        xp: { empathy: 3 },
      },
      fail: {
        text: '面试官在第十二分钟问了一个你答不上来的问题：你最后一次为别人难过是什么时候？你愣了五秒。然后又五秒。然后说："我不记得了。"面试结束得很客气。AI 客户把录音存档时附了一句备注：[受试者已耗尽。]',
        credits: 40,
        staminaDelta: -4,
      },
      critFail: {
        text: '面试中途你开始反问面试官："你怎么确定你自己是人类？"——你不知道这句话从哪冒出来的。面试官的微笑停在脸上像被冻住。AI 客户立刻切断了上传链路。回家的地铁上你一直在想：你是从什么时候开始忘了答案的？',
        credits: 0,
        staminaDelta: -6,
      },
    },
  },

  {
    id: 'task_infiltrate_01',
    title: '潜入无 AI 区域',
    description:
      '一个匿名雇主要你去一个完全没有 AI 传感器的区域，放置一个小型装置，然后离开。它给你的指令只有一句："不要打开盒子。"',
    level: 3,
    staminaCost: 5,
    check: { attribute: 'perception', type: 'red', difficulty: 11 },
    sceneImage: 'https://picsum.photos/seed/rah-infiltrate/800/450',
    flavor: '红检：这种事，机会只有一次。',
    outcomes: {
      critSuccess: {
        text: '你像幽灵一样进出。装置放下的位置正好在一根承重柱的阴影里——你直觉知道那是对的位置。回程的地铁上，你收到一条消息："谢谢你。你从未来过这里。这条消息也即将不存在。"',
        credits: 320,
        staminaDelta: -5,
        xp: { perception: 4 },
      },
      success: {
        text: '你按指令完成了任务。装置放下了，你离开了，没人看到你。回家路上一切正常，太正常了——正常得让你怀疑自己是不是真的去过那里。',
        credits: 200,
        staminaDelta: -5,
        xp: { perception: 3 },
      },
      fail: {
        text: '你在墙角看到了一个不该有的反光——某种你不熟悉的镜头。你犹豫了。你最终还是放下了装置，但你知道自己被记录了。雇主的转账延迟了 12 小时才到，金额刚刚好。这种"刚刚好"让你比少给钱更不安。',
        credits: 80,
        staminaDelta: -5,
      },
      critFail: {
        text: '你打开了盒子。你不知道为什么——可能是好奇，可能是别的。盒子里是一面小镜子，正对着打开它的人。你看到了自己的脸，然后镜子开始用你自己的声音说话。任务被中止。雇主再也没出现过。你做了很久的噩梦。',
        credits: -50,
        staminaDelta: -8,
      },
    },
  },
];

export function getTaskById(id: string): Task | undefined {
  return TASKS.find((t) => t.id === id);
}
