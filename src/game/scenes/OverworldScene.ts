import { Scene } from 'phaser';
import { EventBus } from '../EventBus';
import { Player } from '../objects/Player';
import { NPC } from '../objects/NPC';
import { Sign } from '../objects/Sign';
import { TILE_SIZE, CAMERA_ZOOM, SCENE } from '../constants';
import {
    buildOverworldMap,
    OVERWORLD_DOORS,
    OVERWORLD_NPCS,
    OVERWORLD_SIGNS,
} from '../content/overworldData';
import { ShowDialogPayload } from './UIScene';

export class OverworldScene extends Scene {
    private player!: Player;
    private npcs: NPC[] = [];
    private signs: Sign[] = [];
    private mapData!: number[][];
    private dialogActive = false;
    private transitioning = false;

    constructor() {
        super(SCENE.OVERWORLD);
    }

    create(data?: { spawnTileX?: number; spawnTileY?: number }) {
        this.dialogActive = false;
        this.transitioning = false;
        this.npcs = [];
        this.signs = [];

        this.mapData = buildOverworldMap();

        // Build Phaser tilemap from the 2D data array
        const map = this.make.tilemap({
            data: this.mapData,
            tileWidth: TILE_SIZE,
            tileHeight: TILE_SIZE,
        });
        const tileset = map.addTilesetImage('tileset', 'tileset', TILE_SIZE, TILE_SIZE, 0, 0)!;
        map.createLayer(0, tileset, 0, 0)!.setDepth(0);

        const worldW = this.mapData[0].length * TILE_SIZE;
        const worldH = this.mapData.length * TILE_SIZE;

        this.cameras.main.setBounds(0, 0, worldW, worldH);
        this.cameras.main.setZoom(CAMERA_ZOOM);

        // Spawn player (block NPC tiles so player can't walk through them)
        const spawnX = data?.spawnTileX ?? 17;
        const spawnY = data?.spawnTileY ?? 10;
        const npcBlocked = new Set(OVERWORLD_NPCS.map(n => `${n.tileX},${n.tileY}`));
        this.player = new Player({
            scene: this,
            tileX: spawnX,
            tileY: spawnY,
            mapData: this.mapData,
            blockedExtra: npcBlocked,
        });

        this.cameras.main.startFollow(this.player.body, true);
        this.cameras.main.setFollowOffset(TILE_SIZE / 2, TILE_SIZE / 2);

        // Spawn NPCs
        for (const data of OVERWORLD_NPCS) {
            this.npcs.push(new NPC(this, data));
        }

        // Spawn signs
        for (const data of OVERWORLD_SIGNS) {
            this.signs.push(new Sign(this, data));
        }

        // Player interaction handler
        this.player.onInteract((tx, ty) => {
            if (this.dialogActive) return;

            const npc = this.npcs.find(n => n.isAt(tx, ty));
            if (npc) { this.showDialog(npc.dialog, npc.name); return; }

            const sign = this.signs.find(s => s.isAt(tx, ty));
            if (sign) { this.showDialog(sign.lines, sign.label); return; }
        });

        // Door handler (triggered when player steps onto a DOOR tile)
        this.player.onDoor((tx, ty) => {
            if (this.transitioning) return;
            const door = OVERWORLD_DOORS.find(d => d.tileX === tx && d.tileY === ty);
            if (!door) return;
            this.transitioning = true;
            // Return spawn: one tile in front of the door, back on the path
            const returnY = ty < 10 ? ty + 1 : ty - 1;
            this.cameras.main.fade(250, 0, 0, 0, false, (_cam: Phaser.Cameras.Scene2D.Camera, progress: number) => {
                if (progress === 1) {
                    this.scene.start(door.targetScene, {
                        fromScene: SCENE.OVERWORLD,
                        spawnTileX: door.spawnTileX,
                        spawnTileY: door.spawnTileY,
                        returnTileX: tx,
                        returnTileY: returnY,
                    });
                }
            });
        });

        // Ensure UIScene is running
        if (!this.scene.isActive(SCENE.UI)) {
            this.scene.launch(SCENE.UI);
        }

        this.cameras.main.fadeIn(300, 0, 0, 0);
        EventBus.emit('current-scene-ready', this);
    }

    private showDialog(lines: string[], name?: string) {
        this.dialogActive = true;
        const payload: ShowDialogPayload = {
            lines,
            name,
            onComplete: () => { this.dialogActive = false; },
        };
        this.game.events.emit('show-dialog', payload);
    }

    update(_time: number, delta: number) {
        if (this.dialogActive || this.transitioning) return;
        this.player.update(delta);
    }
}
