<script lang="ts">
	import { page } from '$app/stores';
</script>

{#if $page.status === 401}
	<h1>Error {$page.status}: {$page.error?.message}</h1>
	<p>
		Go to <a href="/login">login</a> page to login.
	</p>
{:else}
	<h1>{$page.status}: {$page.error?.message}</h1>
{/if}