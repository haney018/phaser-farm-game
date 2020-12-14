import './styles/style.css'

import Phaser from 'phaser';
import ContainerScene from './scenes/containerScene';
import GameFowl from './scenes/gameFowl';
import GameScrambled from './scenes/gameScrambled';
import StartScene from './scenes/startScene';
import HelpScene from './scenes/helpScene';
import SelectCharacterScene from './scenes/SelectCharacterScene';
import PauseScene from './scenes/pauseScene';
import WinnerScene from './scenes/winnerScene';
import LoseScene from './scenes/loseScene';

const config = {
  type: Phaser.AUTO,
  parent: "phaser-example",
  width: 1920,
  height: 1080,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    autoRound: false,
  physics: {
    default: 'arcade',
    arcade: { debug: false }
  },
  scene: [
    ContainerScene,
    GameFowl,
    GameScrambled,
    StartScene,
    HelpScene,
    SelectCharacterScene,
    PauseScene,
    WinnerScene,
    LoseScene
  ],
  input: {
    gamepad: true,
    activePointers: 3
  }
};

const game = new Phaser.Game(config);