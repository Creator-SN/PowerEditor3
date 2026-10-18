import { App, Plugin } from 'vue';
import PowerEditor from './editor';
import DevC from './devC'
export { PowerEditor } from './editor';
export { Extension, Node, mergeAttributes } from '@tiptap/core';
export { NodeViewWrapper, NodeViewContent, nodeViewProps, VueNodeViewRenderer } from '@tiptap/vue-3';
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
    }
}

export default PowerEditorPlugins;
