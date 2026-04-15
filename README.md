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
  <i>A Vue 3 rich text editor powered by Tiptap and VFluent3, built for clean editing experiences in modern web apps.</i>
</h4>

<p align="center">
  <a href="https://creator-sn.github.io/PowerEditor3/via/">Documentation</a>
  ·
  <a href="https://www.npmjs.com/package/@creatorsn/powereditor3">npm</a>
  ·
  <a href="https://github.com/Creator-SN/PowerEditor3/issues">Issues</a>
</p>

English | [简体中文](./README_zh.md)

## PowerEditor3

PowerEditor3 is a Vue 3 rich text editor component built on top of [Tiptap](https://tiptap.dev/) and [VFluent3](https://github.com/Creator-SN/VFluent3). It packages a ready-to-use editor with toolbar controls, theme switching, image preview, Markdown conversion, mention support, and extension points for business-specific editing flows.

The project is designed for real application pages where rich text needs to be edited, displayed, saved as HTML or JSON, converted to Markdown, or extended with custom upload and decoding logic.

## Features

- Rich text editing based on Tiptap and ProseMirror.
- Vue 3 plugin installation with global `power-editor` registration.
- Light and dark themes, powered by VFluent3 styling.
- HTML, JSON and Markdown save or conversion workflows.
- Custom toolbar buttons through Vue slots.
- Mention item configuration for user, topic or business entity selection.
- Markdown decoder plugins for custom node and mark serialization.
- Image interceptor API for upload, replacement and progress status handling.

## Installation

Install the package with Yarn:

```sh
yarn add @creatorsn/powereditor3
```

npm and pnpm work in a similar way.

## Quick Start

Register PowerEditor3 in your Vue entry file, usually `main.js`:

```js
import { createApp } from 'vue';
import App from './App.vue';
import PowerEditor from '@creatorsn/powereditor3';
import '@creatorsn/powereditor3/powereditor3.css';

const app = createApp(App);

app.use(PowerEditor);
app.mount('#app');
```

Then use the editor in your Vue app:

```vue
<template>
  <power-editor v-model="content" />
</template>

<script setup>
import { ref } from 'vue';

const content = ref('<p>Hello PowerEditor3</p>');
</script>
```

## Documentation

Read the full documentation, quick start guide and API reference:

[https://creator-sn.github.io/PowerEditor3/via/](https://creator-sn.github.io/PowerEditor3/via/)

## Development

Clone the repository and install dependencies:

```sh
yarn
```

Start the VitePress documentation site:

```sh
yarn docs:dev
```

Build the documentation site:

```sh
yarn docs:build
```

Build the library:

```sh
yarn build
```

## Related Projects

PowerEditor3 uses VFluent3 for its UI foundation:

[https://github.com/Creator-SN/VFluent3](https://github.com/Creator-SN/VFluent3)

## Contributing

PowerEditor3 is still growing, and feedback is welcome.

If you find a bug, have an idea, or want to improve the editor experience, please open an [issue](https://github.com/Creator-SN/PowerEditor3/issues) or submit a pull request.

## License

PowerEditor3 is released under the MIT License.

Copyright (c) 2026 Creator SN
