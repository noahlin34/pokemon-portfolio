export const TILE_SIZE = 16;
export const WORLD_COLS = 30;
export const WORLD_ROWS = 20;
export const CAMERA_ZOOM = 2;

// Tile IDs (match position in tileset image: ID N -> image column N-1)
export const TILE = {
    GRASS:  1,
    TREE:   2,
    PATH:   3,
    WATER:  4,
    WALL:   5,
    DOOR:   6,
    FLOWER: 7,
} as const;

export const WALKABLE_TILES = new Set<number>([
    TILE.GRASS,
    TILE.PATH,
    TILE.DOOR,
    TILE.FLOWER,
]);

export const SCENE = {
    BOOT:       'Boot',
    PRELOADER:  'Preloader',
    OVERWORLD:  'Overworld',
    HOUSE:      'House',
    PROJECTS:   'Projects',
    GYM:        'Gym',
    POKECENTER: 'Pokecenter',
    UI:         'UI',
} as const;

export const DIR = {
    DOWN:  'down',
    UP:    'up',
    LEFT:  'left',
    RIGHT: 'right',
} as const;

export type Direction = typeof DIR[keyof typeof DIR];
