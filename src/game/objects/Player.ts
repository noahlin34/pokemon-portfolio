import Phaser from 'phaser';
import { TILE_SIZE, WALKABLE_TILES, TILE, DIR, Direction } from '../constants';
import { EventBus } from '../EventBus';

export interface PlayerConfig {
    scene: Phaser.Scene;
    tileX: number;
    tileY: number;
    mapData: number[][];
    /** Extra tile positions (as 'x,y' strings) that block movement — e.g. NPCs */
    blockedExtra?: Set<string>;
}

/** Pixels per second */
const SPEED = 80;

/**
 * Collision hitbox offsets within the 16×16 sprite.
 * A narrow box near the feet gives natural-feeling wall-sliding.
 */
const HIT_L = 3;   // left edge from px
const HIT_R = 13;  // right edge from px  (10px wide)
const HIT_T = 8;   // top edge from py
const HIT_B = 15;  // bottom edge from py (7px tall, at feet)

export class Player {
    /** The Graphics object that represents the player body — follow this with the camera */
    readonly body: Phaser.GameObjects.Graphics;

    /** Top-left of the 16×16 sprite in world pixel space */
    private px: number;
    private py: number;
    private facing: Direction = DIR.DOWN;
    private mapData: number[][];
    private blockedExtra: Set<string>;

    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private wasd!: { up: Phaser.Input.Keyboard.Key; down: Phaser.Input.Keyboard.Key; left: Phaser.Input.Keyboard.Key; right: Phaser.Input.Keyboard.Key };
    private spaceKey!: Phaser.Input.Keyboard.Key;
    private enterKey!: Phaser.Input.Keyboard.Key;

    private onInteractCb?: (tileX: number, tileY: number, facing: Direction) => void;
    private onDoorCb?: (tileX: number, tileY: number) => void;

    // Virtual D-pad state (set by MobileDPad component via EventBus)
    private dpadDir: Direction | null = null;
    private dpadActionQueued = false;

    /** Prevents the same door tile from triggering twice in a row */
    private lastDoorKey = '';

    constructor({ scene, tileX, tileY, mapData, blockedExtra }: PlayerConfig) {
        this.px = tileX * TILE_SIZE;
        this.py = tileY * TILE_SIZE;
        this.mapData = mapData;
        this.blockedExtra = blockedExtra ?? new Set();

        this.body = scene.add.graphics();
        this.body.setPosition(this.px, this.py);
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

        // Listen for virtual D-pad events from the React MobileDPad component
        EventBus.on('dpad', ({ dir, action }: { dir: Direction; action: 'press' | 'release' }) => {
            if (action === 'press') {
                this.dpadDir = dir;
            } else if (this.dpadDir === dir) {
                this.dpadDir = null;
            }
        });
        EventBus.on('dpad-action', () => {
            this.dpadActionQueued = true;
        });
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

    /** Returns the tile ID at a world-pixel coordinate, treating out-of-bounds and NPC tiles as solid. */
    private tileAt(worldX: number, worldY: number): number {
        const tx = Math.floor(worldX / TILE_SIZE);
        const ty = Math.floor(worldY / TILE_SIZE);
        const rows = this.mapData.length;
        const cols = this.mapData[0]?.length ?? 0;
        if (tx < 0 || tx >= cols || ty < 0 || ty >= rows) return 0;
        if (this.blockedExtra.has(`${tx},${ty}`)) return 0;
        return this.mapData[ty][tx];
    }

    private walkable(worldX: number, worldY: number): boolean {
        return WALKABLE_TILES.has(this.tileAt(worldX, worldY));
    }

    /**
     * Called every frame by the active scene.
     * @param delta - milliseconds since last frame (from Phaser scene update)
     */
    update(delta: number) {
        const { cursors, wasd } = this;

        const left  = cursors.left.isDown  || wasd.left.isDown  || this.dpadDir === DIR.LEFT;
        const right = cursors.right.isDown || wasd.right.isDown || this.dpadDir === DIR.RIGHT;
        const up    = cursors.up.isDown    || wasd.up.isDown    || this.dpadDir === DIR.UP;
        const down  = cursors.down.isDown  || wasd.down.isDown  || this.dpadDir === DIR.DOWN;

        let dx = (right ? 1 : 0) - (left ? 1 : 0);
        let dy = (down  ? 1 : 0) - (up   ? 1 : 0);

        // Normalize diagonal so speed is consistent in all directions
        if (dx !== 0 && dy !== 0) {
            dx *= Math.SQRT1_2;
            dy *= Math.SQRT1_2;
        }

        // Update facing — horizontal direction takes priority
        if      (left  && !right) this.facing = DIR.LEFT;
        else if (right && !left)  this.facing = DIR.RIGHT;
        else if (up    && !down)  this.facing = DIR.UP;
        else if (down  && !up)    this.facing = DIR.DOWN;

        // Interact (SPACE / ENTER / D-pad A button)
        const interactPressed =
            Phaser.Input.Keyboard.JustDown(this.spaceKey) ||
            Phaser.Input.Keyboard.JustDown(this.enterKey) ||
            this.dpadActionQueued;

        if (interactPressed) {
            this.dpadActionQueued = false;
            const faceDx = this.facing === DIR.LEFT ? -1 : this.facing === DIR.RIGHT ? 1 : 0;
            const faceDy = this.facing === DIR.UP   ? -1 : this.facing === DIR.DOWN  ? 1 : 0;
            // Derive player's tile from their sprite center
            const centerTX = Math.floor((this.px + 8) / TILE_SIZE);
            const centerTY = Math.floor((this.py + 8) / TILE_SIZE);
            this.onInteractCb?.(centerTX + faceDx, centerTY + faceDy, this.facing);
        }

        // Apply movement with per-axis collision so the player slides along walls
        const dist = SPEED * (delta / 1000);

        if (dx !== 0) {
            const newPx = this.px + dx * dist;
            const xEdge = dx > 0 ? newPx + HIT_R : newPx + HIT_L;
            if (this.walkable(xEdge, this.py + HIT_T) && this.walkable(xEdge, this.py + HIT_B)) {
                this.px = newPx;
            }
        }

        if (dy !== 0) {
            const newPy = this.py + dy * dist;
            const yEdge = dy > 0 ? newPy + HIT_B : newPy + HIT_T;
            if (this.walkable(this.px + HIT_L, yEdge) && this.walkable(this.px + HIT_R, yEdge)) {
                this.py = newPy;
            }
        }

        this.body.setPosition(this.px, this.py);

        // Door detection — fires when the player's feet are over a DOOR tile
        const doorTX = Math.floor((this.px + 8)     / TILE_SIZE);
        const doorTY = Math.floor((this.py + HIT_B) / TILE_SIZE);
        const doorKey = `${doorTX},${doorTY}`;
        const tileHere = this.mapData[doorTY]?.[doorTX] ?? 0;

        if (tileHere === TILE.DOOR && doorKey !== this.lastDoorKey) {
            this.lastDoorKey = doorKey;
            this.onDoorCb?.(doorTX, doorTY);
        } else if (tileHere !== TILE.DOOR) {
            this.lastDoorKey = '';
        }
    }

    get gridX()     { return Math.floor((this.px + 8) / TILE_SIZE); }
    get gridY()     { return Math.floor((this.py + 8) / TILE_SIZE); }
    get direction() { return this.facing; }
}
