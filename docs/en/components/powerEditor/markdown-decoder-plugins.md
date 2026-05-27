# Markdown Decoder Plugins

`PowerEditor` includes a built-in Markdown decoder that converts ProseMirror nodes and marks into Markdown. With `mdDecNodeFuncsPlugins` and `mdFlags`, you can override or extend how specific nodes and marks are rendered.

<script setup>
import { ref } from "vue";
import { useData } from "vitepress";

const viteData = useData();
const editor = ref(null);
const mdFileInput = ref(null);
const markdownFileName = ref("power-editor.md");
const editorContent = ref(`<h2>Markdown Decoder Demo</h2><p>Click the MD button at the front of the toolbar to import a local Markdown file, then click save to export the current rich text content as Markdown.</p>`);

const openMarkdownFile = () => {
    mdFileInput.value?.click();
};

const handleMarkdownImport = async (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    markdownFileName.value = file.name.replace(/\.(txt|markdown)$/i, ".md");
    const markdown = await file.text();
    editor.value?.insertMarkdown(markdown);
    event.target.value = "";
};

const saveMarkdownFile = () => {
    const markdown = editor.value?.saveMarkdown?.() ?? "";
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    console.log(markdown);
    link.href = url;
    link.download = markdownFileName.value || "power-editor.md";
    link.click();

    URL.revokeObjectURL(url);
};
</script>

## Try It Online

<div class="markdown-decoder-demo">
    <input
        ref="mdFileInput"
        type="file"
        accept=".md,.markdown,.txt,text/markdown,text/plain"
        style="display: none;"
        @change="handleMarkdownImport"
    />
    <power-editor
        ref="editor"
        v-model="editorContent"
        :theme="viteData.isDark.value ? 'dark' : 'light'"
        style="width: 100%;"
    >
        <template #custom-buttons-front="{ defaultClass }">
            <fv-button
                :class="[defaultClass, 'markdown-decoder-demo-btn', 'markdown-decoder-demo-md-btn']"
                :theme="viteData.isDark.value ? 'dark' : 'light'"
                border-color="transparent"
                title="Import local Markdown"
                @click="openMarkdownFile"
            >
                MD
            </fv-button>
            <fv-button
                :class="[defaultClass, 'markdown-decoder-demo-btn']"
                :theme="viteData.isDark.value ? 'dark' : 'light'"
                border-color="transparent"
                title="Save the current rich text content as Markdown"
                @click="saveMarkdownFile"
            >
                <i class="ms-Icon ms-Icon--Save"></i>
            </fv-button>
        </template>
    </power-editor>
</div>

## How It Works

The decoder walks the ProseMirror document recursively in depth-first order. Built-in nodes use default decoder functions. You only need custom plugin functions for custom nodes or output formats that require special handling.

Plugin function names must match node names or mark names. A function can return a string, or an object with `prefix` and `suffix`.

```ts
type DecoderResult = string | {
    prefix: string;
    suffix: string;
};
```

## Custom Nodes

The example below renders `blockquote` with the correct number of `>` prefixes based on nesting depth.

```markdown
> Level one
>> Level two
>>> Level three
```

```js
blockquote(node, flags) {
    const { blockquote: level } = flags;
    let prefix = '';

    for (let i = 0; i < level; i++) {
        prefix += '>';
    }

    return `\n${prefix} `;
}
```

A `blockquote` in `PowerEditor` may contain child nodes such as `paragraph` and `text`. In most cases, those children do not need to be handled manually, because the decoder continues with its default recursive rules.

## Use Flags For Nesting

`flags` records which parent nodes the current node is inside and how deeply it is nested. Default flags usually look like this:

```js
const flags = {
    inline: false,
    inlineWrapper: false,
    heading: false,
    bulletList: false,
    orderedList: false,
    blockquote: false,
    powerTaskItem: false,
    powerTaskList: false,
    tableHeader: false,
    tableCell: false,
    tableRow: false,
    table: false
};
```

When traversal enters a tracked node, its flag changes from `false` to `1`. If traversal enters a nested node of the same type, the value increments to `2`, `3`, and so on.

## Pass Plugins To PowerEditor

```vue
<power-editor
    :md-dec-node-funcs-plugins="mdDecNodeFuncsPlugins"
    :md-flags="mdFlags"
/>
```

```js
export default {
    data() {
        return {
            mdDecNodeFuncsPlugins: {
                blockquote: (node, flags) => {
                    const { blockquote: level } = flags;
                    let prefix = '';

                    for (let i = 0; i < level; i++) {
                        prefix += '>';
                    }

                    return `\n${prefix} `;
                }
            },
            mdFlags: {
                blockquote: false
            }
        };
    }
};
```

## Custom Marks

Mark plugins follow the same rule: the function name must match the mark name. The example below outputs the `color` value from `textStyle` as an HTML `font` tag:

```markdown
<font color="red">Red text</font>
```

```js
textStyle(text, mark) {
    const { color } = mark.attrs;

    return {
        prefix: `<font color="${color}">`,
        suffix: '</font>'
    };
}
```

When an object is returned, `prefix` is written before the text and `suffix` after it. This is useful for paired Markdown or HTML syntax.

<style scoped>
.markdown-decoder-demo {
    margin: 16px 0 24px;
}

.markdown-decoder-demo-btn {
    border-radius: 999px;
}

.markdown-decoder-demo-md-btn {
    min-width: 40px;
    font-weight: 700;
    letter-spacing: 0.04em;
}
</style>
