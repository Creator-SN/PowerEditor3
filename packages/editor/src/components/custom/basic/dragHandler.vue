<template>
	<drag-handle
		v-if="editor"
		v-show="visible"
		:editor="editor"
		:nested="nestedOptions"
		:compute-position-config="{ placement: 'left-start' }"
		style="display: flex; justify-content: center; align-items: center"
		@nodeChange="handleNodeChange"
	>
		<div
			class="power-editor-drag-handle"
			:class="[{ dark: theme === 'dark' }]"
			:style="{ height: nodeHeight < 28 ? nodeHeight + 'px' : '28px' }"
		>
			<i class="ms-Icon ms-Icon--GripperDotsVertical"></i>
		</div>
	</drag-handle>
</template>

<script>
// @ts-nocheck
import { DragHandle } from "@tiptap/extension-drag-handle-vue-3";

export default {
	name: "DragHandler",
	components: {
		DragHandle,
	},
	props: {
		editor: {
			type: Object,
		},
		nested: {
			type: Boolean,
			default: true,
		},
		theme: {
			default: "light",
		},
	},
	data() {
		return {
			visible: true,
			nodeHeight: 0,
			filterNodeTypes: [
				"imageblock",
				"equationBlock",
				"drawingBlock",
				"embedBlock",
			],
		};
	},
	computed: {
		nestedOptions() {
			if (!this.nested) {
				return false;
			}

			return { edgeDetection: { threshold: -16, edges: ["left"] } };
		},
	},
	methods: {
		handleNodeChange({ node, editor, pos }) {
			if (this.filterNodeTypes.includes(node?.type?.name ?? null)) {
				this.visible = false;
			} else {
				this.visible = true;
			}
			if (pos !== null && pos !== undefined) {
				const dom = editor?.view?.nodeDOM(pos);
				this.nodeHeight = dom?.clientHeight ?? 0;
			}
		},
	},
};
</script>

<style lang="scss">
.power-editor-drag-handle {
	position: relative;
	width: auto;
	height: 28px;
	font-size: 18px;
	color: rgba(170, 170, 170, 1);
	background: rgba(120, 120, 120, 0);
	border-radius: 6px;
	display: flex;
	justify-content: center;
	align-items: center;
	transition: background 1s;
	cursor: grab;

	.ms-Icon {
		display: flex;
		justify-content: center;
		align-items: center;
	}

	&.dark {
		color: whitesmoke;

		&:hover {
			background: rgba(200, 200, 200, 0.1);
		}

		&:active {
			background: rgba(200, 200, 200, 0.2);
		}
	}

	&:hover {
		background: rgba(120, 120, 120, 0.1);
	}

	&:active {
		background: rgba(120, 120, 120, 0.2);
	}
}
</style>
