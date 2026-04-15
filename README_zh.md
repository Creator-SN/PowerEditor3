<div align="center">
  <img src="https://raw.githubusercontent.com/Creator-SN/PowerEditor3/main/docs/public/assets/logo.svg" width="220" alt="PowerEditor3 Logo" />

[![Vue](https://img.shields.io/badge/Vue-3.x-42b883?style=flat-square&logo=vue.js&logoColor=white)](https://vuejs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tiptap](https://img.shields.io/badge/Tiptap-2.x-0D0D0D?style=flat-square)](https://tiptap.dev/)
[![NPM](https://img.shields.io/npm/v/@creatorsn/powereditor3?style=flat-square&color=2F80ED&logo=npm&logoColor=white)](https://www.npmjs.com/package/@creatorsn/powereditor3)
[![Downloads](https://img.shields.io/npm/dw/@creatorsn/powereditor3?style=flat-square&color=green)](https://www.npmjs.com/package/@creatorsn/powereditor3)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](#license)

</div>

<h4 align="center">
  <i>基于 Tiptap 与 VFluent3 的 Vue 3 富文本编辑器，为现代 Web 应用提供清爽、可扩展的编辑体验。</i>
</h4>

<p align="center">
  <a href="https://creator-sn.github.io/PowerEditor3/via/">文档</a>
  ·
  <a href="https://www.npmjs.com/package/@creatorsn/powereditor3">npm</a>
  ·
  <a href="https://github.com/Creator-SN/PowerEditor3/issues">Issues</a>
</p>

[English](./README.md) | 简体中文

## PowerEditor3

PowerEditor3 是一个基于 [Tiptap](https://tiptap.dev/) 与 [VFluent3](https://github.com/Creator-SN/VFluent3) 封装的 Vue 3 富文本编辑器组件。它提供开箱即用的工具栏、主题切换、图片预览、Markdown 互转、Mention 提及项，以及面向业务场景的扩展能力。

这个项目适合用于需要富文本编辑、只读展示、HTML 或 JSON 保存、Markdown 转换、自定义图片上传和自定义 Markdown 解码逻辑的业务页面。

## 特性

- 基于 Tiptap 和 ProseMirror 的富文本编辑能力。
- 通过 Vue 3 插件方式安装，全局注册 `power-editor`。
- 支持亮色与暗色主题，并使用 VFluent3 作为 UI 基础。
- 支持 HTML、JSON 与 Markdown 保存或转换流程。
- 通过 Vue 插槽扩展工具栏按钮。
- 支持 Mention 提及项配置，可用于用户、话题或业务对象选择。
- 支持 Markdown Decoder Plugins，自定义节点和标记的序列化方式。
- 支持 ImgInterceptor 图片拦截器，接管上传、替换和进度状态展示。

## 安装

使用 Yarn 安装：

```sh
yarn add @creatorsn/powereditor3
```

npm 和 pnpm 也可以按类似方式安装。

## 快速开始

在 Vue 入口文件中注册 PowerEditor3，通常是 `main.js`：

```js
import { createApp } from 'vue';
import App from './App.vue';
import PowerEditor from '@creatorsn/powereditor3';
import '@creatorsn/powereditor3/powereditor3.css';

const app = createApp(App);

app.use(PowerEditor);
app.mount('#app');
```

然后在 Vue 组件中使用编辑器：

```vue
<template>
  <power-editor v-model="content" />
</template>

<script setup>
import { ref } from 'vue';

const content = ref('<p>Hello PowerEditor3</p>');
</script>
```

## 文档

查看完整文档、快速开始和 API 说明：

[https://creator-sn.github.io/PowerEditor3/via/](https://creator-sn.github.io/PowerEditor3/via/)

## 本地开发

克隆仓库后安装依赖：

```sh
yarn
```

启动 VitePress 文档站点：

```sh
yarn docs:dev
```

构建文档站点：

```sh
yarn docs:build
```

构建组件库：

```sh
yarn build
```

## 相关项目

PowerEditor3 使用 VFluent3 作为 UI 基础：

[https://github.com/Creator-SN/VFluent3](https://github.com/Creator-SN/VFluent3)

## 参与贡献

PowerEditor3 仍在持续完善，欢迎反馈和贡献。

如果你发现问题、有功能建议，或希望改进编辑器体验，请提交 [issue](https://github.com/Creator-SN/PowerEditor3/issues) 或发起 pull request。

## License

PowerEditor3 基于 MIT License 发布。

Copyright (c) 2026 Creator SN
