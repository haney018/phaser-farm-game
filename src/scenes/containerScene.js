var activeGameId = 'shade';
var gameData = {
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
    winText: '',
    loseText: '',
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

    let text1 = this.add.text(600, 150, 'Loading...');
    text1.setOrigin(0, 0);
    text1.setColor('orange');
    text1.setFontFamily('Toriga');
    text1.setFontSize(100);
    text1.setAlign('center');

    this.scene.launch('StartScene', gameData[activeGameId]);
    // this.scene.launch(gameData[activeGameId].sceneName, gameData[activeGameId]);
  }
}