import { NPCData } from '../objects/NPC';
import { SignData } from '../objects/Sign';
import { PROJECTS, CONTACT } from './modalData';

const W = 5; // wall
const F = 3; // floor (path tile reused as wood floor)
const D = 6; // door

/** Builds a simple 15-wide × 10-tall interior tilemap */
export function buildIndoorMap(extraWalls?: [number, number][]): number[][] {
    const COLS = 15, ROWS = 10;
    const map: number[][] = Array.from({ length: ROWS }, () => Array(COLS).fill(F));

    // Outer walls
    for (let x = 0; x < COLS; x++) { map[0][x] = W; map[ROWS - 1][x] = W; }
    for (let y = 0; y < ROWS; y++) { map[y][0] = W; map[y][COLS - 1] = W; }

    // Exit door at bottom center
    map[ROWS - 1][7] = D;

    // Optional inner obstacles
    if (extraWalls) {
        for (const [y, x] of extraWalls) {
            if (map[y]?.[x] !== undefined) map[y][x] = W;
        }
    }

    return map;
}

// ── HOUSE (ABOUT ME) ──────────────────────────────────────────────────────────

export const HOUSE_NPCS: NPCData[] = [
    {
        tileX: 4,
        tileY: 4,
        name: 'Mom',
        color: 0xe91e63,
        dialog: [
            // TODO: Fill in personal background
            'Honey, you\'re home!',
            'Tell our guests a little',
            'about yourself!',
        ],
    },
    {
        tileX: 10,
        tileY: 4,
        name: 'Dad',
        color: 0x1565c0,
        dialog: [
            // TODO: Fill in personal details (hometown, education)
            'My kid is a software developer.',
            'Always tinkering and building',
            'cool things!',
        ],
    },
];

export const HOUSE_SIGNS: SignData[] = [
    {
        tileX: 7,
        tileY: 1,
        label: 'Nameplate',
        lines: [
            // TODO: Replace with your name and title
            'NOAH\'S HOUSE',
            'Software Developer',
            'Welcome!',
        ],
    },
    {
        tileX: 2,
        tileY: 2,
        label: 'Bookshelf',
        lines: [
            // TODO: Fill in education details
            'University: TODO',
            'Degree: Computer Science',
            'Graduated: TODO',
        ],
    },
];

// ── PROJECTS LAB ──────────────────────────────────────────────────────────────

export const PROJECTS_NPCS: NPCData[] = [
    {
        tileX: 4,
        tileY: 3,
        name: 'Terminal 1',
        color: 0x00bcd4,
        dialog: [],
        // Opens a rich React modal with project details
        modalEvent: 'open-project',
        modalData: PROJECTS[0],
    },
    {
        tileX: 10,
        tileY: 3,
        name: 'Terminal 2',
        color: 0x00bcd4,
        dialog: [],
        modalEvent: 'open-project',
        modalData: PROJECTS[1],
    },
    {
        tileX: 7,
        tileY: 6,
        name: 'Terminal 3',
        color: 0x00bcd4,
        dialog: [],
        modalEvent: 'open-project',
        modalData: PROJECTS[2],
    },
    {
        tileX: 7,
        tileY: 8,
        name: 'Scientist',
        color: 0x4caf50,
        dialog: [
            'Each terminal holds a project.',
            'Walk up and press SPACE to',
            'read details, view code, or',
            'see a live demo!',
        ],
    },
];

export const PROJECTS_SIGNS: SignData[] = [
    {
        tileX: 7,
        tileY: 1,
        label: 'Lab Sign',
        lines: ['PROJECTS LAB', 'Where ideas become software.'],
    },
];

// ── GYM (SKILLS) ─────────────────────────────────────────────────────────────

export const GYM_NPCS: NPCData[] = [
    {
        tileX: 7,
        tileY: 2,
        name: 'Gym Leader',
        color: 0xf44336,
        dialog: [
            // TODO: Replace with your primary skills
            'I am the SKILLS GYM LEADER!',
            'My domain: Full-Stack Dev.',
            'Languages: TypeScript, Python,',
            'Rust, Go, SQL.',
        ],
    },
    {
        tileX: 3,
        tileY: 5,
        name: 'Trainer',
        color: 0xff9800,
        dialog: [
            'Frontend skills:',
            'React, Phaser 3, CSS,',
            'HTML, Vite, Tailwind.',
        ],
    },
    {
        tileX: 11,
        tileY: 5,
        name: 'Trainer',
        color: 0x9c27b0,
        dialog: [
            'Backend skills:',
            'Node.js, PostgreSQL,',
            'REST APIs, GraphQL,',
            'Docker, AWS.',
        ],
    },
];

export const GYM_SIGNS: SignData[] = [
    {
        tileX: 7,
        tileY: 1,
        label: 'Gym Sign',
        lines: ['SKILLS GYM', 'Test your knowledge!'],
    },
];

// ── POKECENTER (CONTACT) ─────────────────────────────────────────────────────

export const POKECENTER_NPCS: NPCData[] = [
    {
        tileX: 7,
        tileY: 3,
        name: 'Nurse Joy',
        color: 0xe91e8c,
        // Brief in-game greeting, then opens the contact modal
        dialog: [
            'Welcome! Let me pull up',
            'the contact details for you.',
        ],
        modalEvent: 'open-contact',
        modalData: CONTACT,
    },
];

export const POKECENTER_SIGNS: SignData[] = [
    {
        tileX: 7,
        tileY: 1,
        label: 'PC Sign',
        lines: ['POKÉCENTER', 'Your journey starts here!'],
    },
    {
        tileX: 3,
        tileY: 5,
        label: 'GitHub',
        lines: [
            // TODO: Replace with your GitHub URL
            'GITHUB',
            'github.com/your-username',
        ],
    },
    {
        tileX: 11,
        tileY: 5,
        label: 'Resume',
        lines: [
            // TODO: Link to your PDF resume
            'RÉSUMÉ',
            'Available on request!',
        ],
    },
];
