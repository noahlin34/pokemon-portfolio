import { NPCData } from '../objects/NPC';
import { SignData } from '../objects/Sign';

const G = 1; // grass
const T = 2; // tree
const P = 3; // path
const W = 4; // water
const B = 5; // building wall
const D = 6; // door (walkable, triggers scene transition)
const F = 7; // flower

/**
 * Builds a 30-wide x 20-tall overworld tile map.
 *
 * Layout:
 *   - Border of trees
 *   - Horizontal path at rows 9-10 linking buildings
 *   - Vertical path at cols 14-15 linking buildings
 *   - Four buildings at the corners (wall tiles) with a door tile at the entrance
 *   - Small ponds, flowers, and inner trees for visual interest
 */
export function buildOverworldMap(): number[][] {
    const COLS = 30, ROWS = 20;
    const map: number[][] = Array.from({ length: ROWS }, () => Array(COLS).fill(G));

    // Border trees
    for (let x = 0; x < COLS; x++) { map[0][x] = T; map[ROWS - 1][x] = T; }
    for (let y = 0; y < ROWS; y++) { map[y][0] = T; map[y][COLS - 1] = T; }

    // Horizontal path (rows 9-10)
    for (let x = 1; x < COLS - 1; x++) { map[9][x] = P; map[10][x] = P; }

    // Vertical path (cols 14-15)
    for (let y = 1; y < ROWS - 1; y++) { map[y][14] = P; map[y][15] = P; }

    // ── BUILDINGS ────────────────────────────────────────────────────────────

    // House (About Me): rows 2-7, cols 2-8
    for (let x = 2; x <= 8; x++) for (let y = 2; y <= 7; y++) map[y][x] = B;
    map[8][5] = D; // door faces south toward horizontal path

    // Lab (Projects): rows 2-7, cols 21-27
    for (let x = 21; x <= 27; x++) for (let y = 2; y <= 7; y++) map[y][x] = B;
    map[8][24] = D;

    // Gym (Skills): rows 12-17, cols 2-8
    for (let x = 2; x <= 8; x++) for (let y = 12; y <= 17; y++) map[y][x] = B;
    map[11][5] = D; // door faces north toward horizontal path

    // Pokecenter (Contact): rows 12-17, cols 21-27
    for (let x = 21; x <= 27; x++) for (let y = 12; y <= 17; y++) map[y][x] = B;
    map[11][24] = D;

    // ── WATER FEATURES ───────────────────────────────────────────────────────
    // Small ponds between buildings and central path
    for (let x = 10; x <= 12; x++) { for (let y = 5; y <= 7; y++) map[y][x] = W; }  // top-left pond
    for (let x = 17; x <= 19; x++) { for (let y = 5; y <= 7; y++) map[y][x] = W; }  // top-right pond
    for (let x = 10; x <= 12; x++) { for (let y = 12; y <= 14; y++) map[y][x] = W; } // bottom-left pond
    for (let x = 17; x <= 19; x++) { for (let y = 12; y <= 14; y++) map[y][x] = W; } // bottom-right pond

    // ── FLOWERS ──────────────────────────────────────────────────────────────
    const flowers: [number, number][] = [
        [2, 10], [2, 19], [3, 10], [3, 19],
        [5, 20], [16, 10], [16, 20], [18, 10], [18, 19],
    ];
    for (const [y, x] of flowers) {
        if (map[y]?.[x] === G) map[y][x] = F;
    }

    // ── INNER TREES ──────────────────────────────────────────────────────────
    const innerTrees: [number, number][] = [
        [2, 9], [2, 20], [3, 20], [17, 20], [18, 9], [18, 20],
    ];
    for (const [y, x] of innerTrees) {
        if (map[y]?.[x] === G) map[y][x] = T;
    }

    return map;
}

// ── DOOR CONFIGS ─────────────────────────────────────────────────────────────

export interface DoorConfig {
    tileX: number;
    tileY: number;
    targetScene: string;
    /** Where the player spawns inside the target scene */
    spawnTileX: number;
    spawnTileY: number;
}

export const OVERWORLD_DOORS: DoorConfig[] = [
    { tileX: 5,  tileY: 8,  targetScene: 'House',      spawnTileX: 5, spawnTileY: 7 },
    { tileX: 24, tileY: 8,  targetScene: 'Projects',   spawnTileX: 5, spawnTileY: 7 },
    { tileX: 5,  tileY: 11, targetScene: 'Gym',        spawnTileX: 5, spawnTileY: 2 },
    { tileX: 24, tileY: 11, targetScene: 'Pokecenter', spawnTileX: 5, spawnTileY: 2 },
];

// ── NPC CONFIGS ──────────────────────────────────────────────────────────────

export const OVERWORLD_NPCS: NPCData[] = [
    {
        tileX: 16,
        tileY: 9,
        name: 'Guide',
        color: 0x27ae60,
        dialog: [
            'Welcome, traveler! Use ARROW KEYS',
            'or WASD to move around.',
            'Press SPACE to talk to people',
            'and read signs.',
            'Each building reveals a part of',
            'my story. Explore them all!',
        ],
    },
    {
        tileX: 10,
        tileY: 3,
        name: 'Villager',
        color: 0x8e44ad,
        dialog: [
            'That blue building is the',
            'ABOUT ME HOUSE.',
            'Head inside to learn about',
            'the developer\'s background!',
        ],
    },
    {
        tileX: 20,
        tileY: 3,
        name: 'Villager',
        color: 0xe67e22,
        dialog: [
            'The PROJECTS LAB to the east',
            'showcases software I\'ve built.',
            'Walk up to a terminal',
            'and press SPACE to read more!',
        ],
    },
    {
        tileX: 10,
        tileY: 16,
        name: 'Trainer',
        color: 0xc0392b,
        dialog: [
            'Think you can handle the',
            'SKILLS GYM?',
            'Inside you\'ll find my technical',
            'skills and areas of expertise.',
        ],
    },
    {
        tileX: 20,
        tileY: 16,
        name: 'Nurse Joy',
        color: 0xe91e8c,
        dialog: [
            'Welcome to the POKÉCENTER!',
            'Inside you\'ll find contact info,',
            'social links, and a link to',
            'download my résumé. Good luck!',
        ],
    },
];

// ── SIGN CONFIGS ─────────────────────────────────────────────────────────────

export const OVERWORLD_SIGNS: SignData[] = [
    { tileX: 5,  tileY: 1,  lines: ['ABOUT ME HOUSE', 'Learn my story and background!'] },
    { tileX: 24, tileY: 1,  lines: ['PROJECTS LAB',   'See the software I\'ve built.'] },
    { tileX: 5,  tileY: 18, lines: ['SKILLS GYM',     'My technical expertise.'] },
    { tileX: 24, tileY: 18, lines: ['POKÉCENTER',     'Contact info and social links.'] },
    { tileX: 14, tileY: 1,  lines: ['TOWN SQUARE',    'Welcome, traveler!', 'Press SPACE near anything\nto interact.'] },
];
