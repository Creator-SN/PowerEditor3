<template>
	<div class="power-editor-container" :class="[{ dark: theme === 'dark' }]">
		<transition name="power-editor-tool-bar-fade-in">
			<tool-bar
				v-if="editor"
				v-show="editable && showToolBar"
				:editor="editor"
				:theme="theme"
				:foreground="foreground"
				:language="language"
				:toolbarHeight="toolbarHeight"
				:toolbarBorderRadius="toolbarBorderRadius"
				:mobileMode="mobileMode"
				:showSave="showSave"
				@save-click="save"
			>
				<template v-slot:custom-buttons="x">
					<slot
						name="custom-buttons"
						:editor="editor"
						:defaultClass="x.defaultClass"
					></slot>
				</template>
				<template v-slot:custom-buttons-front="x">
					<slot
						name="custom-buttons-front"
						:editor="editor"
						:defaultClass="x.defaultClass"
					></slot>
				</template>
				<template v-slot:custom-buttons-0="x">
					<slot
						name="custom-buttons-0"
						:editor="editor"
						:defaultClass="x.defaultClass"
					></slot>
				</template>
				<template v-slot:custom-buttons-1="x">
					<slot
						name="custom-buttons-1"
						:editor="editor"
						:defaultClass="x.defaultClass"
					></slot>
				</template>
				<template v-slot:custom-buttons-2="x">
					<slot
						name="custom-buttons-2"
						:editor="editor"
						:defaultClass="x.defaultClass"
					></slot>
				</template>
				<template v-slot:custom-buttons-3="x">
					<slot
						name="custom-buttons-3"
						:editor="editor"
						:defaultClass="x.defaultClass"
					></slot>
				</template>
				<template v-slot:custom-buttons-4="x">
					<slot
						name="custom-buttons-4"
						:editor="editor"
						:defaultClass="x.defaultClass"
					></slot>
				</template>
			</tool-bar>
		</transition>
		<div
			v-if="editor"
			v-show="editable && showToolBar"
			class="power-editor-tool-bar-acrylic-background"
			:style="{
				height: `${toolbarHeight}px`,
				background: toolbarBackground,
				'border-radius': `${toolbarBorderRadius}px`,
			}"
		></div>
		<div
			:class="[{ 'read-only': !editable || !showToolBar }]"
			class="tip-tap-editor-container"
			ref="container"
			:style="{
				'padding-top':
					editable && showToolBar
						? `${
								editablePaddingTop
									? editablePaddingTop
									: toolbarHeight + 10
							}px`
						: `${readOnlyPaddingTop}px`,
				background: editorOutSideBackground,
				'--link-color': linkColor,
				'--selection-background': selectionBackground,
				'--selection-color': selectionForeground,
				'--table-drag-color': tableDragColor,
				'--code-color': codeColor,
			}"
		>
			<slot name="front-content"></slot>
			<editor-content
				class="tip-tap-editor"
				:class="[{ 'format-painter': showFormatPainter }]"
				:editor="editor"
				:theme="theme"
				ref="editor"
				:style="{
					'padding-bottom': editable
						? `${editablePaddingBottom}px`
						: `${readOnlyPaddingBottom}px`,
					background: editorBackground,
					'max-width': contentMaxWidth,
				}"
			/>
		</div>
		<tiptap-bubble-menu
			v-if="editor"
			v-show="editable"
			:editor="editor"
			:options="{
				placement: 'top',
				offset: 8,
			}"
			:should-show="bubbleMenuShouldShow"
		>
			<bubble-tool-bar
				:editor="editor"
				:theme="theme"
				:foreground="foreground"
				:language="language"
				:mobileMode="mobileMode"
				:showSave="showSave"
			></bubble-tool-bar>
		</tiptap-bubble-menu>
		<drag-handler
			v-if="editor && showDragHandler"
			v-show="editable"
			:editor="editor"
			:theme="theme"
			:nested="dragHandlerNested"
			:ignoreDragNodeType="ignoreDragNodeType"
		></drag-handler>
	</div>
</template>

<script setup>
import { getCurrentInstance } from "vue";

const { ref, proxy } = getCurrentInstance();

