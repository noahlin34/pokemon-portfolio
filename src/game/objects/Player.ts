import Phaser from 'phaser';
import { TILE_SIZE, WALKABLE_TILES, TILE, DIR, Direction } from '../constants';

export interface PlayerConfig {
    scene: Phaser.Scene;
    tileX: number;
    tileY: number;
    mapData: number[][];
    /** Extra tile positions (as 'x,y' strings) that block movement — e.g. NPCs */
    blockedExtra?: Set<string>;
}

const MOVE_DURATION = 140; // ms per tile

export class Player {
    /** The Graphics object that represents the player body — follow this with the camera */
    readonly body: Phaser.GameObjects.Graphics;

    private scene: Phaser.Scene;
    private tileX: number;
    private tileY: number;
    private facing: Direction = DIR.DOWN;
    private isMoving = false;
    private mapData: number[][];
    private blockedExtra: Set<string>;

    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private wasd!: { up: Phaser.Input.Keyboard.Key; down: Phaser.Input.Keyboard.Key; left: Phaser.Input.Keyboard.Key; right: Phaser.Input.Keyboard.Key };
    private spaceKey!: Phaser.Input.Keyboard.Key;
    private enterKey!: Phaser.Input.Keyboard.Key;

    private onInteractCb?: (tileX: number, tileY: number, facing: Direction) => void;
    private onDoorCb?: (tileX: number, tileY: number) => void;

    constructor({ scene, tileX, tileY, mapData, blockedExtra }: PlayerConfig) {
        this.scene = scene;
        this.tileX = tileX;
        this.tileY = tileY;
        this.mapData = mapData;
        this.blockedExtra = blockedExtra ?? new Set();

        // Graphics positioned at tile top-left; shapes drawn in local (0,0)-(16,16) coords
        this.body = scene.add.graphics();
        this.body.setPosition(tileX * TILE_SIZE, tileY * TILE_SIZE);
        this.body.setDepth(10);
        this.draw();

        const kb = scene.input.keyboard!;
        this.cursors = kb.createCursorKeys();
        this.wasd = {
            up:    kb.addKey(Phaser.Input.Keyboard.KeyCodes.W),
            down:  kb.addKey(Phaser.Input.Keyboard.KeyCodes.S),
            left:  kb.addKey(Phaser.Input.Keyboard.KeyCodes.A),
            right: kb.addKey(Phaser.Input.Keyboard.KeyCodes.D),
        };
        this.spaceKey = kb.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.enterKey = kb.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    }

    /** Draw a simple placeholder character in local tile space (0-15, 0-15) */
    private draw() {
        this.body.clear();
        // Legs
        this.body.fillStyle(0x2c3e50);
        this.body.fillRect(4, 10, 3, 6);
        this.body.fillRect(9, 10, 3, 6);
        // Torso
        this.body.fillStyle(0xe74c3c);
        this.body.fillRect(4, 5, 8, 6);
        // Head
        this.body.fillStyle(0xffc8a0);
        this.body.fillRect(5, 1, 6, 5);
        // Hair
        this.body.fillStyle(0x5d3a1a);
        this.body.fillRect(5, 1, 6, 2);
        // Eyes
        this.body.fillStyle(0x111111);
        this.body.fillRect(6, 4, 1, 1);
        this.body.fillRect(9, 4, 1, 1);
    }

    onInteract(cb: (tileX: number, tileY: number, facing: Direction) => void) {
        this.onInteractCb = cb;
    }

    onDoor(cb: (tileX: number, tileY: number) => void) {
        this.onDoorCb = cb;
    }

    private canWalkTo(tx: number, ty: number): boolean {
        const rows = this.mapData.length;
        const cols = this.mapData[0]?.length ?? 0;
        if (tx < 0 || tx >= cols || ty < 0 || ty >= rows) return false;
        if (this.blockedExtra.has(`${tx},${ty}`)) return false;
        return WALKABLE_TILES.has(this.mapData[ty][tx]);
    }

    private move(dx: number, dy: number, dir: Direction) {
        if (this.isMoving) return;
        this.facing = dir;

        const newTileX = this.tileX + dx;
        const newTileY = this.tileY + dy;
        if (!this.canWalkTo(newTileX, newTileY)) return;

        this.tileX = newTileX;
        this.tileY = newTileY;
        this.isMoving = true;

        this.scene.tweens.add({
            targets: this.body,
            x: newTileX * TILE_SIZE,
            y: newTileY * TILE_SIZE,
            duration: MOVE_DURATION,
            ease: 'Linear',
            onComplete: () => {
                this.isMoving = false;
                const tile = this.mapData[this.tileY]?.[this.tileX];
                if (tile === TILE.DOOR) {
                    this.onDoorCb?.(this.tileX, this.tileY);
                }
            },
        });
    }

    update() {
        if (this.isMoving) return;

        if (Phaser.Input.Keyboard.JustDown(this.spaceKey) || Phaser.Input.Keyboard.JustDown(this.enterKey)) {
            const dx = this.facing === DIR.LEFT ? -1 : this.facing === DIR.RIGHT ? 1 : 0;
            const dy = this.facing === DIR.UP   ? -1 : this.facing === DIR.DOWN  ? 1 : 0;
            this.onInteractCb?.(this.tileX + dx, this.tileY + dy, this.facing);
            return;
        }

        const { cursors, wasd } = this;
        if      (cursors.down.isDown  || wasd.down.isDown)  this.move(0,  1, DIR.DOWN);
        else if (cursors.up.isDown    || wasd.up.isDown)    this.move(0, -1, DIR.UP);
        else if (cursors.left.isDown  || wasd.left.isDown)  this.move(-1, 0, DIR.LEFT);
        else if (cursors.right.isDown || wasd.right.isDown) this.move(1,  0, DIR.RIGHT);
    }

    get gridX()     { return this.tileX; }
    get gridY()     { return this.tileY; }
    get direction() { return this.facing; }
}
