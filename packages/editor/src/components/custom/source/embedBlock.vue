<template>
    <node-view-wrapper
        v-if="node"
        class="power-editor-embed-container"
        :style="{ 'justify-content': node.attrs.alignCenter ? 'center' : 'flex-start' }"
    >
        <media-container
            :width.sync="node.attrs.width"
            :caption="node.attrs.caption"
            :alignCenter.sync="node.attrs.alignCenter"
            :editor="editor"
            :theme="thisTheme"
            :foreground="thisForeground"
            :node="node"
            :getPos="getPos"
            ref="media"
            @update:caption="updateAttributes({caption: $event})"
        >
            <iframe
                :src="node.attrs.src"
                frameborder="0"
                allowfullscreen
                style="width: 100%; height: auto"
                :style="{ height: `${width / 1.778}px` }"
            ></iframe>
        </media-container>
    </node-view-wrapper>
</template>

<script>
import { NodeViewWrapper } from '@tiptap/vue-3';
import mediaContainer from './mediaContainer.vue';

export default {
    components: {
        NodeViewWrapper,
        mediaContainer,
    },
    props: {
        // the editor instance
        editor: {
            type: Object,
        },

        // the current node
        node: {
            type: Object,
        },

        // an array of decorations
        decorations: {
            type: Array,
        },

        // `true` when there is a `NodeSelection` at the current node view
        selected: {
            type: Boolean,
        },

        // access to the node extension, for example to get options
        extension: {
            type: Object,
        },

        // get the document position of the current node
        getPos: {
            type: Function,
        },

        // update attributes of the current node
        updateAttributes: {
            type: Function,
        },

        // delete the current node
        deleteNode: {
            type: Function,
        },
    },
    data() {
        return {
            width: 0,
            thisTheme: this.editor.storage.defaultStorage.theme,
            thisForeground: this.editor.storage.defaultStorage.foreground,
            timer: {},
        };
    },
    watch: {
        'editor.storage.defaultStorage.theme'(val) {
            this.thisTheme = val;
        },
        'editor.storage.defaultStorage.foreground'(val) {
            this.thisForeground = val;
        },
    },
    mounted() {
        this.timerInit();
    },
    methods: {
        timerInit() {
            this.timer = setInterval(() => {
                this.width = this.$refs.media.$el.clientWidth;
            }, 300);
        },
    },
    beforeUnmount() {
        clearInterval(this.timer);
    },
};
</script>

<style lang="scss">
.power-editor-embed-container {
    position: relative;
    width: 100%;
    height: auto;
    display: flex;
    justify-content: center;
    align-items: center;
    transition: height 0.3s;

    iframe {
        transition: height 0.3s;
    }
}
</style>
