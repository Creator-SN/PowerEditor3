# PowerEditor 主编辑器

`PowerEditor` 是 PowerEditor3 的核心富文本编辑器组件，基于 Vue 3、Tiptap 与 VFluent3 封装。它提供开箱即用的工具栏、主题切换、图片预览、Markdown 互转、只读展示与插槽扩展能力，适合在业务系统中快速接入可编辑内容区域。

<script setup>
import { ref } from "vue";
import { useData } from "vitepress";

const viteData = useData();
const editor = ref(null);
const mdFileInput = ref(null);
const editable = ref(true);
const editorContent = ref("<h2>PowerEditor Markdown Demo</h2><p>点击右上角按钮导入或导出 Markdown。</p>");

const openMarkdownFile = () => {
    mdFileInput.value?.click();
};

const handleMarkdownImport = async (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const markdown = await file.text();
    editor.value?.insertMarkdown(markdown);
    event.target.value = "";
};

const exportMarkdown = async () => {
    const markdown = editor.value?.saveMarkdown?.() ?? "";

    console.log(markdown);

    try {
        await navigator.clipboard.writeText(markdown);
    } catch (error) {
        console.warn("Copy markdown failed.", error);
    }
};
</script>

<div style="display: flex; justify-content: flex-end; align-items: center; gap: 8px; margin-bottom: 12px;">
    <span>{{ editable ? "可编辑" : "只读" }}</span>
    <fv-toggle-switch v-model="editable"></fv-toggle-switch>
</div>

<power-editor
    :theme="viteData.isDark.value ? 'dark' : 'light'"
    :editable="editable"
    :showDragHandler="true"
    style="width: 100%;"
></power-editor>

## 基础用法

```vue
<template>
    <power-editor
        v-model="content"
        theme="light"
        :showDragHandler="true"
        placeholder="Write something..."
        @change="handleChange"
        @save-html="handleSaveHtml"
        @save-json="handleSaveJson"
    />
</template>
```

## 扩展指南

- [ImgInterceptor](./img-interceptor)
- [图像注入优化](./image-paste-drop)
- [MentionItem](./mention-item)
- [Markdown Decoder Plugins](./markdown-decoder-plugins)
- [Snapshot Compare](./snapshot-compare)

## Props

| 属性 | 类型 | 必填 | 默认值 | 说明 |
| :-- | :-- | :--: | :-- | :-- |
| `modelValue` | `string` | 否 | `<p>I'm running PowerEditor with Vue.js.</p>` | 编辑器内容，支持纯文本与 HTML。 |
| `editable` | `boolean` | 否 | `true` | 是否允许编辑。设为 `false` 时进入只读模式。 |
| `placeholder` | `string` | 否 | `Write something...` | 编辑器占位文案。 |
| `disabledPlaceholder` | `boolean` | 否 | `false` | 是否禁用占位文案。 |
| `contentMaxWidth` | `number` | 否 | `900` | 正文内容最大显示宽度，单位为 `px`。 |
| `editorBackground` | `string` | 否 | - | 编辑器内部背景色。 |
| `editorOutSideBackground` | `string` | 否 | - | 编辑器外部背景色。 |
| `mobileDisplayWidth` | `number` | 否 | `768` | 小于该宽度时使用移动端布局。 |
| `showToolBar` | `boolean` | 否 | `true` | 是否显示工具栏。 |
| `toolbarHeight` | `number` | 否 | `70` | 工具栏高度。 |
| `toolbarBackground` | `string` | 否 | - | 工具栏背景色。 |
| `toolbarBorderRadius` | `number` | 否 | `8` | 工具栏圆角。 |
| `editablePaddingTop` | `number` | 否 | - | 可编辑模式下的顶部内边距；未传入时使用组件内部默认值。 |
| `readOnlyPaddingTop` | `number` | 否 | `5` | 只读模式下的顶部内边距。 |
| `editablePaddingBottom` | `number` | 否 | `315` | 可编辑模式下的底部内边距。 |
| `readOnlyPaddingBottom` | `number` | 否 | `55` | 只读模式下的底部内边距。 |
| `imgInterceptor` | `function` | 否 | - | 图片拦截器，用于接管图片上传、替换与状态展示。详见 [ImgInterceptor](./img-interceptor)。 |
| `mentionItemAttr` | `object` | 否 | - | MentionItem 配置项。详见 [MentionItem](./mention-item)。 |
| `starterKit` | `object` | 否 | `() => ({})` | Tiptap `StarterKit` 相关自定义配置。 |
| `showControlOnReadonly` | `boolean` | 否 | `true` | 只读模式下是否显示控制栏。 |
| `mdDecNodeFuncsPlugins` | `object` | 否 | - | Markdown 解码器自定义节点或标记渲染函数。详见 [Markdown Decoder Plugins](./markdown-decoder-plugins)。 |
| `mdFlags` | `object` | 否 | - | Markdown 解码器递归层级标记配置。 |
| `foreground` | `string` | 否 | `#958DF1` | 编辑器强调色。 |
| `linkColor` | `string` | 否 | `#958DF1` | 链接颜色。 |
| `selectionBackground` | `string` | 否 | `rgba(144, 145, 234, 0.3)` | 选中文本背景色。 |
| `selectionForeground` | `string` | 否 | - | 选中文本前景色。 |
| `tableDragColor` | `string` | 否 | `rgba(144, 145, 234, 0.6)` | 表格拖拽控制块颜色。 |
| `codeColor` | `string` | 否 | - | 行内代码或代码块颜色。 |
| `imgPreview` | `boolean` | 否 | `true` | 是否启用图片预览。 |
| `imgLazyLoad` | `boolean` | 否 | `false` | 是否启用图片懒加载。 |
| `useTab` | `boolean` | 否 | `false` | 是否启用 `Tab` 键插入制表符。启用后，在无序列表和有序列表中不会插入。 |
| `theme` | `'light' \| 'dark'` | 否 | `light` | 编辑器主题。 |
| `extensions` | `array` | 否 | `[]` | 额外的 Tiptap 扩展。 |
| `showSave` | `boolean` | 否 | `true` | 是否显示保存按钮。 |
| `showDragHandler` | `boolean` | 否 | `false` | 是否显示块级拖拽手柄。 |
| `ignoreDragNodeType` | `array` | 否 | `[]` | 忽略显示拖拽手柄的节点类型列表。 |
| `dragHandlerNested` | `boolean` | 否 | `false` | 是否允许拖拽手柄在嵌套块节点中工作。 |

