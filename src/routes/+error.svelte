<script lang="ts">
	import { page } from '$app/stores';
</script>

<main class="error-container">
	{#if $page.status === 401}
		<h1>Error {$page.status}: {$page.error?.message}</h1>
		<p>
			Please <a href="/login">login</a> to view this page.
		</p>
	{:else}
		<h1>{$page.status}: {$page.error?.message}</h1>
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

    p {
        font-size: 1.1rem;
        margin-top: 0;
    }

    a {
        color: #007bff;
        text-decoration: none;
        font-weight: bold;
    }

    a:hover {
        text-decoration: underline;
    }

    @media (max-width: 600px) {
        h1 {
            font-size: 1.5rem;
        }

        p {
            font-size: 1rem;
        }
    }
</style>
