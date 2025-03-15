<script lang="ts">
	import { onMount } from 'svelte';
	import './styles.css';
	import { goto } from '$app/navigation';

	let alerts: any = [];

	async function fetchFromProxy(endpoint: string, method = 'GET', body?: any) {
		const options: RequestInit = { method };
		if (body) {
			options.headers = { 'Content-Type': 'application/json' };
			options.body = JSON.stringify(body);
		}

		const response = await fetch(`/api/proxy?endpoint=${encodeURIComponent(endpoint)}`, options);
		if (!response.ok) {
			throw new Error(`API error: ${response.statusText}`);
		}
		return response.json();
	}

	onMount(async () => {
		try {
			alerts = await fetchFromProxy('alerts/');
		} catch (error) {
			console.error('Error fetching alerts:', error);
			alerts = [];
		}
	});

	// Function to delete the alert
	const deleteAlert = async (alertId: string, event: MouseEvent) => {
		event.stopPropagation(); // Prevent row click when deleting

		try {
			await fetchFromProxy(`alerts/${alertId}`, 'DELETE');
			alerts = alerts.filter((alert) => alert.id !== alertId);
		} catch (error) {
			console.error('Error deleting alert:', error);
		}
	};

	// Function to navigate to the alert details page
	const navigateToAlert = (alertId: string) => {
		goto(`/Alerts/${alertId}`);
	};
</script>

<title>Alerts</title>

<section id="alerts">
	<h1>Alerts</h1>
	<button class="addAlertButton" on:click={() => goto(`/Alerts/New_Alert`)}>+ Add new</button>

	{#if alerts.length > 0}
		<table>
			<thead>
			<tr>
				{#each Object.keys(alerts[0] ?? {}) as column}
					{#if column !== 'id' && column !== 'timestamp'}
						<th>{column}</th>
					{/if}
				{/each}
			</tr>
			</thead>
			<tbody>
			{#each alerts as alert}
				<tr on:click={() => navigateToAlert(alert.id)} style="cursor: pointer;">
					{#each Object.keys(alert ?? {}) as key}
						{#if key !== 'id' && key !== 'timestamp'}
							<td>{alert[key] ?? '-'}</td>
						{/if}
					{/each}
					<td id="delete-column">
						<button class="delete-btn" style="cursor: pointer" title="Delete Alert {alert.id}"
										on:click={(event) => deleteAlert(alert.id, event)}>
							<i class="material-icons">delete</i>
						</button>
					</td>
				</tr>
			{/each}
			</tbody>
		</table>
	{:else}
		<p>No alerts available.</p>
	{/if}
</section>
