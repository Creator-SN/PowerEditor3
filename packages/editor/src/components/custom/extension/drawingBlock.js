import { VueNodeViewRenderer, Node, mergeAttributes } from '@tiptap/vue-3';
import Component from '../source/drawingBlock.vue';

export default Node.create({
    name: 'drawingBlock',

    group: 'block',

    draggable: true,

    atom: true,

    addAttributes() {
        return {
            lines: {
                default: [],
            },
            width: {
                default: 100,
            },
            caption: {
                default: '',
            },
            alignCenter: {
                default: true,
            }
        };
    },

    parseHTML() {
        return [
            {
                tag: 'drawing-block',
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return ['drawing-block', mergeAttributes(HTMLAttributes)];
    },

    addNodeView() {
        return VueNodeViewRenderer(Component);
    },
});
