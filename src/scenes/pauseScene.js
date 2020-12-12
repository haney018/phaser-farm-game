// import bg from '../assets/background.png';
var gameData;
var resumeButton;
var restartButton;
var exitButton;

export default class PauseScene extends Phaser.Scene {
  constructor () {
    super('PauseScene');
  }

  init(data) {
    gameData = data;
  }

  preload() {
    this.load.image('modal', require(`../assets/gen_overlayblob.png`));
    this.load.image('char1', require(`../assets/gen_eggsplain_pause.png`));
    this.load.image('char2', require(`../assets/gen_eggsplore_pause.png`));
    this.load.image('resumeButton', require('../assets/btn_continue.png'));
    this.load.image('restartButton', require('../assets/btn_restart.png'));
    this.load.image('exitButton', require('../assets/btn_exit.png'));
  }

  create() {
    let modal = this.add.image(0, 0, 'modal');
    modal.setOrigin(0, 0);

    const screenCenterX = this.cameras.main.worldView.x + this.cameras.main.width / 2;

    let text1 = this.add.text(screenCenterX, 300, 'GAME PAUSED', {
      wordWrap: { width: 1200, useAdvancedWrap: true }
    });
    text1.setOrigin(0.5);
    text1.setColor('orange');
    text1.setFontFamily('Toriga');
    text1.setFontSize(110);
    text1.setAlign('center');

    let char1 = this.add.image(300, 400, 'char1');
    char1.setOrigin(0, 0);

    let char2 = this.add.image(1300, 400, 'char2');
    char2.setOrigin(0, 0);

    resumeButton = this.add.image(screenCenterX, 500, 'resumeButton');
    resumeButton.setOrigin(0.5);
    resumeButton.setInteractive( { useHandCursor: true  } );
    resumeButton.on('pointerover', () => {
      this.tweens.add({
        targets: resumeButton,
        scale: { value: 1.1, duration: 100, ease: 'Power1' },
      });
    })

    resumeButton.on('pointerout', () => {
      this.tweens.add({
        targets: resumeButton,
        scale: { value: 1, duration: 100, ease: 'Power1' },
      });
    })

    resumeButton.on('pointerdown', () => {
      this.tweens.add({
        targets: resumeButton,
        scale: { value: 0.9, duration: 100, ease: 'Power1' },
        onComplete: () => {
          this.scene.resume(gameData.sceneName);
          this.scene.stop();
        }
      });
    });

    restartButton = this.add.image(screenCenterX, 650, 'restartButton');
    restartButton.setOrigin(0.5);
    restartButton.setInteractive( { useHandCursor: true  } );
    restartButton.on('pointerover', () => {
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