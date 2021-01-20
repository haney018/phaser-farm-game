var gameData;
var player;
var playerBar;
var playerData;
var processTime = 500;
var progressTime = 2500;
var moveSpeed = 400;
var pauseButton;
var countDown;
var timeLimitSec = 121;
var timer;
var chickenGroupData;
var chickenTypes;
var collider_p2c = true;
var collider_p2f = true;
var sounds = {};

export default class GameScrambled extends Phaser.Scene {
  constructor () {
    super('GameScrambled'); 
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
      interactType: null,
      interactZone: null,
      equip: null,
      equipImage: null,
      returnImageOrigin: null,
      returnImage: null,
    };
    moveSpeed = 400;
    pauseButton;
    countDown;
    timeLimitSec = 121;
    timer;
    chickenGroupData = [
      { x: 0, y: 180, value: 0, selected: false, bar: null, type: null, isComplete: false, sounds: {} },
      { x: 660, y: 180, value: 0, selected: false, bar: null, type: null, isComplete: false, sounds: {} },
      { x: 1395, y: 180, value: 0, selected: false, bar: null, type: null, isComplete: false, sounds: {} },

      { x: 0, y: 470, value: 0, selected: false, bar: null, type: null, isComplete: false, sounds: {} },
      { x: 660, y: 470, value: 0, selected: false, bar: null, type: null, isComplete: false, sounds: {} },
      { x: 1395, y: 470, value: 0, selected: false, bar: null, type: null, isComplete: false, sounds: {} },
    
      { x: 0, y: 770, value: 0, selected: false, bar: null, type: null, isComplete: false, sounds: {} },
      { x: 660, y: 770, value: 0, selected: false, bar: null, type: null, isComplete: false, sounds: {} },
      { x: 1395, y: 770, value: 0, selected: false, bar: null, type: null, isComplete: false, sounds: {} }
    ];
    chickenTypes = ['shrub', 'tree', 'shelter']
    collider_p2c = true;
    collider_p2f = true;
    this.randomizeAll();
    this.turnOffSounds();
  }

  randomizeAll() {
    for (let i = 0; i < chickenGroupData.length; i++) {
      let randIndex = Math.floor(Math.random() * Math.floor(chickenTypes.length))
      let type = chickenTypes[randIndex]
      chickenGroupData[i].type = type;
    }
  }

  preload() {
    this.load.image('world', require('../assets/scrambled-shade/shade_backround.jpg'));
    this.load.image('world-end-top', require('../assets/scrambled-shade/shade_cutout.jpg'));

    this.load.image('mat-shrub', require('../assets/scrambled-shade/shade_shrub.png'));
    this.load.image('mat-shrub-select', require('../assets/scrambled-shade/shade_shrub_select.png'));
    this.load.image('mat-tree', require('../assets/scrambled-shade/shade_tree.png'));
    this.load.image('mat-tree-select', require('../assets/scrambled-shade/shade_tree_select.png'));
    this.load.image('mat-shelter', require('../assets/scrambled-shade/shade_shelter.png'));
    this.load.image('mat-shelter-select', require('../assets/scrambled-shade/shade_shelter_select.png'));

    this.load.spritesheet('shrub', require('../assets/scrambled-shade/shrub_ss.png'), { frameWidth: 750, frameHeight: 405 });
    this.load.spritesheet('tree', require('../assets/scrambled-shade/tree_ss.png'), { frameWidth: 750, frameHeight: 405 });
    this.load.spritesheet('shelter', require('../assets/scrambled-shade/shelter_ss.png'), { frameWidth: 750, frameHeight: 405 });

    this.load.spritesheet('poof', require('../assets/scrambled-shade/poof_ss.png'), { frameWidth: 750, frameHeight: 405 });
    this.load.image('highlight', require('../assets/scrambled-shade/shade_highlight.png'), { frameWidth: 750, frameHeight: 405 });

    this.load.spritesheet('eggsplain', require('../assets/eggsplain_ss.png'), { frameWidth: 300.75, frameHeight: 341 });
    this.load.spritesheet('eggsplore', require('../assets/eggsplore_ss.png'), { frameWidth: 300.75, frameHeight: 341 });

    this.load.image('equip-shrub', require('../assets/scrambled-shade/shade_bubble_shrub.png'));
    this.load.image('equip-tree', require('../assets/scrambled-shade/shade_bubble_tree.png'));
    this.load.image('equip-shelter', require('../assets/scrambled-shade/shade_bubble_shelter.png'));

    this.load.image('overlap', require('../assets/sprites/overlap.png'));

    this.load.image('dpad', require('../assets/dpad.png'));
    this.load.image("hidden-dpad", require('../assets/hidden-dpad.png'));
    this.load.image("action", require('../assets/action.png'));

    this.load.image("pauseButton", require('../assets/btn_pause.png'));
    this.load.image("timerBlob", require('../assets/gen_timerblob.png'));

    this.load.audio('click', require(`../assets/audio/button/button.mp3`));
    this.load.audio('hover', require(`../assets/audio/button/hover.mp3`));
    this.load.audio('walk', require(`../assets/audio/character/walk.mp3`));
    this.load.audio('cluck', require(`../assets/audio/chicken/cluck.wav`));
    this.load.audio('puff', require(`../assets/audio/puff.mp3`));
    this.load.audio('build', require(`../assets/audio/wood-hit.mp3`));
    this.load.audio('pick', require(`../assets/audio/pickup.mp3`));


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
    // this.scene.pause();
    // this.scene.launch('StartScene', { gameId: 'fowl' });
  }

  createSounds() {
    sounds.clickSound = this.sound.add('click');
    sounds.hoverSound = this.sound.add('hover');
    sounds.hoverSound.volume = 0.2
    sounds.walkSound = this.sound.add('walk');
    sounds.walkSound.loop = true
    sounds.walkSound.volume = 0.2
    sounds.cluckSound = this.sound.add('cluck');
    sounds.puff = this.sound.add('puff');
    sounds.build = this.sound.add('build');
    sounds.pick = this.sound.add('pick');


    // for (let i = 0; i < chickenGroupData.length; i++) {
    //   chickenGroupData[i].sounds.puff = this.sound.add('puff');
    // }
  }

  createField() {
    let world = this.add.image(0, 0, 'world');
    world.setOrigin(0, 0);

    let worldTop = this.add.image(0, 0, 'world-end-top');
    worldTop.setOrigin(0, 0);
    
    this.worldEnd = this.physics.add.staticGroup();
    this.worldEnd.add(worldTop);
  }

  createInteractableObjects() {
    this.createChickGroup();
    this.createChickenAnimations();
    this.createBuildMaterials();
  }

  createChickGroup() {
    this.chickens = this.physics.add.staticGroup();
    this.zIndexOverlaps = this.physics.add.group();
    this.interactOverlaps = this.physics.add.group();
    this.poofEffects = this.physics.add.group();
    this.highlightEffects = this.physics.add.group();
     
    for (let i = 0; i < chickenGroupData.length; i++) {
      let obj = chickenGroupData[i];
      let type = obj.type

      let highlight = this.add.image(obj.x - 40, obj.y + 40, 'highlight');
      highlight.setScale(1);
      highlight.setDepth(0);
      highlight.setOrigin(0, 0);
      highlight._dataIndex = i
      this.highlightEffects.add(highlight)

      let chickenImage = this.add.sprite(obj.x, obj.y, type);
      chickenImage.setScale(0.7);
      chickenImage.setOrigin(0, 0);
      chickenImage._dataIndex = i
      this.chickens.add(chickenImage)

      let deduction = type === 'shrub' ? 200 : 90
      chickenImage.body.setSize(chickenImage.displayWidth - deduction, 10);

      let zIndex = this.add.zone(obj.x + 10, obj.y).setSize(chickenImage.displayWidth - 20, 80);
      this.physics.world.enable(zIndex);
      zIndex.body.setAllowGravity(false);
      zIndex.body.moves = false;
      zIndex.body.debugBodyColor = 0x00ffff
      zIndex.setOrigin(0);
      zIndex._dataIndex = i
      this.zIndexOverlaps.add(zIndex)

      let interact = this.add.zone(obj.x + 25, obj.y + 120).setSize(chickenImage.displayWidth - 50, 90);
      this.physics.world.enable(interact);
      interact.body.setAllowGravity(false);
      interact.body.moves = false;
      interact.body.debugBodyColor = 0x00ffff
      interact.setOrigin(0);
      interact._dataIndex = i
      this.interactOverlaps.add(interact)

      let poofImage = this.add.sprite(obj.x, obj.y, 'poof', 7);
      poofImage.setScale(0.7);
      poofImage.setDepth(3);
      poofImage.setOrigin(0, 0);
      poofImage._dataIndex = i
      this.poofEffects.add(poofImage)

      

      chickenGroupData[i].bar = new Phaser.GameObjects.Graphics(this)
    }
  }

  createChickenAnimations() {
    this.anims.create({
      key: 'poofing',
      frames: this.anims.generateFrameNumbers('poof', { start: 0, end: 7 }),
      frameRate: 10,
      repeat: 0
    });

    this.anims.create({
      key: 'shrub-normal',
      frames: this.anims.generateFrameNumbers('shrub', { start: 0, end: 9 }),
      frameRate: 10,
      repeat: -1
    });

    this.anims.create({
      key: 'shrub-normal-select',
      frames: this.anims.generateFrameNumbers('shrub', { start: 0, end: 9 }),
      frameRate: 10,
      repeat: -1
    });

    this.anims.create({
      key: 'shrub-angry',
      frames: this.anims.generateFrameNumbers('shrub', { start: 20, end: 29 }),
      frameRate: 30,
      repeat: -1
    });

    this.anims.create({
      key: 'shrub-angry-select',
      frames: this.anims.generateFrameNumbers('shrub', { start: 20, end: 29 }),
      frameRate: 30,
      repeat: -1
    });

    this.anims.create({
      key: 'shrub-build',
      frames: this.anims.generateFrameNumbers('shrub', { start: 40, end: 49 }),
      frameRate: 15,
      repeat: -1
    });

    this.anims.create({
      key: 'tree-normal',
      frames: this.anims.generateFrameNumbers('tree', { start: 0, end: 9 }),
      frameRate: 10,
      repeat: -1
    });

    this.anims.create({
      key: 'tree-normal-select',
      frames: this.anims.generateFrameNumbers('tree', { start: 0, end: 9 }),
      frameRate: 15,
      repeat: -1
    });

    this.anims.create({
      key: 'tree-angry',
      frames: this.anims.generateFrameNumbers('tree', { start: 20, end: 29 }),
      frameRate: 30,
      repeat: -1
    });

    this.anims.create({
      key: 'tree-angry-select',
      frames: this.anims.generateFrameNumbers('tree', { start: 20, end: 29 }),
      frameRate: 30,
      repeat: -1
    });

    this.anims.create({
      key: 'tree-build',
      frames: this.anims.generateFrameNumbers('tree', { start: 40, end: 49 }),
      frameRate: 15,
      repeat: -1
    });

    this.anims.create({
      key: 'shelter-normal',
      frames: this.anims.generateFrameNumbers('shelter', { start: 0, end: 9 }),
      frameRate: 10,
      repeat: -1
    });

    this.anims.create({
      key: 'shelter-normal-select',
      frames: this.anims.generateFrameNumbers('shelter', { start: 0, end: 9 }),
      frameRate: 10,
      repeat: -1
    });

    this.anims.create({
      key: 'shelter-angry',
      frames: this.anims.generateFrameNumbers('shelter', { start: 20, end: 29 }),
      frameRate: 20,
      repeat: -1
    });

    this.anims.create({
      key: 'shelter-angry-select',
      frames: this.anims.generateFrameNumbers('shelter', { start: 20, end: 29 }),
      frameRate: 15,
      repeat: -1
    });

    this.anims.create({
      key: 'shelter-build',
      frames: this.anims.generateFrameNumbers('shelter', { start: 40, end: 49 }),
      frameRate: 15,
      repeat: -1
    });
  }

  createBuildMaterials() {
    let xPos = 660
    this.matImages = this.physics.add.staticGroup();

    for (let i = 0; i < chickenTypes.length; i++) {
      let type = chickenTypes[i];

      let matImage = this.add.image(xPos, 5, `mat-${type}`);
      matImage.setOrigin(0, 0);
      matImage._data = type
      this.matImages.add(matImage)
      // matImage.body.setOffset(0, -100);
      // matImage.setSize(100, 50);
      // matImage.setBottom(-50)
      // console.log(matImage)
      xPos = xPos + 200;
    }


  }

  createPlayer() {
    player = this.physics.add.sprite(510, 180, playerData.playerName);
    player.setScale(0.5);
    player.setDepth(1);
    player.setCollideWorldBounds(true);
    player.setDrag(2000);
    player.setActive(true);
    player.body.setSize(230, 300);
    playerBar = new Phaser.GameObjects.Graphics(this);

    playerData.interactZone = this.physics.add.group();

    let vertical = this.add.zone(player.x, player.y).setSize(10, 150);
    this.physics.world.enable(vertical);
    vertical.body.setAllowGravity(false);
    vertical.body.debugBodyColor = 0x00ffff
    vertical.setOrigin(0);
    playerData.interactZone.add(vertical)

    let horizontal = this.add.zone(player.x, player.y).setSize(90, 10);
    this.physics.world.enable(horizontal);
    horizontal.body.setAllowGravity(false);
    horizontal.body.debugBodyColor = 0x00ffff
    horizontal.setOrigin(0);
    playerData.interactZone.add(horizontal)

    let equipImage = this.add.image(player.x, player.y - 100, 'equip-shrub')
    equipImage.setScale(0.7);
    equipImage.setDepth(1);
    // equipImage.setOrigin(0);
    playerData.equipImage = equipImage

    let returnImage = this.add.image(player.x, player.y - 100, 'overlap')
    returnImage.setOrigin(0);
    returnImage.setScale(0.7);
    returnImage.setDepth(3);
    playerData.returnImage = returnImage

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

  createColliders() {
    this.physics.add.collider(player, this.worldEnd);

    this.physics.add.collider(player, this.chickens);
    
    this.physics.add.overlap(playerData.interactZone, this.interactOverlaps, this.interactOne, () => {
      return collider_p2c;
    }, this);
    this.physics.add.overlap(player, this.zIndexOverlaps);

    this.physics.add.overlap(playerData.interactZone, this.matImages, this.interactTwo, () => {
      return collider_p2f;
    }, this);
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
      this.turnOffSounds();
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

    this.actionLabel = this.add.text(1665, 840, 'Build', {
      wordWrap: { width: 200, useAdvancedWrap: true }
    });
    this.actionLabel.setFontFamily('Toriga');
    this.actionLabel.setFontSize(60);
    this.actionLabel.setAlign('center');
    this.actionLabel.setDepth(5);
    // this.actionLabel.setColor('#00a0e0');
    this.actionGroup.add(this.actionLabel)

    this.actionGroup.setAlpha(0.2);
  }

  interactOne(playerZone, chickens) {
    let timer;
    let intervalTime = 500
    let index = chickens._dataIndex

    this.activeIndex = index
    if (this.spaceBarDown || this.isActionPad) {
      if (collider_p2c && playerData.equip) {
        collider_p2c = false

        let currentType = chickenGroupData[index].type

        if (currentType === playerData.equip) {
          let sec = 0
          playerData.isInteracting = true;
          playerData.interactType = 'p2c';
          chickenGroupData[index].value = 0
          playerData.value = 0
          sounds.build.play();

          timer = setInterval(() => {
            sec = sec + intervalTime
            playerData.value = playerData.value + ((100 * intervalTime) / processTime);
            if (sec > processTime) {
              playerData.isInteracting = false;
              playerData.interactType = null;
              chickenGroupData[index].value = 5;
              playerData.value = 0;
              playerData.equip = null;
              playerData.returnImageOrigin = null
              clearInterval(timer)
              this.poofEffects.children.entries[index].anims.play('poofing', true);
              sounds.puff.play();
              setTimeout(() => {
                chickenGroupData[index].bar.setVisible(false)
                chickenGroupData[index].isComplete = true
                this.changeChicken(index);
              }, 500);
              
            }
          }, intervalTime);

        } else {
          let currentValue = chickenGroupData[index].value
          let type = playerData.equip;
          let returnImage = playerData.returnImage
          let origin = playerData.returnImageOrigin

          chickenGroupData[index].value = currentValue + 30;
          returnImage.x = player.x
          returnImage.y = player.y - 100
          returnImage.setTexture(`mat-${type}`)
          this.tweens.add({
            targets: returnImage,
            duration: 500,
            x: origin.x + 50,
            y: origin.y + 50,
            ease: 'Exponential.easeIn',
            complete: () => {
              playerData.equip = null;
              setTimeout(() => {
                returnImage.setTexture(`overlap`)
              }, 500);
            }
          });
        }

        // chickenGroupData[index].type = this.randomChicken();
        // this.chickens.children.entries[index].setTexture(chickenGroupData[index].type)

        // let currentValue = chickenGroupData[index].value
        // if (currentValue >= 2 && playerData.value === 0) {
        //   let sec = 0
        //   let deduction = chickenGroupData[index].value / (processTime / intervalTime);
        //   playerData.isInteracting = true;
        //   playerData.interactType = 'p2c';

        //   timer = setInterval(() => {
        //     sec = sec + intervalTime
        //     chickenGroupData[index].value = chickenGroupData[index].value - deduction
        //     playerData.value = playerData.value + ((100 * intervalTime) / processTime);
        //     if (sec > processTime) {
        //       playerData.isInteracting = false;
        //       playerData.interactType = null;
        //       chickenGroupData[index].value = 5;
        //       playerData.value = 100;
        //       clearInterval(timer)
        //     }
        //   }, intervalTime);
        // }
      }
    }
  }

  changeChicken(index) {
    setTimeout(() => {
      let randIndex = Math.floor(Math.random() * Math.floor(chickenTypes.length))
      this.poofEffects.children.entries[index].anims.play('poofing', true);
      sounds.puff.play();
      setTimeout(() => {
        let newType = chickenTypes[randIndex]
        let chickenImage = this.chickens.children.entries[index]
        chickenGroupData[index].bar.setVisible(true)
        chickenGroupData[index].isComplete = false
        chickenGroupData[index].type = newType
        let deduction = newType === 'shrub' ? 200 : 90
        chickenImage.body.setSize(chickenImage.displayWidth - deduction, 10);
      }, 500);
    }, 5000); 
  }

  randomChicken() {
    let randIndex = Math.floor(Math.random() * Math.floor(chickenTypes.length))
    return chickenTypes[randIndex];
  }

  interactTwo(playerZone, materialZone) {
    let timer;
    let intervalTime = 500

    if (this.spaceBarDown || this.isActionPad) {
      if (collider_p2f && !playerData.equip) {
        collider_p2f = false

        let sec = 0;
        let type = materialZone._data;
        playerData.value = 0;
        playerData.isInteracting = true;
        playerData.interactType = 'p2f';

        timer = setInterval(() => {
          sec = sec + intervalTime
          playerData.value = playerData.value + ((100 * intervalTime) / processTime);
          if (sec > processTime) {
            sounds.pick.play();
            playerData.isInteracting = false;
            playerData.interactType = null;
            playerData.value = 0
            playerData.equip = type
            playerData.returnImageOrigin = materialZone
            clearInterval(timer)
          }
        }, intervalTime);
      }
    }
  }

  createTimers() {
    this.coopTimer = this.time.addEvent({
      delay: progressTime,
      callback: () => {
        for (let i = 0; i < chickenGroupData.length; i++) {
          let random;
          if (chickenGroupData[i].value < 80) {
            random = Math.floor(Math.random() *  Math.floor(7));
          } else {
            random = Math.floor(Math.random() *  Math.floor(2));
          }
          chickenGroupData[i].value = chickenGroupData[i].value + random;
          if (chickenGroupData[i].value >= 100) {
            chickenGroupData[i].value = 100;
            this.coopTimer.remove();
            this.turnOffSounds();
            this.scene.launch('LoseScene', gameData);
            this.scene.pause();
          }
        }
        // let random = Math.floor(Math.random() * (10 - 1 + 1)) + 1
        // let randomCoop = Math.floor(Math.random() * Math.floor(chickenGroupData.length));
        // chickenGroupData[randomCoop].value = chickenGroupData[randomCoop].value + random;
        // if (chickenGroupData[randomCoop].value >= 100) {
        //   chickenGroupData[randomCoop].value = 100;
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

      let hasSelected = chickenGroupData.filter(val => val.selected)
      if (hasSelected.length) {
        this.actionGroup.setAlpha(0.5);
      } else {
        this.actionGroup.setAlpha(0.1);
      }
    }

    
  }

  updatePlayerMovement() {
    if (playerData.isInteracting) {
      player.setVelocityX(0);
      player.anims.play('interact-coop')
    } else {
      if (this.cursors.right.isDown || this.wasd.right.isDown || this.isRightPad) {
        if (!sounds.walkSound.isPlaying) sounds.walkSound.play();
        player.setVelocityX(moveSpeed);
        player.anims.play('right', true);
      } else if (this.cursors.left.isDown || this.wasd.left.isDown || this.isLeftPad) {
        if (!sounds.walkSound.isPlaying) sounds.walkSound.play();
        player.setVelocityX(-moveSpeed);
        player.anims.play('left', true);
      } else if (this.cursors.down.isDown || this.wasd.down.isDown || this.isDownPad) {
        if (!sounds.walkSound.isPlaying) sounds.walkSound.play();
        player.setVelocityY(moveSpeed);
        player.anims.play('down', true);
      } else if (this.cursors.up.isDown || this.wasd.up.isDown || this.isUpPad) {
        if (!sounds.walkSound.isPlaying) sounds.walkSound.play();
        player.setVelocityY(-moveSpeed);
        player.anims.play('up', true);
      } else {
        sounds.walkSound.stop();
        player.anims.play('turn');
      }
    }

    if (playerData.equip != null) {
      playerData.equipImage.setTexture(`equip-${playerData.equip}`);
    } else {
      playerData.equipImage.setTexture(`overlap`);
    }

    if (playerData.interactZone) {
      playerData.interactZone.children.entries[0].x = player.x - 5
      playerData.interactZone.children.entries[0].y = player.y - 75
      playerData.interactZone.children.entries[1].x = player.x - 45
      playerData.interactZone.children.entries[1].y = player.y + 10
    }

    playerData.equipImage.x = player.x
    playerData.equipImage.y = player.y - 100
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
    this.iucUpdateMaterials();

    for (let i = 0; i < chickenGroupData.length; i++) {
      /* Update select state */
      let animKey
      let coopOvelap = this.interactOverlaps.children.entries[i]
      let boundsA1 = playerData.interactZone.children.entries[0].getBounds();
      let boundsA2 = playerData.interactZone.children.entries[1].getBounds();
      let boundsB = coopOvelap.getBounds();

      chickenGroupData[i].selected = Phaser.Geom.Intersects.RectangleToRectangle(boundsA1, boundsB) || Phaser.Geom.Intersects.RectangleToRectangle(boundsA2, boundsB)
      this.highlightEffects.children.entries[i].setVisible(chickenGroupData[i].selected)

      if (!chickenGroupData[i].isComplete) {
        if (chickenGroupData[i].value < 80) {
          animKey = chickenGroupData[i].selected ? `${chickenGroupData[i].type}-normal-select` : `${chickenGroupData[i].type}-normal`
          this.chickens.children.entries[i].anims.play(animKey, true)
        } else {
          animKey = chickenGroupData[i].selected ?`${chickenGroupData[i].type}-angry-select` : `${chickenGroupData[i].type}-angry`
          this.chickens.children.entries[i].anims.play(animKey, true)
        }
      } else {
        this.chickens.children.entries[i].anims.play(`${chickenGroupData[i].type}-build`, true)
      }
      

      /* Update z-index state */
      let boundC = this.zIndexOverlaps.children.entries[i].getBounds();
      let isBehind = Phaser.Geom.Intersects.RectangleToRectangle(boundsA1, boundC) || Phaser.Geom.Intersects.RectangleToRectangle(boundsA2, boundC)
      if (isBehind) {
        this.chickens.children.entries[i].setDepth(3);
      } else {
        this.chickens.children.entries[i].setDepth(0);
      }
    }
  }

  iucUpdateMaterials() {
    /* Update select state for materials */
    for (let i = 0; i < this.matImages.children.entries.length; i++) {
      let material = this.matImages.children.entries[i];
      let type = material._data;
      let boundsA1 = playerData.interactZone.children.entries[0].getBounds();
      let boundsA2 = playerData.interactZone.children.entries[1].getBounds();
      let boundsB = material.getBounds();
      let isSelected = Phaser.Geom.Intersects.RectangleToRectangle(boundsA1, boundsB) || Phaser.Geom.Intersects.RectangleToRectangle(boundsA2, boundsB)
      isSelected ? material.setTexture(`mat-${type}-select`) : material.setTexture(`mat-${type}`)
    }
  }

  updateCoopData() {
    for (let i = 0; i < chickenGroupData.length; i++) {
      let obj = chickenGroupData[i]
      let currentVal = obj.value
      this.chickens.children.entries[i]._coopValue = currentVal
      this.redrawChickenBar(i, (obj.x + 200), (obj.y + 100), obj.value);
    }
  }

  redrawChickenBar(i, x, y, value) {
    chickenGroupData[i].bar.clear();
    chickenGroupData[i].bar.setDepth(3);

    chickenGroupData[i].bar.fillStyle(0x00a0e0, 0.8);
    chickenGroupData[i].bar.fillRect(x - 3, y - 3, 106, 26);

    if (value > 80) {
      chickenGroupData[i].bar.fillStyle(0xec1c25, 1);
    } else if (value > 40 && value <= 80) {
      chickenGroupData[i].bar.fillStyle(0xffb71b, 1);
    } else {
      chickenGroupData[i].bar.fillStyle(0xffb71b, 1);
    }

    chickenGroupData[i].bar.fillRect(x, y, value, 20);
    this.add.existing(chickenGroupData[i].bar);
  }

  turnOffSounds() {
    for (var key in sounds) {
      sounds[key].stop();
    }
  }
}