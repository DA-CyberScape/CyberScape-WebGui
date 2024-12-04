<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import './styles.css';

	let dbSettings: any = null;
	let error: string | null = null;
	let isLoading: boolean = true;

	// State to track validation errors
	let validationErrors: { [key: string]: string } = {};

	async function fetchData() {
		isLoading = true;
		try {
			const response = await fetch('/api/db');
			if (!response.ok) {
				throw new Error(`Failed to fetch data: ${response.statusText}`);
			}
			dbSettings = await response.json();
		} catch (err) {
			error = err.message;
		} finally {
			isLoading = false;
		}
	}

	// Validate IP address (simple regex for demonstration)
	function validateIP(ip: string): boolean {
		const regex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
		return regex.test(ip);
	}

	// Check if the new cluster name already exists
	function isClusterNameUnique(newName: string): boolean {
		return !dbSettings.clusterlists.some((cluster: any) => cluster.listname === newName);
	}

	async function updateData() {
		validationErrors = {}; // Reset validation errors

		// Validate the IP addresses
		for (let i = 0; i < clusterToEdit.list.length; i++) {
			const ip = clusterToEdit.list[i];
			if (!validateIP(ip)) {
				validationErrors[`ip-${i}`] = `Invalid IP address: ${ip}`;
			}
		}

		// Check if the new cluster name is unique
		if (clusterToEdit.listname !== listname && !isClusterNameUnique(clusterToEdit.listname)) {
			validationErrors['listname'] = `Cluster name "${clusterToEdit.listname}" already exists.`;
		}

		// If there are validation errors, don't submit the form
		if (Object.keys(validationErrors).length > 0) {
			return;
		}

		// Proceed with updating the data
		try {
			const response = await fetch('/api/db', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(dbSettings)
			});
			if (!response.ok) {
				throw new Error(`Failed to update data: ${response.statusText}`);
			}
			alert('Cluster settings updated successfully!');
		} catch (err) {
			error = err.message;
			console.error('Error updating data:', err);
		}
	}

	// Get the selected cluster name from the URL
	let listname: string = '';
	$: listname = $page.params.listname;

	// Find the cluster being edited
	let clusterToEdit: any = null;
	$: {
		if (dbSettings && dbSettings.clusterlists) {
			clusterToEdit = dbSettings.clusterlists.find(
				(cluster: any) => cluster.listname === listname
			);
		}
	}

	onMount(fetchData);
</script>


<title>Edit Database Cluster</title>

<section>
	<div class="container">
		<h1>Edit Database Cluster</h1>

		{#if isLoading}
			<p>Loading settings...</p>
		{:else if error}
			<p class="error-message">Error: {error}</p>
		{:else if clusterToEdit}
			<form on:submit|preventDefault={updateData} class="form">
				<!-- Cluster Name -->
				<div class="form-group">
					<label for="listname">Cluster Name:</label>
					<input
						type="text"
						id="listname"
						bind:value={clusterToEdit.listname}
						placeholder="Cluster Name"
						class={validationErrors['listname'] ? 'invalid' : ''}
					/>
					{#if validationErrors['listname']}
						<br>
						<p class="error-message">{validationErrors['listname']}</p>
					{/if}
				</div>

				<!-- Active Checkbox -->
				<div class="form-group">
					<label for="active">Active:</label>
					<input
						type="checkbox"
						id="active"
						bind:checked={clusterToEdit.active}
					/>
				</div>

				<!-- Production Checkbox -->
				<div class="form-group">
					<label for="production">Production:</label>
					<input
						type="checkbox"
						id="production"
						bind:checked={clusterToEdit.production}
					/>
				</div>

				<!-- IP Addresses -->
				<div class="form-group">
					<label for="nodes">IP Addresses:</label>
					<ul>
						{#each clusterToEdit.list as node, index}
							<li>
								<input
									type="text"
									bind:value={clusterToEdit.list[index]}
									placeholder="IP Address"
									class={validationErrors[`ip-${index}`] ? 'invalid' : ''}
								/>
							</li>
						{/each}
					</ul>
				</div>

				<button type="submit" class="submit-button">Save Changes</button>
			</form>
		{:else}
			<p>No cluster found with that name.</p>
		{/if}
	</div>
</section>
