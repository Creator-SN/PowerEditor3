import { diffArrays, diffWordsWithSpace } from "diff";

function guid() {
	return crypto.randomUUID();
}

function clone(value) {
	return JSON.parse(JSON.stringify(value));
}

function normalizeMarks(marks = []) {
	return marks
		.filter((mark) => mark.type !== "trackedChange")
		.map((mark) => ({
			type: mark.type,
			attrs: mark.attrs || null,
		}));
}

function normalizeAttrs(attrs = {}) {
	return JSON.stringify(attrs || {});
}

function sameMarks(a = [], b = []) {
	return JSON.stringify(normalizeMarks(a)) === JSON.stringify(normalizeMarks(b));
}

function getText(node) {
	if (!node) return "";

	if (node.type === "text") {
		return node.text || "";
	}

	if (Array.isArray(node.content)) {
		return node.content.map(getText).join("");
	}

	return "";
}

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

function normalizeNodeShallow(node) {
	return JSON.stringify({
		type: node?.type,
		attrs: node?.attrs || null,
		signature: Array.isArray(node?.content)
			? node.content.map(getInlineSignature)
			: getInlineSignature(node),
	});
}

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

function buildBlockTokensFromNodes(nodes = []) {
	return nodes.map((node, index) => ({
		index,
		node,
		key: normalizeNodeShallow(node),
		text: getText(node),
		type: node.type,
	}));
}

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

function diffBlocks(sourceDoc = {}, targetDoc = {}) {
	const sourceBlocks = buildBlockTokens(sourceDoc);
	const targetBlocks = buildBlockTokens(targetDoc);
	return diffBlockTokenArrays(sourceBlocks, targetBlocks);
}

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

function inlineTokenKey(node) {
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

	return JSON.stringify({
		kind: "inlineAtom",
		type: node.type,
		attrs: node.attrs || null,
	});
}

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

function mergeInlineReplace(chunks) {
	const result = [];

	for (let i = 0; i < chunks.length; i += 1) {
		const current = chunks[i];
		const next = chunks[i + 1];

		if (current.type === "delete" && next?.type === "insert") {
			result.push({
				type: "replace",
				sourceTokens: current.sourceTokens,
				targetTokens: next.targetTokens,
			});
			i += 1;
			continue;
		}

		result.push(current);
	}

	return result;
}

function diffInlineTokens(sourceBlock = {}, targetBlock = {}) {
	const sourceTokens = buildInlineTokens(sourceBlock);
	const targetTokens = buildInlineTokens(targetBlock);
	const sourceKeys = sourceTokens.map((token) => token.key);
	const targetKeys = targetTokens.map((token) => token.key);
	const raw = diffArrays(sourceKeys, targetKeys);

	let sourceIndex = 0;
	let targetIndex = 0;
	const chunks = [];

	for (const part of raw) {
		const count = part.value.length;

		if (part.removed) {
			chunks.push({
				type: "delete",
				sourceTokens: sourceTokens.slice(sourceIndex, sourceIndex + count),
				targetTokens: [],
			});
			sourceIndex += count;
			continue;
		}

		if (part.added) {
			chunks.push({
				type: "insert",
				sourceTokens: [],
				targetTokens: targetTokens.slice(targetIndex, targetIndex + count),
			});
			targetIndex += count;
			continue;
		}

		chunks.push({
			type: "equal",
			sourceTokens: sourceTokens.slice(sourceIndex, sourceIndex + count),
			targetTokens: targetTokens.slice(targetIndex, targetIndex + count),
		});

		sourceIndex += count;
		targetIndex += count;
	}

	return mergeInlineReplace(chunks);
}

function buildTrackedAttrs(type, groupId = guid()) {
	return {
		id: guid(),
		groupId,
		type,
		createdAt: Date.now(),
	};
}

function cleanupTrackedMarks(node) {
	if (!node.marks || node.marks.length === 0) {
		delete node.marks;
		return node;
	}

	node.marks = node.marks.filter((mark) => mark.type !== "trackedChange");

	if (node.marks.length === 0) {
		delete node.marks;
	}

	return node;
}

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

function canInlineDiffBlock(sourceBlock, targetBlock) {
	return (
		sourceBlock &&
		targetBlock &&
		sourceBlock.type === targetBlock.type &&
		["paragraph", "heading", "blockquote"].includes(sourceBlock.type)
	);
}

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

	if (result.content.length === 0) {
		delete result.content;
	}

	return result;
}

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

function buildReplaceReviewNodes(sourceBlocks = [], targetBlocks = []) {
	const result = [];
	const pairCount = Math.min(sourceBlocks.length, targetBlocks.length);

	// Only pair blocks positionally when both sides have the same block count.
	// For many-to-one / one-to-many replacements, positional pairing can
	// incorrectly fold unrelated siblings into one container diff and reorder
	// the remaining blocks in reviewDoc.
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

	if (sourceBlocks.length > pairCount) {
		const groupId = guid();
		result.push(
			...sourceBlocks.slice(pairCount).map((block) =>
				addTrackedBlock(block.node, buildTrackedAttrs("delete", groupId)),
			),
		);
	}

	if (targetBlocks.length > pairCount) {
		const groupId = guid();
		result.push(
			...targetBlocks.slice(pairCount).map((block) =>
				addTrackedBlock(block.node, buildTrackedAttrs("insert", groupId)),
			),
		);
	}

	return result;
}

function buildReviewNodes(sourceNodes = [], targetNodes = []) {
	const sourceBlocks = buildBlockTokensFromNodes(sourceNodes);
	const targetBlocks = buildBlockTokensFromNodes(targetNodes);
	const chunks = diffBlockTokenArrays(sourceBlocks, targetBlocks);
	const result = [];

	for (const chunk of chunks) {
		if (chunk.type === "equal") {
			result.push(...chunk.targetBlocks.map((block) => clone(block.node)));
			continue;
		}

		if (chunk.type === "delete") {
			const groupId = guid();
			result.push(
				...chunk.sourceBlocks.map((block) =>
					addTrackedBlock(block.node, buildTrackedAttrs("delete", groupId)),
				),
			);
			continue;
		}

		if (chunk.type === "insert") {
			const groupId = guid();
			result.push(
				...chunk.targetBlocks.map((block) =>
					addTrackedBlock(block.node, buildTrackedAttrs("insert", groupId)),
				),
			);
			continue;
		}

		if (chunk.type === "replace") {
			result.push(
				...buildReplaceReviewNodes(chunk.sourceBlocks, chunk.targetBlocks),
			);
		}
	}

	return result;
}

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

function computeDiff(sourceDoc = {}, targetDoc = {}) {
	return {
		chunks: diffBlocks(sourceDoc, targetDoc),
		reviewDoc: buildReviewDoc(sourceDoc, targetDoc),
	};
}

export {
	buildInlineTokens,
	buildReviewDoc,
	buildReviewNodes,
	computeDiff,
	diffBlocks,
	diffInlineTokens,
};
