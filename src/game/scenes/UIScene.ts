import { Scene } from 'phaser';
import { DialogSystem } from '../systems/DialogSystem';

export interface ShowDialogPayload {
    lines: string[];
    name?: string;
    onComplete?: () => void;
}

export class UIScene extends Scene {
    private dialog!: DialogSystem;

    constructor() {
        super({ key: 'UI' });
    }

    create() {
        this.dialog = new DialogSystem(this);

        // World scenes fire events on the Phaser game event bus to show dialog
        this.game.events.on('show-dialog', (payload: ShowDialogPayload) => {
            this.dialog.show(payload.lines, payload.name ?? '', payload.onComplete);
        });

        this.game.events.on('hide-dialog', () => {
            this.dialog.hide();
        });

        // Advance dialog on SPACE or ENTER
        this.input.keyboard!.on('keydown-SPACE', () => this.dialog.advance());
        this.input.keyboard!.on('keydown-ENTER', () => this.dialog.advance());
    }

    get isDialogShowing() {
        return this.dialog?.isShowing ?? false;
    }
}
