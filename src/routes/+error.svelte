<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';

	// Redirect logic handled within the script
	onMount(() => {
		if ($page.status === 401) {
			window.location.href = '/login';
		}
	});
</script>

<main class="error-container">
	{#if $page.status !== 401}
		<h1>{$page.status}: {$page.error?.message || 'An unexpected error occurred'}</h1>
	{/if}
</main>


<style>
    .error-container {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        background-color: #f8f9fa;
        color: #333;
        text-align: center;
        padding: 1.5rem;
        font-family: Arial, sans-serif;
    }

    h1 {
        color: #dc3545;
        font-size: 2rem;
        margin-bottom: 0.5rem;
    }

    @media (max-width: 600px) {
        h1 {
            font-size: 1.5rem;
        }
    }
</style>
