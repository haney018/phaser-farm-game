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
var panelGroup;
var panelKeyValue = [0, 30, 40, 50, 60, 70, 80, 100]
var processTime = 1000;
var solarTime = 8000;
var progressTime = 1000;
var moveSpeed = 400;
var pauseButton;
var countDown;
var timeLimitSec = 121;
var timer;
var panelData;
var hasPower = false;
var driverLevel = 0;
var collider_p2c = true;
var collider_p2f = true;
var sounds = {};

export default class GameSunny extends Phaser.Scene {
  constructor () {
    super('GameSunny'); 
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
    if (panelData) {
      for (let i = 0; i < panelData.length; i++) {
        if (panelData[i].timer) clearInterval(panelData[i].timer)
      }
    }
    panelData = [
      { x: 20, y: 230, value: 0, selected: false, bar: null, interactable: false, isOn: false, timer: null },
      { x: 710, y: 230, value: 0, selected: false, bar: null, interactable: false, isOn: false, timer: null },
      { x: 1375, y: 230, value: 0, selected: false, bar: null, interactable: false, isOn: false, timer: null },

      { x: 20, y: 460, value: 0, selected: false, bar: null, interactable: false, isOn: false, timer: null },
      { x: 710, y: 460, value: 0, selected: false, bar: null, interactable: false, isOn: false, timer: null },
      { x: 1375, y: 460, value: 0, selected: false, bar: null, interactable: false, isOn: false, timer: null },
    
      { x: 20, y: 690, value: 0, selected: false, bar: null, interactable: false, isOn: false, timer: null },
      { x: 710, y: 690, value: 90, selected: false, bar: null, interactable: false, isOn: false, timer: null },
      { x: 1375, y: 690, value: 0, selected: false, bar: null, interactable: false, isOn: false, timer: null }
    ];
    hasPower = false;
    driverLevel = 0;
    collider_p2c = true;
    collider_p2f = true;
    this.turnOffSounds();
  }

  preload() {
    this.load.image('world', require('../assets/sunny-side/sunny_background.png'));
    this.load.image('world-end-top', require('../assets/sunny-side/sunny_bg_cutout.png'));

    this.load.spritesheet('panel', require('../assets/sunny-side/solarpanel_ss.png'), { frameWidth: 500, frameHeight: 150 });
    this.load.spritesheet('conveyor', require('../assets/sunny-side/conveyor_ss.png'), { frameWidth: 1365, frameHeight: 240 });
    this.load.spritesheet('driver', require('../assets/sunny-side/driver_ss.png'), { frameWidth: 400, frameHeight: 240 });

    this.load.spritesheet('eggsplain', require('../assets/eggsplain_ss.png'), { frameWidth: 300.75, frameHeight: 341 });
    this.load.spritesheet('eggsplore', require('../assets/eggsplore_ss.png'), { frameWidth: 300.75, frameHeight: 341 });

    this.load.image('overlap', require('../assets/sprites/overlap.png'));

    this.load.image('dpad', require('../assets/dpad.png'));
    this.load.image("hidden-dpad", require('../assets/hidden-dpad.png'));
    this.load.image("action", require('../assets/action.png'));

    this.load.image("pauseButton", require('../assets/btn_pause.png'));
    this.load.image("timerBlob", require('../assets/gen_timerblob.png'));

    this.load.audio('click', require(`../assets/audio/button/button.mp3`));
    this.load.audio('hover', require(`../assets/audio/button/hover.mp3`));
    this.load.audio('walk', require(`../assets/audio/character/walk.mp3`));
    this.load.audio('honk', require(`../assets/audio/honking/honking.wav`));
    this.load.audio('conveyorSound', require(`../assets/audio/conveyor/conveyor.wav`));
    this.load.audio('onSound', [
      require(`../assets/audio/switch-button/switch-on.wav`),
      require(`../assets/audio/switch-button/switch-on.mp3`),
    ]);
    this.load.audio('offSound', [
      require(`../assets/audio/switch-button/switch-off.wav`),
      require(`../assets/audio/switch-button/switch-off.mp3`),
    ]);

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
    this.createSounds();
    this.createField();
    this.createInteractableObjects();
    this.createPlayer();
    
    this.createColliders();
    this.createMenuTimer();
    this.createGamepad();
    
    this.createTimers();
  }

