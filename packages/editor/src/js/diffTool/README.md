# diffTool README

这个 README 按“贴关键代码片段，再解释这一步做什么”的方式来讲 `packages/editor/src/js/diffTool/index.js`。

目标不是逐个函数做 API 罗列，而是把主流程讲清楚：这份代码怎样把两份 Tiptap JSON 文档变成一份可审核的 `reviewDoc`。

## 1. 入口从哪里开始

先看真正的入口函数：

```js
function computeDiff(sourceDoc = {}, targetDoc = {}) {
	return {
		chunks: diffBlocks(sourceDoc, targetDoc),
		reviewDoc: buildReviewDoc(sourceDoc, targetDoc),
	};
}
```

这一步很简单，但它把整个模块的输出边界定下来了。

- `chunks`：顶层 block 级别的 diff 结果
- `reviewDoc`：最终给编辑器渲染的审核文档

也就是说，这个模块不是只算差异数据，它还负责把差异重新组织成一份“可以直接展示和继续处理”的文档。

## 2. 第一层先做什么：先做顶层 block diff

入口里第一个调用的是：

```js
function diffBlocks(sourceDoc = {}, targetDoc = {}) {
	const sourceBlocks = buildBlockTokens(sourceDoc);
	const targetBlocks = buildBlockTokens(targetDoc);
	return diffBlockTokenArrays(sourceBlocks, targetBlocks);
}
```

这里先不直接比两棵完整树，而是先把顶层 `content` 拆成 block token。

这样做的目的，是先在文档结构层面稳定地找出：

- 哪些顶层 block 完全没变
- 哪些是新增
- 哪些是删除
- 哪些看起来像“旧块换成新块”

如果一开始就把整棵文档按文本打散，后面很难再还原成结构正确的审核文档。

## 3. block token 是怎么来的

先看 block token 的生成：

```js
function buildBlockTokens(doc = {}) {
	const content = Array.isArray(doc.content) ? doc.content : [];

	return content.map((node, index) => ({
		index,
		node,
		key: normalizeNodeShallow(node),
		text: getText(node),
		type: node.type,
	}));
}
```

这里每个顶层节点都会被转成一个对象，核心字段有：

- `node`：原始节点
- `type`：节点类型
- `text`：节点下的纯文本汇总
- `key`：真正用于比较的签名

重点不是 `text`，而是 `key`。

## 4. block 的比较签名怎么构造

签名来自这里：

```js
function normalizeNodeShallow(node) {
	return JSON.stringify({
		type: node?.type,
		attrs: node?.attrs || null,
		signature: Array.isArray(node?.content)
			? node.content.map(getInlineSignature)
			: getInlineSignature(node),
	});
}
```

这一步会把一个 block 编码成一个可比较的字符串，里面包含：

- 节点类型
- 节点 attrs
- 一层浅结构签名

再看浅结构签名怎么来：

```js
function getInlineSignature(node) {
	if (!node) return "";

	if (node.type === "text") {
		return JSON.stringify({
			kind: "text",
			text: node.text || "",
			marks: normalizeMarks(node.marks || []),
		});
	}

	if (node.type === "hardBreak") {
		return JSON.stringify({
			kind: "hardBreak",
		});
	}

	if (!Array.isArray(node.content) || node.content.length === 0) {
		return JSON.stringify({
			kind: "inlineAtom",
			type: node.type,
			attrs: node.attrs || null,
		});
	}

	return JSON.stringify({
		kind: "container",
		type: node.type,
		attrs: node.attrs || null,
		content: node.content.map(getInlineSignature),
	});
}
```

这说明 block 是否相等，不是简单看纯文本，而是看：

- 文本内容
- marks
- inline atom 类型和 attrs
- 一层子结构

所以这个 diff 从一开始就是“结构化比较”，不是纯字符串比较。

## 5. 为什么比较时要忽略已有的 trackedChange

看这里：

```js
function normalizeMarks(marks = []) {
	return marks
		.filter((mark) => mark.type !== "trackedChange")
		.map((mark) => ({
			type: mark.type,
			attrs: mark.attrs || null,
		}));
}
```

这里主动把 `trackedChange` 过滤掉。

这一步的意思很明确：`trackedChange` 只属于输出层，不属于比较层。

如果不忽略，会有几个直接问题：

