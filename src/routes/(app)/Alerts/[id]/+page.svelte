<script lang="ts">
	import { onMount } from 'svelte';
	import './styles.css';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';

	let id: string;
	let tables: string[] = [], columns: string[] = [], isLoading = true;
	let selectedTable = '', selectedColumn = '', selectedOperator = '', comparisonValue = '';
	let name = '', email = '', customMessage = ''; // State-Variablen initialisieren
	const operators = ['<', '>', '=', '<=', '>=', '!='];

	// Map für die Zuordnung der Tabellen-Namen
	let tableMap: Record<string, string> = {};

	page.subscribe(($page) => {
		id = $page.params.id;
	});

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
			const [alerts, schema] = await Promise.all([
				fetchFromProxy('alerts/'),
				fetchFromProxy('configurations/Database/schema')
			]);

			const alert = alerts.find(a => a.id.toString() === id);
			if (alert) {
				name = alert.name || '';
				email = alert.email_adresse || '';
				selectedTable = alert.tabelle || '';
				customMessage = alert.custom_message || '';
				const conditionParts = alert.condition.split(/([<>!=]=?)/);
				if (conditionParts.length === 3) {
					selectedColumn = conditionParts[0].trim();
					selectedOperator = conditionParts[1].trim();
					comparisonValue = conditionParts[2].trim();
				}
			}

			const productionTables = schema.Production;
			tableMap = Object.keys(productionTables).reduce((acc, table) => {
				if (!table.includes('"') && table.trim() !== '') {
					acc[table.toLowerCase()] = table;
				}
				return acc;
			}, {});

			tables = Object.keys(tableMap).sort();
			if (selectedTable) {
				await fetchColumns();
			}
		} catch (error) {
			alert('Fehler beim Laden der Daten.');
			console.error('Fehler:', error);
		} finally {
			isLoading = false;
		}
	});

	async function fetchColumns() {
		try {
			if (!selectedTable) return;
			const schema = await fetchFromProxy('configurations/Database/schema');
			const database = schema.Production;
			const selectedTableOriginal = tableMap[selectedTable];

			if (database[selectedTableOriginal]) {
				columns = database[selectedTableOriginal].flatMap(colSet =>
					colSet.split(',').map(col => col.trim().split(' ')[0].replace(/["`]/g, '').toLowerCase())
				).filter(col => col !== '');
			} else {
				console.error(`Tabelle ${selectedTableOriginal} nicht gefunden.`);
			}
		} catch (error) {
			alert('Fehler beim Laden der Spalten.');
			console.error('Fehler:', error);
		}
	}

	async function saveAlert() {
		// Prepare the updated alert object
		const updatedAlert = {
			id: parseInt(id),
			name: name,
			tabelle: selectedTable,
			condition: `${selectedColumn}${selectedOperator}${comparisonValue}`,
			email_adresse: email,
			custom_message: customMessage,
			timestamp: ''
		};

		// Check if required fields are missing
		if (!updatedAlert.name || !updatedAlert.email_adresse || !updatedAlert.tabelle || !updatedAlert.condition) {
			alert('Please fill in all required fields.');
			return;
		}

		try {
			// Attempt to delete the existing alert before saving the updated one
			const deleteResponse = await fetchFromProxy(`alerts/${id}`, 'DELETE');
			if (!deleteResponse.success) {
				// Provide detailed error message if deletion fails
				// console.error(`Failed to delete alert with ID: ${id}`);
				// throw new Error('Failed to delete the existing alert.');
			}

			// Attempt to save the updated alert
			const saveResponse = await fetchFromProxy('alerts/', 'POST', { endpoint: 'alerts/', body: updatedAlert });
			if (!saveResponse.success) {
				// Log failure and throw an error if saving the alert fails
				console.error('Failed to save the updated alert:', saveResponse);
				throw new Error('Failed to save the updated alert.');
			}

			// If everything went fine, notify the user
			alert('Alert updated successfully!');

			// Navigate to the Alerts page
			await goto('/Alerts');
		} catch (error) {
			console.log('Error Updatin Alert: ', error);
			await goto('/Alerts');
		}
	}

</script>

<title>Edit Alert</title>

<section id="edit-alert">
	<h1>Edit Alert</h1>
	{#if isLoading}
		<p>Lade Daten...</p>
	{:else}
		<form on:submit|preventDefault={saveAlert}>
			<div class="form-group">
				<div class="form-row">
					<label>Name:
						<input type="text" bind:value={name} required />
					</label>
					<label>Email:
						<input type="email" bind:value={email} required />
					</label>
				</div>

				<label>Table:
					<select bind:value={selectedTable} on:change={fetchColumns} required>
						<option value="" disabled>Wähle eine Tabelle</option>
						{#each tables as table}
							<option value={table}>{table}</option>
						{/each}
					</select>
				</label>

				<h3>Bedingungen</h3>
				<div class="form-row">
					<select bind:value={selectedColumn} required>
						<option value="" disabled>Wähle eine Spalte</option>
						{#each columns as col}
							<option value={col}>{col}</option>
						{/each}
					</select>
					<select bind:value={selectedOperator} required>
						{#each operators as op}
							<option value={op}>{op}</option>
						{/each}
					</select>
					<input type="text" bind:value={comparisonValue} required />
				</div>

				<label>Custom Message:
					<input type="text" bind:value={customMessage} required />
				</label>

				<button type="submit">Änderungen speichern</button>
			</div>
		</form>
	{/if}
</section>
