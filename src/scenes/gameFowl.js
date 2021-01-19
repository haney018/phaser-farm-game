var gameData;
var player;
var playerBar;
var playerData = {
  playerName: '',
  isInteracting: false,
  value: 0,
  interactTimer: null,
  interactType: null,
  interactZone: null
};
var processTime = 1000;
var progressTime = 2500;
var moveSpeed = 400;
var pauseButton;
var countDown;
var timeLimitSec = 121;
var timer;
var coopListData;
var collider_p2c = true;
var collider_p2f = true;

export default class GameFowl extends Phaser.Scene {
  constructor () {
    super('GameFowl'); 
  }

  init(data) {
    this.restartData();
    gameData = data
    playerData.playerName = gameData.player ? gameData.player : 'eggsplain'
  }

  restartData() {
    gameData = null;
    player = null;
    playerBar = null
    playerData = {
      playerName: '',
      isInteracting: false,
      value: 0,
      interactTimer: null,
      interactType: null
    };
    moveSpeed = 400;
    pauseButton;
    countDown;
    timeLimitSec = 121;
    timer;
    coopListData = [
      { x: 580, y: 30, value: 0, selected: false, bar: null },
      { x: 930, y: 30, value: 0, selected: false, bar: null },
    
      { x: 130, y: 350, value: 0, selected: false, bar: null },
      { x: 480, y: 350, value: 0, selected: false, bar: null },
      { x: 1050, y: 350, value: 0, selected: false, bar: null },
      { x: 1400, y: 350, value: 0, selected: false, bar: null },
    
      { x: 130, y: 650, value: 0, selected: false, bar: null },
      { x: 480, y: 650, value: 0, selected: false, bar: null },
      { x: 1050, y: 650, value: 0, selected: false, bar: null },
      { x: 1400, y: 650, value: 0, selected: false, bar: null }
    ];
    collider_p2c = true;
    collider_p2f = true;
  }

  preload() {
    this.load.image('world', require('../assets/fowl-fertilizer/fowlbackground.png'));
    this.load.image('world-end-top', require('../assets/fowl-fertilizer/fowlbg_cutout.png'));
    this.load.image('world-end-side', require('../assets/fowl-fertilizer/fowlhaystacks.png'));

    this.load.spritesheet('coop', require('../assets/fowl-fertilizer/coop1_ss_complete.png'), { frameWidth: 400, frameHeight: 290 });

    this.load.spritesheet('eggsplain', require('../assets/eggsplain_ss.png'), { frameWidth: 300.75, frameHeight: 341 });
    this.load.spritesheet('eggsplore', require('../assets/eggsplore_ss.png'), { frameWidth: 300.75, frameHeight: 341 });

    this.load.image('fertilizer', require('../assets/fowl-fertilizer/fowlfertlisers.png'));

    this.load.image('overlap', require('../assets/sprites/overlap.png'));

    this.load.image('dpad', require('../assets/dpad.png'));
    this.load.image("hidden-dpad", require('../assets/hidden-dpad.png'));
    this.load.image("action", require('../assets/action.png'));

    this.load.image("pauseButton", require('../assets/btn_pause.png'));
    this.load.image("timerBlob", require('../assets/gen_timerblob.png'));

    this.spaceBar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.spaceBar.on('down', () => { 
      this.spaceBarDown = true 
    });
    this.spaceBar.on('up', () => { 
      this.spaceBarDown = false 
      collider_p2c = true
      collider_p2f = true
    });
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys(
      {up:Phaser.Input.Keyboard.KeyCodes.W,
      down:Phaser.Input.Keyboard.KeyCodes.S,
      left:Phaser.Input.Keyboard.KeyCodes.A,
      right:Phaser.Input.Keyboard.KeyCodes.D});
  }

  create() {
    this.createField();
    this.createInteractableObjects();
    this.createPlayer();
    
    this.createColliders();
    this.createMenuTimer();
    this.createGamepad();
    
    this.createTimers();
    // this.scene.pause();
    // this.scene.launch('StartScene', { gameId: 'fowl' });
  }

