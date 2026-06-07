# Snapshot Compare

This page demonstrates a snapshot compare flow for `power-editor`.

1. Prepare two Tiptap JSON documents.
2. Render them with `power-editor`.
3. Call `getJSON()` on source and target.
4. Compute diff with `computeDiff()` or `diffTool.compareDiff()`.
5. Render the final review result in another `power-editor`.

## 说明 / Overview

`Snapshot Compare` 用于把两个编辑器快照转换为可审阅的差异结果，适合版本预览、草稿校对、审批确认和变更回放。

`Snapshot Compare` turns two editor snapshots into a review-ready diff result. It is useful for version previews, draft review, approval flows, and change playback.

## 主编辑器中的 Diff Props / Diff Props On `<power-editor>`

下面这些属性已经在主编辑器 `power-editor` 上可直接使用，既可以用于本页示例，也可以用于你自己的审阅页面。

The following props are available directly on `power-editor`. They work both for this demo and for your own review UIs.

| Prop | Type | Default | 中文说明 | English |
| :-- | :-- | :-- | :-- | :-- |
| `diffInlineBlockTypes` | `string[]` | `[]` | 扩展按“行内内容 diff”处理的块级节点类型。适合外观像块节点、但内容仍应逐段比较的自定义节点。 | Extends block node types that should still be diffed like inline content. Useful for custom block-looking nodes whose inner fragments should be compared inline. |
| `diffContainerBlockTypes` | `string[]` | `[]` | 扩展按“容器节点 diff”处理的块级节点类型。适合包装器、布局容器、多子节点结构。 | Extends block node types that should be handled as diff containers, such as wrappers, layout containers, or nested custom structures. |
| `diffInsertColor` | `string` | `""` | 插入变更主色。 | Primary color for inserted changes. |
| `diffDeleteColor` | `string` | `""` | 删除变更主色。 | Primary color for deleted changes. |
| `diffInsertColorSec` | `string` | `""` | 插入变更辅助色，常用于边框或装饰。 | Secondary accent for inserted changes, usually for borders or decoration. |
| `diffDeleteColorSec` | `string` | `""` | 删除变更辅助色。 | Secondary accent for deleted changes. |
| `diffInsertHoverColor` | `string` | `""` | 鼠标移入插入变更时的高亮色。 | Hover highlight color for inserted changes. |
| `diffDeleteHoverColor` | `string` | `""` | 鼠标移入删除变更时的高亮色。 | Hover highlight color for deleted changes. |
| `diffInsertHoverColorSec` | `string` | `""` | 插入变更 hover 状态的辅助色。 | Secondary hover accent for inserted changes. |
| `diffDeleteHoverColorSec` | `string` | `""` | 删除变更 hover 状态的辅助色。 | Secondary hover accent for deleted changes. |

### 推荐场景 / Recommended Usage

- 自定义段落类节点时，优先补充到 `diffInlineBlockTypes`。
- 自定义容器、卡片、布局块时，优先补充到 `diffContainerBlockTypes`。
- 如果你的审阅界面有品牌色或深浅主题切换，建议同时配置普通态和 hover 态颜色。
- When you introduce custom paragraph-like nodes, start with `diffInlineBlockTypes`.
- When you introduce custom containers, cards, or layout wrappers, start with `diffContainerBlockTypes`.
- If your review UI has brand colors or light/dark themes, configure both base and hover colors together.

<script setup>
import { nextTick, onMounted, ref } from "vue";
import { useData } from "vitepress";
import { computeDiff } from "@/packages/editor/src/js/diffTool/index.js";
import { applyTrackedGroup } from "@/packages/editor/src/js/diffTool/apply.js";

const viteData = useData();
const sourceEditorRef = ref(null);
const targetEditorRef = ref(null);
const reviewEditorRef = ref(null);
const reviewContent = ref({
	type: "doc",
	content: [],
});
const reviewChanges = ref([]);

