<script>
	import Nav_Bar from '$lib/Nav_Bar.svelte';
	import './home/styles.css';
</script>

<header>
	<link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons">
</header>

<Nav_Bar />

<div class="main">
	<slot></slot>
</div>