const emits = defineEmits([
	"content-change",
	"on-mounted",
	"change",
	"container-scroll",
	"save-json",
	"save-html",
]);

const props = defineProps({
	modelValue: {
		default: ``,
	},
	editable: {
		default: true,
	},
	placeholder: {
		default: "Write something …",
	},
	disabledPlaceholder: {
		default: false,
		type: Boolean,
	},
	contentMaxWidth: {
		default: "900px",
		type: String,
	},
	foreground: {
		default: "#958DF1",
	},
	linkColor: {
		default: "#958DF1",
	},
	selectionBackground: {
		default: "rgba(144, 145, 234, 0.3)",
	},
	selectionForeground: {
		default: "",
	},
	tableDragColor: {
		default: "rgba(144, 145, 234, 0.6)",
	},
	codeColor: {
		default: "",
	},
	editorBackground: {
		default: "",
	},
	editorOutSideBackground: {
		default: "",
	},
	mobileDisplayWidth: {
		default: 768,
	},
	showToolBar: {
		default: true,
	},
	toolbarHeight: {
		default: 65,
	},
	toolbarBackground: {
		default: "",
	},
	toolbarBorderRadius: {
		default: 8,
	},
	editablePaddingTop: {
		default: false,
	},
	readOnlyPaddingTop: {
		default: 5,
	},
	editablePaddingBottom: {
		default: 315,
	},
	readOnlyPaddingBottom: {
		default: 55,
	},
	codeBlockLanguagesBox: {
		default: true,
	},
	codeBlockLineNumbers: {
		default: false,
	},
	imgPreview: {
		default: true,
	},
	imgInterceptor: {
		default: null,
	},
	mentionItemAttr: {
		default: () => ({}),
	},
	imgLazyLoad: {
		default: true,
	},
	useTab: {
		default: false,
		type: Boolean,
	},
	extensions: {
		default: () => [],
	},
	starterKit: {
		default: () => {},
	},
	showControlOnReadonly: {
		default: true,
	},
	mdDecNodeFuncsPlugins: {
		default: () => ({}),
	},
	mdFlags: {
		default: () => ({}),
	},
	showSave: {
		default: true,
	},
	showDragHandler: {
		default: false,
	},
	ignoreDragNodeType: {
		default: () => [],
		type: Array,
	},
	dragHandlerNested: {
		default: false,
	},
	language: {
		default: "cn",
	},
	theme: {
		default: "light",
	},
});

defineExpose({
	save: (...args) => proxy.save(...args),
	saveMarkdown: (...args) => proxy.saveMarkdown(...args),
	computeMarkdown: (...args) => proxy.computeMarkdown(...args),
	insertMarkdown: (...args) => proxy.insertMarkdown(...args),
	editor: () => proxy.$data.editor, // this is a function
	focus: () => proxy.focus(),
});
</script>

<script>
import { Editor, EditorContent } from "@tiptap/vue-3";
import { BubbleMenu as TiptapBubbleMenu } from "@tiptap/vue-3/menus";
import { Extension } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import Highlight from "@tiptap/extension-highlight";
import { Color } from "@tiptap/extension-color";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import Placeholder from "@tiptap/extension-placeholder";
import CodeBlockLowlight from "./components/custom/extension/codeBlockX.js";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import {
	Details,
	DetailsContent,
	DetailsSummary,
} from "@tiptap/extension-details";
import { lowlight } from "./js/lowlight";
import { Encoder, Decoder } from "./js/markdown";

import ImageBlock from "./components/custom/extension/imageBlock.js";
import EmbedBlock from "./components/custom/extension/embedBlock.js";
import PowerTaskList from "./components/custom/extension/taskList.js";
import PowerTaskItem from "./components/custom/extension/taskItem.js";
import InlineEquation from "./components/custom/extension/inlineEquation.js";
import EquationBlock from "./components/custom/extension/equationBlock.js";
import MentionItem from "./components/custom/extension/mentionItem.js";
import DrawingBlock from "./components/custom/extension/drawingBlock.js";
import FormatPainter from "./components/custom/extension/formatPainter.js";
import {
	TrackedChange,
	TrackedChangeNodeAttributes,
} from "./components/custom/extension/trackedChange.js";

