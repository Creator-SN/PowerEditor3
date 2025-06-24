/// <reference types="vite/client" />
import '@creatorsn/vfluent3';

declare module '*.vue' {
    import type { DefineComponent } from 'vue'
    const component: DefineComponent<{}, {}, any>
    export default component
}
