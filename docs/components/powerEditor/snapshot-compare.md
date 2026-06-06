# Snapshot Compare

This page demonstrates a snapshot compare flow for `power-editor`.

1. Prepare two Tiptap JSON documents.
2. Render them with `power-editor`.
3. Call `getJSON()` on source and target.
4. Import `computeDiff` from `packages/editor/src/js/diffTool/index.js`.
5. Render the final review result in another `power-editor`.

<script setup>
import { nextTick, onMounted, ref } from "vue";
import { useData } from "vitepress";
import { computeDiff } from "@/packages/editor/src/js/diffTool/index.js";

const viteData = useData();
const sourceEditorRef = ref(null);
const targetEditorRef = ref(null);
const reviewContent = ref({
	type: "doc",
	content: [],
});

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

function runCompare() {
	const sourceEditor = sourceEditorRef.value?.editor?.();
	const targetEditor = targetEditorRef.value?.editor?.();

	if (!sourceEditor || !targetEditor) {
		return;
	}

	const sourceJson = sourceEditor.getJSON();
	const targetJson = targetEditor.getJSON();
	const result = computeDiff(sourceJson, targetJson);

	reviewContent.value = result.reviewDoc;

	console.log("source", sourceJson);
	console.log("target", targetJson);
	console.log("diff", result);
}

onMounted(() => {
	nextTick(() => {
		runCompare();
	});
});
</script>

<div class="snapshot-compare-demo">
<div class="snapshot-compare-toolbar">
<fv-button style="width: 120px;" @click="runCompare">Run Compare</fv-button>
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
<power-editor
:model-value="reviewContent"
:theme="viteData.isDark.value ? 'dark' : 'light'"
:editable="false"
:showToolBar="false"
foreground="#1d4ed8"
style="width: 100%;"
></power-editor>
</div>
</div>

## Example

```vue
<script setup>
import { ref } from "vue";
import { computeDiff } from "@/packages/editor/src/js/diffTool/index.js";

const sourceEditorRef = ref(null);
const targetEditorRef = ref(null);
const reviewContent = ref({
    type: "doc",
    content: [],
});

function compareSnapshots() {
    const sourceJson = sourceEditorRef.value?.editor?.()?.getJSON();
    const targetJson = targetEditorRef.value?.editor?.()?.getJSON();
    const result = computeDiff(sourceJson, targetJson);

    reviewContent.value = result.reviewDoc;
    console.log(result);
}
</script>

<template>
    <power-editor ref="sourceEditorRef" :model-value="sourceContent"></power-editor>
    <power-editor ref="targetEditorRef" :model-value="targetContent"></power-editor>
    <power-editor :model-value="reviewContent" :editable="false" :showToolBar="false"></power-editor>
    <fv-button @click="compareSnapshots">Compare</fv-button>
</template>
```

## Notes

- `model-value` in this demo uses Tiptap JSON documents instead of HTML strings.
- Paragraph inline content now supports `text`, `hardBreak`, `inlineEquation` and other inline atoms.
- `computeDiff()` returns both `chunks` and `reviewDoc`.
- `reviewDoc` can be rendered directly by `power-editor` as the final compare result.

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

.snapshot-compare-panel h2,
.snapshot-compare-review h2 {
	margin-top: 0;
}

.snapshot-compare-review :deep(.tip-tap-editor) {
	min-height: 360px;
}

@media (max-width: 1200px) {
	.snapshot-compare-grid.__three {
		grid-template-columns: 1fr;
	}
}

</style>