  createSounds() {
    sounds.clickSound = this.sound.add('click');
    sounds.hoverSound = this.sound.add('hover');
    sounds.hoverSound = this.sound.add('hover');
    sounds.hoverSound.volume = 0.2
    sounds.onSound = this.sound.add('onSound');
    sounds.offSound = this.sound.add('offSound');
    sounds.walkSound = this.sound.add('walk');
    sounds.walkSound.loop = true
    sounds.walkSound.volume = 0.2
    sounds.honkSound = this.sound.add('honk');
    sounds.conveyorSound = this.sound.add('conveyorSound');
    sounds.conveyorSound.loop = true
  }

  createField() {
    let world = this.add.image(0, 0, 'world');
    world.setOrigin(0, 0);

    let worldTop = this.add.image(0, 0, 'world-end-top');
    worldTop.setOrigin(0, 0);
    
    this.worldEnd = this.physics.add.staticGroup();
    this.worldEnd.add(worldTop);

    worldTop.body.setOffset(0, -50)
  }

  createInteractableObjects() {
    this.createPanels();
    this.createConveyor();
  }

  createPanels() {
    panelGroup = this.physics.add.staticGroup();
    this.zIndexOverlaps = this.physics.add.group();
    this.interactOverlaps = this.physics.add.group();
     
    for (let i = 0; i < panelData.length; i++) {
      let obj = panelData[i];

      let panelImage = this.add.sprite(obj.x, obj.y, 'panel');
      panelImage.setOrigin(0, 0);
      panelImage._dataIndex = i
      panelGroup.add(panelImage)

      panelImage.body.setSize(panelImage.displayWidth - 70, 10);
      panelImage.body.setOffset(35, 25);

      let zIndex = this.add.zone(obj.x + 30, obj.y + 5).setSize(panelImage.displayWidth - 60, 20);
      this.physics.world.enable(zIndex);
      zIndex.body.setAllowGravity(false);
      zIndex.body.moves = false;
      zIndex.body.debugBodyColor = 0x00ffff
      zIndex.setOrigin(0);
      zIndex._dataIndex = i
      this.zIndexOverlaps.add(zIndex)

      let interact = this.add.zone(obj.x + 20, obj.y + 100).setSize(panelImage.displayWidth - 400, 20);
      this.physics.world.enable(interact);
      interact.body.setAllowGravity(false);
      interact.body.moves = false;
      interact.body.debugBodyColor = 0x00ffff
      interact.setOrigin(0);
      interact._dataIndex = i
      this.interactOverlaps.add(interact)

      panelData[i].bar = new Phaser.GameObjects.Graphics(this)
    }

    for (let i = 0; i < panelKeyValue.length; i++) {
      let keyVal = 'panel-' + panelKeyValue[i];
      
      this.anims.create({
        key: keyVal,
        frames: [ { key: 'panel', frame: i } ],
        frameRate: 20
      });
    }

    this.anims.create({
      key: 'panel-80-selected',
      frames: [ { key: 'panel', frame: 13 } ],
      frameRate: 20
    });

    this.anims.create({
      key: 'panel-100-selected',
      frames: [ { key: 'panel', frame: 14 } ],
      frameRate: 20
    });

    this.anims.create({
      key: 'panel-on',
      frames: [ { key: 'panel', frame: 8 } ],
      frameRate: 20
    });

    this.anims.create({
      key: 'panel-turn-off',
      frames: this.anims.generateFrameNumbers('panel', { start: 8, end: 12 }),
      frameRate: 2
    });
  }

