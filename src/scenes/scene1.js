var player;
var moveSpeed = 200;
var cursors;
var platforms;
var suns;
var panels;
var panelList = [
  { x: 600, y: 400 },
  { x: 200, y: 300 }
];
var panelSunCollision;

import ChickenCoop from '../components/chickencoop.js'

export default class Scene1 extends Phaser.Scene {
  constructor () {
    super('Scene1');
  }

  init(data)
	{
		this.activeGame = data.activeGame
	}

  preload() {
    this.load.image('background', require('../assets/background.png'));
    this.load.image('ground', require('../assets/platform.png'));
    this.load.image('sun', require('../assets/diamond.png'));
    this.load.spritesheet('character', require('../assets/sprites/dude.png'), { frameWidth: 32, frameHeight: 48 });
    this.load.spritesheet('solar', require('../assets/sprites/solar.png'), { frameWidth: 400, frameHeight: 32 });
    this.load.image('overlap', require('../assets/sprites/overlap.png'));

    this.load.image('dpad', require('../assets/dpad.png'));
    this.load.image("hidden-dpad", require('../assets/hidden-dpad.png'));
    this.load.image("action", require('../assets/action.png'));

    this.spaceBar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys(
      {up:Phaser.Input.Keyboard.KeyCodes.W,
      down:Phaser.Input.Keyboard.KeyCodes.S,
      left:Phaser.Input.Keyboard.KeyCodes.A,
      right:Phaser.Input.Keyboard.KeyCodes.D});
  }

  create() {
    this.createField();
    this.createPlayer();
    this.createPanels();
    this.createSuns();
    this.createOverlapCollider();
    this.createGamepad();

    this.testCoop();
  }

  testCoop() {
    this.coops = this.physics.add.staticGroup();

    const coop = new ChickenCoop(this, 500, 500, 'ground');
    // this.add.existing(coop);

    this.coops.add(coop)
    this.physics.add.collider(this.player, this.coops, (player, coop) => {
      coop._level =  coop._level - 10;
      coop.setValue(coop._level)
      console.log(coop._level)
    }, null, this);

    this.text = this.add.text(320, 300, 'asdasd').setAlign('center').setOrigin(0.5, 0);
    this.text.setInteractive();
    this.text.on('pointerdown', () => {
      this.scene.pause();
    });
  }

  createField() {
    this.physics.world.bounds.y = 200;
    let bg = this.add.sprite(0, 0, 'background');
    bg.setOrigin(0, 0);
  }

