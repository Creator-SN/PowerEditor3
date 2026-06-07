# Snapshot Compare

This page explains how to compare two editor snapshots and render the review result with `power-editor`.

1. Prepare two Tiptap JSON documents.
2. Render them with `power-editor`.
3. Call `getJSON()` on the source and target editors.
4. Compute the diff with `computeDiff()` or `diffTool.compareDiff()`.
5. Render the final review result in another `power-editor`.

## Overview

`Snapshot Compare` turns two editor snapshots into a review-ready diff result. It is a good fit for version previews, draft review, approval flows, and change playback.

## Diff Props On `<power-editor>`

The following props are available directly on `power-editor`. They can be used in this page's demo or in your own review screens.

| Prop | Type | Default | Description |
| :-- | :-- | :-- | :-- |
| `diffInlineBlockTypes` | `string[]` | `[]` | Additional block node types that should still be diffed like inline content. Use this for custom nodes that look block-level but should compare inner inline fragments. |
| `diffContainerBlockTypes` | `string[]` | `[]` | Additional block node types that should be diffed as container nodes. Useful for wrappers, layout containers, and custom nested structures. |
| `diffInsertColor` | `string` | `""` | Primary highlight color for inserted changes. |
| `diffDeleteColor` | `string` | `""` | Primary highlight color for deleted changes. |
| `diffInsertColorSec` | `string` | `""` | Secondary accent color for inserted changes, usually used for borders or supporting decoration. |
| `diffDeleteColorSec` | `string` | `""` | Secondary accent color for deleted changes. |
| `diffInsertHoverColor` | `string` | `""` | Hover highlight color for inserted changes. |
| `diffDeleteHoverColor` | `string` | `""` | Hover highlight color for deleted changes. |
| `diffInsertHoverColorSec` | `string` | `""` | Secondary hover accent color for inserted changes. |
| `diffDeleteHoverColorSec` | `string` | `""` | Secondary hover accent color for deleted changes. |

## Recommended Usage

- Add custom paragraph-like nodes to `diffInlineBlockTypes`.
- Add custom wrappers, cards, and layout nodes to `diffContainerBlockTypes`.
- If your review UI supports branding or theme switching, configure both base and hover colors together.

## Demo

The Chinese page contains the full interactive demo and source walkthrough:

- [Open the interactive demo](/components/powerEditor/snapshot-compare)

The main runtime entry used in projects looks like this:

```vue
<script setup>
import { ref } from "vue";
import { computeDiff, applyTrackedGroup } from "@creatorsn/powereditor3";

const sourceEditorRef = ref(null);
const targetEditorRef = ref(null);
const reviewEditorRef = ref(null);
const reviewContent = ref({
    type: "doc",
    content: [],
});

function compareSnapshots() {
    const sourceJson = sourceEditorRef.value?.editor?.()?.getJSON();
    const targetJson = targetEditorRef.value?.editor?.()?.getJSON();

    if (!sourceJson || !targetJson) {
        return;
    }

    const result = computeDiff(sourceJson, targetJson);
    reviewContent.value = result.reviewDoc;
}

function acceptChange(groupId) {
    const editor = reviewEditorRef.value?.editor?.();

    if (!editor) {
        return;
    }

    applyTrackedGroup(editor, groupId, "accept");
    reviewContent.value = editor.getJSON();
}
</script>

<template>
    <power-editor ref="sourceEditorRef" :model-value="sourceContent" />
    <power-editor ref="targetEditorRef" :model-value="targetContent" />
    <power-editor
        ref="reviewEditorRef"
        :model-value="reviewContent"
        :editable="false"
        :showToolBar="false"
        :diffInsertColor="'rgba(34, 197, 94, 0.18)'"
        :diffDeleteColor="'rgba(239, 68, 68, 0.18)'"
    />
</template>
```

## API Notes

- `computeDiff()` returns both `chunks` and `reviewDoc`.
- `diffTool.compareDiff()` returns the same result shape as `computeDiff()`.
- `reviewDoc` can be rendered directly by `power-editor`.
- `applyTrackedGroup()` applies an `accept` or `reject` action to a tracked change group.
- `power-editor` also exposes `compareDiff(sourceDoc, targetDoc)` on the component instance if you prefer to call the diff entry from a ref.
