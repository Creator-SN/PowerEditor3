<template>
    <callout-base
        :show.sync="show"
        :mobileMode="mobileMode"
        :title="getTitle('Insert Link')"
        :foreground="foreground"
        :theme="theme"
        :language="language"
        :popperClass="['power-editor-link-callout']"
    >
        <template v-slot:trigger="x">
            <slot :show="x.show"></slot>
        </template>
        <template v-slot:content>
            <div
                class="power-editor-l-c-block"
                :class="[{ dark: theme === 'dark' }]"
            >
                <p
                    v-if="false"
                    class="power-editor-l-c-title"
                >Fill the Form</p>
                <fv-text-box
                    v-model="caption"
                    :placeholder="getTitle('Caption')"
                    :theme="theme"
                    icon="TextField"
                    underline
                    :border-width="2"
                    :is-box-shadow="true"
                    :border-color="'rgba(200, 200, 200, 0.1)'"
                    :background="theme === 'dark' ? '#1a1a1a' : '#fff'"
                    :focus-border-color="foreground"
                    style="width: 100%; margin-top: 5px"
                />
                <fv-text-box
                    v-model="link"
                    icon="Link"
                    :placeholder="getTitle('Insert Link Url...')"
                    :theme="theme"
                    underline
                    :border-width="2"
                    :is-box-shadow="true"
                    :border-color="'rgba(200, 200, 200, 0.1)'"
                    :background="theme === 'dark' ? '#1a1a1a' : '#fff'"
                    :focus-border-color="foreground"
                    style="width: 100%; margin-top: 15px"
                />
            </div>
            <div class="power-editor-l-c-control-block">
                <fv-button
                    theme="dark"
                    :disabled="link === ''"
                    :background="foreground"
                    :is-box-shadow="true"
                    style="width: 150px;"
                    @click="insert"
                >{{getTitle('Insert')}}</fv-button>
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
    emits: ['insert-link'],
    props: {
        mobileMode: {
            default: false,
        },
        foreground: {
            default: '',
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
            link: '',
            caption: '',
            show: false,
        };
    },
    watch: {
        show(val) {
            if (!val) {
                this.link = '';
                this.caption = '';
            } else this.getSelection();
        },
    },
    methods: {
        insert() {
            if (this.link === '') return 0;
            this.caption = this.caption == '' ? this.link : this.caption;
            this.$emit('insert-link', `<a href="${this.link}">${this.caption}</a>`);
            this.show = false;
        },
        getSelection() {
            try {
                this.caption = window.getSelection().toString();
            } catch (e) {
                console.log(e);
            }
        },
        getTitle(name) {
            return i18n(name, this.language);
        },
    },
};
</script>

<style lang="scss">
.power-editor-link-callout {
    div.main {
        width: 300px;
        height: auto;
        padding: 5px 0px;
        display: flex;
        flex-direction: column;
        align-items: center;
        overflow: overlay;

        .power-editor-l-c-block {
            position: relative;
            width: 100%;
            height: auto;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;

            &.dark {
            }

            .power-editor-l-c-title {
                position: relative;
                width: 100%;
                flex-shrink: 0;
                font-size: 13px;
                color: rgba(36, 36, 36, 0.8);
                text-align: left;
                text-indent: 15px;
            }
        }

        .power-editor-l-c-control-block {
            position: relative;
            width: 300px;
            margin-top: 25px;
            flex-shrink: 0;
            display: flex;
            justify-content: space-around;
            align-items: center;
        }
    }
}
</style>
