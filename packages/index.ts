import { App, Plugin } from 'vue';
import DevC from './devC'

const components = [
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
    }
}

export default PowerEditorPlugins;
