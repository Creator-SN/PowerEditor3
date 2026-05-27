# ImgInterceptor

`imgInterceptor` lets you control what happens after an image is created or its data changes. Typical use cases include uploading images to a server, replacing temporary URLs, showing upload progress, and rolling back state after failures.

<script setup>
import { ref } from "vue";
import { useData } from "vitepress";

const viteData = useData();
const uploadLog = ref("Insert a local image in the editor below to trigger the mock upload flow.");
const mockRemoteServer = "https://mock.power-editor.local";
const uploadedObjectUrlSet = new Set();

const sleep = (time) => new Promise((resolve) => setTimeout(resolve, time));

const shouldUploadImageSrc = (src) => {
    if (!src) {
        return false;
    }

    if (uploadedObjectUrlSet.has(src)) {
        return false;
    }

    return src.startsWith("data:image") || src.startsWith("file:///") || src.startsWith("blob:");
};

const base64ToBlob = (base64, mimeType = "image/png") => {
    const base64Data = base64.split(",")[1] || "";
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    return new Blob([new Uint8Array(byteNumbers)], { type: mimeType });
};

const mockUploadBinaryImage = (targetId, { file }, _config, onProgress) => {
    return new Promise((resolve, reject) => {
        const total = file?.size || 1024 * 1024;
        let loaded = 0;
        let tickCount = 0;
        const failByName = file?.name?.toLowerCase?.().includes("fail");

        const timer = setInterval(() => {
            tickCount += 1;
            loaded = Math.min(total, loaded + Math.max(total / 5, 1));
            onProgress?.({
                loaded,
                total,
            });

            if (tickCount < 5) {
                return;
            }

            clearInterval(timer);

            if (failByName) {
                reject(new Error("Mock upload failed."));
                return;
            }

            const objectUrl = URL.createObjectURL(file);
            const id = `mock-${Date.now()}`;

            resolve({
                code: 200,
                data: {
                    id,
                    url: objectUrl,
                    fullUrl: `${mockRemoteServer}/sources/image/${id}`,
                },
                message: "success",
                targetId,
            });
        }, 250);
    });
};

const imgInterceptorDemo = async ({
    getImage,
    interceptImage,
    showStatus,
    updateStatus,
    updateImage,
    updateLock,
}) => {
    const src = getImage();

    if (!shouldUploadImageSrc(src)) {
        return;
    }

    let blob = null;

    if (src.startsWith("data:image")) {
        const mimeType = src.split(";")[0].split(":")[1];
        blob = base64ToBlob(src, mimeType);
    } else if (src.startsWith("file:///") || src.startsWith("blob:")) {
        const response = await fetch(src);
        blob = await response.blob();
    }

    if (!blob) {
        return;
    }

    const originalSrc = interceptImage("");
    showStatus(true);
    updateLock(true);
    updateStatus(true, 0, "Uploading Image...");
    uploadLog.value = "Local image detected. Starting mock upload.";

    try {
        await sleep(300);

        const res = await mockUploadBinaryImage(
            "demo-note-id",
            {
                file: blob,
            },
            null,
            (progress) => {
                const { loaded, total } = progress;
                const percent = Math.floor((loaded / total) * 100);

                updateStatus(percent < 100, percent, `Uploading Image... ${percent}%`);
                uploadLog.value = `Mock upload in progress: ${percent}%`;
            }
        );

        showStatus(false);
        updateLock(false);

        if (res.code === 200) {
            uploadedObjectUrlSet.add(res.data.url);
            updateImage(res.data.url);
            uploadLog.value = `Upload complete. Switched to local object URL preview: ${res.data.fullUrl}`;
        }
    } catch (error) {
        console.error(error);
        showStatus(false);
        updateLock(false);
        updateImage(originalSrc);
        uploadLog.value = "Mock upload failed and the original image has been restored. Include fail in the filename to test this branch.";
    }
};
</script>

## Live Demo

The editor below uses `imgInterceptor` directly. After a local image is inserted, the interceptor converts it to a `Blob`, runs a mock async upload, and replaces the image with a local `object URL` preview.

This demo also avoids repeated uploads after replacement. Once the image has been switched to a local object URL, that URL is recorded in `uploadedObjectUrlSet`, so the next interceptor pass skips it instead of uploading again.

<power-editor
    :theme="viteData.isDark.value ? 'dark' : 'light'"
    :img-interceptor="imgInterceptorDemo"
    :mobileDisplayWidth="350"
    style="width: 100%;"
/>

<p>{{ uploadLog }}</p>

## Wrapper Example

The example below keeps the two-layer structure of `imgInterceptTool` and `imgIntercept`, while replacing the upload implementation with the same local mock request used by this page.

