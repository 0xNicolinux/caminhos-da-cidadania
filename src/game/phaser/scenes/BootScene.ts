import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    // Configs
  }

  create() {
    this.scene.start('PreloadScene');
  }
}
