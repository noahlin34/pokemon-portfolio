import { Scene } from 'phaser';
import { TILE_SIZE } from '../constants';

// Tile colors indexed by tile ID (1-7)
const TILE_COLORS: Record<number, { bg: string; detail?: { color: string; x: number; y: number; w: number; h: number }[] }> = {
    1: { bg: '#7bc47b' }, // grass
    2: { bg: '#2d6a2e', detail: [{ color: '#1a4a1c', x: 4, y: 2, w: 8, h: 10 }] }, // tree
    3: { bg: '#c8a96e', detail: [{ color: '#b89858', x: 0, y: 7, w: 16, h: 2 }] }, // path
    4: { bg: '#4a80c4', detail: [{ color: '#6aade0', x: 2, y: 3, w: 4, h: 2 }, { color: '#6aade0', x: 9, y: 9, w: 5, h: 2 }] }, // water
    5: { bg: '#888888', detail: [{ color: '#666666', x: 0, y: 13, w: 16, h: 3 }] }, // building wall
    6: { bg: '#d4845a', detail: [{ color: '#c07040', x: 5, y: 8, w: 6, h: 8 }] }, // door
    7: { bg: '#7bc47b', detail: [// flower
        { color: '#ffff55', x: 6, y: 5, w: 4, h: 4 },
        { color: '#ff69b4', x: 4, y: 4, w: 2, h: 2 },
        { color: '#ff69b4', x: 10, y: 4, w: 2, h: 2 },
        { color: '#ff69b4', x: 4, y: 8, w: 2, h: 2 },
        { color: '#ff69b4', x: 10, y: 8, w: 2, h: 2 },
    ]},
};

export class Preloader extends Scene {
    constructor() {
        super('Preloader');
    }

    create() {
        this.createTileset();
        this.createAnimations();
        this.scene.start('Overworld');
    }

    private createTileset() {
        const numTiles = 7;
        const ct = this.textures.createCanvas('tileset', TILE_SIZE * numTiles, TILE_SIZE)!;
        const ctx = ct.context;

        for (let id = 1; id <= numTiles; id++) {
            const ox = (id - 1) * TILE_SIZE;
            const { bg, detail } = TILE_COLORS[id];

            ctx.fillStyle = bg;
            ctx.fillRect(ox, 0, TILE_SIZE, TILE_SIZE);

            if (detail) {
                for (const d of detail) {
                    ctx.fillStyle = d.color;
                    ctx.fillRect(ox + d.x, d.y, d.w, d.h);
                }
            }

            // Subtle grid border
            ctx.strokeStyle = 'rgba(0,0,0,0.1)';
            ctx.lineWidth = 0.5;
            ctx.strokeRect(ox + 0.25, 0.25, TILE_SIZE - 0.5, TILE_SIZE - 0.5);
        }

        ct?.refresh();
    }

    private createAnimations() {
        // NPC idle bob (we'll create NPC textures per-scene since they use graphics)
        // Animations are registered globally on the game's anims manager so they
        // persist across scenes. Currently we use Graphics objects for characters
        // so no sprite-sheet animations are needed yet.
    }
}
