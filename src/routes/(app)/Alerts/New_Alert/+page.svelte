<script lang="ts">
	import { onMount } from 'svelte';
	import './styles.css';
	import { goto } from '$app/navigation';

	let name = '', email = '', customMessage = '', selectedTable = '', selectedColumn = '', selectedOperator = '',
		comparisonValue = '';
	let tables: string[] = [], columns: string[] = [], nextId = 1, isLoading = true;
	const operators = ['<', '>', '=', '<=', '>=', '!='];

	let tableMap: Record<string, string> = {};

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

			nextId = alerts.length ? Math.max(...alerts.map(a => a.id)) + 1 : 1;

			const productionTables = schema.Production;
			tableMap = Object.keys(productionTables).reduce((acc, table) => {
				if (!table.includes('"') && table.trim() !== '') {
					acc[table.toLowerCase()] = table;
				}
				return acc;
			}, {});

			tables = Object.keys(tableMap).sort();
		} catch (error) {
			alert('Failed to load tables or proxy. Please try again later.');
			console.error('Fetch error:', error);
		} finally {
			isLoading = false;
		}
	});

	async function fetchColumns() {
		if (!selectedTable) return;

		const selectedTableOriginal = tableMap[selectedTable];

		try {
			const schema = await fetchFromProxy('configurations/Database/schema');
			const database = schema.Production;

			if (database[selectedTableOriginal]) {
				columns = database[selectedTableOriginal].flatMap(colSet =>
					colSet.split(',').map(col => col.trim().split(' ')[0].replace(/["`]/g, '').toLowerCase())
				).filter(col => col !== '');
			} else {
				console.error(`Table ${selectedTableOriginal} not found in schema!`);
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
			// Sending both endpoint and body in the request payload
			await fetchFromProxy('alerts/', 'POST', { endpoint: 'alerts/', body: newAlert });
			alert('Alert created successfully!');
			await goto('/Alerts');
		} catch (error) {
			alert('Error creating alert. Please try again.');
			console.error('Create alert error:', error);
		}
	}
</script>

<title>Create new Alert</title>

<section id="create-alert">
	<h1>Create New Alert</h1>
	<div class="form-group">

		{#if isLoading}
			<div class="loading-message" aria-live="polite" style="color: white">Loading tables, please wait...</div>
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
