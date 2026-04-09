import Phaser from 'phaser';

/**
 * 在 BootScene 里调用，用 Canvas 程序化生成所有像素风纹理。
 * 0 张外部图片 —— 全部是代码画的。
 */

// ── 工具 ──────────────────────────────────────────────
function ctx(scene: Phaser.Scene, key: string, w: number, h: number) {
  const canvas = scene.textures.createCanvas(key, w, h)!;
  const c = canvas.getContext();
  return { canvas, c, w, h };
}

function px(
  c: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
) {
  c.fillStyle = color;
  c.fillRect(x, y, size, size);
}

function rect(
  c: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string,
) {
  c.fillStyle = color;
  c.fillRect(x, y, w, h);
}

// ── 玩家精灵帧 (16x24 x 4帧) ─────────────────────────
export function generatePlayer(scene: Phaser.Scene) {
  const FRAME_W = 16;
  const FRAME_H = 24;
  const FRAMES = 4; // idle, walk1, walk2, walk3
  const { canvas, c } = ctx(scene, 'player', FRAME_W * FRAMES, FRAME_H);

  for (let f = 0; f < FRAMES; f++) {
    const ox = f * FRAME_W;
    // 身体（深灰连帽衫）
    rect(c, ox + 5, 8, 6, 10, '#2a2a3e');
    // 头
    rect(c, ox + 5, 2, 6, 6, '#d4a574');
    // 面罩/护目镜（赛博翡翠绿）
    rect(c, ox + 6, 4, 4, 2, '#10b981');
    // 帽兜
    rect(c, ox + 4, 1, 8, 3, '#1e1e30');
    rect(c, ox + 5, 0, 6, 2, '#1e1e30');
    // 手臂
    const armOffset = f === 1 ? -1 : f === 3 ? 1 : 0;
    rect(c, ox + 3, 9 + armOffset, 2, 7, '#2a2a3e');
    rect(c, ox + 11, 9 - armOffset, 2, 7, '#2a2a3e');
    // 腿
    const legSpread = f === 0 ? 0 : f === 2 ? 0 : 1;
    rect(c, ox + 5 - legSpread, 18, 3, 6, '#1a1a2e');
    rect(c, ox + 8 + legSpread, 18, 3, 6, '#1a1a2e');
    // 鞋
    rect(c, ox + 5 - legSpread, 23, 3, 1, '#444');
    rect(c, ox + 8 + legSpread, 23, 3, 1, '#444');
    // 绿色发光细节（胸口小灯）
    px(c, ox + 7, 10, 2, '#10b981');
  }
  canvas.refresh();

  // 注册帧
  scene.textures.get('player').add(0, 0, 0, 0, FRAME_W, FRAME_H);
  scene.textures.get('player').add(1, 0, FRAME_W, 0, FRAME_W, FRAME_H);
  scene.textures.get('player').add(2, 0, FRAME_W * 2, 0, FRAME_W, FRAME_H);
  scene.textures.get('player').add(3, 0, FRAME_W * 3, 0, FRAME_W, FRAME_H);
}

// ── 地面瓦片 ──────────────────────────────────────────
export function generateGround(scene: Phaser.Scene) {
  const { canvas, c } = ctx(scene, 'ground', 32, 32);
  rect(c, 0, 0, 32, 32, '#1a1a24');
  // 裂缝细节
  rect(c, 0, 0, 32, 2, '#252535');
  rect(c, 4, 8, 1, 12, '#111118');
  rect(c, 18, 4, 1, 16, '#111118');
  rect(c, 28, 10, 1, 8, '#111118');
  // 零星的绿色/青色像素（地面反光）
  px(c, 10, 14, 1, '#10b98120');
  px(c, 22, 20, 1, '#06b6d420');
  canvas.refresh();
}

// ── 天空渐变 ──────────────────────────────────────────
export function generateSky(scene: Phaser.Scene) {
  const W = 400;
  const H = 300;
  const { canvas, c } = ctx(scene, 'sky', W, H);
  const grad = c.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, '#05050f');
  grad.addColorStop(0.4, '#0a0a1a');
  grad.addColorStop(0.7, '#0f0f28');
  grad.addColorStop(1, '#141428');
  c.fillStyle = grad;
  c.fillRect(0, 0, W, H);
  // 星星
  for (let i = 0; i < 40; i++) {
    const sx = Math.random() * W;
    const sy = Math.random() * H * 0.6;
    const color = Math.random() > 0.7 ? '#ec489980' : Math.random() > 0.5 ? '#06b6d460' : '#ffffff50';
    px(c, sx, sy, 1, color);
  }
  // 月亮
  c.fillStyle = '#e2e8f030';
  c.beginPath();
  c.arc(320, 50, 18, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = '#e2e8f015';
  c.beginPath();
  c.arc(320, 50, 28, 0, Math.PI * 2);
  c.fill();
  canvas.refresh();
}

