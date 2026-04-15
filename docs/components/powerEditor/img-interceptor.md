# ImgInterceptor 图片拦截器

`imgInterceptor` 用于接管图片创建或图片数据变化后的处理流程。常见用途包括上传图片到服务端、替换临时地址、展示上传进度、上传失败后回滚图片状态等。

## 使用方式

```vue
<template>
    <power-editor :img-interceptor="imgInterceptor" />
</template>

<script>
export default {
    methods: {
        async imgInterceptor(ctx) {
            const originalSrc = ctx.getImage();

            ctx.showStatus(true);
            ctx.updateStatus(true, 0, 'Uploading...');
            ctx.updateLock(true);

            try {
                const localPreview = ctx.interceptImage(originalSrc);
                ctx.updateStatus(true, 50, 'Processing...');

                const uploadedUrl = await uploadImage(localPreview);

                ctx.updateImage(uploadedUrl);
                ctx.updateStatus(false, 100, 'Done');
            } finally {
                ctx.updateLock(false);
                ctx.showStatus(false);
            }
        }
    }
};
</script>
```

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
