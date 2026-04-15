# ImgInterceptor

`imgInterceptor` lets you control what happens after an image is created or its data changes. Typical use cases include uploading images to a server, replacing temporary URLs, showing upload progress and rolling back state after failures.

## Usage

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
