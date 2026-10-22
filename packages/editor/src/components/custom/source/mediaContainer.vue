<template>
	<div
		class="power-editor-media-container"
		:class="[{ dark: theme === 'dark' }, { 'active-effects': active }]"
		:style="{
			width: moveable
				? `${elWidthEnd}px`
				: normalizeWidthValue(currentWidth),
		}"
	>
		<div
			v-show="
				alignCenter &&
				(editor.isEditable ||
					editor.storage.defaultStorage.showControlOnReadonly)
			"
			class="power-editor-media-control-resize-block"
			@mousedown="forward($event, -1)"
			@mouseup="stop"
			@touchstart="forward($event.targetTouches[0], -1)"
			@touchend="stop"
		>
			<i></i>
		</div>
		<div
			class="power-editor-media-slot-container"
			@dblclick="$emit('container-dblclick', $event)"
			@click="$emit('container-click', $event)"
		>
			<slot> Media Container </slot>
		</div>
		<div
			v-show="
				editor.isEditable ||
				editor.storage.defaultStorage.showControlOnReadonly
			"
			class="power-editor-media-control-resize-block sec"
			@mousedown="forward"
			@mouseup="stop"
			@touchstart="forward($event.targetTouches[0])"
			@touchend="stop"
		>
			<i></i>
		</div>
		<div
			v-show="editor.isEditable"
			draggable="true"
			data-drag-handle
			class="power-editor-media-drag-btn"
			@mousedown="active = true"
			@mouseup="active = false"
			@touchstart="active = true"
			@touchend="active = false"
		>
			<i class="ms-Icon ms-Icon--GripperDotsVertical"></i>
		</div>
		<div
			v-show="
				editor.isEditable ||
				editor.storage.defaultStorage.showControlOnReadonly
			"
			class="power-editor-media-control-btn-block"
		>
			<fv-button
				v-show="editor.isEditable"
				v-for="(button, index) in mediaContainerButtons.left"
				:key="`left-${index}`"
				class="power-editor-media-cmd-btn"
				:background="button.background || 'transparent'"
				borderColor="transparent"
				:border-radius="6"
				:theme="theme"
				fontSize="10"
				:title="button.title"
				@click.stop="runMediaButton(button)"
			>
				<i :class="['ms-Icon', `ms-Icon--${button.icon}`]"></i>
			</fv-button>
			<fv-button
				v-show="editor.isEditable"
				class="power-editor-media-cmd-btn"
				:background="'transparent'"
				borderColor="transparent"
				:border-radius="6"
				:theme="theme"
				fontSize="10"
				:title="getTitle('Caption')"
				@click="showCaptionBox"
			>
				<i class="ms-Icon ms-Icon--TextField"></i>
			</fv-button>
			<fv-button
				class="power-editor-media-cmd-btn"
				:background="'transparent'"
				borderColor="transparent"
				:border-radius="6"
				:theme="theme"
				fontSize="10"
				:title="getTitle('AlignLeft')"
				@click="thisAlignCenter = false"
			>
				<i class="ms-Icon ms-Icon--AlignLeft"></i>
			</fv-button>
			<fv-button
				class="power-editor-media-cmd-btn"
				:background="'transparent'"
				borderColor="transparent"
				:border-radius="6"
				:theme="theme"
				fontSize="10"
				:title="getTitle('AlignCenter')"
				@click="thisAlignCenter = true"
			>
				<i class="ms-Icon ms-Icon--AlignCenter"></i>
			</fv-button>
			<fv-button
				v-show="editor.isEditable"
				v-for="(button, index) in mediaContainerButtons.right"
				:key="`right-${index}`"
				class="power-editor-media-cmd-btn"
				:background="button.background || 'transparent'"
				borderColor="transparent"
				:border-radius="6"
				:theme="theme"
				fontSize="10"
				:title="button.title"
				@click.stop="runMediaButton(button)"
			>
				<i :class="['ms-Icon', `ms-Icon--${button.icon}`]"></i>
			</fv-button>
		</div>
		<div
			v-show="editor.isEditable"
			class="power-editor-media-control-btn-block bottom"
		>
			<fv-button
				class="power-editor-media-cmd-btn"
				:background="
					theme === 'dark'
						? 'rgba(0, 0, 0, 0.8)'
						: 'rgba(255, 255, 255, 0.0)'
				"
				:border-radius="6"
				:theme="theme"
				icon="ReturnKeySm"
				fontSize="10"
				:title="getTitle('TextField')"
				style="width: 60px"
				@click="newline"
			>
				{{ getTitle("Newline") }}
			</fv-button>
		</div>
		<div v-show="active" class="power-editor-media-mask-block"></div>
		<p
			v-show="thisCaption !== '' && !show.captionBox"
			class="power-editor-media-container-caption"
			@click="showCaptionBox"
		>
			{{ thisCaption }}
		</p>
		<fv-text-box
			v-show="show.captionBox"
			v-model="thisCaption"
			:theme="theme"
			class="power-editor-media-caption-block"
			:placeholder="getTitle('Write a caption...')"
			ref="caption"
			background="transparent"
			:font-size="12"
			underline
			:border-width="2"
			:border-color="'rgba(200, 200, 200, 0.1)'"
			:focus-border-color="foreground"
			style="height: 35px"
			@keyup.enter="
				() => {
					show.captionBox = false;
					newline();
				}
			"
		></fv-text-box>
	</div>
