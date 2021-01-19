// import bg from '../assets/background.png';
var gameData
var continueButton;
var sounds = {};

export default class HelpScene extends Phaser.Scene {
  constructor () {
    super('HelpScene');
  }

  init(data) {
    gameData = data;
  }

  preload() {
    let helpPath = gameData.helpPath
    this.load.image('help', require(`../assets/${helpPath}`));
    this.load.image('continueButton', require('../assets/btn_continue.png'));
    this.load.audio('click', require(`../assets/audio/button/button.mp3`));
    this.load.audio('hover', require(`../assets/audio/button/hover.mp3`));
  }

  create() {
    const screenCenterX = this.cameras.main.worldView.x + this.cameras.main.width / 2;

    sounds.clickSound = this.sound.add('click');
    sounds.hoverSound = this.sound.add('hover');
    sounds.hoverSound.volume = 0.2

    let help = this.add.image(0, 0, 'help');
    help.setOrigin(0, 0);

    continueButton = this.add.image(screenCenterX, 972, 'continueButton');
    continueButton.setOrigin(0.5);
    continueButton.setInteractive( { useHandCursor: true  } );

    continueButton.on('pointerover', () => {
      sounds.hoverSound.play();
      this.tweens.add({
        targets: continueButton,
        scale: { value: 1.1, duration: 100, ease: 'Power1' },
      });
    })

    continueButton.on('pointerout', () => {
      this.tweens.add({
        targets: continueButton,
        scale: { value: 1, duration: 100, ease: 'Power1' },
      });
    })

    continueButton.on('pointerdown', () => {
      this.tweens.add({
        targets: continueButton,
        scale: { value: 0.9, duration: 100, ease: 'Power1' },
        onComplete: () => {
          sounds.clickSound.play();
          this.scene.launch('SelectCharacterScene', gameData);
          this.scene.stop();
        }
      });
    })
  }

  update() {}
}