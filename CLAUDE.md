# Pokemon Portfolio — CLAUDE.md

Personal portfolio website built as a Pokemon Fire Red-style browser RPG.
Visitors walk a top-down tile world, interact with NPCs/signs, and enter buildings to learn about the developer.

---

## Stack

- **Phaser 3.90** — game engine (tilemaps, scenes, tweens, input, camera)
- **React 19** — UI layer for modal overlays rendered on top of the game canvas
- **TypeScript 5.7** — strict mode throughout
- **Vite 6.3** — dev server (port 8080) and production build

---

## Development Commands

```bash
npm run dev-nolog      # start dev server → http://localhost:8080
npm run build-nolog    # production build → dist/
```

> **Always use the `-nolog` variants.** The `dev` and `build` scripts also run `log.js`, which phones home to an external server (`gryzor.co`) — a telemetry beacon left over from the Phaser template. Avoid it.

---

## Project Structure

```
src/
  game/
    constants.ts          # tile IDs, scene keys, directions, camera zoom
    main.ts               # Phaser game config (480×320, pixelArt, FIT scale)
    EventBus.ts           # global Phaser EventEmitter singleton
    scenes/
      Boot.ts             # trivial bootstrap → starts Preloader
      Preloader.ts        # creates programmatic tileset canvas texture
      OverworldScene.ts   # main 30×20 world
      UIScene.ts          # parallel scene hosting DialogSystem
      IndoorScene.ts      # abstract base for all 4 buildings
      HouseScene.ts       # About Me building
      ProjectsScene.ts    # Projects building (terminals → modals)
      GymScene.ts         # Skills building
      PokecenterScene.ts  # Contact building
    objects/
      Player.ts           # Graphics-based, grid movement, WASD+arrows
      NPC.ts              # Graphics-based character, dialog + modal data
      Sign.ts             # Static prop, multi-line text
    systems/
      DialogSystem.ts     # Pokemon-style typewriter text box
    content/
      overworldData.ts    # 30×20 map builder, NPC + sign data
      indoorData.ts       # 15×10 map builder, all 4 buildings' content
      modalData.ts        # ProjectData + ContactData types and filler data
  components/
    ProjectModal.tsx      # rich project card overlay
    ContactPanel.tsx      # contact links overlay
    MobileDPad.tsx        # touch D-pad (only on pointer:coarse devices)
    MusicToggle.tsx       # fixed top-right music on/off button
  App.tsx                 # root: mounts PhaserGame + all overlays
  PhaserGame.tsx          # React wrapper that creates/destroys Phaser instance
  main.tsx                # React root, renders <App> into #root
public/
  style.css               # global reset, canvas { image-rendering: pixelated }
  assets/
    music/overworld.mp3   # (not yet added — MusicToggle fails silently)
    og-preview.png        # (not yet added — referenced in <meta> tags)
index.html                # Google Font "Press Start 2P", full SEO meta tags
vite/
  config.dev.mjs          # dev config (port 8080, relative base)
  config.prod.mjs         # prod config (Terser, Phaser in separate chunk)
```

---

## Key Constants (`src/game/constants.ts`)

| Constant | Value | Notes |
|---|---|---|
| `TILE_SIZE` | 16px | one grid cell |
| `WORLD_COLS` × `WORLD_ROWS` | 30 × 20 | overworld dimensions |
| `CAMERA_ZOOM` | 2× | player sees 240×160 px = 15×10 tiles |
| `MOVE_DURATION` | 140ms | tween time per tile (in Player.ts) |

### Tile IDs
```
1 = GRASS   (walkable)
2 = TREE    (blocked)
3 = PATH    (walkable)
4 = WATER   (blocked)
5 = WALL    (blocked)
6 = DOOR    (walkable, triggers transition)
7 = FLOWER  (walkable)
```

---

## Architecture

### Rendering
- Canvas: 480×320 logical resolution, `Phaser.Scale.FIT` fills the window
- `pixelArt: true, roundPixels: true` in Phaser config + CSS `image-rendering: pixelated`
- No external image files for gameplay — tileset is drawn programmatically in `Preloader.ts` using `textures.createCanvas` (7 tiles × 16px wide)
- Player and NPCs are `Phaser.GameObjects.Graphics` objects (colored rectangles), not sprite sheets

### Grid Movement
- Player is a Graphics object tweened 140ms between tile positions
- `Player.body` is the Graphics object; camera follows it with `setFollowOffset(8, 8)` to center on tile
- `canWalkTo(tx, ty)` checks `WALKABLE_TILES` set + `blockedExtra` (a `Set<string>` of `"x,y"` NPC positions)
- Door tiles (`TILE.DOOR`) fire `onDoorCb` when the player lands on them

### Scene System
```
Boot → Preloader → OverworldScene
                        ↕ (fade transitions)
                   [HouseScene | ProjectsScene | GymScene | PokecenterScene]

UIScene runs in parallel alongside all world scenes (dialog overlay)
```