</template>

<script>
import i18n from "@/packages/i18n/i18n.js";

export default {
	emits: [
		"container-dblclick",
		"container-click",
		"update:width",
		"update:alignCenter",
		"update:caption",
	],
	props: {
		width: {
			default: 100,
		},
		editor: {
			default: () => {
				return {};
			},
		},
		caption: {
			default: "",
		},
		alignCenter: {
			default: true,
		},
		foreground: {
			default: "",
		},
		node: {
			default: () => ({}),
		},
		getPos: {
			default: () => {},
		},
		theme: {
			default: "light",
		},
	},
	data() {
		return {
			thisCaption: !this.caption ? "" : this.caption.toString(),
			thisAlignCenter: this.alignCenter,
			elWidthStart: 0,
			elWidthEnd: 0,
			active: false,
			moveable: false,
			direction: 1,
			disX: 0,
			currentWidth: this.normalizeWidthValue(this.width),
			outsideEvent: (event) => {
				let x = event.target;
				let _self = false;
				while (x && x.tagName && x.tagName.toLowerCase() != "body") {
					if (x == this.$el) {
						_self = true;
						break;
					}
					x = x.parentNode;
				}
				if (!_self) this.show.captionBox = false;
			},
			show: {
				captionBox: false,
			},
		};
	},
	watch: {
		width(val) {
			this.currentWidth = this.normalizeWidthValue(val);
		},
		currentWidth(val) {
			this.$emit("update:width", val);
		},
		alignCenter(val) {
			this.thisAlignCenter = val;
		},
		thisAlignCenter(val) {
			this.$emit("update:alignCenter", val);
		},
		caption(val) {
			this.thisCaption = !val ? "" : val.toString();
		},
		thisCaption(val) {
			this.$emit("update:caption", val);
		},
	},
	mounted() {
		this.Init();
		this.outSideClickInit();
	},
	computed: {
		mediaContainerButtons() {
			return (
				this.editor.storage.defaultStorage.mediaContainerButtons || {
					left: [],
					right: [],
				}
			);
		},
		defaultButtonBackground() {
			return this.theme === "dark"
				? "rgba(0, 0, 0, 0.8)"
				: "rgba(255, 255, 255, 0.0)";
		},
	},
	methods: {
		runMediaButton(button) {
			if (typeof button.func !== "function") return;
			button.func({
				editor: this.editor,
				node: this.node,
				pos: this.getPos(),
			});
		},
		Init() {
			let agent = (event) => {
				return (
					(event.clientX - this.disX) * this.direction +
					this.elWidthStart * 1
				);
			};
			window.addEventListener("mousemove", (event) => {
				if (this.moveable) {
					this.elWidthEnd = agent(event);
				}
			});
			window.addEventListener("touchmove", (event) => {
				event = event.targetTouches[0];
				if (this.moveable) {
					this.elWidthEnd = agent(event);
				}
			});
			window.addEventListener("mouseup", (event) => {
				this.active = false;
				if (this.moveable) {
					this.stop();
				}
				return event;
			});
			window.addEventListener("touchup", (event) => {
				this.active = false;
				if (this.moveable) {
					this.stop();
				}
				return event;
			});
		},
		forward(event, direction = 1) {
			this.active = true;
			this.moveable = true;
			this.disX = event.clientX;
			this.direction = direction;
			this.elWidthStart = this.$el.clientWidth;
			this.elWidthEnd = this.elWidthStart;
		},
		stop() {
			this.active = false;
			this.moveable = false;
			if (this.elWidthEnd < 50) this.elWidthEnd = 50;
			this.currentWidth = `${this.elWidthEnd}px`;
		},
		outSideClickInit() {
			window.addEventListener("click", this.outsideEvent);
		},
		normalizeWidthValue(width) {
			const normalizedWidth = width?.toString().trim();

			if (!normalizedWidth) return "100%";
			if (
				normalizedWidth.includes("%") ||
				normalizedWidth.includes("px") ||
				normalizedWidth.includes("vw") ||
				normalizedWidth.includes("vh") ||
				normalizedWidth.includes("rem") ||
				normalizedWidth.includes("em") ||
				normalizedWidth.includes("auto") ||
				normalizedWidth.includes("calc(")
			) {
				return normalizedWidth;
			}

			return `${normalizedWidth}%`;
		},
		getTitle(name) {
			return i18n(name, this.editor.storage.defaultStorage.language);
		},
		showCaptionBox() {
			if (!this.editor.isEditable) return;
			this.show.captionBox = true;
			this.$nextTick(() => {
				this.$refs.caption.focus();
			});
		},
		newline() {
			if (!this.editor.isEditable) return;
			this.editor.commands.focus();
			this.editor.commands.insertContentAt(
				this.getPos() + this.node.nodeSize - 1,
				"<br>",
			);
		},
	},
	beforeUnmount() {
		window.removeEventListener("click", this.outsideEvent);
	},
};
</script>

