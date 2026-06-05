# HandleImagePaste / HandleImageDrop

<script setup>
import { onBeforeUnmount, onMounted, ref } from "vue";
import { useData } from "vitepress";

const viteData = useData();
const imagePasteDropDemoHost = ref(null);
const imagePasteDropDemoEditor = ref(null);
const imagePasteDropDemoInput = ref(null);
const imagePasteDropDemoContent = ref(
    "<p>Drop an image here, paste a screenshot, or choose files with the button below.</p>"
);
const imagePasteDropDemoLogs = ref([
    "Waiting for images: drag and drop, paste, or file picker all work.",
]);

const pushImagePasteDropDemoLog = (message) => {
    imagePasteDropDemoLogs.value = [message, ...imagePasteDropDemoLogs.value].slice(0, 6);
};

const getImagePasteDropDemoClipboardImageFiles = (items = []) => {
    const imageFiles = [];

    for (const item of items) {
        if (item.kind !== "file") continue;
        if (!item.type || !item.type.startsWith("image/")) continue;

        const file = item.getAsFile ? item.getAsFile() : null;
        if (file) imageFiles.push(file);
    }

    return imageFiles;
};

const readImagePasteDropDemoFilesAsDataUrls = async (files = []) => {
    return await Promise.all(
        files.map(
            (file) =>
                new Promise((resolve, reject) => {
                    const reader = new FileReader();

                    reader.onload = (event) =>
                        resolve({
                            name: file.name || "unnamed-image",
                            src: event.target.result,
                        });
                    reader.onerror = () => reject(new Error("Read image file failed"));
                    reader.readAsDataURL(file);
                })
        )
    );
};

const insertImagePasteDropDemoImages = (images = []) => {
    const tiptap = imagePasteDropDemoEditor.value?.editor?.();
    if (!tiptap || !images.length) return;

    images.forEach(({ src, name }) => {
        tiptap
            .chain()
            .focus()
            .insertContent(
                `<img src="${src}" alt="${name}" theme="${viteData.isDark.value ? "dark" : "light"}"></img>`
            )
            .run();
    });

    pushImagePasteDropDemoLog(`Inserted ${images.length} image(s).`);
};

const handleImagePasteDropDemoPaste = async (event) => {
    const files = getImagePasteDropDemoClipboardImageFiles(
        event?.clipboardData?.items || []
    );

    if (!files.length) return;

    event.preventDefault();

    try {
        const images = await readImagePasteDropDemoFilesAsDataUrls(files);
        insertImagePasteDropDemoImages(images);
        pushImagePasteDropDemoLog(
            `Captured pasted image(s): ${images.map((item) => item.name).join(", ")}`
        );
    } catch (error) {
        console.error(error);
        pushImagePasteDropDemoLog("Failed to read pasted image.");
    }
};

const handleImagePasteDropDemoDrop = async (event) => {
    const files = Array.from(event?.dataTransfer?.files || []).filter(
        (file) => file.type && file.type.startsWith("image/")
    );

    if (!files.length) return;

    event.preventDefault();

    try {
        const images = await readImagePasteDropDemoFilesAsDataUrls(files);
        insertImagePasteDropDemoImages(images);
        pushImagePasteDropDemoLog(
            `Captured dropped image(s): ${images.map((item) => item.name).join(", ")}`
        );
    } catch (error) {
        console.error(error);
        pushImagePasteDropDemoLog("Failed to read dropped image.");
    }
};

const handleImagePasteDropDemoPick = async (event) => {
    const files = Array.from(event?.target?.files || []).filter(
        (file) => file.type && file.type.startsWith("image/")
    );

    if (!files.length) return;

    try {
        const images = await readImagePasteDropDemoFilesAsDataUrls(files);
        insertImagePasteDropDemoImages(images);
        pushImagePasteDropDemoLog(
            `Inserted from file picker: ${images.map((item) => item.name).join(", ")}`
        );
    } catch (error) {
        console.error(error);
        pushImagePasteDropDemoLog("Failed to read selected image.");
    } finally {
        event.target.value = "";
    }
};

