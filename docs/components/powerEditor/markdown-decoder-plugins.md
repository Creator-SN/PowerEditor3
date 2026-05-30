# Markdown Decoder Plugins

`PowerEditor` 内置了 Markdown 导入与导出能力：

- 用 `editor.insertMarkdown(markdown)` 把 Markdown 导入到编辑器
- 用 `editor.saveMarkdown()` 把当前编辑器内容导出为 Markdown
- 用 `mdDecNodeFuncsPlugins` 和 `mdFlags` 自定义导出时某些节点、标记的输出格式

<script setup>
import { ref } from "vue";
import { useData } from "vitepress";

const viteData = useData();
const editor = ref(null);
const mdFileInput = ref(null);
const markdownFileName = ref("power-editor.md");
const editorContent = ref(`<h2>Markdown Decoder Demo</h2><p>点击工具栏前面的 MD 按钮导入本地 Markdown，再点击保存导出当前富文本对应的 Markdown。</p>`);

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

## 在线试一试

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
                title="导入本地 Markdown"
                @click="openMarkdownFile"
            >
                MD
            </fv-button>
            <fv-button
                :class="[defaultClass, 'markdown-decoder-demo-btn']"
                :theme="viteData.isDark.value ? 'dark' : 'light'"
                border-color="transparent"
                title="将当前富文本保存为 Markdown"
                @click="saveMarkdownFile"
            >
                <i class="ms-Icon ms-Icon--Save"></i>
            </fv-button>
        </template>
    </power-editor>
</div>

## Markdown 导入导出用法

### 导入 Markdown

通过组件暴露的 `insertMarkdown(markdown)`，可以把 Markdown 字符串解析后写入编辑器。

```vue
<script setup>
import { ref } from "vue";

const editor = ref(null);

const importMarkdown = () => {
    const markdown = `# Hello PowerEditor

- item 1
- item 2
`;

    editor.value?.insertMarkdown(markdown);
};
</script>

<template>
    <fv-button @click="importMarkdown">导入 Markdown</fv-button>
    <power-editor ref="editor" />
</template>
```

如果你是从文件导入，通常流程是先读取文件文本，再调用：

```js
const markdown = await file.text();
editor.value?.insertMarkdown(markdown);
```

### 导出 Markdown

通过 `saveMarkdown()`，可以把当前编辑器内容转换成 Markdown 字符串。

```vue
<script setup>
import { ref } from "vue";

const editor = ref(null);

const exportMarkdown = () => {
    const markdown = editor.value?.saveMarkdown?.() ?? "";
    console.log(markdown);
};
</script>

<template>
    <fv-button @click="exportMarkdown">导出 Markdown</fv-button>
    <power-editor ref="editor" />
</template>
```

如果你希望直接下载成文件，可以这样处理：

```js
const markdown = editor.value?.saveMarkdown?.() ?? "";
const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
const url = URL.createObjectURL(blob);
const link = document.createElement("a");

link.href = url;
link.download = "power-editor.md";
link.click();

URL.revokeObjectURL(url);
```

### 相关实例方法

| 方法 | 说明 |
| :-- | :-- |
| `editor.insertMarkdown(markdown)` | 解析 Markdown，并写入编辑器内容。 |
| `editor.saveMarkdown()` | 将当前编辑器内容导出为 Markdown 字符串。 |
| `editor.computeMarkdown(markdown)` | 只解析 Markdown，返回可供编辑器使用的内容结构，不直接写入编辑器。 |

## 如何自定义导出格式

Markdown 导出时，解码器会按深度优先顺序递归遍历 ProseMirror 文档。普通节点会使用默认解码函数；你只需要为自定义节点或有特殊格式要求的节点补充插件函数。

插件函数名需要和节点名或标记名保持一致。函数可以返回字符串，也可以返回包含 `prefix` 与 `suffix` 的对象。

```ts
type DecoderResult = string | {
    prefix: string;
    suffix: string;
};
```

## 自定义节点

下面示例把 `blockquote` 导出为对应层级的 `>` 前缀：

```markdown
> 一级引用
>> 二级引用
>>> 三级引用
```

```js
blockquote(node, flags) {
    const { blockquote: level } = flags;
    let prefix = "";

    for (let i = 0; i < level; i++) {
        prefix += ">";
    }

    return `\n${prefix} `;
}
```

`PowerEditor` 里的 `blockquote` 还可能包含 `paragraph`、`text` 等子节点。通常你不需要手动处理这些子节点，解码器会继续按默认规则递归转换。

## 使用 flags 识别层级

`flags` 用来记录当前节点位于哪些父级节点之内，以及嵌套层级是多少。默认值通常如下：

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

当遍历进入某个被 flags 记录的节点时，对应字段会从 `false` 变成 `1`；如果继续进入同类嵌套节点，则会递增成 `2`、`3`，依此类推。

## 传入 PowerEditor

```vue
<power-editor
    ref="editor"
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
                    let prefix = "";

                    for (let i = 0; i < level; i++) {
                        prefix += ">";
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

然后在导出时直接调用：

```js
const markdown = editor.value?.saveMarkdown?.() ?? "";
```

这样导出的 Markdown 就会使用你传入的自定义规则。

## 自定义标记

标记插件同样遵循“函数名等于标记名”的规则。下面示例把 `textStyle` 中的 `color` 导出成 HTML `font` 标签：

```markdown
<font color="red">红色文字</font>
```

```js
textStyle(text, mark) {
    const { color } = mark.attrs;

    return {
        prefix: `<font color="${color}">`,
        suffix: "</font>"
    };
}
```

当返回对象时，`prefix` 会写在文本前，`suffix` 会写在文本后，适合处理成对包裹的 Markdown 或 HTML 语法。

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
