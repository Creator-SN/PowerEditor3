# 快速开始

本页介绍如何在 Vue 3 项目中安装并全局注册 `PowerEditor3`。

## 安装

使用 `yarn` 安装组件包：

```bash
yarn add @creatorsn/powereditor3
```

## 全局注册

在项目入口文件中引入组件和样式，例如 `main.js`：

```js
import { createApp } from 'vue';
import App from './App.vue';
import PowerEditor from '@creatorsn/powereditor3';
import '@creatorsn/powereditor3/powereditor3.css';

const app = createApp(App);

app.use(PowerEditor);
app.mount('#app');
```

## 使用组件

注册完成后，即可在任意 Vue 组件中使用 `power-editor`：

```vue
<template>
    <power-editor v-model="content" />
</template>

<script setup>
import { ref } from 'vue';

const content = ref('<p>Hello PowerEditor3</p>');
</script>
```

如果需要查看完整属性、事件和方法，请继续阅读 [PowerEditor 概览与 API](./)。