const bindImagePasteDropDemoEvents = () => {
    if (!imagePasteDropDemoHost.value) return;

    imagePasteDropDemoHost.value.addEventListener(
        "paste",
        handleImagePasteDropDemoPaste,
        true
    );
    imagePasteDropDemoHost.value.addEventListener(
        "drop",
        handleImagePasteDropDemoDrop,
        true
    );
};

const unbindImagePasteDropDemoEvents = () => {
    if (!imagePasteDropDemoHost.value) return;

    imagePasteDropDemoHost.value.removeEventListener(
        "paste",
        handleImagePasteDropDemoPaste,
        true
    );
    imagePasteDropDemoHost.value.removeEventListener(
        "drop",
        handleImagePasteDropDemoDrop,
        true
    );
};

onMounted(() => {
    bindImagePasteDropDemoEvents();
});

onBeforeUnmount(() => {
    unbindImagePasteDropDemoEvents();
});
</script>

当你希望 `PowerEditor` 支持“直接粘贴图片”或“把图片拖进编辑器”时，推荐在编辑器外层容器监听原生 `paste` / `drop` 事件，然后把图片文件读成 Data URL，再插入到编辑器中。

这种方式和 `Fab3` 里的 `editorBlock.vue` 思路一致：

- 在宿主容器上绑定原生事件
- 从 `ClipboardEvent` 或 `DragEvent` 里提取图片文件
- 用 `FileReader` 转成 base64 Data URL
- 通过编辑器命令插入 `<img>`
- 如果你还配置了 `imgInterceptor`，插入后的图片还能继续走上传、替换、状态提示等流程

## 适用场景

- 用户按 `Ctrl + V` / `Cmd + V` 直接粘贴截图
- 用户把本地图片文件拖进编辑器
- 希望先本地预览，再交给 `imgInterceptor` 上传

## 实现思路

整体流程如下：

1. 在组件挂载后给编辑器容器绑定 `paste` 和 `drop`
2. 过滤出 `image/*` 类型文件
3. 把文件转成 Data URL
4. 调用 Tiptap `insertContent()` 插入图片
5. 在组件卸载时移除监听器

## 可直接运行的示例

这个 demo 就是完整可运行的文档示例：

- 把图片拖进编辑器区域
- 在编辑器聚焦后直接粘贴截图
- 或点击按钮选择本地图片文件

<div ref="imagePasteDropDemoHost" class="image-paste-drop-demo">
    <div class="image-paste-drop-demo-toolbar">
        <fv-button
            :theme="viteData.isDark.value ? 'dark' : 'light'"
            @click="imagePasteDropDemoInput?.click?.()"
        >
            选择图片
        </fv-button>
        <span class="image-paste-drop-demo-tip">
            支持拖拽、粘贴、文件选择
        </span>
    </div>
    <input
        ref="imagePasteDropDemoInput"
        type="file"
        accept="image/*"
        multiple
        style="display: none"
        @change="handleImagePasteDropDemoPick"
    />
    <power-editor
        ref="imagePasteDropDemoEditor"
        v-model="imagePasteDropDemoContent"
        :theme="viteData.isDark.value ? 'dark' : 'light'"
        :mobileDisplayWidth="350"
        style="width: 100%;"
    />
    <div class="image-paste-drop-demo-log">
        <p
            v-for="(item, index) in imagePasteDropDemoLogs"
            :key="`${index}-${item}`"
        >
            {{ item }}
        </p>
    </div>
</div>

## 完整示例

下面这个示例可以直接放到你的业务组件里。它同时支持图片粘贴和拖拽，并保留 `imgInterceptor` 的扩展能力。