```js
const uploadedObjectUrlSet = new Set();

const sleep = (time) => new Promise((resolve) => setTimeout(resolve, time));

const base64ToBlob = (base64, mimeType = "image/png") => {
    const base64Data = base64.split(",")[1] || "";
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    return new Blob([new Uint8Array(byteNumbers)], { type: mimeType });
};

const shouldUploadImageSrc = (src) => {
    if (!src) {
        return false;
    }

    if (uploadedObjectUrlSet.has(src)) {
        return false;
    }

    return src.startsWith("data:image") || src.startsWith("file:///") || src.startsWith("blob:");
};

const mockUploadBinaryImage = (targetId, { file }, _config, onProgress) => {
    return new Promise((resolve, reject) => {
        const total = file?.size || 1024 * 1024;
        let loaded = 0;
        let tickCount = 0;

        const timer = setInterval(() => {
            tickCount += 1;
            loaded = Math.min(total, loaded + Math.max(total / 5, 1));
            onProgress?.({ loaded, total });

            if (tickCount < 5) {
                return;
            }

            clearInterval(timer);

            if (file?.name?.toLowerCase?.().includes("fail")) {
                reject(new Error("Mock upload failed."));
                return;
            }

            const objectUrl = URL.createObjectURL(file);
            const id = `mock-${Date.now()}`;

            resolve({
                code: 200,
                data: {
                    id,
                    url: objectUrl,
                    fullUrl: `https://mock.power-editor.local/sources/image/${id}`,
                },
                targetId,
            });
        }, 250);
    });
};

export default {
    data() {
        return {
            isRemote: true,
            target: {
                id: "demo-note-id",
            },
        };
    },
    methods: {
        async imgInterceptTool({
            getImage,
            interceptImage,
            showStatus,
            updateStatus,
            updateImage,
            isRemote,
            base64ToBlob
        }) {
            if (!isRemote) return;

            setTimeout(async () => {
                let src = getImage();
                let blob = null;

                if (!shouldUploadImageSrc(src)) return;

                if (src.startsWith("data:image")) {
                    let mimeType = src.split(";")[0].split(":")[1];
                    blob = base64ToBlob(src, mimeType);
                } else if (src.startsWith("file:///") || src.startsWith("blob:")) {
                    const response = await fetch(src);
                    blob = await response.blob();
                }

                if (!blob) return;

                let oriUrl = interceptImage("");
                showStatus(true);
                updateStatus(true, 0, "Uploading Image...");

                await sleep(300);

                mockUploadBinaryImage(
                    this.target.id,
                    {
                        file: blob
                    },
                    null,
                    (progress) => {
                        const { loaded, total } = progress;
                        let percent = Math.floor((loaded / total) * 100);
                        updateStatus(
                            percent < 100,
                            percent,
                            `Uploading Image... ${percent}%`
                        );
                    }
                )
                    .then((res) => {
                        showStatus(false);

                        if (res.code === 200) {
                            uploadedObjectUrlSet.add(res.data.url);
                            updateImage(res.data.url);
                        }
                    })
                    .catch((err) => {
                        console.error(err);
                        showStatus(false);
                        updateImage(oriUrl);
                    });
            }, 3000);
        },

        async imgIntercept({
            getImage,
            interceptImage,
            showStatus,
            updateStatus,
            updateImage
        }) {
            if (this.imgInterceptTool) {
                await this.imgInterceptTool({
                    getImage,
                    interceptImage,
                    showStatus,
                    updateStatus,
                    updateImage,
                    isRemote: this.isRemote,
                    base64ToBlob: this.base64ToBlob
                });
            }
        }
    }
};
```

Mount the final interceptor on `PowerEditor` through `img-interceptor`:

```vue
<template>
    <power-editor :img-interceptor="imgIntercept" />
</template>
```

## Mock Upload Demo Code

The snippet below replaces server upload, progress callbacks, and the final response with a local mock implementation. It is suitable for docs pages, demos, and local debugging.

```vue
<script setup>
import { ref } from "vue";

const uploadLog = ref("Insert a local image.");
const mockRemoteServer = "https://mock.power-editor.local";
const uploadedObjectUrlSet = new Set();

const sleep = (time) => new Promise((resolve) => setTimeout(resolve, time));

const shouldUploadImageSrc = (src) => {
    if (!src) {
        return false;
    }

    if (uploadedObjectUrlSet.has(src)) {
        return false;
    }

    return src.startsWith("data:image") || src.startsWith("file:///") || src.startsWith("blob:");
};

const base64ToBlob = (base64, mimeType = "image/png") => {
    const base64Data = base64.split(",")[1] || "";
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    return new Blob([new Uint8Array(byteNumbers)], { type: mimeType });
};