- 旧的审核标记会干扰本次 diff
- 同样的正文，只因为 `trackedChange` 不同就会被判成变化
- 已经生成过 review 的文档再次参与 diff 时，噪声会越来越大

所以这个模块默认假设：

- 输入是业务文档
- 输出才是带审核标记的文档

## 6. block diff 最终怎么得到 chunks

真正做顶层数组 diff 的是这里：

```js
function diffBlockTokenArrays(sourceBlocks = [], targetBlocks = []) {
	const sourceKeys = sourceBlocks.map((block) => block.key);
	const targetKeys = targetBlocks.map((block) => block.key);
	const raw = diffArrays(sourceKeys, targetKeys);

	let sourceIndex = 0;
	let targetIndex = 0;
	const chunks = [];

	for (const part of raw) {
		const count = part.value.length;

		if (part.removed) {
			chunks.push({
				type: "delete",
				sourceBlocks: sourceBlocks.slice(sourceIndex, sourceIndex + count),
				targetBlocks: [],
			});
			sourceIndex += count;
			continue;
		}

		if (part.added) {
			chunks.push({
				type: "insert",
				sourceBlocks: [],
				targetBlocks: targetBlocks.slice(targetIndex, targetIndex + count),
			});
			targetIndex += count;
			continue;
		}

		chunks.push({
			type: "equal",
			sourceBlocks: sourceBlocks.slice(sourceIndex, sourceIndex + count),
			targetBlocks: targetBlocks.slice(targetIndex, targetIndex + count),
		});

		sourceIndex += count;
		targetIndex += count;
	}

	return mergeDeleteInsertToReplace(chunks);
}
```

这一步先用 `diffArrays()` 比较 `sourceKeys` 和 `targetKeys`，再把底层结果翻译成业务上可用的 chunk：

- `equal`
- `delete`
- `insert`

并且每个 chunk 都把原始 block 一起带上，后续生成 `reviewDoc` 时就不需要回头再找原节点。

## 7. replace 是怎么引入的

上一步最后不是直接 `return chunks`，而是：

```js
return mergeDeleteInsertToReplace(chunks);
```

再看这个函数：

```js
function mergeDeleteInsertToReplace(chunks) {
	const result = [];

	for (let i = 0; i < chunks.length; i += 1) {
		const current = chunks[i];
		const next = chunks[i + 1];

		if (current.type === "delete" && next?.type === "insert") {
			result.push({
				type: "replace",
				sourceBlocks: current.sourceBlocks,
				targetBlocks: next.targetBlocks,
			});
			i += 1;
			continue;
		}

		result.push(current);
	}

	return result;
}
```

这里要先明确一件事：

- `replace` 不是底层 diff 库直接给的类型
- `replace` 是这个模块为了审核语义自己整理出来的类型

为什么要多这一步？

因为很多“修改”在底层 diff 结果里，本来就会表现成：

1. 删掉一段旧内容
2. 紧接着插入一段新内容

但在审核场景里，这两步应该被看成一次“替换”。

如果不合并成 `replace`，后面的逻辑就没办法统一处理：

- 文本级替换
- 段落级替换
- 容器级替换

所以 `replace` 是整个后续精细处理的前提。

## 8. reviewDoc 从哪里开始构造

接着看第二条主线：

```js
function buildReviewDoc(sourceDoc = {}, targetDoc = {}) {
	const chunks = diffBlocks(sourceDoc, targetDoc);
	const reviewDoc = {
		...clone(targetDoc),
		content: [],
	};

	for (const chunk of chunks) {
		if (chunk.type === "equal") {
			reviewDoc.content.push(...chunk.targetBlocks.map((block) => clone(block.node)));
			continue;
		}

		if (chunk.type === "delete") {
			const groupId = guid();

			reviewDoc.content.push(
				...chunk.sourceBlocks.map((block) =>
					addTrackedBlock(block.node, buildTrackedAttrs("delete", groupId)),
				),
			);
			continue;
		}

		if (chunk.type === "insert") {
			const groupId = guid();

			reviewDoc.content.push(
				...chunk.targetBlocks.map((block) =>
					addTrackedBlock(block.node, buildTrackedAttrs("insert", groupId)),
				),
			);
			continue;
		}

		if (chunk.type === "replace") {
			reviewDoc.content.push(
				...buildReplaceReviewNodes(chunk.sourceBlocks, chunk.targetBlocks),
			);
		}
	}

	return reviewDoc;
}
```

