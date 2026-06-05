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

If you want `PowerEditor` to support image paste and image drag-and-drop, a practical approach is to listen to native `paste` and `drop` events on the outer container, convert image files to Data URLs, and then insert them into the editor.

This follows the same idea used in `Fab3`'s `editorBlock.vue`:

- Bind native events on the host container
- Extract image files from `ClipboardEvent` or `DragEvent`
- Convert files to base64 Data URLs with `FileReader`
- Insert `<img>` through editor commands
- Let `imgInterceptor` continue with upload, replacement, and status updates if needed

## Use Cases

- Users paste screenshots with `Ctrl + V` or `Cmd + V`
- Users drag local image files into the editor
- You want instant local preview before uploading through `imgInterceptor`

## How It Works

The flow is straightforward:

1. Bind `paste` and `drop` after the component is mounted
2. Filter `image/*` files
3. Convert files to Data URLs
4. Use Tiptap `insertContent()` to insert images
5. Remove listeners when the component is unmounted

## Live Demo

This demo is interactive on the docs page itself:

- Drop image files into the editor area
- Focus the editor and paste a screenshot
- Or use the button to pick local image files

<div ref="imagePasteDropDemoHost" class="image-paste-drop-demo">
    <div class="image-paste-drop-demo-toolbar">
        <fv-button
            :theme="viteData.isDark.value ? 'dark' : 'light'"
            @click="imagePasteDropDemoInput?.click?.()"
        >
            Choose Images
        </fv-button>
        <span class="image-paste-drop-demo-tip">
            Supports drag-and-drop, paste, and file picker
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

## Full Example

The example below can be used directly in your app. It supports both image paste and drag-and-drop, and still works well with `imgInterceptor`.

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

## Options API Version

This version is closer to the pattern used in `Fab3`'s `editorBlock.vue`.

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

## Relationship With `imgInterceptor`

`handleImagePaste` and `handleImageDrop` are responsible for inserting local images into the editor.  
`imgInterceptor` is responsible for what happens after the image is inserted.

A good separation is:

- `handleImagePaste` / `handleImageDrop`: turn files into Data URLs and insert them
- `imgInterceptor`: upload to the server, show progress, and replace the final URL

## FAQ

### 1. Why bind to the outer container instead of only the inner editor DOM?

Because the outer container is usually easier to access from business components, and it is also a cleaner place to bind and unbind native events.

### 2. Why insert Data URLs first?

Because they can be previewed immediately. Later, `imgInterceptor` can replace them with remote URLs after upload.

### 3. Why call `preventDefault()` on drop?

Without it, the browser may open the dropped image file instead of inserting it into the editor.

### 4. Can this insert multiple images at once?

Yes. The examples above already support reading multiple files and inserting them one by one.

## Minimal Setup

If you already have a `PowerEditor` instance, the minimum setup is:

```js
this.$el.addEventListener("paste", this.handleImagePaste, true);
this.$el.addEventListener("drop", this.handleImageDrop, true);
this.$el.removeEventListener("paste", this.handleImagePaste, true);
```

Then add:

- `getClipboardImageFiles()`
- `readFilesAsDataUrls()`
- `insertImages()`

and image paste / drag-and-drop will work.

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