  createField() {
    let world = this.add.image(0, 0, 'world');
    world.setOrigin(0, 0);

    let worldTop = this.add.image(0, 0, 'world-end-top');
    worldTop.setOrigin(0, 0);

    let worldLeft = this.add.image(10, 930, 'world-end-side');
    worldLeft.setOrigin(0, 0);
    worldLeft.setDepth(3);

    let worldRight = this.add.image(1360, 930, 'world-end-side');
    worldRight.setOrigin(0, 0);
    worldRight.setDepth(3);
    
    this.worldEnd = this.physics.add.staticGroup();
    this.worldEnd.add(worldTop);
    this.worldEnd.add(worldLeft);
    this.worldEnd.add(worldRight);
    
    worldLeft.body.setOffset(0, 90);
    worldRight.body.setOffset(0, 90);
  }

  createInteractableObjects() {
    this.createCoops();
    this.createFertilizer();
  }

  createCoops() {
    this.coops = this.physics.add.staticGroup();
    this.zIndexOverlaps = this.physics.add.group();
    this.interactOverlaps = this.physics.add.group();
     
    for (let i = 0; i < coopListData.length; i++) {
      let obj = coopListData[i];

      let coopImage = this.add.sprite(obj.x, obj.y, 'coop');
      coopImage.setOrigin(0, 0);
      coopImage._dataIndex = i
      this.coops.add(coopImage)

      coopImage.body.setSize(coopImage.displayWidth - 90, 10);
      coopImage.body.setOffset(45, 100);

      let zIndex = this.add.zone(obj.x + 30, obj.y + 30).setSize(coopImage.displayWidth - 60, 50);
      this.physics.world.enable(zIndex);
      zIndex.body.setAllowGravity(false);
      zIndex.body.moves = false;
      zIndex.body.debugBodyColor = 0x00ffff
      zIndex.setOrigin(0);
      zIndex._dataIndex = i
      this.zIndexOverlaps.add(zIndex)

      let interact = this.add.zone(obj.x + 50, obj.y + 150).setSize(coopImage.displayWidth - 100, 50);
      this.physics.world.enable(interact);
      interact.body.setAllowGravity(false);
      interact.body.moves = false;
      interact.body.debugBodyColor = 0x00ffff
      interact.setOrigin(0);
      interact._dataIndex = i
      this.interactOverlaps.add(interact)

      coopListData[i].bar = new Phaser.GameObjects.Graphics(this)
    }

    this.anims.create({
      key: 'coop-normal',
      frames: this.anims.generateFrameNumbers('coop', { start: 20, end: 29 }),
      frameRate: 20,
      repeat: -1
    });

    this.anims.create({
      key: 'coop-normal-select',
      frames: this.anims.generateFrameNumbers('coop', { start: 30, end: 39 }),
      frameRate: 20,
      repeat: -1
    });

    this.anims.create({
      key: 'coop-angry',
      frames: this.anims.generateFrameNumbers('coop', { start: 0, end: 9 }),
      frameRate: 40,
      repeat: -1
    });

    this.anims.create({
      key: 'coop-angry-select',
      frames: this.anims.generateFrameNumbers('coop', { start: 10, end: 19 }),
      frameRate: 40,
      repeat: -1
    });
  }

  createFertilizer() {
    this.fertCollider = this.physics.add.staticGroup();
    this.fertOverlap = this.physics.add.staticGroup();

    let binImage = this.add.image(590, 960, 'fertilizer');
    binImage.setOrigin(0, 0);
    this.fertCollider.add(binImage)
    binImage.body.setSize(binImage.displayWidth, 20);
    binImage.body.setOffset(0, 80);
    binImage.setDepth(2);

    let overlap = this.add.image(590, 960, 'overlap');
    overlap.setOrigin(0, 0);
    this.fertOverlap.add(overlap)

    overlap.setDisplaySize(binImage.displayWidth, 50);
    overlap.body.setSize(binImage.displayWidth, 50);
    overlap.body.setOffset(0, 0);
  }

