import Phaser from 'phaser';
import { TILE_SIZE } from '../constants';

export interface SignData {
    tileX: number;
    tileY: number;
    lines: string[];
    label?: string;
}

export class Sign {
    readonly tileX: number;
    readonly tileY: number;
    readonly lines: string[];
    readonly label: string;

    constructor(scene: Phaser.Scene, data: SignData) {
        this.tileX = data.tileX;
        this.tileY = data.tileY;
        this.lines = data.lines;
        this.label = data.label ?? 'Sign';

        const px = data.tileX * TILE_SIZE;
        const py = data.tileY * TILE_SIZE;

        // Draw a small wooden sign post
        const gfx = scene.add.graphics();
        gfx.setDepth(5);
        // Post
        gfx.fillStyle(0x8b5e3c);
        gfx.fillRect(px + 7, py + 8, 2, 8);
        // Sign board
        gfx.fillStyle(0xc8956a);
        gfx.fillRect(px + 2, py + 2, 12, 8);
        gfx.fillStyle(0x8b5e3c);
        gfx.lineStyle(1, 0x8b5e3c);
        gfx.strokeRect(px + 2, py + 2, 12, 8);
        // Exclamation mark (simplified)
        gfx.fillStyle(0x5d3a1a);
        gfx.fillRect(px + 7, py + 3, 2, 4);
        gfx.fillRect(px + 7, py + 8, 2, 1);
    }

    isAt(tileX: number, tileY: number): boolean {
        return this.tileX === tileX && this.tileY === tileY;
    }
}
