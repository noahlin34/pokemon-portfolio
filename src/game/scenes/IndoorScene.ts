import { Scene } from 'phaser';
import { EventBus } from '../EventBus';
import { Player } from '../objects/Player';
import { NPC, NPCData } from '../objects/NPC';
import { Sign, SignData } from '../objects/Sign';
import { TILE_SIZE, CAMERA_ZOOM, SCENE } from '../constants';
import { buildIndoorMap } from '../content/indoorData';
import { ShowDialogPayload } from './UIScene';

export interface IndoorSceneConfig {
    npcs: NPCData[];
    signs: SignData[];
    /** Hex color for the background (behind tilemap), e.g. 0x5c3a1a for wood */
    bgColor?: number;
    /** Tween color used in fade-in, default black */
    fadeColor?: [number, number, number];
}

/**
 * Base class for all interior building scenes.
 * Handles: tilemap, player, NPCs, signs, dialog, exit door.
 */
export abstract class IndoorScene extends Scene {
    protected player!: Player;
    protected npcs: NPC[] = [];
    protected signs: Sign[] = [];
    protected mapData!: number[][];
    protected dialogActive = false;
    protected transitioning = false;

    /** Overworld tile position to return the player to on exit */
    private returnTileX = 17;
    private returnTileY = 10;

    protected abstract getConfig(): IndoorSceneConfig;

    create(data?: { fromScene?: string; spawnTileX?: number; spawnTileY?: number; returnTileX?: number; returnTileY?: number }) {
        this.dialogActive = false;
        this.transitioning = false;
        this.npcs = [];
        this.signs = [];

        // Store return position for when player exits
        this.returnTileX = data?.returnTileX ?? 17;
        this.returnTileY = data?.returnTileY ?? 10;

        const { npcs, signs } = this.getConfig();
        this.mapData = buildIndoorMap();
        const npcBlocked = new Set(npcs.map(n => `${n.tileX},${n.tileY}`));

        // Tilemap
        const map = this.make.tilemap({
            data: this.mapData,
            tileWidth: TILE_SIZE,
            tileHeight: TILE_SIZE,
        });
        const tileset = map.addTilesetImage('tileset', 'tileset', TILE_SIZE, TILE_SIZE, 0, 0)!;
        map.createLayer(0, tileset, 0, 0)!.setDepth(0);

        const worldW = this.mapData[0].length * TILE_SIZE;
        const worldH = this.mapData.length * TILE_SIZE;

        // Camera — no scroll needed for this small room, but bounds prevent overdraw
        this.cameras.main.setBounds(0, 0, worldW, worldH);
        this.cameras.main.setZoom(CAMERA_ZOOM);

        // Player spawns at given position (or just inside the door)
        const spawnX = data?.spawnTileX ?? 7;
        const spawnY = data?.spawnTileY ?? 7;
        this.player = new Player({
            scene: this,
            tileX: spawnX,
            tileY: spawnY,
            mapData: this.mapData,
            blockedExtra: npcBlocked,
        });
        this.cameras.main.startFollow(this.player.body, true);
        this.cameras.main.setFollowOffset(TILE_SIZE / 2, TILE_SIZE / 2);

        // NPCs
        for (const npcData of npcs) this.npcs.push(new NPC(this, npcData));
        // Signs
        for (const signData of signs) this.signs.push(new Sign(this, signData));

        // Interaction
        this.player.onInteract((tx, ty) => {
            if (this.dialogActive) return;
            const npc = this.npcs.find(n => n.isAt(tx, ty));
            if (npc) {
                this.handleNPCInteract(npc);
                return;
            }
            const sign = this.signs.find(s => s.isAt(tx, ty));
            if (sign) { this.showDialog(sign.lines, sign.label); return; }
        });

        // Exit door → back to Overworld
        this.player.onDoor((tx, ty) => {
            if (this.transitioning) return;
            // Door is at (7, 9) — if player steps on it, go back
            if (tx === 7 && ty === this.mapData.length - 1) {
                this.transitioning = true;
                this.cameras.main.fade(250, 0, 0, 0, false, (_cam: Phaser.Cameras.Scene2D.Camera, progress: number) => {
                    if (progress === 1) {
                        this.scene.start(SCENE.OVERWORLD, {
                            spawnTileX: this.returnTileX,
                            spawnTileY: this.returnTileY,
                        });
                    }
                });
            }
        });

        // Ensure UIScene is running
        if (!this.scene.isActive(SCENE.UI)) {
            this.scene.launch(SCENE.UI);
        }

        this.cameras.main.fadeIn(300, 0, 0, 0);
        EventBus.emit('current-scene-ready', this);
    }

    private handleNPCInteract(npc: NPC) {
        const emitModal = () => {
            if (npc.modalEvent) {
                EventBus.emit(npc.modalEvent, npc.modalData);
            }
        };

        if (npc.dialog.length > 0) {
            // Show dialog first, then open modal on completion
            this.showDialog(npc.dialog, npc.name, emitModal);
        } else {
            // No dialog — open modal directly
            emitModal();
        }
    }

    private showDialog(lines: string[], name?: string, onComplete?: () => void) {
        this.dialogActive = true;
        const payload: ShowDialogPayload = {
            lines,
            name,
            onComplete: () => {
                this.dialogActive = false;
                onComplete?.();
            },
        };
        this.game.events.emit('show-dialog', payload);
    }

    update(_time: number, delta: number) {
        if (this.dialogActive || this.transitioning) return;
        this.player.update(delta);
    }
}
