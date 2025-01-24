<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import './styles.css';

	interface Cluster {
		listname: string;
		active: boolean;
		production: boolean;
		list: string[];
	}

	interface DBSettings {
		clusterlists: Cluster[];
	}

	let dbSettings: DBSettings | null = null;
	let error: string | null = null;

	// Popup state
	let showPopup = false;
	let popupClusterIndex: number | null = null;
	let tempActiveState: boolean[] = [];

	onMount(async () => {
		try {
			const response = await fetch('/api/db');
			if (!response.ok) {
				throw new Error(`Failed to fetch data: ${response.statusText}`);
			}
			dbSettings = await response.json();

			// Initialize temporary checkbox states
			if (dbSettings) {
				tempActiveState = dbSettings.clusterlists.map(cluster => cluster.active);
			}
		} catch (err) {
			error = err instanceof Error ? err.message : 'Unknown error';
		}
	});

	function openPopup(clusterIndex: number) {
		showPopup = true;
		popupClusterIndex = clusterIndex;

		// Temporarily update the state to reflect the clicked checkbox
		tempActiveState = dbSettings?.clusterlists.map((cluster, index) =>
			index === clusterIndex
		) || [];
	}

	function closePopup() {
		// Revert to the original state
		tempActiveState = dbSettings?.clusterlists.map(cluster => cluster.active) || [];
		showPopup = false;
		popupClusterIndex = null;
	}

	async function confirmActiveChange() {
		if (popupClusterIndex === null || !dbSettings) return;

		// Update active status: only one active at a time
		dbSettings = {
			...dbSettings,
			clusterlists: dbSettings.clusterlists.map((cluster, index) => ({
				...cluster,
				active: index === popupClusterIndex // Only the selected one becomes active
			}))
		};

		// Persist the change
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
			error = err instanceof Error ? err.message : 'Unknown error';
			console.error('Error updating data:', err);
		} finally {
			// Sync temporary state with confirmed changes
			tempActiveState = dbSettings.clusterlists.map(cluster => cluster.active);
			showPopup = false;
			popupClusterIndex = null;
		}
	}

	async function handleCheckboxChange(clusterIndex: number, isActiveCheckbox: boolean) {
		if (!dbSettings) return;

		if (isActiveCheckbox) {
			// Handle the "Active" checkbox logic
			const currentlyActiveIndex = dbSettings.clusterlists.findIndex(cluster => cluster.active);

			// Prevent deactivation of the only active cluster
			if (currentlyActiveIndex === clusterIndex && dbSettings.clusterlists[clusterIndex].active) {
				location.reload(); // Or skip the popup logic entirely
				return;
			}

			// Open confirmation popup for a valid activation request
			openPopup(clusterIndex);
		} else {
			// Handle the "Production" checkbox logic directly without a popup
			try {
				dbSettings = {
					...dbSettings,
					clusterlists: dbSettings.clusterlists.map((cluster, index) => ({
						...cluster,
						production: index === clusterIndex ? !cluster.production : cluster.production
					}))
				};

				// Persist the change
				const response = await fetch('/api/db', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(dbSettings)
				});
				if (!response.ok) {
					throw new Error(`Failed to update data: ${response.statusText}`);
				}
			} catch (err) {
				error = err instanceof Error ? err.message : 'Unknown error';
				console.error('Error updating data:', err);
			}
		}
	}


	function handleRowClick(event: MouseEvent, clusterName: string) {
		// Check if the click originated from an input element (checkbox)
		if ((event.target as HTMLElement).tagName.toLowerCase() !== 'input') {
			openClusterEditPage(clusterName);
		}
	}

	function openClusterEditPage(clusterName: string) {
		goto(`/Data_Base/${encodeURIComponent(clusterName)}`);
	}
</script>

<style>
    .popup-overlay {
        position: fixed; /* Keeps the overlay fixed relative to the viewport */
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5); /* Semi-transparent background */
        display: flex;
        justify-content: center; /* Centers the popup horizontally */
        align-items: center; /* Centers the popup vertically */
        z-index: 1000;
    }
</style>

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
				<tr on:click={(event) => handleRowClick(event, cluster.listname)}>
					<td>{cluster.listname}</td>
					<td>
						<!-- Active Checkbox -->
						<input
							type="checkbox"
							checked={tempActiveState[index]}
							on:change|stopPropagation={() => handleCheckboxChange(index, true)}
						/>
					</td>
					<td>
						<!-- Production Checkbox -->
						<input
							type="checkbox"
							checked={cluster.production}
							on:change|stopPropagation={() => handleCheckboxChange(index, false)}
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

	{#if showPopup}
		<div class="popup-overlay" on:click={closePopup}>
			<div class="popup-box">
				<button class="close" on:click={closePopup}>&times;</button>
				<h2>Confirm Active Change</h2>
				<p>Are you sure you want to change the active database?</p>

				<button class="submit" style="background-color: green; color: white" on:click={confirmActiveChange}>Yes</button>
				<button class="submit" style="background-color: red; color: white" on:click={closePopup}>No</button>
			</div>
		</div>
	{/if}
</section>
