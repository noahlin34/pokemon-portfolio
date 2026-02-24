import { IndoorScene, IndoorSceneConfig } from './IndoorScene';
import { SCENE } from '../constants';
import { PROJECTS_NPCS, PROJECTS_SIGNS } from '../content/indoorData';

export class ProjectsScene extends IndoorScene {
    constructor() {
        super(SCENE.PROJECTS);
    }

    protected getConfig(): IndoorSceneConfig {
        return {
            npcs: PROJECTS_NPCS,
            signs: PROJECTS_SIGNS,
        };
    }
}
