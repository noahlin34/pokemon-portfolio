import { IndoorScene, IndoorSceneConfig } from './IndoorScene';
import { SCENE } from '../constants';
import { POKECENTER_NPCS, POKECENTER_SIGNS } from '../content/indoorData';

export class PokecenterScene extends IndoorScene {
    constructor() {
        super(SCENE.POKECENTER);
    }

    protected getConfig(): IndoorSceneConfig {
        return {
            npcs: POKECENTER_NPCS,
            signs: POKECENTER_SIGNS,
        };
    }
}