const sourceContent = ref({
	type: "doc",
	content: [
		{
			type: "heading",
			attrs: {
				level: 2,
			},
			content: [
				{
					type: "text",
					text: "Snapshot Compare Overview",
				},
			],
		},
		{
			type: "paragraph",
			attrs: {
				textAlign: null,
			},
			content: [
				{
					type: "text",
					text: "This source snapshot keeps the original editor structure before changes.",
				},
			],
		},
		{
			type: "bulletList",
			content: [
				{
					type: "listItem",
					content: [
						{
							type: "paragraph",
							content: [
								{
									type: "text",
									text: "Export editor state with getJSON()",
								},
							],
						},
					],
				},
				{
					type: "listItem",
					content: [
						{
							type: "paragraph",
							content: [
								{
									type: "text",
									text: "Keep heading and paragraph nodes",
								},
							],
						},
					],
				},
			],
		},
	],
});

const targetContent = ref({
	type: "doc",
	content: [
		{
			type: "heading",
			attrs: {
				level: 2,
			},
			content: [
				{
					type: "text",
					text: "Snapshot Compare Overview",
				},
			],
		},
		{
			type: "paragraph",
			attrs: {
				textAlign: null,
			},
			content: [
				{
					type: "text",
					text: "This target snapshot keeps the updated editor structure after changes.",
				},
				{
					type: "inlineEquation",
					attrs: {
						value: "A_a",
						tag: "span",
						placeholder: "Y=WX^T+b",
						emptyPlaceholder: "New Equation",
						showPopper: false,
					},
				},
			],
		},
		{
			type: "bulletList",
			content: [
				{
					type: "listItem",
					content: [
						{
							type: "paragraph",
							content: [
								{
									type: "text",
									text: "Export editor state with getJSON()",
								},
							],
						},
					],
				},
				{
					type: "listItem",
					content: [
						{
							type: "paragraph",
							content: [
								{
									type: "text",
									text: "Keep heading and paragraph nodes",
								},
							],
						},
					],
				},
				{
					type: "listItem",
					content: [
						{
							type: "paragraph",
							content: [
								{
									type: "text",
									text: "Add a new snapshot compare debug entry",
								},
							],
						},
					],
				},
			],
		},
	],
});

function truncateText(text = "", max = 48) {
	const normalized = String(text).replace(/\s+/g, " ").trim();

	if (!normalized) {
		return "";
	}

	return normalized.length > max
		? `${normalized.slice(0, max - 1)}...`
		: normalized;
}

function getNodeLabel(node = {}) {
	const labels = {
		paragraph: "Paragraph",
		heading: "Heading",
		bulletList: "Bullet List",
		orderedList: "Ordered List",
		listItem: "List Item",
		blockquote: "Blockquote",
		codeBlock: "Code Block",
		inlineEquation: "Inline Equation",
		equationBlock: "Equation Block",
		imageblock: "Image",
		mentionItem: "Mention",
		powerTaskItem: "Task Item",
	};

	return labels[node.type] || node.type || "Node";
}

function pushChangeOccurrence(changeMap, groupId, occurrence) {
	if (!groupId) {
		return;
	}

	if (!changeMap.has(groupId)) {
		changeMap.set(groupId, {
			groupId,
			order: changeMap.size,
			types: new Set(),
			snippets: [],
			count: 0,
		});
	}

	const entry = changeMap.get(groupId);
	entry.types.add(occurrence.type || "insert");
	entry.count += 1;

	if (
		occurrence.snippet &&
		!entry.snippets.includes(occurrence.snippet) &&
		entry.snippets.length < 3
	) {
		entry.snippets.push(occurrence.snippet);
	}
}

