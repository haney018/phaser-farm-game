// import bg from '../assets/background.png';
var gameData;
var sounds = {};

export default class StartScene extends Phaser.Scene {
  constructor () {
    super('StartScene');
  }

  init(data) {
    gameData = data
  }

  preload() {
    let introPath = gameData.introPath
    this.load.image('title', require(`../assets/${introPath}`));
    this.load.image('startButton', require('../assets/btn_start.png'));

    this.load.audio('click', require(`../assets/audio/button/button.mp3`));
    this.load.audio('hover', require(`../assets/audio/button/hover.mp3`));
  }

  create() {
    const screenCenterX = this.cameras.main.worldView.x + this.cameras.main.width / 2;

    sounds.clickSound = this.sound.add('click');
    sounds.hoverSound = this.sound.add('hover');
    sounds.hoverSound.volume = 0.2
    
    let title = this.add.image(0, 0, 'title');
    title.setOrigin(0, 0);

    this.startButton = this.add.image(screenCenterX, 870, 'startButton');
    this.startButton.setOrigin(0.5);
    this.startButton.setInteractive( { useHandCursor: true  } );

    this.startButton.on('pointerover', () => {
      sounds.hoverSound.play();
      this.tweens.add({
        targets: this.startButton,
        scale: { value: 1.1, duration: 100, ease: 'Power1' },
      });
    })


    this.startButton.on('pointerout', () => {
      this.tweens.add({
        targets: this.startButton,
        scale: { value: 1, duration: 100, ease: 'Power1' },
      });
    })

    this.startButton.on('pointerdown', () => {
      this.tweens.add({
        targets: this.startButton,
        scale: { value: 0.9, duration: 100, ease: 'Power1' },
        onComplete: () => {
          sounds.clickSound.play();

          this.scene.launch('HelpScene', gameData);
          this.scene.stop();

        }
      });
      
    })
  }

  update() {}
}