# Power Editor

<script setup>
import { useData } from "vitepress";

const viteData = useData();
</script>

<power-editor :theme="viteData.isDark.value ? 'dark' : 'light'" style="width: 100%;"></power-editor>