function collectReviewChanges(reviewDoc) {
	const changeMap = new Map();

    function walkTrackedChanges(node, changeMap) {
        if (!node || typeof node !== "object") {
            return;
        }

        const nodeChange = node.attrs?.trackedChange;

        if (nodeChange?.groupId) {
            pushChangeOccurrence(changeMap, nodeChange.groupId, {
                type: nodeChange.type,
                snippet: getNodeLabel(node),
            });
        }

        if (node.type === "text" && Array.isArray(node.marks)) {
            node.marks
                .filter((mark) => mark.type === "trackedChange" && mark.attrs?.groupId)
                .forEach((mark) => {
                    pushChangeOccurrence(changeMap, mark.attrs.groupId, {
                        type: mark.attrs.type,
                        snippet: node.text.slice(0, 48),
                    });
                });
        }

        if (Array.isArray(node.content)) {
            node.content.forEach((child) => walkTrackedChanges(child, changeMap));
        }
    }

	walkTrackedChanges(reviewDoc, changeMap);

	return Array.from(changeMap.values())
		.map((item) => {
			const types = Array.from(item.types);
			const type =
				types.includes("insert") && types.includes("delete")
					? "replace"
					: types[0] || "insert";

			return {
				groupId: item.groupId,
				type,
				typeLabel:
					type === "replace"
						? "Replace"
						: type === "delete"
							? "Delete"
							: "Insert",
				summary: item.snippets.join(" / ") || "Tracked change",
				fragmentCount: item.count,
				order: item.order,
			};
		})
		.sort((a, b) => a.order - b.order);
}

function syncReviewState(reviewDoc) {
	reviewContent.value = reviewDoc;
	reviewChanges.value = collectReviewChanges(reviewDoc);
}

function runCompare() {
	const sourceEditor = sourceEditorRef.value?.editor?.();
	const targetEditor = targetEditorRef.value?.editor?.();

	if (!sourceEditor || !targetEditor) {
		return;
	}

	const sourceJson = sourceEditor.getJSON();
	const targetJson = targetEditor.getJSON();
	const result = computeDiff(sourceJson, targetJson);

	syncReviewState(result.reviewDoc);

	console.log("source", sourceJson);
	console.log("target", targetJson);
	console.log("diff", result);
}

function applyReviewChange(groupId, action) {
	const reviewEditor = reviewEditorRef.value?.editor?.();

	if (!reviewEditor || !groupId) {
		return;
	}

	applyTrackedGroup(reviewEditor, groupId, action);
    for(let i = reviewChanges.value.length - 1; i >= 0; i--) {
        if (reviewChanges.value[i].groupId === groupId) {
            reviewChanges.value.splice(i, 1);
        }
    }
}

onMounted(() => {
	nextTick(() => {
		runCompare();
	});
});
</script>

<div class="snapshot-compare-demo">
<div class="snapshot-compare-toolbar">
<fv-button border-radius="6" style="width: 120px;" @click="runCompare">Run Compare</fv-button>
<span>The final review editor below is rendered from <code>index.js</code>.</span>
</div>

<div class="snapshot-compare-grid __three">
<div class="snapshot-compare-panel">
<h2>Source Snapshot</h2>
<power-editor
ref="sourceEditorRef"
:model-value="sourceContent"
:theme="viteData.isDark.value ? 'dark' : 'light'"
foreground="#0f766e"
toolbar-background="#f4fffd"
:showSave="false"
style="width: 100%;"
></power-editor>
</div>

<div class="snapshot-compare-panel">
<h2>Target Snapshot</h2>
<power-editor
ref="targetEditorRef"
:model-value="targetContent"
:theme="viteData.isDark.value ? 'dark' : 'light'"
foreground="#b45309"
toolbar-background="#fffaf0"
:showSave="false"
style="width: 100%;"
></power-editor>
</div>
</div>

<div class="snapshot-compare-review">
<h2>Review Result</h2>
<div class="snapshot-compare-review-layout">
<div class="snapshot-compare-review-editor">
<power-editor
ref="reviewEditorRef"
:model-value="reviewContent"
:theme="viteData.isDark.value ? 'dark' : 'light'"
:editable="false"
:showToolBar="false"
foreground="#1d4ed8"
style="width: 100%;"
></power-editor>
</div>

<aside class="snapshot-compare-review-sidebar">
<div class="snapshot-compare-review-sidebar-header">
<h3>Pending Changes</h3>
<span>{{ reviewChanges.length }}</span>
</div>

