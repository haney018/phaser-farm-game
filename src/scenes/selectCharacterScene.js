var gameData
var text1;
var char1;
var char2;
var selectedCharacter;
var selectPlayButton;

export default class SelectCharacterScene extends Phaser.Scene {
  constructor () {
    super('SelectCharacterScene');
  }

  init(data) {
    gameData = data;
  }

  preload() {
    this.load.image('selectModal', require(`../assets/gen_overlayblob.png`));
    this.load.image('chooseChar1', require(`../assets/gen_char_eggsplore.png`));
    this.load.image('chooseChar1Select', require(`../assets/gen_char_eggsplore_select.png`));
    this.load.image('chooseChar2', require(`../assets/gen_char_eggsplain.png`));
    this.load.image('chooseChar2Select', require(`../assets/gen_char_eggsplain_select.png`));
    this.load.image('selectPlayButton', require('../assets/btn_play.png'));
  }

  create() {
    let selectModal = this.add.image(0, 0, 'selectModal');
    selectModal.setOrigin(0, 0);

    const screenCenterX = this.cameras.main.worldView.x + this.cameras.main.width / 2;

    text1 = this.add.text(screenCenterX, 200, gameData.gameName);
    text1.setOrigin(0.5);
    text1.setColor('orange');
    text1.setFontFamily('Toriga');
    text1.setFontSize(80);
    text1.setAlign('left');

    text1.width = selectModal.displayWidth;

    let text2 = this.add.text(screenCenterX, 290, 'Choose your character');
    text2.setOrigin(0.5);
    text2.setColor('blue');
    text2.setFontFamily('Toriga');
    text2.setFontSize(80);
    text2.setAlign('center');

    char1 = this.add.image(540, 350, 'chooseChar1');
    char1.setOrigin(0, 0);
    char1.setInteractive( { useHandCursor: true  } );

    char1.on('pointerdown', () => {
      char1.setTexture('chooseChar1Select');
      char2.setTexture('chooseChar2');
      selectedCharacter = 'eggsplore'
    });

    char2 = this.add.image(1050, 350, 'chooseChar2');
    char2.setOrigin(0, 0);
    char2.setInteractive( { useHandCursor: true  } );

    char2.on('pointerdown', () => {
      char1.setTexture('chooseChar1');
      char2.setTexture('chooseChar2Select');
      selectedCharacter = 'eggsplain'
    });

    selectPlayButton = this.add.image(screenCenterX, 960, 'selectPlayButton');
    selectPlayButton.setOrigin(0.5);
    selectPlayButton.setInteractive( { useHandCursor: true  } );

    selectPlayButton.on('pointerover', () => {
      this.tweens.add({
        targets: selectPlayButton,
        scale: { value: 1.1, duration: 100, ease: 'Power1' },
      });
    })


    selectPlayButton.on('pointerout', () => {
      this.tweens.add({
        targets: selectPlayButton,
        scale: { value: 1, duration: 100, ease: 'Power1' },
      });
    })

    selectPlayButton.on('pointerdown', () => {
      this.tweens.add({
        targets: selectPlayButton,
        scale: { value: 0.9, duration: 100, ease: 'Power1' },
        onComplete: () => {
          if (selectedCharacter) {
            gameData['player'] = selectedCharacter;
            this.scene.launch(gameData.sceneName, gameData);
            this.scene.stop();
          }
        }
      });
    })
  }

  update() {
    selectPlayButton.setVisible(selectedCharacter)
  }
}