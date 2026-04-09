import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { CityScene } from './scenes/CityScene';

export function createGameConfig(parent: HTMLElement): Phaser.Types.Core.GameConfig {
  return {
    type: Phaser.AUTO,
    parent,
    pixelArt: true,
    backgroundColor: '#05050f',
    scale: {
      mode: Phaser.Scale.RESIZE,
      width: '100%',
      height: '100%',
    },
    scene: [BootScene, CityScene],
    // 不使用 arcade physics —— 平面横版不需要重力
    // 玩家 y 固定在地面线上
    input: {
      keyboard: true,
      touch: true,
    },
  };
}
