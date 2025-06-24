import HelloWorld from './components/HelloWorld.vue';
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['logo']} */ ;
/** @type {__VLS_StyleScopedClasses['logo']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.a, __VLS_intrinsicElements.a)({
    href: "https://vite.dev",
    target: "_blank",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
    src: "/vite.svg",
    ...{ class: "logo" },
    alt: "Vite logo",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.a, __VLS_intrinsicElements.a)({
    href: "https://vuejs.org/",
    target: "_blank",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
    src: "./assets/vue.svg",
    ...{ class: "logo vue" },
    alt: "Vue logo",
});
/** @type {[typeof HelloWorld, ]} */ ;
// @ts-ignore
const __VLS_0 = __VLS_asFunctionalComponent(HelloWorld, new HelloWorld({
    msg: "Vite + Vue",
}));
const __VLS_1 = __VLS_0({
    msg: "Vite + Vue",
}, ...__VLS_functionalComponentArgsRest(__VLS_0));
/** @type {__VLS_StyleScopedClasses['logo']} */ ;
/** @type {__VLS_StyleScopedClasses['logo']} */ ;
/** @type {__VLS_StyleScopedClasses['vue']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            HelloWorld: HelloWorld,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