<div v-if="reviewChanges.length" class="snapshot-compare-change-list">
<div
v-for="change in reviewChanges"
:key="change.groupId"
class="snapshot-compare-change-item"
>
<div class="snapshot-compare-change-meta">
<span
class="snapshot-compare-change-badge"
:class="`__${change.type}`"
>{{ change.typeLabel }}</span>
<span class="snapshot-compare-change-count">{{ change.fragmentCount }} fragment(s)</span>
</div>
<p class="snapshot-compare-change-summary">{{ change.summary }}</p>
<div class="snapshot-compare-change-actions">
<fv-button
:theme="'dark'"
background="rgba(0, 204, 153, 1)"
border-radius="6"
@click="applyReviewChange(change.groupId, 'accept')"
>Accept</fv-button>
<fv-button
:theme="'dark'"
background="rgba(200, 38, 45, 1)"
border-radius="6"
@click="applyReviewChange(change.groupId, 'reject')"
>Reject</fv-button>
</div>
</div>
</div>

<div v-else class="snapshot-compare-change-empty">
All tracked changes in the review editor have been handled.
</div>
</aside>
</div>
</div>
</div>

## Example

### In This Docs Repo

The live demo on this page imports the source files directly, because VitePress here is running inside the same repository:

```js
import { computeDiff } from "@/packages/editor/src/js/diffTool/index.js";
import { applyTrackedGroup } from "@/packages/editor/src/js/diffTool/apply.js";
```

### After `yarn add @creatorsn/powereditor3`

After publishing and installing from npm, do not import from the internal source path above. Import from the package root instead:

```js
import {
    computeDiff,
    diffTool,
    applyTrackedGroup,
} from "@creatorsn/powereditor3";
```

If you are only using the default compare flow, `computeDiff(sourceDoc, targetDoc)` is enough.

If you want the configurable style, you can also write:

```js
import { diffTool } from "@creatorsn/powereditor3";

const result = diffTool
    .configure({
        extendInlineDiffBlockTypes: ["customParagraphLike"],
        extendContainerDiffBlockTypes: ["customContainerLike"],
    })
    .compareDiff(sourceDoc, targetDoc);
```

### Using Exposed Methods From `<power-editor>`

`power-editor` also exposes `compareDiff()` on its component instance. So if you already have an editor ref and want to reuse the editor-level configuration entry, this is also supported:

```vue
<script setup>
import { ref } from "vue";

const reviewEditorRef = ref(null);

function compareWithEditor(sourceDoc, targetDoc) {
    return reviewEditorRef.value?.compareDiff?.(sourceDoc, targetDoc);
}
</script>
```

This page's main demo still uses the direct `computeDiff()` + `applyTrackedGroup()` flow because it makes the diff pipeline easier to read.

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
const reviewChanges = ref([]);

function collectReviewChanges(reviewDoc) {
    return [];
}

function compareSnapshots() {
    const sourceJson = sourceEditorRef.value?.editor?.()?.getJSON();
    const targetJson = targetEditorRef.value?.editor?.()?.getJSON();
    const result = computeDiff(sourceJson, targetJson);

    reviewContent.value = result.reviewDoc;
    reviewChanges.value = collectReviewChanges(result.reviewDoc);
}

function applyChange(groupId, action) {
    const editor = reviewEditorRef.value?.editor?.();

    if (!editor) return;

    applyTrackedGroup(editor, groupId, action);
    reviewContent.value = editor.getJSON();
    reviewChanges.value = collectReviewChanges(reviewContent.value);
}
</script>

<template>
    <power-editor ref="sourceEditorRef" :model-value="sourceContent"></power-editor>
    <power-editor ref="targetEditorRef" :model-value="targetContent"></power-editor>
    <power-editor ref="reviewEditorRef" :model-value="reviewContent" :editable="false" :showToolBar="false"></power-editor>
    <fv-button @click="compareSnapshots">Compare</fv-button>
    <fv-button @click="applyChange(reviewChanges[0]?.groupId, 'accept')">Accept First Change</fv-button>