const mockUploadBinaryImage = (targetId, { file }, _config, onProgress) => {
    return new Promise((resolve, reject) => {
        const total = file?.size || 1024 * 1024;
        let loaded = 0;
        let tickCount = 0;

        const timer = setInterval(() => {
            tickCount += 1;
            loaded = Math.min(total, loaded + Math.max(total / 5, 1));
            onProgress?.({ loaded, total });

            if (tickCount < 5) {
                return;
            }

            clearInterval(timer);

            if (file?.name?.toLowerCase?.().includes("fail")) {
                reject(new Error("Mock upload failed."));
                return;
            }

            const objectUrl = URL.createObjectURL(file);
            const id = `mock-${Date.now()}`;

            resolve({
                code: 200,
                data: {
                    id,
                    url: objectUrl,
                    fullUrl: `${mockRemoteServer}/sources/image/${id}`,
                },
                message: "success",
                targetId,
            });
        }, 250);
    });
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

    if (!shouldUploadImageSrc(src)) {
        return;
    }

    let blob = null;

    if (src.startsWith("data:image")) {
        const mimeType = src.split(";")[0].split(":")[1];
        blob = base64ToBlob(src, mimeType);
    } else {
        const response = await fetch(src);
        blob = await response.blob();
    }

    if (!blob) {
        return;
    }

    const oriUrl = interceptImage("");
    showStatus(true);
    updateLock(true);
    updateStatus(true, 0, "Uploading Image...");

    try {
        await sleep(300);

        const res = await mockUploadBinaryImage(
            "demo-note-id",
            { file: blob },
            null,
            ({ loaded, total }) => {
                const percent = Math.floor((loaded / total) * 100);
                updateStatus(percent < 100, percent, `Uploading Image... ${percent}%`);
                uploadLog.value = `Mock upload in progress: ${percent}%`;
            }
        );

        showStatus(false);
        updateLock(false);

        if (res.code === 200) {
            uploadedObjectUrlSet.add(res.data.url);
            updateImage(res.data.url);
            uploadLog.value = `Upload complete: ${res.data.fullUrl}`;
        }
    } catch (error) {
        console.error(error);
        showStatus(false);
        updateLock(false);
        updateImage(oriUrl);
        uploadLog.value = "Upload failed and the original image has been restored.";
    }
};
</script>

<template>
    <power-editor :img-interceptor="imgInterceptor" />
    <p>{{ uploadLog }}</p>
</template>
```

## Demo Flow

This demo is designed to show the complete `imgInterceptor` flow in a way that is easy to inspect:

1. After a user inserts an image, `getImage()` reads the current `src`.
2. Only `data:image`, `file:///`, and `blob:` values are treated as local sources that still need processing.
3. `interceptImage("")` temporarily clears the image and lets the status layer take over.
4. Base64 data is converted into a `Blob`, while `file:///` and `blob:` sources are fetched back into a `Blob`.
5. The `Blob` is passed to `mockUploadBinaryImage`, which simulates upload progress and an async response.
6. On success, the demo returns a local `object URL` instead of a real remote image URL.
7. That `object URL` is stored in `uploadedObjectUrlSet` before calling `updateImage(res.data.url)`.
8. When `updateImage` triggers another interceptor pass, `uploadedObjectUrlSet.has(src)` makes that second pass exit immediately, so the image is not uploaded again.

In other words, the demo avoids repeated uploads through two concrete steps working together:

| Step | Purpose |
| :-- | :-- |
| Replace the final image with an `object URL` | Simulates the “new image URL after upload” phase |
| Record that URL in `uploadedObjectUrlSet` | Makes the next interceptor pass skip it immediately |

Because this is a documentation demo without a real backend, it uses “local object URL + processed URL set” to model the full lifecycle.

## Context

`imgInterceptor` receives a context object with the current image node and helper functions.

| Field | Type | Description |
| :-- | :-- | :-- |
| `node` | `object` | Current image node. |
| `extension` | `object` | Current image node extension. |
| `getPos` | `function` | Returns the current node position. |
| `updateAttributes` | `function` | Updates current node attributes. |
| `deleteNode` | `function` | Deletes the current image node. |
| `showStatus` | `function` | Shows or hides the image status layer. |
| `updateStatus` | `function` | Updates upload or processing status. |
| `getImage` | `function` | Returns the current image `src`. |
| `interceptImage` | `function` | Replaces image `src` temporarily and returns the original `src`. |
| `updateImage` | `function` | Updates the final image `src`. |
| `updateLock` | `function` | Updates interceptor lock state. |

## Helper Functions

### `showStatus(status)`

Shows or hides the image status layer.

| Param | Description |
| :-- | :-- |
| `status` | `true` to show, `false` to hide. |

### `updateStatus(loading, progress, info)`

Updates the status layer.

| Param | Description |
| :-- | :-- |
| `loading` | Whether loading state is visible. |
| `progress` | Processing progress. Recommended range: `0` to `100`. |
| `info` | Status text. |

### `getImage()`

Returns the current image node `src`.

### `interceptImage(replaceSrc)`

Temporarily replaces the image `src` during processing and returns the original `src`. This is useful for local previews or placeholders before upload is finished.

### `updateImage(src)`

Updates the image node with the final `src`.

### `updateLock(lock)`

Updates interceptor lock state. Lock during upload or async processing, then unlock after it finishes.

| Param | Description |
| :-- | :-- |
| `lock` | `true` to lock, `false` to unlock. |

## Full Signature

```js
const imgInterceptor = ({
    node,
    extension,
    getPos,
    updateAttributes,
    deleteNode,
    showStatus,
    updateStatus,
    getImage,
    interceptImage,
    updateImage,
    updateLock
}) => {
    // custom upload or processing logic
};
```
