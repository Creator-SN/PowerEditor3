<template>
	<Layout> </Layout>
</template>

<script setup>
import DefaultTheme from "vitepress/theme";
import { useData } from "vitepress";
import { watch } from "vue";

const { Layout } = DefaultTheme;
const viteData = useData();

watch(viteData.isDark, (val) => {
	console.log('isDark', val);
});
</script>