// ── 远景天际线 ──────────────────────────────────────────
export function generateFarSkyline(scene: Phaser.Scene) {
  const W = 600;
  const H = 200;
  const { canvas, c } = ctx(scene, 'far-skyline', W, H);

  // 大楼轮廓
  const buildings = [
    { x: 0, w: 40, h: 120 },
    { x: 50, w: 30, h: 80 },
    { x: 90, w: 50, h: 150 },
    { x: 150, w: 35, h: 100 },
    { x: 200, w: 60, h: 170 },
    { x: 270, w: 40, h: 90 },
    { x: 320, w: 55, h: 140 },
    { x: 385, w: 30, h: 110 },
    { x: 425, w: 50, h: 160 },
    { x: 490, w: 45, h: 100 },
    { x: 545, w: 55, h: 130 },
  ];

  for (const b of buildings) {
    const y = H - b.h;
    rect(c, b.x, y, b.w, b.h, '#0d0d1a');
    // 窗户
    for (let wy = y + 6; wy < H - 8; wy += 8) {
      for (let wx = b.x + 4; wx < b.x + b.w - 4; wx += 6) {
        if (Math.random() > 0.5) {
          const wc = Math.random() > 0.8 ? '#06b6d430' : Math.random() > 0.6 ? '#eab30820' : '#fbbf2415';
          px(c, wx, wy, 2, wc);
        }
      }
    }
  }
  canvas.refresh();
}

// ── 中景建筑 ──────────────────────────────────────────
export function generateMidSkyline(scene: Phaser.Scene) {
  const W = 800;
  const H = 200;
  const { canvas, c } = ctx(scene, 'mid-skyline', W, H);

  const buildings = [
    { x: 10, w: 60, h: 130 },
    { x: 80, w: 80, h: 100 },
    { x: 180, w: 50, h: 160 },
    { x: 250, w: 70, h: 110 },
    { x: 340, w: 90, h: 145 },
    { x: 450, w: 55, h: 120 },
    { x: 520, w: 75, h: 155 },
    { x: 610, w: 60, h: 90 },
    { x: 690, w: 80, h: 135 },
  ];

  for (const b of buildings) {
    const y = H - b.h;
    rect(c, b.x, y, b.w, b.h, '#121220');
    // 边框高光
    rect(c, b.x, y, 1, b.h, '#1a1a30');
    rect(c, b.x + b.w - 1, y, 1, b.h, '#0a0a15');
    // 窗户（更大更亮）
    for (let wy = y + 8; wy < H - 10; wy += 10) {
      for (let wx = b.x + 5; wx < b.x + b.w - 5; wx += 8) {
        if (Math.random() > 0.4) {
          const wc = Math.random() > 0.7 ? '#10b98130' : Math.random() > 0.5 ? '#ec489920' : '#fbbf2420';
          rect(c, wx, wy, 3, 3, wc);
        }
      }
    }
    // 偶尔的霓虹招牌
    if (Math.random() > 0.6) {
      const signColor = Math.random() > 0.5 ? '#ec489950' : '#06b6d450';
      rect(c, b.x + 5, y + 3, b.w - 10, 4, signColor);
    }
  }
  canvas.refresh();
}

// ── 可交互建筑 ────────────────────────────────────────

export function generateBuilding_Home(scene: Phaser.Scene) {
  const W = 100;
  const H = 100;
  const { canvas, c } = ctx(scene, 'building-home', W, H);

  // 主体
  rect(c, 10, 20, 80, 80, '#1a1a2e');
  rect(c, 10, 20, 80, 2, '#252540');
  // 防火梯
  rect(c, 8, 30, 2, 70, '#333350');
  rect(c, 5, 40, 8, 2, '#333350');
  rect(c, 5, 60, 8, 2, '#333350');
  rect(c, 5, 80, 8, 2, '#333350');
  // 窗户
  for (let wy = 30; wy < 90; wy += 18) {
    for (let wx = 20; wx < 80; wx += 20) {
      const lit = Math.random() > 0.4;
      rect(c, wx, wy, 8, 8, lit ? '#fbbf2430' : '#0a0a18');
      rect(c, wx, wy, 8, 1, '#252540');
    }
  }
  // 你的窗户（绿光）
  rect(c, 60, 30, 8, 8, '#10b98150');
  // 门
  rect(c, 40, 82, 16, 18, '#0f0f1e');
  rect(c, 40, 82, 16, 2, '#10b98140');
  // 门牌号
  px(c, 48, 86, 2, '#10b98180');
  canvas.refresh();
}