## Events

| 事件名 | 参数 | 说明 |
| :-- | :-- | :-- |
| `on-mounted` | `editor` | 编辑器初始化完成后触发，返回当前 Tiptap editor 实例。 |
| `container-scroll` | `event` | 编辑器容器滚动时触发。 |
| `change` | `payload` | 编辑器内容变化时触发。 |
| `content-change` | `payload` | 外部内容变更并同步到编辑器时触发。 |
| `save-json` | `string` | 点击保存或调用保存方法后，以 JSON 字符串形式返回内容。 |
| `save-html` | `string` | 点击保存或调用保存方法后，以 HTML 字符串形式返回内容。 |

## Methods

通过 `ref` 可以调用编辑器暴露的方法。

<div class="power-editor-method-demo">
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
        :showDragHandler="true"
        style="width: 100%;"
    >
        <template #custom-buttons-front="{ defaultClass }">
            <fv-button
                :class="[defaultClass, 'power-editor-method-btn']"
                :theme="viteData.isDark.value ? 'dark' : 'light'"
                border-color="transparent"
                title="导入 Markdown"
                @click="openMarkdownFile"
            >
                <i class="ms-Icon ms-Icon--Upload"></i>
            </fv-button>
            <fv-button
                :class="[defaultClass, 'power-editor-method-btn']"
                :theme="viteData.isDark.value ? 'dark' : 'light'"
                border-color="transparent"
                title="导出 Markdown"
                @click="exportMarkdown"
            >
                <i class="ms-Icon ms-Icon--Download"></i>
            </fv-button>
        </template>
    </power-editor>
</div>

```vue
<script setup>
import { ref } from "vue";

const editor = ref(null);
const mdFileInput = ref(null);

const openMarkdownFile = () => {
    mdFileInput.value?.click();
};

const handleMarkdownImport = async (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const markdown = await file.text();
    editor.value?.insertMarkdown(markdown);
    event.target.value = "";
};

const exportMarkdown = async () => {
    const markdown = editor.value?.saveMarkdown?.() ?? "";

    console.log(markdown);
    await navigator.clipboard.writeText(markdown);
};
</script>

<template>
    <input
        ref="mdFileInput"
        type="file"
        accept=".md,.markdown,.txt,text/markdown,text/plain"
        style="display: none;"
        @change="handleMarkdownImport"
    />
    <power-editor ref="editor" :showDragHandler="true">
        <template #custom-buttons="{ defaultClass }">
            <fv-button
                :class="[defaultClass, 'round-btn']"
                border-color="transparent"
                title="导入 Markdown"
                @click="openMarkdownFile"
            >
                <i class="ms-Icon ms-Icon--Upload"></i>
            </fv-button>
            <fv-button
                :class="[defaultClass, 'round-btn']"
                border-color="transparent"
                title="导出 Markdown"
                @click="exportMarkdown"
            >
                <i class="ms-Icon ms-Icon--Download"></i>
            </fv-button>
        </template>
    </power-editor>
</template>

<style scoped>
.round-btn {
    border-radius: 999px;
}
</style>
```

| 方法 | 说明 |
| :-- | :-- |
| `editor.save()` | 保存当前内容，并触发 `save-json` 与 `save-html` 事件。 |
| `editor.saveMarkdown()` | 将当前编辑器内容转换为 Markdown。 |
| `editor.computeMarkdown(markdown)` | 将 Markdown 字符串解析为编辑器内容。 |
| `editor.insertMarkdown(markdown)` | 在当前位置插入 Markdown 内容。 |

## Slots

### `custom-buttons`

自定义工具栏按钮。也可以使用 `custom-buttons-front` 或 `custom-buttons-[index]` 精确控制插入位置，其中 `index` 从 `0` 开始，最大为 `4`；未指定位置时默认插入到工具栏最右侧。

插槽参数：

| 参数 | 说明 |
| :-- | :-- |
| `editor` | 当前 Tiptap editor 实例。 |
| `defaultClass` | 工具栏按钮的默认样式类名。 |

```vue
<power-editor>
    <template #custom-buttons="{ defaultClass }">
        <fv-button :class="[defaultClass]">Custom</fv-button>
    </template>
</power-editor>
```

<style scoped>
.power-editor-method-demo {
    margin: 16px 0 20px;
}

.power-editor-method-btn {
    border-radius: 999px;
}
</style>

### `front-content`

在正文内容前插入自定义区域，适合展示摘要、头图、说明条或业务自定义头部。

```vue
<power-editor>
    <template #front-content>
        <div class="front-content-block">Before editor content</div>
    </template>
</power-editor>
```
