import Phaser from 'phaser'

export default class ChickenCoop extends Phaser.GameObjects.Container {

  constructor(scene, x, y, imageKey) {
    super(scene, x, y)

    this._level = 100;



    this.coopImage = scene.add.image(0, 0, imageKey);
    this.add(this.coopImage)
    // this.physics.add.existing(this.coopImage)

    this.bar = scene.add.graphics();
    this.bar.fillStyle('green', 1);
    this.bar.fillRect(0, 0, 200, 50);
    this.bar.x = 0;
    this.bar.y = 0;
    this.add(this.bar)
    
  }

  setValue(percentage) {
    //scale the this.bar
    this.bar.scaleX = percentage/100;
  }
}