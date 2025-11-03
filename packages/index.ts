import { App, Plugin } from 'vue';
import PowerEditor from './editor';
import DevC from './devC'

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

declare module '@vue/runtime-core' {
    export interface GlobalComponents {
        PowerEditor: typeof PowerEditor
        DevC: typeof DevC
    }
}

export {}
export default PowerEditorPlugins;
