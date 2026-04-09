import Phaser from 'phaser';
import { LOCATIONS, type LocationDef } from '../world/locations';
import { eventBus } from '../eventBus';

const WORLD_WIDTH = 2000;
const GROUND_Y = 260; // 地面 y（角色脚底）
const PLAYER_SCALE = 3;

export class CityScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keyA!: Phaser.Input.Keyboard.Key;
  private keyD!: Phaser.Input.Keyboard.Key;
  private keyE!: Phaser.Input.Keyboard.Key;
  private locked = false;
  private speed = 160;
  private playerVx = 0;

  // 交互区
  private zones: { def: LocationDef; zone: Phaser.GameObjects.Zone; label: Phaser.GameObjects.Text; arrow: Phaser.GameObjects.Image }[] = [];
  private nearZone: LocationDef | null = null;
  private promptText!: Phaser.GameObjects.Text;

  // 触控
  private touchDir: -1 | 0 | 1 = 0;

  constructor() {
    super({ key: 'CityScene' });
  }

  create() {
    const cam = this.cameras.main;
    const viewH = cam.height;

    // ── 天空（固定不动） ────────────────────
    this.add.image(0, 0, 'sky').setOrigin(0, 0).setScrollFactor(0).setDisplaySize(cam.width, viewH);

    // ── 远景天际线 ──────────────────────────
    const farSky = this.add.tileSprite(0, viewH - 200, cam.width, 200, 'far-skyline')
      .setOrigin(0, 0)
      .setScrollFactor(0);
    (this as any)._farSky = farSky;

    // ── 中景建筑 ────────────────────────────
    const midSky = this.add.tileSprite(0, viewH - 200, cam.width, 200, 'mid-skyline')
      .setOrigin(0, 0)
      .setScrollFactor(0);
    (this as any)._midSky = midSky;

    // ── 地面 ────────────────────────────────
    const groundTop = GROUND_Y + 4;
    for (let x = 0; x < WORLD_WIDTH; x += 32) {
      this.add.image(x, groundTop, 'ground').setOrigin(0, 0).setScale(1);
    }
    // 第二层地面
    for (let x = 0; x < WORLD_WIDTH; x += 32) {
      this.add.image(x, groundTop + 32, 'ground').setOrigin(0, 0).setScale(1).setAlpha(0.6);
    }

    // ── 可交互建筑 ──────────────────────────
    const buildingMap: Record<string, string> = {
      home: 'building-home',
      rah: 'building-rah',
      food: 'building-food',
      alley: 'building-alley',
    };

    for (const loc of LOCATIONS) {
      const texKey = buildingMap[loc.id];
      if (!texKey) continue;
      const tex = this.textures.get(texKey);
      const frame = tex.get(0);
      const bH = frame.height * 2;
      const bW = frame.width * 2;
      // 建筑底部紧贴地面
      this.add.image(loc.x, groundTop, texKey)
        .setOrigin(0.5, 1)
        .setScale(2);

      // 交互区（不可见）
      const zone = this.add.zone(loc.x, GROUND_Y - 10, loc.width, 40);

      // 浮动标签
      const label = this.add.text(loc.x, groundTop - bH - 8, loc.label, {
        fontFamily: 'monospace',
        fontSize: '10px',
        color: '#10b981',
        stroke: '#000',
        strokeThickness: 2,
      }).setOrigin(0.5, 1).setAlpha(0.7);

      // 箭头
      const arrow = this.add.image(loc.x, groundTop - bH + 4, 'arrow')
        .setScale(2)
        .setAlpha(0);

      this.zones.push({ def: loc, zone, label, arrow });
    }

    // ── 环境装饰 ─────────────────────────────
    this.addDecorations(groundTop);

    // ── 雨 ───────────────────────────────────
    this.addRain(viewH);

    // ── 玩家 ─────────────────────────────────
    this.player = this.add.sprite(200, GROUND_Y, 'player', 0)
      .setOrigin(0.5, 1)
      .setScale(PLAYER_SCALE);
    this.player.play('player-idle');

    // ── 相机 ─────────────────────────────────
    cam.setBounds(0, 0, WORLD_WIDTH, viewH);
    cam.startFollow(this.player, false, 0.1, 0, 0, viewH * 0.15);

    // ── 键盘 ─────────────────────────────────
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.keyA = this.input.keyboard!.addKey('A');
    this.keyD = this.input.keyboard!.addKey('D');
    this.keyE = this.input.keyboard!.addKey('E');

    // ── 交互提示文字 ─────────────────────────
    this.promptText = this.add.text(0, 0, '', {
      fontFamily: 'monospace',
      fontSize: '9px',
      color: '#10b981',
      backgroundColor: '#000000cc',
      padding: { x: 6, y: 3 },
    }).setOrigin(0.5, 1).setAlpha(0).setDepth(10);

    // ── 触控 ─────────────────────────────────
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
      // 检查是否点击了交互区域
      for (const z of this.zones) {
        const bounds = z.zone.getBounds();
        if (bounds.contains(p.worldX, p.worldY)) {
          this.enterLocation(z.def);
          return;
        }
      }
      // 否则是移动
      const midX = cam.width / 2;
      this.touchDir = p.x < midX ? -1 : 1;
    });
    this.input.on('pointerup', () => { this.touchDir = 0; });
    this.input.on('pointermove', (p: Phaser.Input.Pointer) => {
      if (!p.isDown) return;
      const midX = cam.width / 2;
      this.touchDir = p.x < midX ? -1 : 1;
    });

    // ── 事件总线监听 ─────────────────────────
    eventBus.on('close-overlay', () => {
      this.locked = false;
    });

    // ── 地面线发光 ────────────────────────────
    const glowLine = this.add.graphics();
    glowLine.lineStyle(1, 0x10b981, 0.15);
    glowLine.beginPath();
    glowLine.moveTo(0, groundTop);
    glowLine.lineTo(WORLD_WIDTH, groundTop);
    glowLine.strokePath();
  }

  update(_time: number, _delta: number) {
    if (this.locked) {
      this.player.play('player-idle', true);
      return;
    }

    // 输入
    const left = this.cursors.left.isDown || this.keyA.isDown || this.touchDir === -1;
    const right = this.cursors.right.isDown || this.keyD.isDown || this.touchDir === 1;

    if (left) {
      this.playerVx = -this.speed;
      this.player.setFlipX(true);
      this.player.play('player-walk', true);
    } else if (right) {
      this.playerVx = this.speed;
      this.player.setFlipX(false);
      this.player.play('player-walk', true);
    } else {
      this.playerVx = 0;
      this.player.play('player-idle', true);
    }

    // 移动
    const dt = _delta / 1000;
    this.player.x = Phaser.Math.Clamp(
      this.player.x + this.playerVx * dt,
      30,
      WORLD_WIDTH - 30,
    );

    // 视差
    const scrollX = this.cameras.main.scrollX;
    if ((this as any)._farSky) (this as any)._farSky.tilePositionX = scrollX * 0.15;
    if ((this as any)._midSky) (this as any)._midSky.tilePositionX = scrollX * 0.4;

    // 交互检测
    this.nearZone = null;
    for (const z of this.zones) {
      const dist = Math.abs(this.player.x - z.def.x);
      const inRange = dist < z.def.width / 2;
      z.arrow.setAlpha(inRange ? 0.8 : 0);

      if (inRange) {
        this.nearZone = z.def;
      }
    }

    // 提示文字
    if (this.nearZone) {
      this.promptText.setPosition(this.nearZone.x, GROUND_Y - PLAYER_SCALE * 24 - 16);
      this.promptText.setText(`[E] 进入 ${this.nearZone.label}`);
      this.promptText.setAlpha(1);
    } else {
      this.promptText.setAlpha(0);
    }

    // E 键交互
    if (Phaser.Input.Keyboard.JustDown(this.keyE) && this.nearZone) {
      this.enterLocation(this.nearZone);
    }
  }

  private enterLocation(loc: LocationDef) {
    this.locked = true;
    this.player.play('player-idle', true);
    eventBus.emit('enter-location', loc.id);
  }

  // ── 环境装饰 ──────────────────────────────
  private addDecorations(groundTop: number) {
    // 路灯
    const lampPositions = [100, 450, 950, 1450, 1900];
    for (const lx of lampPositions) {
      // 灯柱
      const g = this.add.graphics();
      g.fillStyle(0x333350, 1);
      g.fillRect(lx, groundTop - 60, 3, 60);
      // 灯头
      g.fillStyle(0xfbbf24, 0.6);
      g.fillRect(lx - 4, groundTop - 64, 11, 4);
      // 光晕
      g.fillStyle(0xfbbf24, 0.05);
      g.fillCircle(lx + 1, groundTop - 50, 30);
    }

    // 零散的霓虹涂鸦
    const graffiti = [
      { x: 380, text: 'HUMANS 4 RENT', color: '#ec4899' },
      { x: 1550, text: 'NO SIGNAL', color: '#ef4444' },
    ];
    for (const g of graffiti) {
      this.add.text(g.x, groundTop - 16, g.text, {
        fontFamily: 'monospace',
        fontSize: '7px',
        color: g.color + '60',
      });
    }
  }

  // ── 雨粒子 ──────────────────────────────
  private addRain(viewH: number) {
    const rainEmitter = this.add.particles(0, -10, 'raindrop', {
      x: { min: 0, max: WORLD_WIDTH },
      y: -10,
      lifespan: 1500,
      speedY: { min: 120, max: 200 },
      speedX: { min: -15, max: -5 },
      scale: { start: 1, end: 0.5 },
      alpha: { start: 0.3, end: 0 },
      frequency: 20,
      quantity: 2,
      blendMode: 'ADD',
    });
    rainEmitter.setScrollFactor(0.8, 1);
  }
}
