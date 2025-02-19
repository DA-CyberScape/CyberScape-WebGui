<script lang="ts">
	import { onMount } from 'svelte';
	import './styles.css';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';

	let id: string;
	let tables: string[] = [], columns: string[] = [], isLoading = true;
	let selectedTable = '', selectedColumn = '', selectedOperator = '', comparisonValue = '';
	let name = '', email = '', customMessage = ''; // Initialize state variables
	const operators = ['<', '>', '=', '<=', '>=', '!='];

	// Map to store lowercase table names and their corresponding original names
	let tableMap: Record<string, string> = {};

	page.subscribe(($page) => {
		id = $page.params.id; // Use the provided ID for editing
	});

	onMount(async () => {
		try {
			const [alertsResponse, tablesResponse] = await Promise.all([
				fetch('http://10.0.1.10:5073/alerts/'),
				fetch('http://10.0.1.10:5073/configurations/Database/schema')
			]);

			if (alertsResponse.ok) {
				const alerts = await alertsResponse.json();
				// Find the alert by ID and populate the form fields with its data
				const alert = alerts.find(a => a.id.toString() === id);
				if (alert) {
					name = alert.name || '';
					email = alert.email_adresse || '';
					selectedTable = alert.tabelle || '';
					customMessage = alert.custom_message || '';
					// You can also set selectedColumn, selectedOperator, and comparisonValue based on the alert's condition
					const conditionParts = alert.condition.split(/([<>!=]=?)/);
					if (conditionParts.length === 3) {
						selectedColumn = conditionParts[0].trim();
						selectedOperator = conditionParts[1].trim();
						comparisonValue = conditionParts[2].trim();
					}
				}
			}

			if (tablesResponse.ok) {
				const schema = await tablesResponse.json();
				const productionTables = schema.Production;

				// Create a map of lowercase table names to the original (not lowercase) names
				tableMap = Object.keys(productionTables).reduce((acc, table) => {
					// Filter out tables with quotes and convert table names to lowercase
					if (!table.includes('\"') && table.trim() !== '') {
						acc[table.toLowerCase()] = table; // Store the original name, use lowercase key
					}
					return acc;
				}, {});

				// Use lowercase table names for the dropdown
				tables = Object.keys(tableMap).sort();

				// Call fetchColumns to load columns for the selected table if already selected
				if (selectedTable) {
					await fetchColumns();
				}
			}
		} catch (error) {
			alert('Failed to load tables or alerts. Please try again later.');
			console.error('Fetch error:', error);
		} finally {
			isLoading = false;
		}
	});

	async function fetchColumns() {
		try {
			// Fetch schema only if a table is selected
			if (!selectedTable) return;

			// Get the original table name from the map using the lowercase selectedTable
			const selectedTableOriginal = tableMap[selectedTable];

			const response = await fetch('http://10.0.1.10:5073/configurations/Database/schema');
			if (response.ok) {
				const schema = await response.json();
				const database = schema.Production;

				// Check if the selected table exists in the schema
				if (database[selectedTableOriginal]) {
					// Get the columns of the selected table using the original table name
					const selectedTableColumns = database[selectedTableOriginal];

					// Ensure the selected table exists in the schema
					if (selectedTableColumns && selectedTableColumns.length > 0) {
						// Flatten and process all column sets if the table contains multiple rows of columns
						columns = selectedTableColumns.flatMap(colSet =>
							colSet.split(',') // Split by comma to separate each column
								.map(col => {
									col = col.trim();
									// Extract column name by splitting on the first space and cleaning
									const columnName = col.split(' ')[0].trim();
									return columnName.replace(/["`]/g, '').toLowerCase(); // Convert column names to lowercase
								})
								.filter(col => col !== '') // Remove empty values
						);
					} else {
						columns = [];
					}
				} else {
					console.error(`Table ${selectedTableOriginal} not found in schema!`);
				}
			} else {
				console.error('Failed to fetch schema for columns');
			}
		} catch (error) {
			alert('Failed to load columns. Please try again.');
			console.error('Fetch columns error:', error);
		}
	}

	async function saveAlert() {
		try {
			// Parse id into an integer
			const alertId = parseInt(id, 10);

			// Check if the id is valid
			if (isNaN(alertId)) {
				alert('Invalid ID format. Please try again.');
				return;
			}

			// Step 1: DELETE the old alert
			const deleteResponse = await fetch(`http://10.0.1.10:5073/alerts/${alertId}`, {
				method: 'DELETE'
			});

			if (!deleteResponse.ok) {
				alert('Failed to delete old alert. Please try again.');
				console.error('Error deleting alert:', await deleteResponse.text());
				return;
			}

			const postResponse = await fetch('http://10.0.1.10:5073/alerts/', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					id: alertId,
					name: name,
					tabelle: selectedTable,
					condition: `${selectedColumn}${selectedOperator}${comparisonValue}`,
					email_adresse: email,
					custom_message: customMessage,
					timestamp: ''
				})
			});

			if (postResponse.ok) {
				alert('Alert updated successfully!');
			} else {
				alert('Failed to create new alert. Please try again.');
				console.error('Error posting new alert:', await postResponse.text());
			}
		} catch (error) {
			console.error('Error saving alert:', error);
			alert('An error occurred while saving the alert.');
		}

		await goto('/Alerts');
	}

</script>

<title>Edit Alert</title>

<section id="edit-alert">
	<h1>Edit Alert</h1>
	{#if isLoading}
		<p>Loading alert details...</p>
	{:else}
		<form on:submit|preventDefault={saveAlert} aria-label="Edit alert form">
			<div class="form-group">
				<div class="form-row">
					<label>Name:
						<input type="text" bind:value={name} aria-label="Alert name" required />
					</label>
					<label>Email:
						<input type="email" bind:value={email} aria-label="Recipient email" required />
					</label>
				</div>

				<label id="tables-select">Table:
					<select bind:value={selectedTable} on:change={fetchColumns} aria-label="Select table" required>
						<option value="" disabled>Select a table</option>
						{#each tables as table}
							<option value={table}>{table}</option>
						{/each}
					</select>
				</label>

				<h3>Conditions</h3>
				<div id="condition-section">
					<div class="form-row">
						<select bind:value={selectedColumn} aria-label="Select column" required>
							<option value="" disabled>Select a column</option>
							{#each columns as col}
								<option value={col}>{col}</option>
							{/each}
						</select>
						<select bind:value={selectedOperator} aria-label="Select condition operator" required>
							{#each operators as op}
								<option value={op}>{op}</option>
							{/each}
						</select>
						<input type="text" bind:value={comparisonValue} aria-label="Comparison value" required />
					</div>
				</div>

				<label>Custom Message:
					<input type="text" bind:value={customMessage} aria-label="Custom message" required />
				</label>

				<button type="submit">Save Changes</button>
			</div>
		</form>
	{/if}
</section>
