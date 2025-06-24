import type { App, Component, Plugin } from 'vue';

type ComponentPlugin<T> = T & Plugin;

export const convertPlugin = <T>(component: T): ComponentPlugin<T> => {
    (component as ComponentPlugin<T>).install = (app: App): void => {
        app.component((component as any).name, component as Component);
    };
    return component as ComponentPlugin<T>;
};