<style lang="scss">
.power-editor-media-container {
	position: relative;
	min-width: 50px;
	width: 100%;
	max-width: 100%;
	height: auto;

	&.dark {
		.power-editor-media-control-resize-block {
			i {
				background: rgba(255, 255, 255, 0.8);
			}
		}

		.power-editor-media-drag-btn {
			color: whitesmoke;
		}

		.power-editor-media-container-caption {
			color: rgba(230, 230, 230, 1);
		}

		.power-editor-media-control-btn-block {
			background: rgba(0, 0, 0, 0.6);
			border: rgba(36, 36, 36, 0.1) solid thin;
		}
	}

	&:hover {
		.power-editor-media-drag-btn {
			opacity: 1;
		}

		.power-editor-media-control-resize-block,
		.power-editor-media-control-btn-block {
			opacity: 1;
		}
	}

	&.active-effects:active {
		.power-editor-media-slot-container {
			transform: scale(1.02);
			box-shadow: 20px 20px 20px rgba(0, 0, 0, 0.1);
			opacity: 0.8;
		}
	}

	.power-editor-media-slot-container {
		position: relative;
		transition:
			transform 0.3s,
			box-shadow 0.3s,
			opacity 0.3s;
	}

	.power-editor-media-control-resize-block {
		position: absolute;
		left: 0px;
		top: 0px;
		width: 6px;
		height: 100%;
		display: flex;
		align-items: center;
		opacity: 0;
		cursor: e-resize;
		transition: opacity 0.3s;
		z-index: 2;

		&.sec {
			left: inherit;
			right: 0px;
		}

		i {
			width: 90%;
			height: min(50px, 100%);
			flex-shrink: 0;
			background: rgba(12, 12, 12, 0.6);
			border-radius: 8px;
			backdrop-filter: blur(50px);
			-webkit-backdrop-filter: blur(50px);
			z-index: 2;
		}
	}

	.power-editor-media-control-btn-block {
		position: absolute;
		right: 0px;
		top: 0px;
		width: auto;
		height: auto;
		gap: 1px;
		padding: 2px;
		background: rgba(255, 255, 255, 0.6);
		border: rgba(120, 120, 120, 0.1) solid thin;
		border-radius: 8px;
		display: flex;
		align-items: center;
		opacity: 0;
		transition: opacity 1s;
		box-shadow: 0px 0px 1px rgba(120, 120, 120, 0.1);

		&.bottom {
			top: inherit;
			bottom: 2px;
			background: none;
			border: none;
			box-shadow: none;
			z-index: 1;
		}

		.power-editor-media-cmd-btn {
			width: 25px;
			height: 25px;
			flex-shrink: 0;
		}
	}

	.power-editor-media-drag-btn {
		position: absolute;
		left: 5px;
		top: 5px;
		width: auto;
		height: auto;
		font-size: 18px;
		color: rgba(36, 36, 36, 1);
		opacity: 0;
		transition: opacity 1s;
		cursor: grab;
	}

	.power-editor-media-caption-block {
		position: relative;
		width: 100%;
		margin-top: 5px;
	}

	.power-editor-media-container-caption {
		position: relative;
		min-height: 35px;
		height: 35px;
		margin: 0px;
		font-size: 12px;
		color: rgba(95, 95, 95, 1);
		border-radius: 3px;
		text-align: left;
		display: flex;
		justify-content: flex-start;
		align-items: center;
		opacity: 0.8;

		&:hover {
			background: rgba(200, 200, 200, 0.1);
		}

		&:active {
			background: rgba(200, 200, 200, 0.15);
		}
	}

	.power-editor-media-mask-block {
		position: absolute;
		left: 0px;
		top: 0px;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.01);
	}
}
</style>
