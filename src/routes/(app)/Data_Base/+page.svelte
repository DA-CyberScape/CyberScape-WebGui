<script lang="ts">
	import { onMount } from 'svelte';
	import './styles.css';

	let dbSettings: any = null;
	let error: string | null = null;

	onMount(async () => {
		try {
			const response = await fetch('/api/db');
			if (!response.ok) {
				throw new Error(`Failed to fetch data: ${response.statusText}`);
			}
			dbSettings = await response.json();
		} catch (err) {
			error = err.message;
		}
	});
</script>

<title>DB Settings</title>

<section>
	<h1>DB Settings</h1>

	{#if error}
		<p style="color: red;">Error: {error}</p>
	{:else if dbSettings}
		<table border="1">
			<thead>
			<tr>
				<th>Name</th>
				<th>Active</th>
				<th>Production</th>
				<th>IP Addresses</th>
			</tr>
			</thead>
			<tbody>
			{#each dbSettings.clusterlists as cluster}
				<tr>
					<td>{cluster.listname}</td>
					<td>
						<input type="checkbox" disabled checked={cluster.active} />
					</td>
					<td>
						<input type="checkbox" disabled checked={cluster.production} />
					</td>
					<td>
						<table border="1">
							<thead>
							<tr>
								<th>IP Address</th>
							</tr>
							</thead>
							<tbody>
							{#each cluster.list as node}
								<tr>
									<td>{node}</td>
								</tr>
							{/each}
							</tbody>
						</table>
					</td>
				</tr>
			{/each}
			</tbody>
		</table>
	{:else}
		<p>Loading...</p>
	{/if}
</section>
