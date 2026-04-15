# Quick Start

This page shows how to install and globally register `PowerEditor3` in a Vue 3 project.

## Install

Install the package with `yarn`:

```bash
yarn add @creatorsn/powereditor3
```

## Global Registration

Import the plugin and stylesheet in your entry file, for example `main.js`:

```js
import { createApp } from 'vue';
import App from './App.vue';
import PowerEditor from '@creatorsn/powereditor3';
import '@creatorsn/powereditor3/powereditor3.css';

const app = createApp(App);

app.use(PowerEditor);
app.mount('#app');
```

## Use The Component

After registration, use `power-editor` in any Vue component:

```vue
<template>
    <power-editor v-model="content" />
</template>

<script setup>
import { ref } from 'vue';

const content = ref('<p>Hello PowerEditor3</p>');
</script>
```

For the full list of props, events and exposed methods, continue with [PowerEditor Overview and API](./).
