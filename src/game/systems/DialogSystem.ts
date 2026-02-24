import Phaser from 'phaser';

const CHAR_DELAY_MS = 25;   // ms between each character
const LINES_PER_PAGE = 2;   // how many lines visible at once

export class DialogSystem {
    private scene: Phaser.Scene;

    private box!: Phaser.GameObjects.Rectangle;
    private boxBorder!: Phaser.GameObjects.Rectangle;
    private nameTag!: Phaser.GameObjects.Rectangle;
    private nameText!: Phaser.GameObjects.Text;
    private bodyText!: Phaser.GameObjects.Text;
    private arrow!: Phaser.GameObjects.Graphics;

    private pages: string[][] = [];
    private currentPage = 0;
    private isTyping = false;
    private typeTimer?: Phaser.Time.TimerEvent;
    private fullPageText = '';
    private typedChars = 0;
    private isVisible = false;
    private onComplete?: () => void;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.buildUI();
        this.hide();
    }

    private buildUI() {
        const W = this.scene.cameras.main.width;   // 480
        const H = this.scene.cameras.main.height;  // 320

        const BOX_H   = 72;
        const BOX_W   = W - 16;
        const BOX_X   = 8;
        const BOX_Y   = H - BOX_H - 8;
        const PADDING = 8;

        // Outer border (lighter) then inner fill (dark)
        this.boxBorder = this.scene.add.rectangle(BOX_X + BOX_W / 2, BOX_Y + BOX_H / 2, BOX_W, BOX_H, 0xffffff);
        this.boxBorder.setDepth(100).setScrollFactor(0);

        this.box = this.scene.add.rectangle(BOX_X + BOX_W / 2, BOX_Y + BOX_H / 2, BOX_W - 4, BOX_H - 4, 0x1a1a2e);
        this.box.setDepth(101).setScrollFactor(0);

        // Name tag (shown when speaker has a name)
        this.nameTag = this.scene.add.rectangle(BOX_X + 40, BOX_Y - 10, 80, 18, 0x1a1a2e);
        this.nameTag.setDepth(101).setScrollFactor(0).setStrokeStyle(1, 0xffffff);

        this.nameText = this.scene.add.text(BOX_X + PADDING, BOX_Y - 17, '', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '6px',
            color: '#ffffaa',
        }).setDepth(102).setScrollFactor(0);

        // Body text
        this.bodyText = this.scene.add.text(BOX_X + PADDING + 2, BOX_Y + PADDING, '', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '8px',
            color: '#ffffff',
            wordWrap: { width: BOX_W - PADDING * 2 - 8 },
            lineSpacing: 6,
        }).setDepth(102).setScrollFactor(0);

        // Continue arrow (down-pointing triangle)
        this.arrow = this.scene.add.graphics();
        this.arrow.setDepth(102).setScrollFactor(0);
        this.arrow.fillStyle(0xffffff);
        const ax = BOX_X + BOX_W - 14;
        const ay = BOX_Y + BOX_H - 10;
        this.arrow.fillTriangle(ax, ay - 4, ax + 8, ay - 4, ax + 4, ay);
    }

    show(lines: string[], name = '', onComplete?: () => void) {
        this.pages = this.chunkIntoPages(lines);
        this.currentPage = 0;
        this.onComplete = onComplete;
        this.isVisible = true;

        // Update name tag visibility
        if (name) {
            this.nameTag.setVisible(true);
            this.nameText.setText(name).setVisible(true);
        } else {
            this.nameTag.setVisible(false);
            this.nameText.setVisible(false);
        }

        this.setVisibility(true);
        this.showPage(0);
    }

    private chunkIntoPages(lines: string[]): string[][] {
        const pages: string[][] = [];
        for (let i = 0; i < lines.length; i += LINES_PER_PAGE) {
            pages.push(lines.slice(i, i + LINES_PER_PAGE));
        }
        return pages;
    }

    private showPage(index: number) {
        if (index >= this.pages.length) {
            this.hide();
            this.onComplete?.();
            return;
        }

        this.arrow.setVisible(false);
        this.fullPageText = this.pages[index].join('\n');
        this.typedChars = 0;
        this.isTyping = true;
        this.bodyText.setText('');
        this.typeTimer?.remove();

        this.typeTimer = this.scene.time.addEvent({
            delay: CHAR_DELAY_MS,
            repeat: this.fullPageText.length - 1,
            callback: () => {
                this.typedChars++;
                this.bodyText.setText(this.fullPageText.substring(0, this.typedChars));
                if (this.typedChars >= this.fullPageText.length) {
                    this.isTyping = false;
                    this.arrow.setVisible(true);
                }
            },
        });
    }

    /** Call on SPACE / ENTER press. Returns true if dialog consumed the input. */
    advance(): boolean {
        if (!this.isVisible) return false;

        if (this.isTyping) {
            // Skip to end of current page
            this.typeTimer?.remove();
            this.isTyping = false;
            this.bodyText.setText(this.fullPageText);
            this.arrow.setVisible(true);
            return true;
        }

        this.currentPage++;
        if (this.currentPage < this.pages.length) {
            this.showPage(this.currentPage);
        } else {
            this.hide();
            this.onComplete?.();
        }
        return true;
    }

    hide() {
        this.isVisible = false;
        this.typeTimer?.remove();
        this.setVisibility(false);
    }

    private setVisibility(v: boolean) {
        this.box.setVisible(v);
        this.boxBorder.setVisible(v);
        this.bodyText.setVisible(v);
        this.arrow.setVisible(v);
        if (!v) {
            this.nameTag.setVisible(false);
            this.nameText.setVisible(false);
        }
    }

    get isShowing() { return this.isVisible; }
}
