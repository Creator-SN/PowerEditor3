# ImgInterceptor 图片拦截器

`imgInterceptor` 用于接管图片创建或图片数据变化后的处理流程。常见用途包括上传图片到服务端、替换临时地址、展示上传进度、上传失败后回滚图片状态等。

<script setup>
import { ref } from "vue";
import { useData } from "vitepress";

const viteData = useData();
const uploadLog = ref("请在下面的编辑器中插入一张本地图片，触发虚拟上传流程。");
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
    uploadLog.value = "检测到本地图片，开始执行虚拟上传。";

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
                uploadLog.value = `虚拟上传中: ${percent}%`;
            }
        );

        showStatus(false);
        updateLock(false);

        if (res.code === 200) {
            uploadedObjectUrlSet.add(res.data.url);
            updateImage(res.data.url);
            uploadLog.value = `上传完成，已切换为本地对象地址预览: ${res.data.fullUrl}`;
        }
    } catch (error) {
        console.error(error);
        showStatus(false);
        updateLock(false);
        updateImage(originalSrc);
        uploadLog.value = "虚拟上传失败，已回滚到原始图片。将文件名包含 fail 可测试失败流程。";
    }
};
</script>

## 可直接运行的演示

下面这个示例就是一个 `power-editor` 实例。插入本地图片后，`imgInterceptor` 会把图片转换成 `Blob`，再走一段本地虚拟异步请求，最后把结果转成一个本地 `object URL` 用于预览。

这个 demo 额外做了一个“防循环上传”处理：当图片已经被替换成本地对象地址后，会先查 `uploadedObjectUrlSet`，命中就直接跳过，不再重复触发上传。因为示例没有真实服务端地址，所以这里用“本地对象地址 + 已上传标记”的方式模拟最终图片源。

<power-editor
    :theme="viteData.isDark.value ? 'dark' : 'light'"
    :img-interceptor="imgInterceptorDemo"
    :mobileDisplayWidth="350"
    style="width: 100%;"
/>

<p>{{ uploadLog }}</p>

## 示例封装写法

下面这段示例保留了 `imgInterceptTool` 和 `imgIntercept` 两层封装结构，同时把上传逻辑替换成文档中的本地虚拟请求。这样既能展示业务层封装方式，也能直接用于本地调试和演示。

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

在 `PowerEditor` 中挂载时，直接把最终拦截方法传给 `img-interceptor` 即可：

```vue
<template>
    <power-editor :img-interceptor="imgIntercept" />
</template>
```

## 本地虚拟请求演示代码

下面这段代码把服务端上传、进度回调和最终响应都替换成了本地虚拟实现，适合直接放进文档、示例页或调试页面中演示完整流程。

```vue
<script setup>
import { ref } from "vue";

const uploadLog = ref("请插入一张本地图片。");
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
                uploadLog.value = `虚拟上传中: ${percent}%`;
            }
        );

        showStatus(false);
        updateLock(false);

        if (res.code === 200) {
            uploadedObjectUrlSet.add(res.data.url);
            updateImage(res.data.url);
            uploadLog.value = `上传完成: ${res.data.fullUrl}`;
        }
    } catch (error) {
        console.error(error);
        showStatus(false);
        updateLock(false);
        updateImage(oriUrl);
        uploadLog.value = "上传失败，已恢复原图。";
    }
};
</script>

<template>
    <power-editor :img-interceptor="imgInterceptor" />
    <p>{{ uploadLog }}</p>
</template>
```

## Demo 实现思路

这个 demo 主要是为了演示 `imgInterceptor` 的完整链路，所以实现上故意保留了几个容易看懂的步骤：

1. 用户插入图片后，先通过 `getImage()` 取到当前 `src`。
2. 只有当 `src` 是 `data:image`、`file:///` 或 `blob:` 时，才认为它是“刚插入、还没处理”的本地图片。
3. 命中后先调用 `interceptImage("")`，把当前图片节点临时清空，再显示上传状态层。
4. 如果是 base64，就先转成 `Blob`；如果是 `file:///` 或 `blob:`，就用 `fetch` 读回来再转成 `Blob`。
5. 再把这个 `Blob` 交给本地虚拟上传函数 `mockUploadBinaryImage`，里面用定时器模拟进度回调和异步响应。
6. 上传成功后，不返回真实远程图，而是返回一个本地 `object URL` 作为“最终图片地址”。
7. 这个 `object URL` 会先存进 `uploadedObjectUrlSet`，然后再 `updateImage(res.data.url)`。
8. 当图片 `src` 因为 `updateImage` 再次变化时，`imgInterceptor` 会重新执行一次，但这次会先被 `uploadedObjectUrlSet.has(src)` 拦住，所以不会再次上传。

也就是说，这个 demo 的关键不是抽象的“防循环策略”，而是这两个具体动作配合在一起：

| 动作 | 作用 |
| :-- | :-- |
| 把最终结果改成 `object URL` | 模拟“上传成功后拿到一个新图片地址” |
| 用 `uploadedObjectUrlSet` 记录这个地址 | 保证这个新地址再次进入拦截器时会被直接跳过 |

因为这只是文档演示，没有真实服务端，所以这里没有直接把图片替换成线上 URL，而是用“本地对象地址 + 已处理标记”来把整条流程跑通。

## 函数参数

`imgInterceptor` 接收一个上下文对象，包含当前图片节点信息和一组控制函数。

| 字段 | 类型 | 说明 |
| :-- | :-- | :-- |
| `node` | `object` | 当前图片节点对象。 |
| `extension` | `object` | 当前图片节点扩展对象。 |
| `getPos` | `function` | 获取当前节点位置。 |
| `updateAttributes` | `function` | 更新当前节点属性。 |
| `deleteNode` | `function` | 删除当前图片节点。 |
| `showStatus` | `function` | 控制是否显示图片状态层。 |
| `updateStatus` | `function` | 更新上传或处理状态。 |
| `getImage` | `function` | 获取当前图片的 `src`。 |
| `interceptImage` | `function` | 用临时地址替换图片 `src`，并返回原始 `src`。 |
| `updateImage` | `function` | 更新图片最终 `src`。 |
| `updateLock` | `function` | 控制拦截器锁定状态。 |

## 控制函数

### `showStatus(status)`

显示或隐藏图片状态层。

| 参数 | 说明 |
| :-- | :-- |
| `status` | `true` 表示显示，`false` 表示隐藏。 |

### `updateStatus(loading, progress, info)`

更新图片状态层内容。

| 参数 | 说明 |
| :-- | :-- |
| `loading` | 是否显示加载状态。 |
| `progress` | 处理进度，建议范围为 `0` 到 `100`。 |
| `info` | 状态文案。 |

### `getImage()`

返回当前图片节点的 `src`。

### `interceptImage(replaceSrc)`

在处理过程中临时替换图片 `src`，并返回图片原始 `src`。适合先显示本地预览或占位图，再等待上传完成。

### `updateImage(src)`

将图片节点更新为最终 `src`。

### `updateLock(lock)`

更新拦截器锁定状态。上传或异步处理期间建议锁定，处理结束后解锁。

| 参数 | 说明 |
| :-- | :-- |
| `lock` | `true` 表示锁定，`false` 表示解锁。 |

## 完整函数签名

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