这里可以直接看出 `reviewDoc` 的生成规则：

- `equal`：直接保留 target 的节点
- `delete`：把 source 的节点写成删除标记
- `insert`：把 target 的节点写成新增标记
- `replace`：进入专门的替换处理逻辑

这段代码还说明了另一件事：`reviewDoc` 是以 `targetDoc` 为基础克隆出来的。

这样做的好处是，最终文档天然更接近目标态，接受修改后也更容易收敛到 target 的语义。

## 9. trackedChange 是怎么生成的

先看标记属性的生成：

```js
function buildTrackedAttrs(type, groupId = guid()) {
	return {
		id: guid(),
		groupId,
		type,
		createdAt: Date.now(),
	};
}
```

这里最重要的是两个字段：

- `type`：`insert` 或 `delete`
- `groupId`：把同一组变更片段串起来

后续 accept / reject 能按组处理，核心就是靠 `groupId`。

## 10. 整块节点怎么加 trackedChange

看整块节点的处理：

```js
function addTrackedBlock(node, attrs) {
	const cloned = clone(node);

	cloned.attrs = {
		...(cloned.attrs || {}),
		trackedChange: attrs,
	};

	if (cloned.type === "codeBlock") {
		if (Array.isArray(cloned.content)) {
			cloned.content = cloned.content.map((child) => cleanupTrackedMarks(clone(child)));
		}

		return cloned;
	}

	if (Array.isArray(cloned.content)) {
		cloned.content = cloned.content.map((child) =>
			addTrackedToInlineNode(child, attrs),
		);
	}

	return cloned;
}
```

这一步做了两件事：

1. 给 block 自己挂上 `attrs.trackedChange`
2. 如果 block 有子内容，再继续给子内容补标记

这样 block 在结构层和内容层都会带上审核信息。

### codeBlock 为什么单独处理

在这段代码里可以看到：

```js
if (cloned.type === "codeBlock") {
	...
	return cloned;
}
```

也就是说 `codeBlock` 不会继续把内部每个 child 都递归打上新的 trackedChange。

这是因为代码块内部如果把每个文本节点都再标一层，会导致：

- 结构明显复杂化
- 代码展示噪声很重
- 容易和代码块自身渲染逻辑冲突

所以代码块目前采用“整块标记优先”的策略。

## 11. 行内节点怎么加 trackedChange

再看 inline 的处理：

```js
function addTrackedToInlineNode(node, attrs) {
	const cloned = cleanupTrackedMarks(clone(node));

	if (cloned.type === "text") {
		cloned.marks = [
			...(cloned.marks || []),
			{
				type: "trackedChange",
				attrs,
			},
		];
		return cloned;
	}

	cloned.attrs = {
		...(cloned.attrs || {}),
		trackedChange: attrs,
	};

	return cloned;
}
```

这里根据节点类型分成两种写法：

- `text`：写到 `marks`
- 非文本 inline atom：写到 `attrs.trackedChange`

这就保证了文本、行内公式、mention 一类节点都能进入同一套审核体系。

## 12. 哪些 block 会继续往下细分

先看判断函数：

```js
function canInlineDiffBlock(sourceBlock, targetBlock) {
	return (
		sourceBlock &&
		targetBlock &&
		sourceBlock.type === targetBlock.type &&
		["paragraph", "heading", "blockquote"].includes(sourceBlock.type)
	);
}
```

```js
function canContainerDiffBlock(sourceBlock, targetBlock) {
	return (
		sourceBlock &&
		targetBlock &&
		sourceBlock.type === targetBlock.type &&
		["bulletList", "orderedList", "listItem", "taskList", "taskItem"].includes(
			sourceBlock.type,
		)
	);
}
```

这里把节点分成三类：

- 段落类：继续做 inline diff
- 列表类容器：继续做递归 diff
- 其他节点：不细分，整块处理

这样设计的目的是控制复杂度。不是所有节点都值得往下挖，当前实现优先覆盖最常见、最有收益的富文本场景。

## 13. replace 进入哪条处理分支

当一个顶层或局部 block 被识别成 `replace` 后，会走这里：

