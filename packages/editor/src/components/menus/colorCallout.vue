<template>
    <callout-base :show.sync="show" :mobileMode="mobileMode" :title="getTitle('Text Color')" :foreground="foreground" :theme="theme" :language="language" :popperClass="['power-editor-color-callout']">
        <template v-slot:trigger="x">
            <slot :show="x.show"></slot>
        </template>
        <template v-slot:content>
            <p class="power-menu-sec-title" :style="{ '--power-menu-sec-title-background': foreground }">{{ getTitle('Foreground') }}</p>
            <div class="power-editor-color-item" :class="[{ dark: theme == 'dark' }]" @click="execX('unsetColor')">
                <p class="peci-example">A</p>
                <p class="peci-comment">{{ getTitle(`removeColor`) }}</p>
            </div>
            <div
                v-for="(item, index) in colorList"
                class="power-editor-color-item"
                :class="[{ dark: theme == 'dark', choosen: editor.isActive('textStyle', { color: item.color }) }]"
                :key="'color:' + index"
                @click="execMoreX('setColor', item.color)"
            >
                <p class="peci-example" :style="{ color: item.color }">A</p>
                <p class="peci-comment">{{ getTitle(item.name) }}</p>
            </div>
            <p class="power-menu-sec-title" :style="{ '--power-menu-sec-title-background': foreground }">{{ getTitle('Highlight Background') }}</p>
            <div class="power-editor-color-item" :class="[{ dark: theme == 'dark' }]" @click="execX('unsetHighlight')">
                <p class="peci-example">A</p>
                <p class="peci-comment">{{ getTitle(`removeHighlight`) }}</p>
            </div>
            <div
                v-for="(item, index) in highlightList"
                class="power-editor-color-item"
                :class="[{ dark: theme == 'dark', choosen: editor.isActive('highlight', { color: item.color }) }]"
                :key="'highlight:' + index"
                @click="execMoreX('setHighlight', { color: item.color })"
            >
                <p class="peci-example" :style="{ background: item.color }">A</p>
                <p class="peci-comment">{{ getTitle(item.name) }}</p>
            </div>
        </template>
    </callout-base>
</template>

<script>
import calloutBase from './calloutBase.vue';
import i18n from '@/packages/i18n/i18n.js';

export default {
    components: {
        calloutBase,
    },
    props: {
        foreground: {
            default: '',
        },
        getBackground: {
            default: () => {},
        },
        getForeground: {
            default: () => {},
        },
        exec: {
            default: () => {},
        },
        execMore: {
            default: () => {},
        },
        editor: {
            default: null,
        },
        mobileMode: {
            default: false,
        },
        language: {
            default: 'en',
        },
        theme: {
            default: 'light',
        },
    },
    data() {
        return {
            show: false,
            colorList: [
                { name: 'gray', color: '#787774' },
                { name: 'purple', color: '#958DF1' },
                { name: 'pink', color: '#f58eda' },
                { name: 'red', color: '#F98181' },
                { name: 'orange', color: '#FBBC88' },
                { name: 'yellow', color: '#FAF594' },
                { name: 'blue', color: '#4086cb' },
                { name: 'teal', color: '#94FADB' },
                { name: 'green', color: '#B9F18D' },
                { name: 'rose', color: '#ee7686' },
                { name: 'fresh_blue', color: '#70CFF8' },
                { name: 'ice_blue', color: '#9fc2ca' },
                { name: 'dark_blue', color: '#0c4a83' },
                { name: 'fresh_green', color: '#55ddb6' },
            ],
            highlightList: [
                { name: 'red', color: 'red' },
                { name: 'red', color: '#ffa8a8' },
                { name: 'yellow', color: '#FAF594' },
                { name: 'orange', color: '#ffc078' },
                { name: 'green', color: '#8ce99a' },
                { name: 'blue', color: '#74c0fc' },
                { name: 'purple', color: '#b197fc' },
                { name: 'light_green', color: '#d1f6e7' },
                { name: 'light_yellow', color: '#fdf0c6' },
                { name: 'light_red', color: '#ffe3e3' },
                { name: 'light_purple', color: '#e9e1f9' },
                { name: 'light_orange', color: '#ffe5c7' },
            ],
        };
    },
    watch: {},
    methods: {
        getTitle(name) {
            return i18n(name, this.language);
        },
        execX(a) {
            this.exec(a);
            if (this.mobileMode) {
                this.show = false;
            }
        },
        execMoreX(a, b) {
            this.execMore(a, b);
            if (this.mobileMode) {
                this.show = false;
            }
        },
    },
};
</script>

<style lang="scss">
.power-editor-color-callout {
    div.main {
        width: 300px;
        height: 360px;
        padding: 5px 0px;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        overflow: overlay;
        overflow-x: hidden;

        --power-menu-sec-title-background: rgba(200, 200, 200, 0.1);

        .power-menu-sec-title {
            width: auto;
            height: 25px;
            margin-left: 3px;
            flex-shrink: 0;
            padding: 0px 10px;
            font-size: 12px;
            font-weight: bold;
            color: whitesmoke;
            border-radius: 12px;
            background: var(--power-menu-sec-title-background);
            box-sizing: border-box;
            display: flex;
            align-items: center;
            box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.1);
        }

        .power-editor-cmd-btn {
            width: 50px;
            height: 35px;
            margin-top: 5px;
            flex-shrink: 0;
        }

        .power-editor-color-item {
            position: relative;
            width: 100%;
            height: 35px;
            margin: 3px;
            padding: 5px;
            border-radius: 6px;
            box-sizing: border-box;
            display: flex;
            align-items: center;
            user-select: none;
            cursor: default;

            &:hover {
                background: rgba(200, 200, 200, 0.1);
            }

            &:active {
                background: rgba(200, 200, 200, 0.3);
            }

            &.dark {
                &:hover {
                    background: rgba(200, 200, 200, 0.3);
                }

                &:active {
                    background: rgba(200, 200, 200, 0.2);
                }

                .peci-example {
                    background: rgba(75, 75, 75, 1);
                    border: rgba(75, 75, 75, 0.1) solid thin;
                }
            }

            &.choosen {
                background: rgba(200, 200, 200, 0.3);
            }

            .peci-example {
                position: relative;
                width: 25px;
                height: 25px;
                flex-shrink: 1;
                background: white;
                border: whitesmoke solid thin;
                color: rgba(36, 36, 36, 1);
                border-radius: 35px;
                display: flex;
                justify-content: center;
                align-items: center;
            }

            .peci-comment {
                flex: 1;
                margin-left: 15px;
            }
        }
    }
}
</style>
