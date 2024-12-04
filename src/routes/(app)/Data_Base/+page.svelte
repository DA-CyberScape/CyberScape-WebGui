<script lang="ts">
	import { onMount } from 'svelte';
	import './styles.css';
	import { goto } from '$app/navigation';

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

	async function handleCheckboxChange(clusterIndex: number, field: string, value: boolean) {
		if (!dbSettings || !dbSettings.clusterlists) return;

		dbSettings.clusterlists[clusterIndex][field] = value;

		try {
			const response = await fetch('/api/db', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(dbSettings)
			});
			if (!response.ok) {
				throw new Error(`Failed to update data: ${response.statusText}`);
			}
		} catch (err) {
			error = err.message;
			console.error('Error updating data:', err);
		}
	}

	function openClusterEditPage(clusterName: string) {
		goto(`/Data_Base/${encodeURIComponent(clusterName)}`);
	}
</script>

<title>DB Settings</title>

<section id="db-settings-section">
	<h1 id="db-settings-title">DB Settings</h1>

	{#if error}
		<p id="db-settings-error" style="color: red;">Error: {error}</p>
	{:else if dbSettings}
		<table id="db-settings-table" border="1">
			<thead>
			<tr>
				<th>Name</th>
				<th>Active</th>
				<th>Production</th>
				<th>IP Addresses</th>
			</tr>
			</thead>
			<tbody>
			{#each dbSettings.clusterlists as cluster, index}
				<tr on:click={() => openClusterEditPage(cluster.listname)}>
					<td>{cluster.listname}</td>
					<td>
						<input
							type="checkbox"
							bind:checked={cluster.active}
							on:click|stopPropagation={() => handleCheckboxChange(index, 'active', cluster.active)}
						/>
					</td>
					<td>
						<input
							type="checkbox"
							bind:checked={cluster.production}
							on:click|stopPropagation={() => handleCheckboxChange(index, 'production', cluster.production)}
						/>
					</td>
					<td>
						<table id="db-settings-subtable" border="1">
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
		<p id="db-settings-loading">Loading...</p>
	{/if}
</section>
