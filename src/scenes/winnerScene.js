// import bg from '../assets/background.png';
var gameData;
var restartButton;
var exitButton;
var sounds = {};

export default class WinnerScene extends Phaser.Scene {
  constructor () {
    super('WinnerScene');
  }

  init(data) {
    gameData = data;
  }

  preload() {
    this.load.image('modal', require(`../assets/gen_overlayblob.png`));
    this.load.image('char1', require(`../assets/gen_eggsplain_conrgats.png`));
    this.load.image('char2', require(`../assets/gen_eggsplore_congrats.png`));
    this.load.image('resumeButton', require('../assets/btn_continue.png'));
    this.load.image('restartButton', require('../assets/btn_restart.png'));
    this.load.image('exitButton', require('../assets/btn_exit.png'));

    this.load.audio('winner', require(`../assets/audio/winner/winner.wav`));
    this.load.audio('click', require(`../assets/audio/button/button.mp3`));
    this.load.audio('hover', require(`../assets/audio/button/hover.mp3`));
  }

  create() {
    sounds.clickSound = this.sound.add('click');
    sounds.hoverSound = this.sound.add('hover');
    sounds.hoverSound.volume = 0.2
    sounds.winnerSound = this.sound.add('winner');
    sounds.winnerSound.play();

    let modal = this.add.image(0, 0, 'modal');
    modal.setOrigin(0, 0);

    const screenCenterX = this.cameras.main.worldView.x + this.cameras.main.width / 2;

    let text1 = this.add.text(screenCenterX, 220, 'CONGRATULATION!', {
      wordWrap: { width: 1200, useAdvancedWrap: true }
    });
    text1.setOrigin(0.5);
    text1.setColor('#ffb71b');
    text1.setFontFamily('Toriga');
    text1.setFontSize(110);
    text1.setAlign('center');

    let message = gameData.winText ? gameData.winText : ''

    let text2 = this.add.text(screenCenterX, 400, message, {
      wordWrap: { width: 1200, useAdvancedWrap: true }
    });
    text2.setOrigin(0.5);
    text2.setColor('#00a0e0');
    text2.setFontFamily('Toriga');
    text2.setFontSize(70);
    text2.setAlign('center');

    let char1 = this.add.image(300, 500, 'char1');
    char1.setOrigin(0, 0);

    let char2 = this.add.image(1300, 500, 'char2');
    char2.setOrigin(0, 0);

    restartButton = this.add.image(screenCenterX, 650, 'restartButton');
    restartButton.setOrigin(0.5);
    restartButton.setInteractive( { useHandCursor: true  } );
    restartButton.on('pointerover', () => {
      sounds.hoverSound.play();
      this.tweens.add({
        targets: restartButton,
        scale: { value: 1.1, duration: 100, ease: 'Power1' },
      });
    })

    restartButton.on('pointerout', () => {
      this.tweens.add({
        targets: restartButton,
        scale: { value: 1, duration: 100, ease: 'Power1' },
      });
    })

    restartButton.on('pointerdown', () => {
      this.tweens.add({
        targets: restartButton,
        scale: { value: 0.9, duration: 100, ease: 'Power1' },
        onComplete: () => {
          sounds.clickSound.play();
          let currentScene = this.scene.get(gameData.sceneName);
          currentScene.scene.restart();
          this.scene.stop();
        }
      });
    });

    exitButton = this.add.image(screenCenterX, 800, 'exitButton');
    exitButton.setOrigin(0.5);
    exitButton.setInteractive( { useHandCursor: true  } );
    exitButton.on('pointerover', () => {
      sounds.hoverSound.play();
      this.tweens.add({
        targets: exitButton,
        scale: { value: 1.1, duration: 100, ease: 'Power1' },
      });
    })

    exitButton.on('pointerout', () => {
      this.tweens.add({
        targets: exitButton,
        scale: { value: 1, duration: 100, ease: 'Power1' },
      });
    })

    exitButton.on('pointerdown', () => {
      this.tweens.add({
        targets: exitButton,
        scale: { value: 0.9, duration: 100, ease: 'Power1' },
        onComplete: () => {
          sounds.clickSound.play();
          let currentScene = this.scene.get('ContainerScene');
          currentScene.scene.restart();
          this.scene.stop(gameData.sceneName);
          this.scene.stop();
          location.reload();
        }
      });
    });
  }

  update() {}
}