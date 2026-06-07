import { App, Plugin } from 'vue';
import PowerEditor from './editor';
import DevC from './devC'
export { PowerEditor } from './editor';
export {
    computeDiff,
    diffTool,
    configureDiffTool,
    diffBlocks,
    diffInlineTokens,
    buildReviewDoc,
    buildReviewNodes,
    buildInlineTokens,
    inlineDiffBlockTypes,
    containerDiffBlockTypes,
    registerInlineDiffBlockType,
    unregisterInlineDiffBlockType,
    registerContainerDiffBlockType,
    unregisterContainerDiffBlockType,
} from './editor/src/js/diffTool/index.js';
export { applyTrackedGroup } from './editor/src/js/diffTool/apply.js';

const components = [
    PowerEditor,
    DevC
]

export const PowerEditorPlugins: Plugin = {
    install(app: App, options: any) {
        for (const component of components) {
            app.use(component);
        }
    },
};

declare module 'vue' {
    export interface GlobalComponents {
        DevC: typeof DevC;
        PowerEditor: typeof PowerEditor;
        'dev-c': typeof DevC;
        'power-editor': typeof PowerEditor;
    }
}

declare module '@vue/runtime-core' {
    export interface GlobalComponents {
        DevC: typeof DevC;
        PowerEditor: typeof PowerEditor;
        'dev-c': typeof DevC;
        'power-editor': typeof PowerEditor;
    }
}

export default PowerEditorPlugins;
