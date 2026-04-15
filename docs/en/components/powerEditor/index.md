# PowerEditor

`PowerEditor` is the core rich text editor component in PowerEditor3. It is built with Vue 3, Tiptap and VFluent3, and provides a ready-to-use toolbar, theme switching, image preview, Markdown conversion, read-only display and slot-based customization.

<script setup>
import { useData } from "vitepress";

const viteData = useData();
</script>

<power-editor :theme="viteData.isDark.value ? 'dark' : 'light'" style="width: 100%;"></power-editor>

## Basic Usage

```vue
<template>
    <power-editor
        v-model="content"
        theme="light"
        placeholder="Write something..."
        @change="handleChange"
        @save-html="handleSaveHtml"
        @save-json="handleSaveJson"
    />
</template>
```

## Props

| Prop | Type | Required | Default | Description |
| :-- | :-- | :--: | :-- | :-- |
| `modelValue` | `string` | No | `<p>I'm running PowerEditor with Vue.js.</p>` | Editor content. Plain text and HTML are supported. |
| `editable` | `boolean` | No | `true` | Whether the editor is editable. Set it to `false` for read-only mode. |
| `placeholder` | `string` | No | `Write something...` | Placeholder text. |
| `disabledPlaceholder` | `boolean` | No | `false` | Whether to disable the placeholder. |
| `contentMaxWidth` | `number` | No | `900` | Maximum content width in pixels. |
| `editorBackground` | `string` | No | - | Inner editor background color. |
| `editorOutSideBackground` | `string` | No | - | Outer editor background color. |
| `mobileDisplayWidth` | `number` | No | `768` | Width threshold for mobile layout. |
| `showToolBar` | `boolean` | No | `true` | Whether to show the toolbar. |
| `toolbarHeight` | `number` | No | `70` | Toolbar height. |
| `toolbarBackground` | `string` | No | - | Toolbar background color. |
| `toolbarBorderRadius` | `number` | No | `8` | Toolbar border radius. |
| `editablePaddingTop` | `number` | No | - | Top padding in editable mode. Internal default is used when omitted. |
| `readOnlyPaddingTop` | `number` | No | `5` | Top padding in read-only mode. |
| `editablePaddingBottom` | `number` | No | `315` | Bottom padding in editable mode. |
| `readOnlyPaddingBottom` | `number` | No | `55` | Bottom padding in read-only mode. |
| `imgInterceptor` | `function` | No | - | Image interceptor for upload, replacement and status control. See [ImgInterceptor](./img-interceptor). |
| `mentionItemAttr` | `object` | No | - | MentionItem configuration. See [MentionItem](./mention-item). |
| `starterKit` | `object` | No | `() => ({})` | Custom configuration for Tiptap `StarterKit`. |
| `showControlOnReadonly` | `boolean` | No | `true` | Whether to show controls in read-only mode. |
| `mdDecNodeFuncsPlugins` | `object` | No | - | Custom Markdown decoder functions. See [Markdown Decoder Plugins](./markdown-decoder-plugins). |
| `mdFlags` | `object` | No | - | Custom Markdown decoder traversal flags. |
| `foreground` | `string` | No | `#958DF1` | Editor accent color. |
| `linkColor` | `string` | No | `#958DF1` | Link color. |
| `selectionBackground` | `string` | No | `rgba(144, 145, 234, 0.3)` | Selection background color. |
| `selectionForeground` | `string` | No | - | Selection foreground color. |
| `tableDragColor` | `string` | No | `rgba(144, 145, 234, 0.6)` | Table drag handle color. |
| `codeColor` | `string` | No | - | Inline code or code block color. |
| `imgPreview` | `boolean` | No | `true` | Whether to enable image preview. |
| `imgLazyLoad` | `boolean` | No | `false` | Whether to lazy-load images. |
| `theme` | `'light' \| 'dark'` | No | `light` | Editor theme. |
| `extensions` | `array` | No | `[]` | Extra Tiptap extensions. |
| `showSave` | `boolean` | No | `true` | Whether to show the save button. |

## Events

| Event | Args | Description |
| :-- | :-- | :-- |
| `on-mounted` | `editor` | Emitted after the editor is initialized. Returns the current Tiptap editor instance. |
| `container-scroll` | `event` | Emitted when the editor container scrolls. |
| `change` | `payload` | Emitted when editor content changes. |
| `content-change` | `payload` | Emitted when external content is synchronized into the editor. |
| `save-json` | `string` | Emitted with JSON content after saving. |
| `save-html` | `string` | Emitted with HTML content after saving. |

## Methods

Use a template ref to call exposed editor methods.

```vue
<power-editor ref="editor" />
```

| Method | Description |
| :-- | :-- |
| `editor.save()` | Saves the current content and emits `save-json` and `save-html`. |
| `editor.saveMarkdown()` | Converts the current editor content to Markdown. |
| `editor.computeMarkdown(markdown)` | Parses Markdown into editor content. |
| `editor.insertMarkdown(markdown)` | Inserts Markdown at the current position. |

## Slots

### `custom-buttons`

Adds custom buttons to the toolbar. You can also use `custom-buttons-front` or `custom-buttons-[index]` to control the position. `index` starts from `0` and goes up to `4`. When no position is provided, the button is inserted at the right end of the toolbar.

Slot props:

| Prop | Description |
| :-- | :-- |
| `editor` | Current Tiptap editor instance. |
| `defaultClass` | Default toolbar button class. |

```vue
<power-editor>
    <template #custom-buttons="{ defaultClass }">
        <fv-button :class="[defaultClass]">Custom</fv-button>
    </template>
</power-editor>
```

### `front-content`

Adds custom content before the document body.

```vue
<power-editor>
    <template #front-content>
        <div class="front-content-block">Before editor content</div>
    </template>
</power-editor>
```
