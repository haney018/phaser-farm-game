var activeGameId = 'sunny';
var counter = 0;
var loadingText;
var gameData = {
  'sunny': {
    gameId: 'sunny',
    gameName: 'Sunny Side',
    sceneName: 'GameSunny',
    introPath: 'sunny-side/sunny_intro.png',
    worldPath: 'sunny-side/sunny_background.png',
    helpPath: 'sunny-side/sunny_instructions.png',
    winText: 'You provided enough power to the egg factory',
    loseText: 'You weren\'t able to supply enough power to the egg factory',
    player: null
  },
  'fowl': {
    gameId: 'fowl',
    gameName: 'Fowl Fertilizer',
    sceneName: 'GameFowl',
    introPath: 'fowl-fertilizer/fowlintro.png',
    worldPath: 'fowl-fertilizer/fowlbackground.png',
    helpPath: 'fowl-fertilizer/fowlinstructions.png',
    winText: 'You emptied the chicken coop within the time limit',
    loseText: 'You left the hens feeling agitated inside their coop',
    player: null
  },
  'shade': {
    gameId: 'shade',
    gameName: 'Scrambled Shade',
    sceneName: 'GameScrambled',
    introPath: 'scrambled-shade/shade_intro.png',
    worldPath: 'scrambled-shade/shade_backround.jpg',
    helpPath: 'scrambled-shade/shade_instructions.png',
    winText: 'You sure made the hens had shelter out of the hot sun',
    loseText: 'You didn\'t give the hens enough shade out of the hot sun',
    player: null
  }
}

export default class ContainerScene extends Phaser.Scene {
  constructor () {
    super('ContainerScene');
  }

  preload() {
    this.load.image('world', require(`../assets/${gameData[activeGameId].worldPath}`));
  }

  create() {
    let world = this.add.image(0, 0, 'world');
    world.setOrigin(0, 0);

    let screenCenterX = this.cameras.main.worldView.x + this.cameras.main.width / 2;

    let testText = this.add.text(screenCenterX, 200, '', {
      wordWrap: { width: 1200, useAdvancedWrap: true, font: 'Toriga' }
    });
    testText.setOrigin(0.5);
    testText.setColor('#00a0e0');

    loadingText = this.add.text(screenCenterX, 450, 'Loading...', {
      wordWrap: { width: 1200, useAdvancedWrap: true, font: 'Toriga' }
    });
    loadingText.setOrigin(0.5);
    loadingText.setColor('#00a0e0');
    loadingText.setFontFamily('Toriga');
    loadingText.setFontSize(100);
    loadingText.setAlign('center');

    this.scene.launch('StartScene', gameData[activeGameId]);
  }

  update() {
    // loadingText.setFontFamily('Toriga');
    this.time.addEvent({
      delay: 1000,                // ms
      callback: () => {
        loadingText.setFontFamily('Toriga');

        if (counter < 4) {
          let currentText = loadingText.text;
          loadingText.setText(currentText);
        } else {
          counter = 0;
        }
        counter++;
      },
      loop: true
    });
  }
}