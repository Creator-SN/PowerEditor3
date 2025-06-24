<template>
	<div class="dev-c-container">
		<h1>{{ title }}</h1>
		<p>{{ message }}</p>
        <fv-button>Confirm</fv-button>
	</div>
</template>

<script setup>
defineProps({
	title: {
		default: "Dev C",
	},
});
</script>

<script>
export default {
	name: "DevC",
	data() {
		return {
			message: "Welcome to Dev C!",
		};
	},
	mounted() {
		console.log(this.message);
	},
};
</script>

<style lang="scss">
.dev-c-container {
	padding: 10px;
	background: whitesmoke;
    border-radius: 8px;
}
</style>
