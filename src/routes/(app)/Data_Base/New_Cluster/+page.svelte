<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import yaml from 'js-yaml';
	import './styles.css';

	let dbSettings: any = null;
	let error: string | null = null;
	let isLoading: boolean = true;

	// State to track validation errors
	let validationErrors: { [key: string]: string } = {};

	// New cluster state
	let newCluster = {
		listname: '',
		active: false,
		production: false,
		list: [''] // Ensure at least one input field for IPs
	};

	async function fetchData() {
		isLoading = true;
		try {
			const response = await fetch('/api/proxy?endpoint=configurations/database/'); // Changed to /api/proxy
			if (!response.ok) {
				throw new Error(`Failed to fetch data: ${response.statusText}`);
			}
			const textData = await response.text(); // Read response as text
			dbSettings = yaml.load(textData); // Convert YAML to JSON

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

	// Add an empty IP field if the last one is filled
	function addEmptyFieldIfNeeded() {
		newCluster.list = newCluster.list.filter((ip: string, index: number) =>
			ip.trim() !== '' || index === newCluster.list.length - 1
		);

		const lastIP = newCluster.list[newCluster.list.length - 1];
		if (lastIP.trim() !== '') {
			newCluster.list.push('');
		}
	}

	async function createNewCluster() {
		validationErrors = {}; // Reset validation errors
		let ipTracker = new Set<string>(); // Track unique IPs
		let hasDuplicates = false;

		// Sicherstellen, dass newCluster.list immer ein Array ist
		if (!Array.isArray(newCluster.list)) {
			newCluster.list = [];
		}

		// Entferne ungültige Werte und trimme gültige Einträge
		newCluster.list = newCluster.list
			.filter((ip) => typeof ip === 'string' && ip.trim().length > 0) // Nur gültige Strings behalten
			.map((ip) => ip.trim()); // Trimmen

		// Validierung: Mindestens eine gültige IP muss vorhanden sein
		if (newCluster.list.length === 0) {
			validationErrors['ip'] = 'At least one valid IP address is required';
			addEmptyFieldIfNeeded();
			return;
		}

		// Validate Cluster Name
		if (!newCluster.listname || typeof newCluster.listname !== 'string' || newCluster.listname.trim() === '') {
			validationErrors['listname'] = 'Cluster name is required';
		} else {
			// Prüfen, ob der Cluster-Name bereits existiert
			const nameExists = dbSettings?.clusterlists?.some(
				(cluster: any) => cluster.listname.toLowerCase() === newCluster.listname.toLowerCase()
			);
			if (nameExists) {
				validationErrors['listname'] = 'Cluster name already exists';
			}
		}

		// Validate IP addresses
		newCluster.list.forEach((ip, index) => {
			if (!validateIP(ip)) {
				validationErrors[`ip-${index}`] = 'Invalid IP address';
			}

			if (ipTracker.has(ip)) {
				validationErrors[`ip-${index}`] = 'Duplicate IP address';
				hasDuplicates = true;
			} else {
				ipTracker.add(ip);
			}
		});

		// Falls es Fehler gibt, das Formular nicht abschicken
		if (Object.keys(validationErrors).length > 0 || hasDuplicates) {
			addEmptyFieldIfNeeded();
			return;
		}

		// Ensure only one active cluster
		if (newCluster.active) {
			dbSettings.clusterlists = dbSettings.clusterlists.map((cluster: any) => ({
				...cluster,
				active: false // Deactivate all other clusters
			}));
		}

		// Add the new cluster to the list
		dbSettings.clusterlists.push({ ...newCluster });

		try {
			const response = await fetch('/api/proxy?endpoint=configurations/database/', { // Changed to /api/proxy
				method: 'POST',
				headers: { 'Content-Type': 'application/x-yaml' },
				body: yaml.dump(dbSettings)
			});

			if (!response.ok) {
				throw new Error(`Failed to update data: ${response.statusText}`);
			}

			alert('Cluster added successfully!');
			goto('/Data_Base');
		} catch (err) {
			error = err.message;
			console.error('Error updating data:', err);
		} finally {
			addEmptyFieldIfNeeded();
		}
	}


	onMount(fetchData);
</script>

<title>Create New Database Cluster</title>

<section id="db-settings-editor">
	<div class="container">
		<h1>Create New Database Cluster</h1>

		{#if isLoading}
			<p>Loading settings...</p>
		{:else if error}
			<p class="error-message">Error: {error}</p>
		{:else}
			<form on:submit|preventDefault={createNewCluster} class="form">
				<!-- Cluster Name -->
				<div class="form-group">
					<label for="listname">Cluster Name:</label>
					<input
						type="text"
						id="listname"
						bind:value={newCluster.listname}
						placeholder="Cluster Name"
						class={validationErrors['listname'] ? 'invalid' : ''}
					/>
					{#if validationErrors['listname']}
						<p class="error-message">{validationErrors['listname']}</p>
					{/if}
				</div>

				<!-- Active Checkbox -->
				<div class="form-group">
					<label for="active">Active:</label>
					<input
						type="checkbox"
						id="active"
						bind:checked={newCluster.active}
					/>
				</div>

				<!-- Production Checkbox -->
				<div class="form-group">
					<label for="production">Production:</label>
					<input
						type="checkbox"
						id="production"
						bind:checked={newCluster.production}
					/>
				</div>

				<!-- IP Addresses -->
				<div class="form-group">
					<label for="nodes">IP Addresses:</label>
					<ul>
						{#each newCluster.list as ip, index}
							<li>
								<input
									type="text"
									bind:value={newCluster.list[index]}
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

				<button type="submit" class="submit-button">Create Cluster</button>
			</form>
		{/if}
	</div>
</section>
