import Phaser from 'phaser';
import { TILE_SIZE } from '../constants';

export interface NPCData {
    tileX: number;
    tileY: number;
    /** In-game dialog lines shown via the Pokemon-style text box. */
    dialog: string[];
    name?: string;
    color?: number;
    /**
     * If set, interacting with this NPC emits this event on EventBus (e.g. 'open-project')
     * and opens a React modal overlay instead of (or after) the dialog box.
     */
    modalEvent?: string;
    /** Arbitrary data forwarded to the React modal handler. */
    modalData?: unknown;
}

export class NPC {
    readonly tileX: number;
    readonly tileY: number;
    readonly dialog: string[];
    readonly name: string;
    readonly modalEvent?: string;
    readonly modalData?: unknown;

    private gfx: Phaser.GameObjects.Graphics;

    constructor(scene: Phaser.Scene, data: NPCData) {
        this.tileX = data.tileX;
        this.tileY = data.tileY;
        this.dialog = data.dialog;
        this.name = data.name ?? 'NPC';
        this.modalEvent = data.modalEvent;
        this.modalData = data.modalData;

        const color = data.color ?? 0x3498db;
        const px = data.tileX * TILE_SIZE;
        const py = data.tileY * TILE_SIZE;

        this.gfx = scene.add.graphics();
        this.gfx.setDepth(9);
        this.drawCharacter(px, py, color);
    }

    private drawCharacter(px: number, py: number, bodyColor: number) {
        // Legs
        this.gfx.fillStyle(0x2c3e50);
        this.gfx.fillRect(px + 4, py + 10, 3, 6);
        this.gfx.fillRect(px + 9, py + 10, 3, 6);
        // Torso
        this.gfx.fillStyle(bodyColor);
        this.gfx.fillRect(px + 4, py + 5, 8, 6);
        // Head
        this.gfx.fillStyle(0xffc8a0);
        this.gfx.fillRect(px + 5, py + 1, 6, 5);
        // Hair (blonde)
        this.gfx.fillStyle(0xf1c40f);
        this.gfx.fillRect(px + 5, py + 1, 6, 2);
        // Eyes
        this.gfx.fillStyle(0x111111);
        this.gfx.fillRect(px + 6, py + 4, 1, 1);
        this.gfx.fillRect(px + 9, py + 4, 1, 1);
    }

    isAt(tileX: number, tileY: number): boolean {
        return this.tileX === tileX && this.tileY === tileY;
    }
}
