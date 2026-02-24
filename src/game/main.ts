import { AUTO, Game } from 'phaser';
import { Boot } from './scenes/Boot';
import { Preloader } from './scenes/Preloader';
import { OverworldScene } from './scenes/OverworldScene';
import { UIScene } from './scenes/UIScene';
import { HouseScene } from './scenes/HouseScene';
import { ProjectsScene } from './scenes/ProjectsScene';
import { GymScene } from './scenes/GymScene';
import { PokecenterScene } from './scenes/PokecenterScene';

// Game canvas = 480x320 (logical resolution)
// Scale.FIT scales it to fill the window while keeping aspect ratio.
// Camera zoom = 2 means the player sees 240x160 game-pixels of world space,
// giving the chunky pixel-art look of a GBA Pokemon game.
const config: Phaser.Types.Core.GameConfig = {
    type: AUTO,
    width: 480,
    height: 320,
    backgroundColor: '#000000',
    pixelArt: true,
    roundPixels: true,
    parent: 'game-container',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 480,
        height: 320,
    },
    scene: [Boot, Preloader, OverworldScene, UIScene, HouseScene, ProjectsScene, GymScene, PokecenterScene],
};

const StartGame = (parent: string) => new Game({ ...config, parent });

export default StartGame;
