import { IndoorScene, IndoorSceneConfig } from './IndoorScene';
import { SCENE } from '../constants';
import { GYM_NPCS, GYM_SIGNS } from '../content/indoorData';

export class GymScene extends IndoorScene {
    constructor() {
        super(SCENE.GYM);
    }

    protected getConfig(): IndoorSceneConfig {
        return {
            npcs: GYM_NPCS,
            signs: GYM_SIGNS,
        };
    }
}