  createConveyor() {
    this.convCollider = this.physics.add.staticGroup();

    let convImage = this.add.sprite(200, 880, 'conveyor');
    convImage.setOrigin(0, 0);
    this.convCollider.add(convImage)
    // convImage.body.setSize(convImage.displayWidth, 20);
    // convImage.body.setOffset(0, 80);
    convImage.setDepth(2);
    convImage.setScale(0.9);

    this.anims.create({
      key: 'conveyor-run',
      frames: this.anims.generateFrameNumbers('conveyor', { start: 0, end: 14 }),
      frameRate: 10,
      repeat: -1
    });

    let driverImage = this.add.sprite(1400, 880, 'driver');
    driverImage.setOrigin(0, 0);
    this.convCollider.add(driverImage)
    driverImage.setDepth(2);
    driverImage.setScale(0.9);

    this.anims.create({
      key: 'driver-normal',
      frames: this.anims.generateFrameNumbers('driver', { start: 0, end: 9 }),
      frameRate: 10,
      repeat: -1
    });

    this.anims.create({
      key: 'driver-angry',
      frames: this.anims.generateFrameNumbers('driver', { start: 10, end: 19 }),
      frameRate: 15,
      repeat: -1
    });
  }

  createPlayer() {
    player = this.physics.add.sprite(940, 800, playerData.playerName);
    player.setScale(0.5);
    player.setDepth(1);
    player.setCollideWorldBounds(true);
    player.setDrag(2000);
    player.setActive(true);
    player.body.setSize(250, 300);
    playerBar = new Phaser.GameObjects.Graphics(this);

    playerData.interactZone = this.add.zone(player.x, player.y).setSize(10, 120);
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
      key: 'interact',
      frames: [ { key: playerData.playerName, frame: 16 } ],
      frameRate: 20
    });

    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers(playerData.playerName, { start: 24, end: 27 }),
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
      key: 'up',
      frames: this.anims.generateFrameNumbers(playerData.playerName, { start: 16, end: 19   }),
      frameRate: 10,
      repeat: -1
    });

    this.anims.create({
      key: 'down',
      frames: this.anims.generateFrameNumbers(playerData.playerName, { start: 20, end: 23 }),
      frameRate: 10,
      repeat: -1
    });
  }

  createColliders() {
    this.physics.add.collider(player, this.worldEnd);

    this.physics.add.collider(player, panelGroup);
    
    this.physics.add.overlap(playerData.interactZone, this.interactOverlaps, this.interactOne, () => {
      return collider_p2c;
    }, this);
    this.physics.add.overlap(player, this.zIndexOverlaps);

    this.physics.add.collider(player, this.convCollider);
    // this.physics.add.overlap(player, this.fertOverlap, this.interactTwo, () => {
    //   return collider_p2f;
    // }, this);
  }

  createMenuTimer() {
    pauseButton = this.add.image(120, 80, 'pauseButton');
    pauseButton.setInteractive( { useHandCursor: true  } );

    pauseButton.on('pointerover', () => {
      sounds.hoverSound.play();
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
          sounds.clickSound.play();
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
      this.turnOffSounds();
    }
  }


  createGamepad() {
    this.dpad = this.add.image(250, 850, 'dpad');
    this.dpad.setDepth(4);
    this.dpad.setScale(0.7);
    this.dpad.alpha = .6;

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

    this.actionLabel = this.add.text(1670, 810, 'Turn On', {
      wordWrap: { width: 200, useAdvancedWrap: true }
    });
    this.actionLabel.setFontFamily('Toriga');
    this.actionLabel.setFontSize(60);
    this.actionLabel.setAlign('center');
    this.actionLabel.setDepth(5);
    // this.actionLabel.setColor('#00a0e0');
    this.actionGroup.add(this.actionLabel)

    this.actionGroup.setVisible(false);
  }

  interactOne(player, coop) {
    let intervalTime = 500
    let index = coop._dataIndex
    this.activeIndex = index

    if (this.spaceBarDown || this.isActionPad) {
      if (collider_p2c && panelData[index].interactable) {
        collider_p2c = false
        sounds.onSound.play();

        let currentValue = panelData[index].value
        let sec = 0
        let deduction = panelData[index].value / (solarTime / intervalTime);

        driverLevel = driverLevel - 10
        playerData.isInteracting = true;
        playerData.interactType = 'p2c';
        panelData[index].isOn = true
        panelData[index].timer = null
        panelGroup.children.entries[index].anims.play('panel-on', true)
         
        panelData[index].timer = setInterval(() => {
          sec = sec + intervalTime
          panelData[index].value = panelData[index].value - deduction
          
          if (sec === processTime) {
            playerData.isInteracting = false;
            playerData.interactType = null;
          }

          if (sec > solarTime) {
            panelGroup.children.entries[index].anims.play('panel-turn-off', true)
            clearInterval(panelData[index].timer)
            setTimeout(() => {
              sounds.offSound.play();
              panelData[index].value = 0;
              panelData[index].isOn = false
            }, 2000)
             
          }
        }, intervalTime);
      }
    }
  }

  createTimers() {
    this.panelTimer = this.time.addEvent({
      delay: progressTime,                // ms
      callback: () => {
        for (let i = 0; i < panelData.length; i++) {
          let random = Math.floor(Math.random() *  Math.floor(10));

          if (!panelData[i].isOn) {
            panelData[i].value = panelData[i].value + random;
            panelData[i].interactable = (panelData[i].value >= 80);
            if (panelData[i].value >= 100) {
              panelData[i].value = 100;
            }
          } else {
            panelData[i].interactable = false;
          }
        }
      },
      loop: true
    });

    this.driverTimer = this.time.addEvent({
      delay: 2000,                // ms
      callback: () => {
        if (!hasPower) {
          driverLevel = driverLevel + 5
          if (driverLevel >= 100) {
            this.driverTimer.remove();
            this.scene.launch('LoseScene', gameData);
            this.scene.pause();
            this.turnOffSounds();
          } else if (driverLevel >= 60) {
            sounds.honkSound.play();
          }
        }
      },
      loop: true
    });
  }

  update() {
    this.updateGamepad();
    this.updatePlayerMovement();
    this.updatePlayerBar();
    this.updateInteractableMovement();
    this.updateNonInteractMovement();
    this.updatePanelData();
  }

  updateGamepad() {
    if (this.sys.game.device.os.desktop){
      this.dpad.visible = false;
      this.upDpad.visible = false;
      this.downDpad.visible = false;
      this.leftDpad.visible = false;
      this.rightDpad.visible = false;
      this.actionGroup.setVisible(false);
    }
    else{
      this.dpad.visible = true;
      this.upDpad.visible = true;
      this.downDpad.visible = true;
      this.leftDpad.visible = true;
      this.rightDpad.visible = true;
      this.actionGroup.visible = true;
      this.actionGroup.setVisible(true);

      let hasSelected = panelData.filter(val => val.selected)
      if (hasSelected.length) {
        this.actionGroup.setAlpha(0.8);
      } else {
        this.actionGroup.setAlpha(0.1);
      }
    }
  }

  updatePlayerMovement() {
    if (playerData.isInteracting) {
      player.setVelocityX(0);
      if (playerData.interactType === 'p2c') {
        player.anims.play('interact')
      }
    } else {
      if (this.cursors.right.isDown || this.wasd.right.isDown || this.isRightPad) {
        if (!sounds.walkSound.isPlaying) sounds.walkSound.play();
        player.setVelocityX(moveSpeed);
        playerData.value ? player.anims.play('right-bucket', true) : player.anims.play('right', true);
      } else if (this.cursors.left.isDown || this.wasd.left.isDown || this.isLeftPad) {
        if (!sounds.walkSound.isPlaying) sounds.walkSound.play();
        player.setVelocityX(-moveSpeed);
        playerData.value ? player.anims.play('left-bucket', true) : player.anims.play('left', true);
      } else if (this.cursors.down.isDown || this.wasd.down.isDown || this.isDownPad) {
        if (!sounds.walkSound.isPlaying) sounds.walkSound.play();
        player.setVelocityY(moveSpeed);
        playerData.value ? player.anims.play('down-bucket', true) : player.anims.play('down', true);
      } else if (this.cursors.up.isDown || this.wasd.up.isDown || this.isUpPad) {
        if (!sounds.walkSound.isPlaying) sounds.walkSound.play();
        player.setVelocityY(-moveSpeed);
        playerData.value ? player.anims.play('up-bucket', true) : player.anims.play('up', true);
      } else {
        sounds.walkSound.stop();
        playerData.value ? player.anims.play('turn-bucket') : player.anims.play('turn');
      }
    }

    playerData.interactZone.x = player.x - 5
    playerData.interactZone.y = player.y - 50
  }

  updatePlayerBar() {
    if (playerData.isInteracting) {
      // this.redrawPlayerBar(player.x - 45, player.y - 100, playerData.value);
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
    for (let i = 0; i < panelData.length; i++) {
      /* Update select state */
      let animKey
      let coopOvelap = this.interactOverlaps.children.entries[i]
      let boundsA = playerData.interactZone.getBounds();
      let boundsB = coopOvelap.getBounds();
      let isColliding = Phaser.Geom.Intersects.RectangleToRectangle(boundsA, boundsB)

      if (!panelData[i].isOn) {
        if (panelData[i].interactable) {
          let keyVal = panelKeyValue.filter(val => val <=  panelData[i].value)
          animKey = keyVal.length ? 'panel-' + keyVal[keyVal.length - 1] : 'panel-0'
          panelData[i].selected = isColliding
          animKey = panelData[i].selected ? animKey + '-selected' : animKey
        } else {
          let keyVal = panelKeyValue.filter(val => val <=  panelData[i].value)
          animKey = keyVal.length ? 'panel-' + keyVal[keyVal.length - 1] : 'panel-0'
        }
        panelGroup.children.entries[i].anims.play(animKey, true)
      } else {
        panelData[i].selected = false
      }
      
      // if (panelData[i].value < 80) {
      //   animKey = panelData[i].selected ? 'coop-normal-select' : 'coop-normal'
      //   panelGroup.children.entries[i].anims.play(animKey, true)
      // } else {
      //   animKey = panelData[i].selected ? 'coop-angry-select' : 'coop-angry'
      //   panelGroup.children.entries[i].anims.play(animKey, true)
      // }

      /* Update z-index state */
      let boundC = this.zIndexOverlaps.children.entries[i].getBounds();
      let isBehind = Phaser.Geom.Intersects.RectangleToRectangle(boundsA, boundC)
      if (isBehind) {
        panelGroup.children.entries[i].setDepth(3);
      } else {
        panelGroup.children.entries[i].setDepth(0);
      }
    }
  }

  updateNonInteractMovement() {
    let panelOn = panelData.filter(val => val.isOn)
    hasPower = panelOn.length ? true : false
    if (hasPower) {
      this.convCollider.children.entries[0].anims.play('conveyor-run', true)
      if (!sounds.conveyorSound.isPlaying) sounds.conveyorSound.play();
      // if (sounds)
    } else {
      this.convCollider.children.entries[0].anims.pause()
      sounds.conveyorSound.stop();
    }

    if (driverLevel >= 60) {
      this.convCollider.children.entries[1].anims.play('driver-angry', true)
    } else {
      this.convCollider.children.entries[1].anims.play('driver-normal', true)
    }
    
  }

  updatePanelData() {
    for (let i = 0; i < panelData.length; i++) {
      let obj = panelData[i]
      let currentVal = obj.value
      panelGroup.children.entries[i]._coopValue = currentVal
      // this.redrawPanelBar(i, (obj.x + 210), obj.y + 10, obj.value);
    }
  }

  redrawPanelBar(i, x, y, value) {
    panelData[i].bar.clear();
    panelData[i].bar.setDepth(3);

    panelData[i].bar.fillStyle(0x00a0e0);
    panelData[i].bar.fillRect(x - 3, y - 3, 106, 16);

    if (value > 80) {
      panelData[i].bar.fillStyle(0xec1c25, 1);
    } else if (value > 40 && value <= 80) {
      panelData[i].bar.fillStyle(0xffb71b, 1);
    } else {
      panelData[i].bar.fillStyle(0xffb71b, 1);
    }

    panelData[i].bar.fillRect(x, y, value, 10);
    this.add.existing(panelData[i].bar);
  }

  turnOffSounds() {
    for (var key in sounds) {
      sounds[key].stop();
    }
  }
}