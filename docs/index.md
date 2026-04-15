---
layout: home

title: PowerEditor3
editLink: true
lastUpdated: true
hero:
  name: PowerEditor3
  text: Vue 3 富文本编辑器
  tagline: 基于 Vue 3、Tiptap 与 VFluent3 封装的富文本编辑器组件。
  image:
    src: /assets/logo.svg
    alt: PowerEditor
  actions:
    - theme: brand
      text: 快速开始
      link: /components/powerEditor/quick-start
features:
  - title: 面向真实项目
    details: 围绕业务系统中的内容编辑、只读展示、图片处理与 Markdown 互转场景设计。
  - title: Vue 原生体验
    details: 可直接在 Vue 页面和 VitePress Markdown 中使用组件。
  - title: 灵活扩展
    details: 支持自定义工具栏按钮、Mention 提及项、Markdown 解码插件和图片拦截流程。
---

<script setup>
import { ref, onMounted } from "vue";
import { useData } from "vitepress";

const viteData = useData();
const editor = ref(null);

onMounted(() => {
    console.log(editor.value?.editor?.().commands);
});
</script>

<p style="display: flex; justify-content: center; align-items: center; gap: 8px; margin-top: 10px;">
  <a href="https://github.com/vuejs/vue" target="_blank">
    <img src="https://img.shields.io/badge/vue-3.5.13-orange.svg" alt="vue3">
  </a>
  <a href="https://www.npmjs.com/package/@creatorsn/vfluent3" target="_blank">
    <img alt="npm" src="https://img.shields.io/npm/v/@creatorsn/vfluent3.svg" />
  </a>
</p>

<power-editor :theme="viteData.isDark.value ? 'dark' : 'light'" ref="editor" style="width: 100%;"></power-editor>
