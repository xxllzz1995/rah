import Phaser from 'phaser';
import { generateAllAssets } from '../world/generateAssets';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  create() {
    generateAllAssets(this);

    // 注册动画
    this.anims.create({
      key: 'player-idle',
      frames: [{ key: 'player', frame: 0 }],
      frameRate: 1,
      repeat: -1,
    });

    this.anims.create({
      key: 'player-walk',
      frames: [
        { key: 'player', frame: 1 },
        { key: 'player', frame: 0 },
        { key: 'player', frame: 2 },
        { key: 'player', frame: 0 },
      ],
      frameRate: 8,
      repeat: -1,
    });

    this.scene.start('CityScene');
  }
}