  createPlayer() {
    this.player = this.physics.add.sprite(400, 300, 'character');
    this.player.setCollideWorldBounds(true);
    this.player.setDrag(2000);

    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('character', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'turn',
        frames: [ { key: 'character', frame: 4 } ],
        frameRate: 20
    });

    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('character', { start: 5, end: 8 }),
        frameRate: 10,
        repeat: -1
    });
  }

  createPanels() {
    this.panels = this.physics.add.staticGroup();
    this.panelsOverlap = this.physics.add.staticGroup();

    for (let i = 0; i < panelList.length; i++) {
      let elem = panelList[i];
      let parent = this.panels.create(elem.x, elem.y, 'solar').setScale(0.8).refreshBody();
      let child = this.panelsOverlap.create(elem.x, elem.y, 'overlap').setSize(parent.displayWidth + 30, parent.displayHeight + 30);
      child.setScale(0.8);
    }

    this.panels.children.iterate(function (child) {
      child._isOn = false
      child._countDown = null
    });

    this.anims.create({
      key: 'turnOn',
      frames: this.anims.generateFrameNumbers('solar', { start: 0, end: 1 }),
      frameRate: 10,
      repeat: -1
    });

    this.anims.create({
      key: 'turnOff',
      frames: [ { key: 'solar', frame: 0 } ],
      frameRate: 20
    });
  }

  createSuns() {
    this.suns = this.physics.add.group({
      key: 'character',
      repeat: 1,
      setXY: { x: 12, y: 0, stepX: 70 }
    });
    
    this.suns.children.iterate(function (child) {
        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
        child.setGravityY(10);
        child.setCollideWorldBounds(true);
        child.anims.play('left', true);
    });
  }

  createOverlapCollider() {
    this.physics.add.collider(this.player, this.panels);
    this.physics.add.overlap(this.player, this.panelsOverlap, this.turnOn, null, this);

    this.physics.add.overlap(this.suns, this.panelsOverlap, this.validateSunDrop, null, this);
    panelSunCollision = this.physics.add.collider(this.suns, this.panels, this.sunDrop, null, this);
  }

  createGamepad() {
    this.dpad = this.add.image(150, 480, 'dpad');
    this.dpad.setScale(0.4);
    this.dpad.alpha = .5;

    this.upDpad = this.add.image(this.dpad.x, (this.dpad.y + 20) - this.dpad.displayHeight / 2, "hidden-dpad");
    this.upDpad.setScale(0.5);
    this.upDpad.alpha = .01;
    this.upDpad.setInteractive()
      .on('pointerdown', () => { this.isUpPad = true })
      .on('pointerover', () => { this.isUpPad = true })
      .on('pointerup', () => { this.isUpPad = false })
      .on('pointerout', () => { this.isUpPad = false });
    
    this.downDpad = this.add.image(this.dpad.x, (this.dpad.y - 20) + this.dpad.displayHeight / 2, "hidden-dpad");
    this.downDpad.setScale(0.5);
    this.downDpad.alpha = .01;
    this.downDpad.setInteractive()
      .on('pointerdown', () => { this.isDownPad = true })
      .on('pointerover', () => { this.isDownPad = true })
      .on('pointerup', () => { this.isDownPad = false })
      .on('pointerout', () => { this.isDownPad = false });

    this.leftDpad = this.add.image((this.dpad.x + 20) - this.dpad.displayWidth / 2, this.dpad.y, "hidden-dpad");
    this.leftDpad.setScale(0.5);
    this.leftDpad.alpha = .01;
    this.leftDpad.setInteractive()
      .on('pointerdown', () => { this.isLeftPad = true })
      .on('pointerover', () => { this.isLeftPad = true })
      .on('pointerup', () => { this.isLeftPad = false })
      .on('pointerout', () => { this.isLeftPad = false });
    
    this.rightDpad = this.add.image((this.dpad.x - 20) + this.dpad.displayWidth / 2, this.dpad.y, "hidden-dpad");
    this.rightDpad.setScale(0.5);
    this.rightDpad.alpha = .01;
    this.rightDpad.setInteractive()
      .on('pointerdown', () => { this.isRightPad = true })
      .on('pointerover', () => { this.isRightPad = true })
      .on('pointerup', () => { this.isRightPad = false })
      .on('pointerout', () => { this.isRightPad = false });

    this.actionPad = this.add.image(700, 480, 'action');
    this.actionPad.setScale(0.2);
    this.actionPad.alpha = .5;
    this.actionPad.setInteractive()
      .on('pointerdown', () => { this.isActionPad = true })
      .on('pointerup', () => { this.isActionPad = false })
      .on('pointerout', () => { this.isActionPad = false });

    this.pauseButton = this.add.image(700, 0, 'action');
    this.pauseButton.setScale(0.1);
    this.pauseButton.setInteractive()
      .on('pointerdown', () => { this.scene.launch('PauseScene') });
  }

  turnOn(player, panel) {
    if (this.spaceBar.isDown || this.isActionPad) {
      panel._isOn = true
      panel.anims.play('turnOn', true);
      if (panel._countDown) clearInterval(panel._countDown);

      panel._countDown = setTimeout(() => {
        panel._isOn = false
        panel.anims.play('turnOff', true);
      }, 3000);
    }
  }

  validateSunDrop(sun, panel) {
    if (panel._isOn) {
      panelSunCollision.active = true;
    } else {
      panelSunCollision.active = false;
    }
  }

  sunDrop(sun, panel) {
    sun.anims.play('right', true);
    sun.disableBody(true, true);
  }

  update() {
    this.updateGamepad();
    this.updatePlayerMovement();
  }

  updateGamepad() {
    if (this.sys.game.device.os.desktop){
      this.dpad.visible = false;
      this.upDpad.visible = false;
      this.downDpad.visible = false;
      this.leftDpad.visible = false;
      this.rightDpad.visible = false;
      this.actionPad.visible = false;
    }
    else{
      this.dpad.visible = true;
      this.upDpad.visible = true;
      this.downDpad.visible = true;
      this.leftDpad.visible = true;
      this.rightDpad.visible = true;
      this.actionPad.visible = true;
    }
  }

  updatePlayerMovement() {
    if (this.cursors.right.isDown || this.wasd.right.isDown || this.isRightPad) {
      this.player.setVelocityX(moveSpeed);
      this.player.anims.play('right', true);
    } else if (this.cursors.left.isDown || this.wasd.left.isDown || this.isLeftPad) {
      this.player.setVelocityX(-moveSpeed);
      this.player.anims.play('left', true);
    } else if (this.cursors.down.isDown || this.wasd.down.isDown || this.isDownPad) {
      this.player.setVelocityY(moveSpeed);
    } else if (this.cursors.up.isDown || this.wasd.up.isDown || this.isUpPad) {
      this.player.setVelocityY(-moveSpeed);
    } else {
      this.player.anims.play('turn');
    }
  }
}