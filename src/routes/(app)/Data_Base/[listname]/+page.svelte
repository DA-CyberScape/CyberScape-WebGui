<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import './styles.css';
	import { goto } from '$app/navigation';

	let dbSettings: any = null;
	let error: string | null = null;
	let isLoading: boolean = true;

	// State to track validation errors
	let validationErrors: { [key: string]: string } = {};

	// Async function to fetch data
	async function fetchData() {
		isLoading = true;
		try {
			const response = await fetch('/api/db');
			if (!response.ok) {
				throw new Error(`Failed to fetch data: ${response.statusText}`);
			}
			dbSettings = await response.json();

			// Ensure at least one empty IP field exists in the cluster to edit
			if (clusterToEdit?.list && !clusterToEdit.list.some((ip: string) => ip.trim() === '')) {
				clusterToEdit.list.push('');
			}
		} catch (err) {
			error = err.message;
		} finally {
			isLoading = false;
		}
	}

	// Validate IP address
	function validateIP(ip: string): boolean {
		const regex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
		return regex.test(ip);
	}

	// Add an empty field if the last field is not empty
	function addEmptyFieldIfNeeded() {
		if (clusterToEdit?.list) {
			// Remove all empty fields except the last one
			clusterToEdit.list = clusterToEdit.list.filter((ip: string, index: number) =>
				ip.trim() !== '' || index === clusterToEdit.list.length - 1
			);

			// Add an empty field if the last field is not empty
			const lastIP = clusterToEdit.list[clusterToEdit.list.length - 1];
			if (lastIP.trim() !== '') {
				clusterToEdit.list.push('');
			}
		}
	}

async function updateData() {
    validationErrors = {}; // Reset validation errors
    let ipTracker = new Set<string>(); // Track unique IPs
    let hasDuplicates = false;

    // Remove empty IP fields before submission
    clusterToEdit.list = clusterToEdit.list.filter((ip: string) => ip.trim() !== '');

    // Validate all IP addresses
    for (let i = 0; i < clusterToEdit.list.length; i++) {
        const ip = clusterToEdit.list[i].trim();

        // Validate IP syntax
        if (!validateIP(ip)) {
            validationErrors[`ip-${i}`] = `Invalid IP address`;
        }

        // Check for duplicate IPs
        if (ipTracker.has(ip)) {
            validationErrors[`ip-${i}`] = `Duplicate IP address`;
            hasDuplicates = true;
        } else {
            ipTracker.add(ip);
        }
    }

    // If there are validation errors or duplicate IPs, stop and re-add the empty IP field
    if (Object.keys(validationErrors).length > 0 || hasDuplicates) {
        // Re-add an empty field for user to input IP
        addEmptyFieldIfNeeded();
        return;
    }

    // If the current cluster is marked as active, deactivate all others
    if (clusterToEdit.active) {
        dbSettings.clusterlists = dbSettings.clusterlists.map((cluster: any) => ({
            ...cluster,
            active: cluster === clusterToEdit // Only the current cluster remains active
        }));
    }

    // Proceed with updating the data, using the cleaned list
    try {
        const response = await fetch('/api/db', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...dbSettings,
                clusterlists: dbSettings.clusterlists.map((cluster: any) =>
                    cluster === clusterToEdit
                        ? { ...clusterToEdit, list: clusterToEdit.list }
                        : cluster
                )
            })
        });

        if (!response.ok) {
            throw new Error(`Failed to update data: ${response.statusText}`);
        }

        alert('Cluster settings updated successfully!');
				goto('/Data_Base');
    } catch (err) {
        error = err.message;
        console.error('Error updating data:', err);
    } finally {
        // Ensure the empty field is re-added after submission if needed
        addEmptyFieldIfNeeded();
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

			// Ensure there's at least one empty field
			if (clusterToEdit?.list && !clusterToEdit.list.some((ip: string) => ip.trim() === '')) {
				clusterToEdit.list.push('');
			}
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
						disabled={clusterToEdit.active}
					/>
					{#if clusterToEdit.active}
						<p style="color: red">This database is currently active and cannot be deactivated.</p>
					{/if}
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
									on:input={addEmptyFieldIfNeeded}
								/>
								{#if validationErrors[`ip-${index}`]}
									<p class="error-message">{validationErrors[`ip-${index}`]}</p>
								{/if}
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