```js
function buildReplaceReviewNodes(sourceBlocks = [], targetBlocks = []) {
	const result = [];
	const pairCount = Math.min(sourceBlocks.length, targetBlocks.length);

	if (sourceBlocks.length !== targetBlocks.length) {
		if (sourceBlocks.length > 0) {
			const groupId = guid();
			result.push(
				...sourceBlocks.map((block) =>
					addTrackedBlock(block.node, buildTrackedAttrs("delete", groupId)),
				),
			);
		}

		if (targetBlocks.length > 0) {
			const groupId = guid();
			result.push(
				...targetBlocks.map((block) =>
					addTrackedBlock(block.node, buildTrackedAttrs("insert", groupId)),
				),
			);
		}

		return result;
	}

	for (let index = 0; index < pairCount; index += 1) {
		const sourceBlock = sourceBlocks[index];
		const targetBlock = targetBlocks[index];

		if (sourceBlock.type === targetBlock.type) {
			result.push(...buildReviewNodePair(sourceBlock.node, targetBlock.node));
			continue;
		}

		const groupId = guid();
		result.push(
			addTrackedBlock(sourceBlock.node, buildTrackedAttrs("delete", groupId)),
			addTrackedBlock(targetBlock.node, buildTrackedAttrs("insert", groupId)),
		);
	}

	return result;
}
```

这段代码其实就是在回答两个问题：

1. 这次 replace 能不能一对一配对处理？
2. 配对之后要不要继续细分？

## 14. 为什么 many-to-one / one-to-many 不强行配对

还是看上面这段最前面的判断：

```js
if (sourceBlocks.length !== targetBlocks.length) {
	...
	return result;
}
```

只要两边数量不一样，就不做位置配对，而是：

- source 全部按 delete 输出
- target 全部按 insert 输出

这样做比较保守，但它是稳定的。

如果 many-to-one / one-to-many 也继续硬配，很容易把原本无关的兄弟节点错误折叠进一次 replace，最后让 `reviewDoc` 顺序错乱。

所以这里宁可少做一点“聪明匹配”，也优先保证结果结构不乱。

## 15. 一对一 replace 时，怎么决定继续下钻还是整块处理

关键在这里：

```js
function buildReviewNodePair(sourceNode, targetNode) {
	if (canInlineDiffBlock(sourceNode, targetNode)) {
		return [buildInlineReviewBlock(sourceNode, targetNode)];
	}

	if (canContainerDiffBlock(sourceNode, targetNode)) {
		return [buildContainerReviewBlock(sourceNode, targetNode)];
	}

	const groupId = guid();

	return [
		addTrackedBlock(sourceNode, buildTrackedAttrs("delete", groupId)),
		addTrackedBlock(targetNode, buildTrackedAttrs("insert", groupId)),
	];
}
```

这里的决策顺序很清楚：

1. 如果是段落类，走 inline diff
2. 如果是容器类，走递归 diff
3. 否则就把整块当作 delete + insert

也就是说，replace 并不自动意味着“必须细粒度比较”。是否下钻，仍然由节点类型决定。

## 16. inline diff 是怎么开始的

先看 inline token 化：

```js
function buildInlineTokens(block = {}) {
	const content = Array.isArray(block.content) ? block.content : [];

	return content.map((node, index) => {
		if (node.type === "text") {
			return {
				kind: "text",
				index,
				node,
				text: node.text || "",
				marks: node.marks || [],
				key: inlineTokenKey(node),
			};
		}

		if (node.type === "hardBreak") {
			return {
				kind: "hardBreak",
				index,
				node,
				key: inlineTokenKey(node),
			};
		}

		return {
			kind: "inlineAtom",
			index,
			type: node.type,
			attrs: node.attrs || {},
			node,
			key: inlineTokenKey(node),
		};
	});
}
```

这一步把段落类 block 的内部内容拆成三类 token：

- `text`
- `hardBreak`
- `inlineAtom`

这样后面的 inline diff 既能识别文本改动，也能识别行内原子节点改动。

## 17. inline diff 怎么得到 replace

真正的 inline diff 在这里：

```js
function diffInlineTokens(sourceBlock = {}, targetBlock = {}) {
	const sourceTokens = buildInlineTokens(sourceBlock);
	const targetTokens = buildInlineTokens(targetBlock);
	const sourceKeys = sourceTokens.map((token) => token.key);
	const targetKeys = targetTokens.map((token) => token.key);
	const raw = diffArrays(sourceKeys, targetKeys);

	...

	return mergeInlineReplace(chunks);
}
```