```vue
<template>
    <div ref="container" class="editor-host">
        <power-editor
            ref="editor"
            v-model="content"
            :theme="theme"
            :img-interceptor="imgInterceptor"
            style="width: 100%;"
        />
    </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from "vue";

const container = ref(null);
const editor = ref(null);
const theme = ref("light");
const content = ref("<p>Paste or drop an image here.</p>");

const getClipboardImageFiles = (items = []) => {
    const imageFiles = [];

    for (const item of items) {
        if (item.kind !== "file") continue;
        if (!item.type || !item.type.startsWith("image/")) continue;

        const file = item.getAsFile ? item.getAsFile() : null;
        if (file) imageFiles.push(file);
    }

    return imageFiles;
};

const readFilesAsDataUrls = async (files = []) => {
    return await Promise.all(
        files.map(
            (file) =>
                new Promise((resolve, reject) => {
                    const reader = new FileReader();

                    reader.onload = (event) => resolve(event.target.result);
                    reader.onerror = () => reject(new Error("Read image file failed"));
                    reader.readAsDataURL(file);
                })
        )
    );
};

const insertImages = (dataUrls = []) => {
    if (!dataUrls.length) return;

    const tiptap = editor.value?.editor?.();
    if (!tiptap) return;

    dataUrls.forEach((src) => {
        tiptap
            .chain()
            .focus()
            .insertContent(`<img src="${src}" theme="${theme.value}"></img>`)
            .run();
    });
};

const handleImagePaste = async (event) => {
    const imageFiles = getClipboardImageFiles(event?.clipboardData?.items || []);

    if (imageFiles.length === 0) return;

    event.preventDefault();

    try {
        const dataUrls = await readFilesAsDataUrls(imageFiles);
        insertImages(dataUrls);
    } catch (error) {
        console.error(error);
    }
};

const handleImageDrop = async (event) => {
    const files = Array.from(event?.dataTransfer?.files || []).filter(
        (file) => file.type && file.type.startsWith("image/")
    );

    if (files.length === 0) return;

    event.preventDefault();

    try {
        const dataUrls = await readFilesAsDataUrls(files);
        insertImages(dataUrls);
    } catch (error) {
        console.error(error);
    }
};

const bindNativeImageEvents = () => {
    if (!container.value) return;

    container.value.addEventListener("paste", handleImagePaste, true);
    container.value.addEventListener("drop", handleImageDrop, true);
};

const unbindNativeImageEvents = () => {
    if (!container.value) return;

    container.value.removeEventListener("paste", handleImagePaste, true);
    container.value.removeEventListener("drop", handleImageDrop, true);
};

const imgInterceptor = async ({
    getImage,
    interceptImage,
    showStatus,
    updateStatus,
    updateImage,
    updateLock,
}) => {
    const src = getImage();

    if (!src || !src.startsWith("data:image")) {
        return;
    }

    const originalSrc = interceptImage("");
    showStatus(true);
    updateLock(true);
    updateStatus(true, 0, "Uploading Image...");

    try {
        await new Promise((resolve) => setTimeout(resolve, 600));

        updateStatus(true, 100, "Upload Complete");
        updateImage(originalSrc);
    } catch (error) {
        console.error(error);
        updateImage(originalSrc);
    } finally {
        showStatus(false);
        updateLock(false);
    }
};

onMounted(() => {
    bindNativeImageEvents();
});

onBeforeUnmount(() => {
    unbindNativeImageEvents();
});
</script>
```

## 如果你使用 Options API

这版写法更接近 `Fab3` 里的 `editorBlock.vue`。

