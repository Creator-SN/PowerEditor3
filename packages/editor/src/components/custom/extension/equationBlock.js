import { Node, mergeAttributes, nodeInputRule } from '@tiptap/core';
import { VueNodeViewRenderer } from '@tiptap/vue-3';
import equationBlock from '../source/equationBase.vue';
import { nodePasteRule } from '../pasteRules/nodePasteRules';

const inputRegex = /(\${2}\s|\\\[\s)$/;
const pasteRegex = /(\s*\${2}|\\\[)([\s\S]+?)(\${2}|\\\])/g;

export default Node.create({
    name: 'equationBlock',

    group: 'block',

    atom: true,

    draggable: true,

    addAttributes() {
        return {
            value: {
                default: '',
            },
            tag: {
                default: 'div',
            },
            placeholder: {
                default: 'Y=WX^T+b',
            },
            emptyPlaceholder: {
                default: 'New Equation',
            },
            showPopper: {
                default: false,
            }
        };
    },

    parseHTML() {
        return [
            {
                tag: 'equation-block',
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return ['equation-block', mergeAttributes(HTMLAttributes)];
    },

    addNodeView() {
        return VueNodeViewRenderer(equationBlock);
    },

    addInputRules() {
        return [
            nodeInputRule({
                find: inputRegex, type: this.type, getAttributes: () => {
                    return {
                        theme: this.editor.storage.defaultStorage.theme,
                    };
                }
            }),
        ];
    },

    addPasteRules() {
        return [
            nodePasteRule({
                find: pasteRegex,
                type: this.type,
                getAttributes: match => {
                    // return some attrs, if any.
                    return {
                        value: match[2],
                        theme: this.editor.storage.defaultStorage.theme,
                    };
                },
            }),
        ];
    }
});