这里和顶层 block diff 的套路是一样的：

1. 把内容转成 token
2. 比 key 数组
3. 先得到 `equal / delete / insert`
4. 再合并出 `replace`

这说明整份实现其实是“同一套策略在不同层级复用”：

- 顶层 block 一次
- 段落内部 inline 再来一次

## 18. inline review 是怎么组装的

看这段：

```js
function buildInlineReviewBlock(sourceBlock, targetBlock) {
	const result = clone(targetBlock);
	const chunks = diffInlineTokens(sourceBlock, targetBlock);

	result.content = [];

	for (const chunk of chunks) {
		if (chunk.type === "equal") {
			result.content.push(...chunk.targetTokens.map((token) => clone(token.node)));
			continue;
		}

		if (chunk.type === "delete") {
			const groupId = guid();

			result.content.push(
				...chunk.sourceTokens.map((token) =>
					addTrackedToInlineNode(token.node, buildTrackedAttrs("delete", groupId)),
				),
			);
			continue;
		}

		if (chunk.type === "insert") {
			const groupId = guid();

			result.content.push(
				...chunk.targetTokens.map((token) =>
					addTrackedToInlineNode(token.node, buildTrackedAttrs("insert", groupId)),
				),
			);
			continue;
		}

		if (chunk.type === "replace") {
			result.content.push(
				...buildInlineReplaceNodes(chunk.sourceTokens, chunk.targetTokens),
			);
		}
	}

	return result;
}
```

这里的重点有两个：

- 结果节点是从 `targetBlock` 克隆出来的
- 只有发生变化的位置才重写内容

这让最终 inline review 的结构天然更偏向目标态，而旧内容则通过 delete 标记的方式插回到合适位置。

## 19. 文本 replace 什么情况下继续细分到词级

看条件判断：

```js
function buildInlineReplaceNodes(sourceTokens, targetTokens) {
	const groupId = guid();

	if (
		sourceTokens.length === 1 &&
		targetTokens.length === 1 &&
		sourceTokens[0].kind === "text" &&
		targetTokens[0].kind === "text" &&
		sameMarks(sourceTokens[0].marks, targetTokens[0].marks)
	) {
		return diffTextToken(sourceTokens[0], targetTokens[0], groupId);
	}

	return [
		...sourceTokens.map((token) =>
			addTrackedToInlineNode(token.node, buildTrackedAttrs("delete", groupId)),
		),
		...targetTokens.map((token) =>
			addTrackedToInlineNode(token.node, buildTrackedAttrs("insert", groupId)),
		),
	];
}
```

这里不是所有 inline replace 都继续拆，而是只在比较简单、比较可控的时候才拆：

- 一边一个 token
- 都是文本
- marks 一致

满足时，才进入词级 diff；否则直接回退成“旧内容 delete + 新内容 insert”。

这个策略的目的，是保证展示结果可读，不把格式变化和文本变化硬搅在一起。

## 20. 词级 diff 具体怎么做

继续看：

```js
function diffTextToken(sourceToken, targetToken, groupId) {
	const parts = diffWordsWithSpace(sourceToken.text, targetToken.text);
	const result = [];

	for (const part of parts) {
		if (!part.value) continue;

		if (part.removed) {
			result.push({
				type: "text",
				text: part.value,
				marks: [
					...(sourceToken.marks || []),
					{
						type: "trackedChange",
						attrs: buildTrackedAttrs("delete", groupId),
					},
				],
			});
			continue;
		}

		if (part.added) {
			result.push({
				type: "text",
				text: part.value,
				marks: [
					...(targetToken.marks || []),
					{
						type: "trackedChange",
						attrs: buildTrackedAttrs("insert", groupId),
					},
				],
			});
			continue;
		}

		result.push(
			cleanupTrackedMarks({
				type: "text",
				text: part.value,
				marks: targetToken.marks?.length ? clone(targetToken.marks) : undefined,
			}),
		);
	}

	return result;
}
```

这一步是典型的“词级拆分 + 分别挂 delete / insert”：

- source 中被删掉的词，保留 source 的 marks，再加 delete
- target 中新增的词，保留 target 的 marks，再加 insert
- 没变的词，保留 target 的 marks，并清理 trackedChange

