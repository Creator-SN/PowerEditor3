import { Node, mergeAttributes, nodeInputRule } from '@tiptap/core';
import { VueNodeViewRenderer } from '@tiptap/vue-3';
import mentionItem from '../source/mentionItem.vue';

const inputRegex = /(@)$/;

export default Node.create({
    name: 'mentionItem',

    group: 'inline',

    inline: true,

    draggable: true,

    addAttributes() {
        return {
            value: {
                default: '',
            },
            currentItem: {
                default: () => ({}),
                // 解析HTML时，将data-current-item属性转换为对象
                parseHTML: element => {
                    const raw = element.getAttribute('data-current-item');

                    if (!raw || raw === '[object Object]') {
                        return {};
                    }

                    try {
                        return JSON.parse(raw);
                    } catch (e) {
                        return {};
                    }
                },
                // 渲染HTML时，将对象转换为字符串
                renderHTML: attributes => {
                    const currentItem = attributes.currentItem;

                    if (
                        !currentItem ||
                        typeof currentItem !== 'object' ||
                        Array.isArray(currentItem) ||
                        Object.keys(currentItem).length === 0
                    ) {
                        return {};
                    }

                    return {
                        'data-current-item': JSON.stringify(currentItem),
                    };
                }
            },
            placeholder: {
                default: 'mention',
            },
            freeze: {
                default: false
            },
            showPopper: {
                default: false,
            }
        };
    },

    parseHTML() {
        return [
            {
                tag: 'mention-item',
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return ['mention-item', mergeAttributes(HTMLAttributes)];
    },

    addNodeView() {
        return VueNodeViewRenderer(mentionItem);
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
    }
});
