import Custom from "./custom.vue"
import type { App } from "vue"
import { PowerEditorPlugins } from "@/packages";
import VFluent from "@creatorsn/vfluent3";
import '@creatorsn/vfluent3/style.css';
import './style.css'

export default {
    Layout: Custom,
    enhanceApp: ({ app }: { app: App }) => {
        app.use(VFluent)
        app.use(PowerEditorPlugins)
    }
}