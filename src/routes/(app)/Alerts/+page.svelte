<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { invalidate } from '$app/navigation';
	import './styles.css';

	let alerts = $page.data.alerts;

	const deleteAlert = async (alertId: string, event: MouseEvent) => {
		event.stopPropagation();

		const formData = new FormData();
		formData.append('alertId', alertId);

		await fetch('/Alerts/delete', { // Ensure correct path
			method: 'POST',
			body: formData
		});

		await invalidate('alerts'); // Refresh alerts list
	};


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
