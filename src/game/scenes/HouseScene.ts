import { IndoorScene, IndoorSceneConfig } from './IndoorScene';
import { SCENE } from '../constants';
import { HOUSE_NPCS, HOUSE_SIGNS } from '../content/indoorData';

export class HouseScene extends IndoorScene {
    constructor() {
        super(SCENE.HOUSE);
    }

    protected getConfig(): IndoorSceneConfig {
        return {
            npcs: HOUSE_NPCS,
            signs: HOUSE_SIGNS,
        };
    }
}