export function generateBuilding_RAH(scene: Phaser.Scene) {
  const W = 140;
  const H = 110;
  const { canvas, c } = ctx(scene, 'building-rah', W, H);

  // 主体
  rect(c, 5, 15, 130, 95, '#0f1a20');
  rect(c, 5, 15, 130, 3, '#10b98160');
  // 大霓虹招牌 "RAH"
  rect(c, 20, 22, 100, 20, '#0a1515');
  c.fillStyle = '#10b981';
  c.font = 'bold 14px monospace';
  c.fillText('R A H', 38, 38);
  // 副标题
  c.fillStyle = '#10b98160';
  c.font = '5px monospace';
  c.fillText('RENT-A-HUMAN', 38, 48);
  // 窗户（大落地窗）
  rect(c, 15, 50, 50, 30, '#10b98115');
  rect(c, 75, 50, 50, 30, '#10b98115');
  // 窗户反光条纹
  rect(c, 15, 50, 50, 1, '#10b98140');
  rect(c, 75, 50, 50, 1, '#10b98140');
  // 门
  rect(c, 55, 85, 30, 25, '#0a1515');
  rect(c, 55, 85, 30, 2, '#10b981');
  // 门口发光
  rect(c, 50, 108, 40, 2, '#10b98130');
  canvas.refresh();
}

export function generateBuilding_Food(scene: Phaser.Scene) {
  const W = 160;
  const H = 90;
  const { canvas, c } = ctx(scene, 'building-food', W, H);

  // 三个相连的小摊位
  const stalls = [
    { x: 5, w: 45, color: '#b91c1c30', awning: '#ef4444' },
    { x: 58, w: 45, color: '#b4530030', awning: '#f59e0b' },
    { x: 111, w: 45, color: '#0f766e30', awning: '#14b8a6' },
  ];

  for (const s of stalls) {
    // 遮阳棚
    rect(c, s.x, 20, s.w, 6, s.awning + '80');
    rect(c, s.x, 26, s.w, 2, s.awning + '40');
    // 摊位主体
    rect(c, s.x, 28, s.w, 62, '#1a1a2e');
    // 柜台
    rect(c, s.x, 60, s.w, 4, '#252540');
    // 灯光
    px(c, s.x + 20, 35, 3, s.awning + '60');
    // 窗口
    rect(c, s.x + 8, 35, 28, 20, '#0a0a18');
    rect(c, s.x + 8, 35, 28, 1, s.awning + '40');
  }
  // 地面反光
  rect(c, 0, 88, W, 2, '#10b98110');
  canvas.refresh();
}

export function generateBuilding_Alley(scene: Phaser.Scene) {
  const W = 80;
  const H = 110;
  const { canvas, c } = ctx(scene, 'building-alley', W, H);

  // 两侧建筑墙
  rect(c, 0, 0, 20, 110, '#0d0d1a');
  rect(c, 60, 0, 20, 110, '#0d0d1a');
  // 深处
  const grad = c.createLinearGradient(20, 0, 20, 110);
  grad.addColorStop(0, '#0a0008');
  grad.addColorStop(1, '#1a0010');
  c.fillStyle = grad;
  c.fillRect(20, 0, 40, 110);
  // 深处红光
  c.fillStyle = '#ef444420';
  c.beginPath();
  c.arc(40, 50, 20, 0, Math.PI * 2);
  c.fill();
  // 管道
  rect(c, 18, 20, 4, 90, '#252535');
  rect(c, 58, 10, 4, 100, '#252535');
  // 神秘符号
  px(c, 38, 40, 4, '#ef444440');
  px(c, 36, 44, 2, '#ef444430');
  px(c, 42, 44, 2, '#ef444430');
  // 地面水洼
  rect(c, 25, 100, 30, 4, '#10b98110');
  canvas.refresh();
}

// ── 雨滴粒子纹理 ────────────────────────────────────────
export function generateRaindrop(scene: Phaser.Scene) {
  const { canvas, c } = ctx(scene, 'raindrop', 2, 6);
  const grad = c.createLinearGradient(0, 0, 0, 6);
  grad.addColorStop(0, '#ffffff00');
  grad.addColorStop(1, '#ffffff40');
  c.fillStyle = grad;
  c.fillRect(0, 0, 2, 6);
  canvas.refresh();
}

// ── 交互提示箭头 ────────────────────────────────────────
export function generateArrow(scene: Phaser.Scene) {
  const { canvas, c } = ctx(scene, 'arrow', 12, 8);
  c.fillStyle = '#10b981';
  // 向下箭头
  rect(c, 4, 0, 4, 5, '#10b981');
  rect(c, 2, 4, 8, 2, '#10b981');
  rect(c, 4, 6, 4, 2, '#10b981');
  canvas.refresh();
}

// ── 一次性调用 ──────────────────────────────────────────
export function generateAllAssets(scene: Phaser.Scene) {
  generatePlayer(scene);
  generateGround(scene);
  generateSky(scene);
  generateFarSkyline(scene);
  generateMidSkyline(scene);
  generateBuilding_Home(scene);
  generateBuilding_RAH(scene);
  generateBuilding_Food(scene);
  generateBuilding_Alley(scene);
  generateRaindrop(scene);
  generateArrow(scene);
}
