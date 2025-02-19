<script lang="ts">
	import { onMount } from 'svelte';
	import './styles.css';
	import { goto } from '$app/navigation';

	let name = '', email = '', customMessage = '', selectedTable = '', selectedColumn = '', selectedOperator = '',
		comparisonValue = '';
	let tables = [], columns = [], nextId = 1, isLoading = true;
	const operators = ['<', '>', '=', '<=', '>=', '!='];

	// Map to store lowercase table names and their original names
	let tableMap: { [key: string]: string } = {};

	onMount(async () => {
		try {
			const [alertsResponse, tablesResponse] = await Promise.all([
				fetch('http://10.0.1.10:5073/alerts/'),
				fetch('http://10.0.1.10:5073/configurations/Database/schema')
			]);

			if (alertsResponse.ok) {
				const alerts = await alertsResponse.json();
				nextId = alerts.length ? Math.max(...alerts.map(a => a.id)) + 1 : 1;
			}

			if (tablesResponse.ok) {
				const schema = await tablesResponse.json();
				const productionTables = schema.Production;

				// Convert table names to lowercase before storing them
				tables = Object.keys(productionTables)
					.filter(table => !table.includes('\"') && table.trim() !== '')
					.map(table => table.toLowerCase())  // Convert each table name to lowercase
					.sort();

				// Create a map of lowercase table names to the original names
				tableMap = Object.keys(productionTables)
					.filter(table => !table.includes('\"') && table.trim() !== '')
					.reduce((map, table) => {
						map[table.toLowerCase()] = table;
						return map;
					}, {} as { [key: string]: string });
			}
		} catch (error) {
			alert('Failed to load tables or alerts. Please try again later.');
			console.error('Fetch error:', error);
		} finally {
			isLoading = false;
		}
	});

	// This is to fetch columns for the selected table
	async function fetchColumns() {
		if (!selectedTable) return;  // Prevent fetching if no table is selected

		// Get the original table name from the map using the lowercase selectedTable
		const selectedTableOriginal = tableMap[selectedTable];

		try {
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

	async function createAlert() {
		if (!selectedTable || !selectedColumn || !selectedOperator || !comparisonValue || !email) {
			alert('Please fill in all required fields before submitting.');
			return;
		}

		const newAlert = {
			id: nextId,
			name: name,
			tabelle: selectedTable,
			condition: `${selectedColumn}${selectedOperator}${comparisonValue}`,
			email_adresse: email,
			custom_message: customMessage,
			timestamp: ''
		};

		try {
			const response = await fetch('http://10.0.1.10:5073/alerts/', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(newAlert)
			});

			if (response.ok) {
				alert('Alert created successfully!');
			} else {
				const errorText = await response.text();
				alert(`Failed to create alert: ${errorText}`);
			}
		} catch (error) {
			alert('Error creating alert. Please try again.');
			console.error('Create alert error:', error);
		}

		await goto('/Alerts');
	}

</script>

<title>Create new Alert</title>

<section id="create-alert">
	<h1>Create New Alert</h1>
	<div class="form-group">

		{#if isLoading}
			<div class="loading-message" aria-live="polite">Loading tables, please wait...</div>
		{:else}
			<form on:submit|preventDefault={createAlert} aria-label="Create alert form">

				<div class="form-row">
					<label>Name:<input type="text" bind:value={name} aria-label="Alert name" required /></label>
					<label>Email:<input type="email" bind:value={email} aria-label="Recipient email" required /></label>
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

				<button type="submit">Create Alert</button>
			</form>
		{/if}
	</div>
</section>