```js
export default {
    methods: {
        getEditor() {
            return this.$refs.editor;
        },
        getClipboardImageFiles(items = []) {
            const imageFiles = [];

            for (const item of items) {
                if (item.kind !== "file") continue;
                if (!item.type || !item.type.startsWith("image/")) continue;

                const file = item.getAsFile ? item.getAsFile() : null;
                if (file) imageFiles.push(file);
            }

            return imageFiles;
        },
        async readFilesAsDataUrls(files = []) {
            return await Promise.all(
                files.map(
                    (file) =>
                        new Promise((resolve, reject) => {
                            const reader = new FileReader();
                            reader.onload = (event) => resolve(event.target.result);
                            reader.onerror = () => reject(new Error("Read image file failed"));
                            reader.readAsDataURL(file);
                        })
                )
            );
        },
        insertImages(dataUrls = []) {
            const tiptap = this.getEditor()?.editor?.();
            if (!tiptap) return;

            dataUrls.forEach((src) => {
                tiptap
                    .chain()
                    .focus()
                    .insertContent(`<img src="${src}" theme="${this.theme}"></img>`)
                    .run();
            });
        },
        async handleImagePaste(event) {
            const imageFiles = this.getClipboardImageFiles(
                event?.clipboardData?.items || []
            );

            if (imageFiles.length === 0) return;

            event.preventDefault();

            const dataUrls = await this.readFilesAsDataUrls(imageFiles);
            this.insertImages(dataUrls);
        },
        async handleImageDrop(event) {
            const files = Array.from(event?.dataTransfer?.files || []).filter(
                (file) => file.type && file.type.startsWith("image/")
            );

            if (files.length === 0) return;

            event.preventDefault();

            const dataUrls = await this.readFilesAsDataUrls(files);
            this.insertImages(dataUrls);
        },
        bindNativeImageEvents() {
            this.$nextTick(() => {
                if (!this.$el) return;

                this.$el.addEventListener("paste", this.handleImagePaste, true);
                this.$el.addEventListener("drop", this.handleImageDrop, true);
            });
        },
    },
    mounted() {
        this.bindNativeImageEvents();
    },
    beforeUnmount() {
        if (!this.$el) return;

        this.$el.removeEventListener("paste", this.handleImagePaste, true);
        this.$el.removeEventListener("drop", this.handleImageDrop, true);
    },
};
```

## 和 `imgInterceptor` 的关系

`handleImagePaste` / `handleImageDrop` 负责“把本地图片插进编辑器”。  
`imgInterceptor` 负责“图片插入后如何处理”。

推荐组合方式：

- `handleImagePaste` / `handleImageDrop`：把图片转成 Data URL 并插入
- `imgInterceptor`：上传到服务器、显示进度、替换成远程地址

这样职责会比较清晰。

## 常见问题

### 1. 为什么要监听外层容器，而不是只监听编辑器内部 DOM？

因为业务组件通常更容易拿到外层容器，也更方便统一解绑事件。  
只要事件冒泡路径能覆盖到编辑器区域，就可以正常工作。

### 2. 为什么插入的是 Data URL？

因为 Data URL 能立即预览，不需要等上传完成。  
之后再通过 `imgInterceptor` 把临时地址替换成真正的远程地址。

### 3. 拖拽图片后为什么要 `preventDefault()`？

如果不阻止默认行为，浏览器可能直接打开图片文件，而不是把它插入编辑器。

### 4. 多张图片可以一次插入吗？

可以。上面的示例已经支持一次读取多个文件，并逐个插入。

## 最小接入示例

如果你已经有 `PowerEditor` 实例，最少只需要下面三步：

```js
this.$el.addEventListener("paste", this.handleImagePaste, true);
this.$el.addEventListener("drop", this.handleImageDrop, true);
this.$el.removeEventListener("paste", this.handleImagePaste, true);
```

再加上：

- `getClipboardImageFiles()`
- `readFilesAsDataUrls()`
- `insertImages()`

就能把图片粘贴和拖拽接进来。

<style>
.image-paste-drop-demo {
    padding: 16px;
    border: 1px solid rgba(120, 120, 120, 0.18);
    border-radius: 14px;
    background: linear-gradient(180deg, rgba(120, 120, 120, 0.06), rgba(120, 120, 120, 0.02));
}

.image-paste-drop-demo-toolbar {
    display: flex;
    gap: 12px;
    align-items: center;
    margin-bottom: 12px;
}

.image-paste-drop-demo-tip {
    font-size: 13px;
    color: var(--vp-c-text-2);
}

.image-paste-drop-demo-log {
    margin-top: 12px;
    padding: 12px 14px;
    border-radius: 10px;
    background: rgba(120, 120, 120, 0.08);
    font-size: 13px;
}

.image-paste-drop-demo-log p {
    margin: 0 0 6px;
}

.image-paste-drop-demo-log p:last-child {
    margin-bottom: 0;
}
</style>