import toolBar from "./components/toolBar.vue";
import bubbleToolBar from "./components/bubbleToolBar.vue";
import DragHandler from "./components/custom/basic/dragHandler/index.vue";

import i18n from "../../i18n/i18n.js";

export default {
	name: "PowerEditor",
	components: {
		EditorContent,
		TiptapBubbleMenu,
		toolBar,
		bubbleToolBar,
		DragHandler,
	},
	data() {
		return {
			editor: null,
			mobileMode: false,
			timer: {
				widthTimer: {},
			},
		};
	},
	watch: {
		modelValue(val) {
			this.editor.commands.setContent(val);
			this.propsSync();
			this.$emit("content-change", val);
		},
		editable() {
			this.editor.setEditable(this.editable);
		},
		language() {
			this.propsSync();
		},
		theme() {
			this.propsSync();
			if (this.editor?.view) {
				// tiptap 3.23.6有懒更新, NodeView 组件的刷新时机被 Tiptap 绑定在编辑器更新周期上了, 这里建立一个空的state, 让editor更新一下.
				this.editor.view.dispatch(
					this.editor.state.tr.setMeta("theme-change", this.theme),
				);
			}
		},
	},
	computed: {
		formatPainterStatus() {
			if (!this.editor) return "off";
			if (!this.editor.storage) return "off";
			if (!this.editor.storage.formatPainter) return "off";
			return this.editor.storage.formatPainter.formatPainterStatus;
		},
		showFormatPainter() {
			return this.formatPainterStatus !== "off";
		},
	},
	mounted() {
		this.init();
		this.eventInit();
		this.propsSync();
		this.widthTimerInit();
		this.$emit("on-mounted", this.editor);
	},
	methods: {
		init() {
			let el = this;
			const extensions = [
				StarterKit.configure({
					dropcursor: {
						color: this.foreground,
						width: 3,
						class: "power-editor-drop-cursor-custom",
					},
					codeBlock: false,
					// provide options for starterkit configuration
					...this.starterKit,
				}),
				TextAlign.configure({
					types: ["heading", "paragraph"],
				}),
				TextStyle,
				Highlight.configure({ multicolor: true }),
				Color,
				Subscript,
				Superscript,
				CodeBlockLowlight.configure({
					lowlight,
					HTMLAttributes: {
						class: "tiptap-code",
					},
					languageClassPrefix: "language-",
				}),
				ImageBlock,
				EmbedBlock,
				PowerTaskList,
				PowerTaskItem,
				InlineEquation,
				EquationBlock,
				MentionItem,
				DrawingBlock,
				TrackedChangeNodeAttributes,
				TrackedChange,
				Table.configure({
					HTMLAttributes: {},
					resizable: true,
				}),
				TableRow,
				TableHeader,
				TableCell,
				Details.configure({
					persist: true,
					HTMLAttributes: {
						class: "details",
					},
				}),
				DetailsSummary,
				DetailsContent,
				this.defaultStorageInit(),
				FormatPainter,
				...this.extensions,
			];
			if (this.disabledPlaceholder == false) {
				extensions.push(
					Placeholder.configure({
						emptyEditorClass: "is-editor-empty",
						placeholder: () => this.placeholder,
					}),
				);
			}
			this.editor = new Editor({
				editable: this.editable,
				content: this.modelValue,
				extensions,
				editorProps: {
					handleKeyDown(view, event) {
						return el.handleEditorKeyDown(event);
					},
				},
				onUpdate() {
					el.$emit("change");
				},
			});
		},
		eventInit() {
			this.$refs.container.addEventListener("scroll", (event) => {
				if (this.$refs.container)
					this.$emit("container-scroll", {
						el: this.$refs.container,
						oriEvent: event,
					});
			});
			this.$refs.container.addEventListener("mouseup", () => {
				let status =
					this.editor.storage.formatPainter.formatPainterStatus;
				if (status !== "off") {
					this.editor.commands.pasteFormat();
					if (status === "once") {
						this.editor.storage.formatPainter.formatPainterStatus =
							"off";
					}
				}
			});
		},
		handleEditorKeyDown(event) {
			if (!this.useTab || event.key !== "Tab") {
				return false;
			}

			event.preventDefault();

			if (
				this.editor.isActive("bulletList") ||
				this.editor.isActive("orderedList")
			) {
				return true;
			}

			if (!this.editable) {
				return true;
			}

			this.editor.commands.insertContent("\t");
			return true;
		},
		bubbleMenuShouldShow({ editor, view, state, from, to }) {
			if (!this.editable) {
				return false;
			}

			const hasSelection = from !== to;
			const hasSelectedText = !!state.doc
				.textBetween(from, to, " ")
				.trim().length;

			if (!view.hasFocus() || !hasSelection || !hasSelectedText) {
				return false;
			}

			return !(
				editor.isActive("imageblock") ||
				editor.isActive("equationBlock") ||
				editor.isActive("embedblock") ||
				editor.isActive("drawingBlock")
			);
		},
		defaultStorageInit() {
			const defaultStorage = Extension.create({
				name: "defaultStorage",

				addStorage() {
					return {
						showControlOnReadonly: false,
						language: "en",
						theme: "light",
					};
				},
			});

			return defaultStorage;
		},
		propsSync() {
			this.editor.storage.defaultStorage.codeBlockLanguagesBox =
				this.codeBlockLanguagesBox;
			this.editor.storage.defaultStorage.codeBlockLineNumbers =
				this.codeBlockLineNumbers;
			this.editor.storage.defaultStorage.showControlOnReadonly =
				this.showControlOnReadonly;
			this.editor.storage.defaultStorage.imgLazyLoad = this.imgLazyLoad;
			this.editor.storage.defaultStorage.imgPreview = this.imgPreview;
			this.editor.storage.defaultStorage.foreground = this.foreground;
			this.editor.storage.defaultStorage.language = this.language;
			this.editor.storage.defaultStorage.theme = this.theme;
			this.editor.storage.defaultStorage.getTitle = (name) => {
				return i18n(name, this.language);
			};
			this.editor.storage.defaultStorage.editorContainer =
				this.$refs.container;
			this.editor.storage.defaultStorage.imgInterceptor =
				this.imgInterceptor;
			let mentionItemTools = {
				mentionList: () => [
					// { key: 0, name: 'Mention Color', type: 'header' },
					// {
					//     key: 1,
					//     name: 'Blue',
					//     color: 'rgba(0, 120, 212, 1)',
					//     icon: 'WindowsLogo',
					//     iconColor: 'rgba(0, 153, 204, 1)',
					// },
					// { key: 2, name: 'Purple', color: '#958DF1', icon: 'DelveAnalyticsLogo', iconColor: '#958DF1' },
					// { key: 3, name: 'Mention Text', type: 'header' },
					// { key: 9, name: '', type: 'divider' },
					// { key: 5, name: 'Text1' },
					// { key: 6, name: 'Text2' },
				],
				filterFunc: () => {
					return true;
				},
				chooseItemCallback: () => {
					console.log("chooseItemCallback");
				},
				mentionClickCallback: () => {
					console.log("mentionClickCallback");
				},
				placeholder: () => {
					return "mention";
				},
				isLoading: () => {
					return false;
				},
				headerForeground: () => {
					return this.foreground;
				},
			};
			this.editor.storage.defaultStorage.mentionItemTools = Object.assign(
				mentionItemTools,
				this.mentionItemAttr,
			);
		},
		insert(html) {
			this.editor.commands.insertContent(html);
		},
		insertImg(base64_list) {
			base64_list.forEach((el) => {
				this.insert(`<img src="${el}" theme="${this.theme}"></img>\n`);
			});
		},
		widthTimerInit() {
			this.timer.widthTimer = setInterval(() => {
				if (this.$el.clientWidth < this.mobileDisplayWidth)
					this.mobileMode = true;
				else this.mobileMode = false;
			}, 300);
		},
		async customPaste(event) {
			//rewrite paste event//
			let img_promises = [];
			let exists_html = false;
			let exists_text = false;

			let data = event.clipboardData || window.clipboardData;
			let items = data.items;
			for (let i = 0; i < items.length; i++) {
				if (items[i].type.indexOf("html") > -1) exists_html = items[i];
				if (items[i].type.indexOf("plain") > -1) exists_text = items[i];
				if (
					items[i].kind === "file" &&
					items[i].type.indexOf("image") > -1
				) {
					let pasteFile = items[i].getAsFile();
					let reader = new FileReader();
					reader.readAsDataURL(pasteFile);
					let base64 = new Promise((resolve) => {
						reader.onload = (event) => {
							resolve(event.target.result);
						};
					});
					img_promises.push(base64);
				}
			}

			if (exists_html !== false) {
				let txt = await new Promise((resolve) => {
					exists_html.getAsString((str) => {
						resolve(str);
					});
				});
				let parser = new DOMParser();
				let htmlDoc = parser.parseFromString(txt, "text/html");
				console.log(htmlDoc);
				let insertDoc = parser.parseFromString("", "text/html");
				let pure = [];
				htmlDoc.body.children.forEach((el) => {
					let r = this.dfsDiv(el);
					pure = pure.concat(r);
				});
				insertDoc.body.append(...pure);
				// let all_nodes = insertDoc.querySelectorAll('*');
				// for (let i = 0; i < all_nodes.length; i++) {
				//     let node = all_nodes[i];
				//     let style = node.getAttribute('style');
				//     if (!style) node.setAttribute('style', ``);
				//     else {
				//         let color = style.match(/color: *[()\d,\w]+;/);
				//         let background = style.match(/background-color: *[()\d,\w]+;/);
				//         if (color) color = color[0];
				//         else color = 'inherit';
				//         if (background) background = background[0];
				//         else background = 'inherit';
				//         node.setAttribute('style', `color: ${color}; background: ${background};`);
				//     }
				// }
				let img_nodes = insertDoc.querySelectorAll("img");
				for (let i = 0; i < img_nodes.length; i++) {
					let x = img_nodes[i];
					let node = img_nodes[i];
					while (x && x.parentNode != insertDoc.body) {
						x = x.parentNode;
					}
					x.parentNode.insertBefore(node, x);
				}
				console.log(insertDoc.body.innerHTML);
				this.insert(insertDoc.body.innerHTML);
			} else if (exists_text !== false) {
				exists_text.getAsString((str) => {
					const transaction = this.editor.state.tr.insertText(str);
					this.editor.view.dispatch(transaction);
					// str = str.replace(/&/g, '&amp;');
					// str = str.replace(/</g, '&lt;');
					// str = str.replace(/>/g, '&gt;');
					// str = str.replace(/"/g, '&quto;');
					// str = str.replace(/'/g, '&#39;');
					// str = str.replace(/`/g, '&#96;');
					// str = str.replace(/\//g, '&#x2F;');
					// this.insert(str);
				});
			} else
				Promise.all(img_promises).then((data) => {
					this.insertImg(data);
				});
		},
		dfsDiv(node) {
			if (node.tagName.toUpperCase() !== "DIV") return [node];
			let children = node.children;
			let result = [];
			children.forEach((el) => {
				result = result.concat(this.dfsDiv(el));
			});
			return result;
		},
		focus() {
			this.editor.commands.focus();
		},
		computeMarkdown(content) {
			let md = new Encoder([
				StarterKit,
				Table,
				TableRow,
				TableHeader,
				TableCell,
			]);
			let deserialized = md.encoder(content);
			return deserialized;
		},
		insertMarkdown(content) {
			let deserialized = this.computeMarkdown(content);
			this.editor.commands.setContent(deserialized);
			return deserialized;
		},
		saveMarkdown() {
			let dec = new Decoder(this.mdDecNodeFuncsPlugins, this.mdFlags);
			return dec.decode(this.editor.getJSON());
		},
		save() {
			this.$emit("save-json", this.editor.getJSON());
			this.$emit("save-html", this.editor.getHTML());
		},
	},
	beforeUnmount() {
		if (this.editor) this.editor.destroy();
		for (let key in this.timer) {
			clearInterval(this.timer[key]);
		}
	},
};
</script>

<style src="./styles/editor.scss" lang="scss"></style>
