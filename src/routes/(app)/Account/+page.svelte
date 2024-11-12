<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;

	const { user } = data;
</script>

<svelte:head>
	<title>Account</title>
</svelte:head>

<section>
	<div>
		<h1>Account</h1>

		<p style="color: white">Hello {user.username}</p>
	</div>

	<form method="POST" action="?/logout">
		<button type="submit" name="logout" value="true">Logout</button>
	</form>
</section>