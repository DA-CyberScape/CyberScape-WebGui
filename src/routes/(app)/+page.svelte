<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	onMount(() => {
		goto('/home?reload=true');
	});
</script>

<title>Redirecting...</title>

<p style="color: white">Redirecting...</p>
<p style="color: white">If you are not redirected, <a href="/home?reload=true">click here</a>.</p>