这样一句话里只改几个词时，review 结果会比整句替换更可读。

## 21. 容器节点为什么单独递归处理

看容器处理：

```js
function buildContainerReviewBlock(sourceBlock, targetBlock) {
	const result = clone(targetBlock);
	const sourceChildren = Array.isArray(sourceBlock.content)
		? sourceBlock.content
		: [];
	const targetChildren = Array.isArray(targetBlock.content)
		? targetBlock.content
		: [];

	result.content = buildReviewNodes(sourceChildren, targetChildren);

	if (result.content.length === 0) {
		delete result.content;
	}

	return result;
}
```

这一步等于是在说：

- 容器本身先保留 target 结构
- 容器内部 children 再走一遍 block diff 主流程

这样列表、任务列表、嵌套 listItem 才能保住层级关系。

如果把这类节点直接整块替换，很多信息都会丢掉，比如到底是哪一个列表项改了。

## 22. 递归入口在哪里复用

容器里继续调用的是这个函数：

```js
function buildReviewNodes(sourceNodes = [], targetNodes = []) {
	const sourceBlocks = buildBlockTokensFromNodes(sourceNodes);
	const targetBlocks = buildBlockTokensFromNodes(targetNodes);
	const chunks = diffBlockTokenArrays(sourceBlocks, targetBlocks);
	const result = [];

	for (const chunk of chunks) {
		...
	}

	return result;
}
```

这个函数可以理解成“局部版的 `buildReviewDoc()`”：

- 输入不是整个 doc，而是一段 children
- 逻辑仍然是先 diff，再按 chunk 组装结果

所以整个模块的设计很统一：

- 顶层文档用一套 block diff
- 容器内部 children 复用同一套 block diff
- 段落内部再用一套 inline diff

## 23. 对外真正建议怎么用

导出如下：

```js
export {
	buildInlineTokens,
	buildReviewDoc,
	buildReviewNodes,
	computeDiff,
	diffBlocks,
	diffInlineTokens,
};
```

实际对外最推荐直接使用的是：

```js
computeDiff(sourceDoc, targetDoc)
```

因为它同时给你：

- 顶层 diff 结果 `chunks`
- 可直接渲染的 `reviewDoc`

其他导出更适合做调试、测试或局部复用。

## 24. 这份实现当前最重要的几个取舍

结合上面的代码，可以把当前设计取舍总结成几条：

### 24.1 优先保证结构稳定

体现在：

- 先做 block diff
- 容器节点递归处理
- many-to-one / one-to-many 不强配

### 24.2 只对高收益节点做细粒度 diff

体现在：

- 段落、标题、引用做 inline diff
- 列表类节点做递归 diff
- 其他复杂节点整块处理

### 24.3 文本细分是有条件开启的

体现在：

- 只有简单文本 replace 才做词级 diff
- 复杂 inline replace 回退成 delete + insert

### 24.4 trackedChange 只属于输出层

体现在：

- 比较时忽略旧的 trackedChange
- 输出时重新写入 trackedChange

## 25. 阅读和维护时优先看哪些函数

如果后续要扩展这个模块，最值得优先看的顺序是：

1. `computeDiff()`
2. `diffBlockTokenArrays()`
3. `buildReviewDoc()`
4. `buildReplaceReviewNodes()`
5. `buildInlineReviewBlock()`
6. `buildContainerReviewBlock()`
7. `diffTextToken()`

如果你的修改目标不同，入口也不同：

- 想扩 block 细分范围，看 `canInlineDiffBlock()` 和 `canContainerDiffBlock()`
- 想改 replace 策略，看 `buildReplaceReviewNodes()`
- 想改文本展示粒度，看 `buildInlineReplaceNodes()` 和 `diffTextToken()`
- 想兼容更多自定义节点，看 `addTrackedToInlineNode()` 和 `addTrackedBlock()`

## 26. 总结

这份代码的主线可以直接概括成三步：

1. 先把文档按 block 稳定分段
2. 对适合下钻的节点继续做 inline 或递归 diff
3. 把差异重新编码成 `trackedChange`，输出 `reviewDoc`

所以它的核心价值，不只是“算出差异”，而是“算完之后，还能产出一份编辑器可以继续使用的审核文档”。