### Event Flow
```
Player steps on door / presses SPACE near NPC
  → callback in OverworldScene / IndoorScene
    → dialog: game.events.emit('show-dialog', { lines, name, onComplete })
      → UIScene receives it → DialogSystem renders text box
    → modal: EventBus.emit('open-project' | 'open-contact', data)
      → App.tsx receives it → renders ProjectModal or ContactPanel
```

Two-layer event system:
- **`game.events`** (Phaser game-level bus) — internal Phaser scene ↔ UIScene communication
- **`EventBus`** (Phaser EventEmitter singleton in `src/game/EventBus.ts`) — Phaser → React modal triggers and mobile D-pad input

### Dialog vs Modal
- Short NPC text / sign content → **in-game Pokemon text box** (UIScene + DialogSystem)
- Rich project cards / contact links → **React overlay modal** (ProjectModal / ContactPanel)
- NPCs can do both: show dialog first, then emit modal event in `onComplete` callback

---

## Content Customization

All personal content lives in two files. Search for `// TODO:` to find every placeholder.

### `src/game/content/modalData.ts`
Defines `ProjectData` and `ContactData` interfaces and the exported `PROJECTS[]` array and `CONTACT` object. Update these with real project details and contact info.

### `src/game/content/indoorData.ts`
Defines NPC dialog arrays and sign text for all 4 buildings:
- `HOUSE_NPCS`, `HOUSE_SIGNS` — About Me content
- `PROJECTS_NPCS`, `PROJECTS_SIGNS` — terminal NPCs that open project modals
- `GYM_NPCS`, `GYM_SIGNS` — skills content
- `POKECENTER_NPCS`, `POKECENTER_SIGNS` — contact NPC + sign links

NPC `dialog` is a `string[]` shown in the text box. `modalEvent` / `modalData` optionally trigger a React modal after dialog completes.

### `src/game/content/overworldData.ts`
NPC and sign data for the outdoor world. The 5 guide NPCs explain controls and point to buildings. Less likely to need editing.

---

## Adding a New Project

1. Add a `ProjectData` entry to `PROJECTS` in `modalData.ts`
2. Add or update an NPC in `PROJECTS_NPCS` in `indoorData.ts`:
   ```ts
   {
     tileX: 4, tileY: 4,
     name: 'TERMINAL',
     dialog: ['My New Project', 'Press A to view details.'],
     modalEvent: 'open-project',
     modalData: PROJECTS[3],   // index of the new project
   }
   ```

---

## Adding an NPC

NPC shape in `indoorData.ts` / `overworldData.ts`:
```ts
{
  tileX: number,
  tileY: number,
  name: string,
  dialog: string[],         // lines shown in text box (can be empty)
  color?: number,           // 0xRRGGBB hex (defaults to blue)
  modalEvent?: string,      // 'open-project' | 'open-contact'
  modalData?: ProjectData | ContactData,
}
```

NPC positions are automatically added to `blockedExtra` so the player can't walk through them.

---

## Scene Transitions

- **Enter building**: Player steps on `TILE.DOOR` in overworld → camera fade out → launch indoor scene
- **Exit building**: Player steps on door tile at (7, 9) in indoor scene → fade out → return to overworld
- **Return position**: Calculated in `OverworldScene` as `returnY = doorTileY < 10 ? doorTileY + 1 : doorTileY - 1` (one tile away from the building door)

---

## Mobile Support

`MobileDPad.tsx` is a cross-shaped D-pad + A button rendered as a fixed React overlay. It is only shown on `pointer: coarse` devices (touch screens) and only when no modal is open.

It emits `EventBus` events that `Player.ts` listens to:
- `'dpad'` — `{ dir: Direction, action: 'press' | 'release' }`
- `'dpad-action'` — equivalent to SPACE/ENTER (interact)

---

## Background Music

`MusicToggle.tsx` loads `/assets/music/overworld.mp3` via the HTML Audio API. Place an MP3 at that path to enable music. The component fails silently if the file is missing — no console errors, no broken UI.

---

## TypeScript Notes

- `strict: true` + `noUnusedLocals` + `noUnusedParameters` — the compiler is strict
- Run `npx tsc --noEmit` to check for type errors (Vite transpiles without type-checking)
- `strictPropertyInitialization: false` is set to allow Phaser class patterns (late-initialized via `!` assertions)

---

## Deployment

Self-hosted on a VPS — no GitHub Actions workflow. Build with `npm run build-nolog`, then serve the `dist/` directory with any static file server (nginx, caddy, etc.).

The build uses relative asset paths (`base: './'` in vite config), so it works from any subdirectory.

---

## Pending TODOs

- [ ] Fill in real bio, project, and contact content (search `// TODO:` in `src/game/content/`)
- [ ] Add `/public/assets/music/overworld.mp3` for background music
- [ ] Add `/public/assets/og-preview.png` for social share preview image
- [ ] Replace placeholder colored-rectangle sprites with real pixel art
- [ ] Update `og:url` in `index.html` to match VPS domain