  createPlayer() {
    player = this.physics.add.sprite(400, 300, playerData.playerName);
    player.setScale(0.5);
    player.setDepth(1);
    player.setCollideWorldBounds(true);
    player.setDrag(2000);
    player.setActive(true);
    player.body.setSize(250, 300);
    playerBar = new Phaser.GameObjects.Graphics(this);

    playerData.interactZone = this.add.zone(player.x, player.y).setSize(10, 100);
    this.physics.world.enable(playerData.interactZone);
    playerData.interactZone.body.setAllowGravity(false);
    playerData.interactZone.body.debugBodyColor = 0x00ffff
    playerData.interactZone.setOrigin(0);

    this.anims.create({
      key: 'turn',
      frames: [ { key: playerData.playerName, frame: 20 } ],
      frameRate: 20
    });

    this.anims.create({
      key: 'turn-bucket',
      frames: [ { key: playerData.playerName, frame: 4 } ],
      frameRate: 20
    });

    this.anims.create({
      key: 'interact-coop',
      frames: [ { key: playerData.playerName, frame: 16 } ],
      frameRate: 20
    });

    this.anims.create({
      key: 'interact-fert',
      frames: [ { key: playerData.playerName, frame: 4 } ],
      frameRate: 20
    });

    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers(playerData.playerName, { start: 24, end: 27 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
      key: 'left-bucket',
      frames: this.anims.generateFrameNumbers(playerData.playerName, { start: 8, end: 11 }),
      frameRate: 10,
      repeat: -1
    });

    this.anims.create({
      key: 'right',
      frames: this.anims.generateFrameNumbers(playerData.playerName, { start: 28, end: 31 }),
      frameRate: 10,
      repeat: -1
    });

    this.anims.create({
      key: 'right-bucket',
      frames: this.anims.generateFrameNumbers(playerData.playerName, { start: 12, end: 15 }),
      frameRate: 10,
      repeat: -1
    });    

    this.anims.create({
      key: 'up',
      frames: this.anims.generateFrameNumbers(playerData.playerName, { start: 16, end: 19   }),
      frameRate: 10,
      repeat: -1
    });

    this.anims.create({
      key: 'up-bucket',
      frames: this.anims.generateFrameNumbers(playerData.playerName, { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1
    });

    this.anims.create({
      key: 'down',
      frames: this.anims.generateFrameNumbers(playerData.playerName, { start: 20, end: 23 }),
      frameRate: 10,
      repeat: -1
    });

    this.anims.create({
      key: 'down-bucket',
      frames: this.anims.generateFrameNumbers(playerData.playerName, { start: 4, end: 7 }),
      frameRate: 10,
      repeat: -1
    });

    
  }

  drawCoopBar(x, y, value) {
    let container = this.add.graphics();
    container.fillRect(0, 0, 200, 50);
    container.x = x;
    container.y = y;
    container.scaleX = value / 100;
    container.setDepth(3);
    if (value < 90 && value > 40) {
      container.fillStyle(0xe74c3c, 1);
    } else if (value <= 40) {
      container.fillStyle(0xe74c3c, 1);
    } else {
      container.fillStyle(0xe74c3c, 1);
    }
    return container;
  }

  drawBar(x, y, value, isContainer) {
    let graphics = this.add.graphics();
    let w = isContainer ? 110 : 100
    let h = isContainer ? 30 : 20

    graphics.fillRect(0, 0, w, h);
    graphics.x = isContainer ? x -5 : x;
    graphics.y = isContainer ? y -5 : y;
    graphics.scaleX = value / 100;
    graphics.setDepth(3);

    if (isContainer) {
      graphics.fillStyle(0x00FF00, 1);
    } else {
      if (value < 90 && value > 40) {
        graphics.fillStyle(0x00FF00, 1);
      } else if (value <= 40) {
        graphics.fillStyle(0x00FF00, 1);
      } else {
        graphics.fillStyle(0x00FF00, 1);
      }
    }
    return graphics;
  }

  createColliders() {
    this.physics.add.collider(player, this.worldEnd);

    this.physics.add.collider(player, this.coops);
    
    this.physics.add.overlap(playerData.interactZone, this.interactOverlaps, this.interactOne, () => {
      return collider_p2c;
    }, this);
    this.physics.add.overlap(player, this.zIndexOverlaps);

    this.physics.add.collider(player, this.fertCollider);
    this.physics.add.overlap(player, this.fertOverlap, this.interactTwo, () => {
      return collider_p2f;
    }, this);
  }

  createMenuTimer() {
    pauseButton = this.add.image(120, 80, 'pauseButton');
    pauseButton.setInteractive( { useHandCursor: true  } );

    pauseButton.on('pointerover', () => {
      this.tweens.add({
        targets: pauseButton,
        scale: { value: 1.1, duration: 100, ease: 'Power1' },
      });
    })


    pauseButton.on('pointerout', () => {
      this.tweens.add({
        targets: pauseButton,
        scale: { value: 1, duration: 100, ease: 'Power1' },
      });
    })

    pauseButton.on('pointerdown', () => {
      this.tweens.add({
        targets: pauseButton,
        scale: { value: 0.9, duration: 100, ease: 'Power1' },
        onComplete: () => {
          this.scene.launch('PauseScene', gameData);
          this.scene.pause();
        }
      });
    })

    let blob = this.add.image(1690, 120, 'timerBlob');
    blob.setDepth(4);

    countDown = this.add.text(1540, 60, '00:00');
    countDown.setDepth(4)
    countDown.setOrigin(0, 0);
    countDown.setFontFamily('Toriga');
    countDown.setFontSize(110);
    countDown.setAlign('center');

    timer = this.time.addEvent({
      delay: 1000,                // ms
      callback: () => { this.updateCounter() },
      loop: true
    });
  }

  updateCounter() {
    timeLimitSec = timeLimitSec - 1
    
    let sec_num = parseInt(timeLimitSec, 10); // don't forget the second param
    let hours   = Math.floor(sec_num / 3600);
    let minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    let seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}

    countDown.setText(minutes+':'+seconds);
    if (timeLimitSec === 0) {
      this.scene.launch('WinnerScene', gameData);
      this.scene.pause();
    }
  }


  createGamepad() {
    this.dpad = this.add.image(250, 850, 'dpad');
    this.dpad.setDepth(4);
    this.dpad.setScale(0.7);
    this.dpad.alpha = .5;

    this.upDpad = this.add.image(this.dpad.x, (this.dpad.y + 50) - this.dpad.displayHeight / 2, "hidden-dpad");
    this.upDpad.setScale(0.8);
    this.upDpad.alpha = .01;
    this.upDpad.setInteractive()
      .on('pointerdown', () => { this.isUpPad = true })
      .on('pointerover', () => { this.isUpPad = true })
      .on('pointerup', () => { this.isUpPad = false })
      .on('pointerout', () => { this.isUpPad = false });
    
    this.downDpad = this.add.image(this.dpad.x, (this.dpad.y - 50) + this.dpad.displayHeight / 2, "hidden-dpad");
    this.downDpad.setScale(0.8);
    this.downDpad.alpha = .01;
    this.downDpad.setInteractive()
      .on('pointerdown', () => { this.isDownPad = true })
      .on('pointerover', () => { this.isDownPad = true })
      .on('pointerup', () => { this.isDownPad = false })
      .on('pointerout', () => { this.isDownPad = false });

    this.leftDpad = this.add.image((this.dpad.x + 40) - this.dpad.displayWidth / 2, this.dpad.y, "hidden-dpad");
    this.leftDpad.setScale(0.8);
    this.leftDpad.alpha = .01;
    this.leftDpad.setInteractive()
      .on('pointerdown', () => { this.isLeftPad = true })
      .on('pointerover', () => { this.isLeftPad = true })
      .on('pointerup', () => { this.isLeftPad = false })
      .on('pointerout', () => { this.isLeftPad = false });
    
    this.rightDpad = this.add.image((this.dpad.x - 40) + this.dpad.displayWidth / 2, this.dpad.y, "hidden-dpad");
    this.rightDpad.setScale(0.8);
    this.rightDpad.alpha = .01;
    this.rightDpad.setInteractive()
      .on('pointerdown', () => { this.isRightPad = true })
      .on('pointerover', () => { this.isRightPad = true })
      .on('pointerup', () => { this.isRightPad = false })
      .on('pointerout', () => { this.isRightPad = false });

    this.actionGroup = this.physics.add.staticGroup();

    this.actionPad = this.add.image(1750, 870, 'action');
    this.actionPad.setScale(0.3);
    this.actionPad.setDepth(4);
    this.actionPad.setInteractive()
      .on('pointerdown', () => { 
        this.isActionPad = true
      })
      .on('pointerup', () => { 
        this.isActionPad = false
        collider_p2c = true
        collider_p2f = true
      })
      .on('pointerout', () => { 
        this.isActionPad = false
        collider_p2c = true
        collider_p2f = true
      });
    this.actionGroup.add(this.actionPad)

    this.actionLabel = this.add.text(1640, 840, 'Collect', {
      wordWrap: { width: 220, useAdvancedWrap: true }
    });
    this.actionLabel.setFontFamily('Toriga');
    this.actionLabel.setFontSize(55);
    this.actionLabel.setAlign('center');
    this.actionLabel.setDepth(5);
    // this.actionLabel.setColor('#00a0e0');
    this.actionGroup.add(this.actionLabel)

    this.actionGroup.setAlpha(0.2);
  }

  interactOne(player, coop) {
    let timer;
    let intervalTime = 500
    let index = coop._dataIndex

    this.activeIndex = index
    if (this.spaceBarDown || this.isActionPad) {
      if (collider_p2c) {
        collider_p2c = false

        let currentValue = coopListData[index].value
        if (currentValue >= 2 && playerData.value === 0) {
          let sec = 0
          let deduction = coopListData[index].value / (processTime / intervalTime);
          playerData.isInteracting = true;
          playerData.interactType = 'p2c';

          timer = setInterval(() => {
            sec = sec + intervalTime
            coopListData[index].value = coopListData[index].value - deduction
            playerData.value = playerData.value + ((100 * intervalTime) / processTime);
            if (sec > processTime) {
              playerData.isInteracting = false;
              playerData.interactType = null;
              coopListData[index].value = 5;
              playerData.value = 100;
              clearInterval(timer)
            }
          }, intervalTime);
        }
      }
    }
  }

  interactTwo(player, fert) {
    let timer;
    let intervalTime = 500

    if (this.spaceBarDown || this.isActionPad) {
      if (collider_p2f) {
        collider_p2f = false

        if (playerData.value === 100) {
          let sec = 0
          let deduction = playerData.value / (processTime / intervalTime);

          playerData.isInteracting = true;
          playerData.interactType = 'p2f';

          timer = setInterval(() => {
            sec = sec + intervalTime
            playerData.value = playerData.value - deduction
            if (sec > processTime) {
              playerData.isInteracting = false;
              playerData.interactType = null;
              playerData.value = 0
              clearInterval(timer)
            }
          }, intervalTime);
        }
      }
    }
  }

  createTimers() {
    this.coopTimer = this.time.addEvent({
      delay: progressTime,                // ms
      callback: () => {
        for (let i = 0; i < coopListData.length; i++) {
          let random;
          if (coopListData[i].value > 80) {
            random = Math.floor(Math.random() *  Math.floor(10));
          } else {
            random = Math.floor(Math.random() *  Math.floor(5));
          }
          coopListData[i].value = coopListData[i].value + random;
          if (coopListData[i].value >= 100) {
            coopListData[i].value = 100;
            this.coopTimer.remove();
            this.scene.launch('LoseScene', gameData);
            this.scene.pause();
          }
        }
        // let random = Math.floor(Math.random() * (10 - 1 + 1)) + 1
        // let randomCoop = Math.floor(Math.random() * Math.floor(coopListData.length));
        // coopListData[randomCoop].value = coopListData[randomCoop].value + random;
        // if (coopListData[randomCoop].value >= 100) {
        //   coopListData[randomCoop].value = 100;
        //   this.coopTimer.remove();
        //   this.scene.launch('LoseScene', gameData);
        //   this.scene.pause();
        // }
      },
      loop: true
    });
  }

  run() {
    console.log('asdas')
  }

  update() {
    this.updateGamepad();
    this.updatePlayerMovement();
    this.updatePlayerBar();
    this.updateInteractableMovement();
    this.updateCoopData();
  }

  updateGamepad() {
    if (this.sys.game.device.os.desktop){
      this.dpad.visible = false;
      this.upDpad.visible = false;
      this.downDpad.visible = false;
      this.leftDpad.visible = false;
      this.rightDpad.visible = false;
      this.actionGroup.visible = false;
    }
    else{
      this.dpad.visible = true;
      this.upDpad.visible = true;
      this.downDpad.visible = true;
      this.leftDpad.visible = true;
      this.rightDpad.visible = true;
      this.actionGroup.visible = true;
    }

    let hasSelected = coopListData.filter(val => val.selected)
    let boundsA = playerData.interactZone.getBounds();
    let boundsB = this.fertOverlap.children.entries[0].getBounds();
    let inFertilizer = Phaser.Geom.Intersects.RectangleToRectangle(boundsA, boundsB)

    if (hasSelected.length || inFertilizer) {
      this.actionLabel.setText(inFertilizer ? ' Empty ' : 'Collect')
      this.actionGroup.setAlpha(0.6);
    } else {
      this.actionGroup.setAlpha(0.1);
    }
  }

  updatePlayerMovement() {
    if (playerData.isInteracting) {
      player.setVelocityX(0);
      if (playerData.interactType === 'p2c') {
        player.anims.play('interact-coop')
      } else {
        player.anims.play('interact-fert')
      }
    } else {
      if (this.cursors.right.isDown || this.wasd.right.isDown || this.isRightPad) {
        player.setVelocityX(moveSpeed);
        playerData.value ? player.anims.play('right-bucket', true) : player.anims.play('right', true);
      } else if (this.cursors.left.isDown || this.wasd.left.isDown || this.isLeftPad) {
        player.setVelocityX(-moveSpeed);
        playerData.value ? player.anims.play('left-bucket', true) : player.anims.play('left', true);
      } else if (this.cursors.down.isDown || this.wasd.down.isDown || this.isDownPad) {
        player.setVelocityY(moveSpeed);
        playerData.value ? player.anims.play('down-bucket', true) : player.anims.play('down', true);
      } else if (this.cursors.up.isDown || this.wasd.up.isDown || this.isUpPad) {
        player.setVelocityY(-moveSpeed);
        playerData.value ? player.anims.play('up-bucket', true) : player.anims.play('up', true);
      } else {
        playerData.value ? player.anims.play('turn-bucket') : player.anims.play('turn');
      }
    }

    playerData.interactZone.x = player.x - 5
    playerData.interactZone.y = player.y - 75
  }

  updatePlayerBar() {
    if (playerData.isInteracting) {
      this.redrawPlayerBar(player.x - 45, player.y - 100, playerData.value);
    } else {
      playerBar.clear();
    }
  }

  redrawPlayerBar(x, y, value) {
    playerBar.clear();
    playerBar.setDepth(3);

    playerBar.fillStyle(0x00a0e0);
    playerBar.fillRect(x - 3, y - 3, 106, 16);

    if (value > 80) {
      playerBar.fillStyle(0xec1c25, 1);
    } else if (value > 40 && value <= 80) {
      playerBar.fillStyle(0xffb71b, 1);
    } else {
      playerBar.fillStyle(0xffb71b, 1);
    }
    playerBar.fillRect(x, y, value, 10);
    this.add.existing(playerBar);
  }

  updateInteractableMovement() {
    console.log(this.activeIndex)
    for (let i = 0; i < coopListData.length; i++) {
      /* Update select state */
      let animKey
      let coopOvelap = this.interactOverlaps.children.entries[i]
      let boundsA = playerData.interactZone.getBounds();
      let boundsB = coopOvelap.getBounds();

      coopListData[i].selected = Phaser.Geom.Intersects.RectangleToRectangle(boundsA, boundsB)
      
      if (coopListData[i].value < 80) {
        animKey = coopListData[i].selected ? 'coop-normal-select' : 'coop-normal'
        this.coops.children.entries[i].anims.play(animKey, true)
      } else {
        animKey = coopListData[i].selected ? 'coop-angry-select' : 'coop-angry'
        this.coops.children.entries[i].anims.play(animKey, true)
      }

      /* Update z-index state */
      let boundC = this.zIndexOverlaps.children.entries[i].getBounds();
      let isBehind = Phaser.Geom.Intersects.RectangleToRectangle(boundsA, boundC)
      if (isBehind) {
        this.coops.children.entries[i].setDepth(3);
      } else {
        this.coops.children.entries[i].setDepth(0);
      }
    }
  }

  updateCoopData() {
    for (let i = 0; i < coopListData.length; i++) {
      let obj = coopListData[i]
      let currentVal = obj.value
      this.coops.children.entries[i]._coopValue = currentVal
      this.redrawCoopBar(i, (obj.x + 150), obj.y, obj.value);
    }
  }

  redrawCoopBar(i, x, y, value) {
    coopListData[i].bar.clear();
    coopListData[i].bar.setDepth(3);

    coopListData[i].bar.fillStyle(0x00a0e0);
    coopListData[i].bar.fillRect(x - 3, y - 3, 106, 26);

    if (value > 80) {
      coopListData[i].bar.fillStyle(0xec1c25, 1);
    } else if (value > 40 && value <= 80) {
      coopListData[i].bar.fillStyle(0xffb71b, 1);
    } else {
      coopListData[i].bar.fillStyle(0xffb71b, 1);
    }

    coopListData[i].bar.fillRect(x, y, value, 20);
    this.add.existing(coopListData[i].bar);
  }
}