</template>
```

## Notes

- `model-value` in this demo uses Tiptap JSON documents instead of HTML strings.
- Paragraph inline content now supports `text`, `hardBreak`, `inlineEquation` and other inline atoms.
- `computeDiff()` returns both `chunks` and `reviewDoc`.
- `diffTool.compareDiff()` returns the same result shape as `computeDiff()`.
- `reviewDoc` can be rendered directly by `power-editor` as the final compare result.
- `applyTrackedGroup()` can be imported from `@creatorsn/powereditor3` after package installation.

<style scoped>
.snapshot-compare-demo {
	margin-top: 16px;
}

.snapshot-compare-toolbar {
	display: flex;
	align-items: center;
	gap: 12px;
	margin-bottom: 16px;
}

.snapshot-compare-grid {
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	gap: 20px;
}

.snapshot-compare-grid.__three {
	grid-template-columns: repeat(2, minmax(0, 1fr));
	margin-bottom: 20px;
}

.snapshot-compare-panel,
.snapshot-compare-review {
	padding: 16px;
	border: 1px solid var(--vp-c-divider);
	border-radius: 16px;
	background: var(--vp-c-bg-soft);
}

.snapshot-compare-review {
	padding: 20px;
}

.snapshot-compare-review-layout {
	display: grid;
	grid-template-columns: minmax(0, 1fr) 280px;
	gap: 16px;
	align-items: start;
}

.snapshot-compare-panel h2,
.snapshot-compare-review h2 {
	margin-top: 0;
}

.snapshot-compare-review-sidebar {
	padding: 14px;
	border-radius: 14px;
	border: 1px solid var(--vp-c-divider);
	background: var(--vp-c-bg);
}

.snapshot-compare-review-sidebar-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 12px;
	margin-bottom: 12px;
}

.snapshot-compare-review-sidebar-header h3 {
	margin: 0;
	font-size: 14px;
}

.snapshot-compare-review-sidebar-header span {
	font-size: 12px;
	color: var(--vp-c-text-2);
}

.snapshot-compare-change-list {
	display: flex;
	flex-direction: column;
	gap: 10px;
	max-height: 360px;
	overflow: auto;
}

.snapshot-compare-change-item {
	padding: 12px;
	border-radius: 12px;
	border: 1px solid var(--vp-c-divider);
	background: var(--vp-c-bg-soft);
}

.snapshot-compare-change-meta {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 8px;
	margin-bottom: 8px;
}

.snapshot-compare-change-badge {
	display: inline-flex;
	align-items: center;
	padding: 2px 8px;
	border-radius: 999px;
	font-size: 12px;
	font-weight: 600;
}

.snapshot-compare-change-badge.__insert {
	background: rgba(34, 197, 94, 0.14);
	color: #15803d;
}

.snapshot-compare-change-badge.__delete {
	background: rgba(239, 68, 68, 0.14);
	color: #b91c1c;
}

.snapshot-compare-change-badge.__replace {
	background: rgba(59, 130, 246, 0.14);
	color: #1d4ed8;
}

.snapshot-compare-change-count {
	font-size: 12px;
	color: var(--vp-c-text-2);
}

.snapshot-compare-change-summary {
	margin: 0 0 10px;
	font-size: 13px;
	line-height: 1.5;
	color: var(--vp-c-text-1);
	word-break: break-word;
}

.snapshot-compare-change-actions {
	display: flex;
	gap: 8px;
}

.snapshot-compare-change-empty {
	font-size: 13px;
	line-height: 1.6;
	color: var(--vp-c-text-2);
}

.snapshot-compare-review :deep(.tip-tap-editor) {
	min-height: 360px;
}

@media (max-width: 1200px) {
	.snapshot-compare-grid.__three {
		grid-template-columns: 1fr;
	}

	.snapshot-compare-review-layout {
		grid-template-columns: 1fr;
	}
}

</style>
