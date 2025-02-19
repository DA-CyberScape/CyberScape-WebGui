<script lang="ts">
	import { onMount } from 'svelte';
	import './styles.css';
	import { goto } from '$app/navigation';

	let alerts: any = [];

	onMount(async () => {
		try {
			const response = await fetch('http://10.0.1.10:5073/alerts/');
			if (!response.ok) {
				throw new Error(`Error fetching alerts: ${response.statusText}`);
			}
			const json = await response.json();
			alerts = Array.isArray(json) ? json : [];
		} catch (error) {
			console.error('Error fetching alerts:', error);
			alerts = [];
		}
	});

	// Function to delete the alert
	const deleteAlert = async (alertId: string, event: MouseEvent) => {
		// Prevent row click when deleting
		event.stopPropagation();

		try {
			const response = await fetch(`http://10.0.1.10:5073/alerts/${alertId}`, {
				method: 'DELETE'
			});

			if (!response.ok) {
				throw new Error(`Error deleting alert: ${response.statusText}`);
			}

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
