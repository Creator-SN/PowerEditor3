---
layout: home

title: PowerEditor3
editLink: true
lastUpdated: true
hero:
  name: PowerEditor3
  text: Vue 3 Rich Text Editor
  tagline: A rich text editor component built with Vue 3, Tiptap and VFluent3.
  image:
    src: /assets/logo.svg
    alt: PowerEditor
  actions:
    - theme: brand
      text: Quick Start
      link: /en/components/powerEditor/quick-start
features:
  - title: Production Ready
    details: Designed around real editing scenarios in business applications.
  - title: Vue Native
    details: Use PowerEditor directly in Vue pages and VitePress Markdown files.
  - title: Extensible
    details: Customize toolbar buttons, Markdown decoding, mention behavior and image upload workflows.
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
