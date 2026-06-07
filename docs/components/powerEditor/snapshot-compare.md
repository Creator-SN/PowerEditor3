# 快照对比

本页演示 `power-editor` 的快照对比流程。

1. 准备两份 Tiptap JSON 文档。
2. 分别用 `power-editor` 渲染源文档和目标文档。
3. 通过 `getJSON()` 读取两边编辑器内容。
4. 使用 `computeDiff()` 或 `diffTool.compareDiff()` 计算差异。
5. 将最终审阅结果渲染到另一个 `power-editor` 中。

## 说明

快照对比用于把两个编辑器快照转换为可审阅的差异结果，适合版本预览、草稿校对、审批确认和变更回放。

## 主编辑器中的 Diff Props

下面这些属性已经在主编辑器 `power-editor` 上可直接使用，既可以用于本页示例，也可以用于你自己的审阅页面。

| 属性 | 类型 | 默认值 | 说明 |
| :-- | :-- | :-- | :-- |
| `diffInlineBlockTypes` | `string[]` | `[]` | 扩展按“行内内容 diff”处理的块级节点类型。适合外观像块节点、但内容仍应逐段比较的自定义节点。 |
| `diffContainerBlockTypes` | `string[]` | `[]` | 扩展按“容器节点 diff”处理的块级节点类型。适合包装器、布局容器、多子节点结构。 |
| `diffInsertColor` | `string` | `""` | 插入变更主色。 |
| `diffDeleteColor` | `string` | `""` | 删除变更主色。 |
| `diffInsertColorSec` | `string` | `""` | 插入变更辅助色，常用于边框或装饰。 |
| `diffDeleteColorSec` | `string` | `""` | 删除变更辅助色。 |
| `diffInsertHoverColor` | `string` | `""` | 鼠标移入插入变更时的高亮色。 |
| `diffDeleteHoverColor` | `string` | `""` | 鼠标移入删除变更时的高亮色。 |
| `diffInsertHoverColorSec` | `string` | `""` | 插入变更 hover 状态的辅助色。 |
| `diffDeleteHoverColorSec` | `string` | `""` | 删除变更 hover 状态的辅助色。 |

### 推荐场景

- 自定义段落类节点时，优先补充到 `diffInlineBlockTypes`。
- 自定义容器、卡片、布局块时，优先补充到 `diffContainerBlockTypes`。
- 如果你的审阅界面有品牌色或深浅主题切换，建议同时配置普通态和 hover 态颜色。

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
					text: "快照对比概览",
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
					text: "这份源快照保留了变更前的原始编辑器结构。",
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
									text: "使用 getJSON() 导出编辑器状态",
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
									text: "保留标题与段落节点",
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
					text: "快照对比概览",
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
					text: "这份目标快照保留了变更后的编辑器结构。",
				},
				{
					type: "inlineEquation",
					attrs: {
						value: "A_a",
						tag: "span",
						placeholder: "Y=WX^T+b",
						emptyPlaceholder: "新建公式",
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
									text: "使用 getJSON() 导出编辑器状态",
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
									text: "保留标题与段落节点",
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
									text: "新增一条快照对比调试记录",
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
		paragraph: "段落",
		heading: "标题",
		bulletList: "无序列表",
		orderedList: "有序列表",
		listItem: "列表项",
		blockquote: "引用块",
		codeBlock: "代码块",
		inlineEquation: "行内公式",
		equationBlock: "公式块",
		imageblock: "图片",
		mentionItem: "提及项",
		powerTaskItem: "任务项",
	};

	return labels[node.type] || node.type || "节点";
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
						? "替换"
						: type === "delete"
							? "删除"
							: "插入",
				summary: item.snippets.join(" / ") || "跟踪变更",
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
<fv-button border-radius="6" style="width: 120px;" @click="runCompare">运行对比</fv-button>
<span>下方最终审阅编辑器由 <code>index.js</code> 生成结果后渲染。</span>
</div>

<div class="snapshot-compare-grid __three">
<div class="snapshot-compare-panel">
<h2>源快照</h2>
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
<h2>目标快照</h2>
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
<h2>审阅结果</h2>
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
<h3>待处理变更</h3>
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
<span class="snapshot-compare-change-count">{{ change.fragmentCount }} 个片段</span>
</div>
<p class="snapshot-compare-change-summary">{{ change.summary }}</p>
<div class="snapshot-compare-change-actions">
<fv-button
:theme="'dark'"
background="rgba(0, 204, 153, 1)"
border-radius="6"
@click="applyReviewChange(change.groupId, 'accept')"
>接受</fv-button>
<fv-button
:theme="'dark'"
background="rgba(200, 38, 45, 1)"
border-radius="6"
@click="applyReviewChange(change.groupId, 'reject')"
>拒绝</fv-button>
</div>
</div>
</div>

<div v-else class="snapshot-compare-change-empty">
审阅编辑器中的所有跟踪变更都已处理完成。
</div>
</aside>
</div>
</div>
</div>

## 示例

### 在当前文档仓库中

本页在线示例直接引用源码文件，因为这里的 VitePress 就运行在同一个仓库里：

```js
import { computeDiff } from "@/packages/editor/src/js/diffTool/index.js";
import { applyTrackedGroup } from "@/packages/editor/src/js/diffTool/apply.js";
```

### 执行 `yarn add @creatorsn/powereditor3` 之后

发布到 npm 并安装后，不要再从上面的内部源码路径导入，而应该从包根入口导入：

```js
import {
    computeDiff,
    diffTool,
    applyTrackedGroup,
} from "@creatorsn/powereditor3";
```

如果你只使用默认的对比流程，那么 `computeDiff(sourceDoc, targetDoc)` 就够用了。

如果你希望使用可配置写法，也可以这样写：

```js
import { diffTool } from "@creatorsn/powereditor3";

const result = diffTool
    .configure({
        extendInlineDiffBlockTypes: ["customParagraphLike"],
        extendContainerDiffBlockTypes: ["customContainerLike"],
    })
    .compareDiff(sourceDoc, targetDoc);
```

### 使用 `<power-editor>` 暴露的方法

`power-editor` 组件实例同样暴露了 `compareDiff()`。如果你已经拿到了编辑器 `ref`，并且希望复用编辑器级别的配置入口，也可以直接这样调用：

```vue
<script setup>
import { ref } from "vue";

const reviewEditorRef = ref(null);

function compareWithEditor(sourceDoc, targetDoc) {
    return reviewEditorRef.value?.compareDiff?.(sourceDoc, targetDoc);
}
</script>
```

本页主示例仍然使用直接调用 `computeDiff()` + `applyTrackedGroup()` 的方式，因为这样更便于看清整条 diff 处理链路。

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
    <fv-button @click="compareSnapshots">执行对比</fv-button>
    <fv-button @click="applyChange(reviewChanges[0]?.groupId, 'accept')">接受第一条变更</fv-button>
</template>
```

## 说明事项

- 本示例中的 `model-value` 使用的是 Tiptap JSON 文档，而不是 HTML 字符串。
- 段落行内内容现在支持 `text`、`hardBreak`、`inlineEquation` 等多种行内原子节点。
- `computeDiff()` 会同时返回 `chunks` 和 `reviewDoc`。
- `diffTool.compareDiff()` 返回的数据结构与 `computeDiff()` 一致。
- `reviewDoc` 可以直接交给 `power-editor` 渲染成最终对比结果。
- 安装包之后，可以从 `@creatorsn/powereditor3` 直接导入 `applyTrackedGroup()`。

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
