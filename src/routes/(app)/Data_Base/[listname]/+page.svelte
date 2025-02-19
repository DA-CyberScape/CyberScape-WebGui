<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import './styles.css';
	import { goto } from '$app/navigation';
	import yaml from 'js-yaml';

	let dbSettings: any = null;
	let error: string | null = null;
	let isLoading: boolean = true;

	// State to track validation errors
	let validationErrors: { [key: string]: string } = {};

	// Name des Clusters aus der URL
	let listname: string = '';
	$: listname = $page.params.listname;

	// Das aktuell bearbeitete Cluster
	let clusterToEdit: any = null;
	let editedListname: string = '';

	async function fetchData() {
		isLoading = true;
		try {
			const response = await fetch('http://10.0.1.10:5073/configurations/database/');
			if (!response.ok) {
				throw new Error(`Failed to fetch data: ${response.statusText}`);
			}
			const textData = await response.text();
			dbSettings = yaml.load(textData);

			if (dbSettings?.clusterlists) {
				clusterToEdit = dbSettings.clusterlists.find((cluster: any) => cluster.listname === listname);

				if (clusterToEdit) {
					editedListname = clusterToEdit.listname;

					// Sicherstellen, dass es immer ein leeres IP-Feld gibt
					if (!clusterToEdit.list.some((ip: string) => ip.trim() === '')) {
						clusterToEdit.list.push('');
					}
				}
			}
		} catch (err) {
			error = err.message;
		} finally {
			isLoading = false;
		}
	}

	// IP-Adresse validieren
	function validateIP(ip: string): boolean {
		const regex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
		return regex.test(ip);
	}

	// Leeres Feld hinzufügen, falls nötig
	function addEmptyFieldIfNeeded() {
		if (clusterToEdit?.list) {
			clusterToEdit.list = clusterToEdit.list.filter((ip: string, index: number) =>
				ip.trim() !== '' || index === clusterToEdit.list.length - 1
			);

			const lastIP = clusterToEdit.list[clusterToEdit.list.length - 1];
			if (lastIP.trim() !== '') {
				clusterToEdit.list.push('');
			}
		}
	}

	// Validierung für den neuen Cluster-Namen
	function validateClusterName() {
		// Überprüfen, ob der neue Clustername bereits existiert
		const existingClusterNames = dbSettings?.clusterlists.map((cluster: any) => cluster.listname);
		if (existingClusterNames?.includes(editedListname) && editedListname !== listname) {
			validationErrors['listname'] = 'Cluster name already exists';
			return false;
		}
		// Falls der Name verfügbar ist
		delete validationErrors['listname'];
		return true;
	}

	async function updateData() {
		validationErrors = {};
		let ipTracker = new Set<string>();
		let hasDuplicates = false;

		// Überprüfen, ob der neue Clustername gültig ist
		if (!validateClusterName()) {
			return; // Stoppt, wenn der Name bereits existiert
		}

		// Entferne leere Felder vor der Validierung
		clusterToEdit.list = clusterToEdit.list.filter((ip: string) => ip.trim() !== '');

		// Mindestens eine IP muss ausgefüllt sein
		if (clusterToEdit.list.length === 0) {
			validationErrors['ip'] = 'At least one valid IP address is required';
		}

		// IP-Adressen validieren
		clusterToEdit.list.forEach((ip, index) => {
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

		// Falls Fehler vorhanden sind, nicht fortfahren
		if (Object.keys(validationErrors).length > 0 || hasDuplicates) {
			addEmptyFieldIfNeeded();
			return;
		}

		// Wenn der Cluster "Active" ist, deaktiviere alle anderen Cluster
		if (clusterToEdit.active) {
			dbSettings.clusterlists.forEach((cluster: any) => {
				if (cluster.listname !== clusterToEdit.listname) {
					cluster.active = false; // Deaktiviere andere Cluster
				}
			});
		}

		// Cluster-Name aktualisieren
		clusterToEdit.listname = editedListname;

		// Liste mit den aktualisierten Clustern speichern
		dbSettings.clusterlists = dbSettings.clusterlists.map((cluster: any) =>
			cluster.listname === listname ? { ...clusterToEdit } : cluster
		);

		// Daten als YAML speichern
		const yamlData = yaml.dump(dbSettings, { indent: 2 });

		try {
			const response = await fetch('http://10.0.1.10:5073/configurations/database/', {
				method: 'POST',
				headers: { 'Content-Type': 'application/x-yaml' },
				body: yamlData
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
			addEmptyFieldIfNeeded();
		}
	}

	onMount(fetchData);
</script>

<title>Edit Database Cluster</title>

<section id="db-settings-editor">
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
						bind:value={editedListname}
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
