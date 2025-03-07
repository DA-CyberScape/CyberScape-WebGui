<script lang="ts">
	import { page } from '$app/stores';
	import { invalidate } from '$app/navigation';
	import { enhance } from '$app/forms';
	import './styles.css';

	let id: string;
	let tables: string[] = [], columns: string[] = [];
	let selectedTable = '', selectedColumn = '', selectedOperator = '', comparisonValue = '';
	let name = '', email = '', customMessage = '';
	const operators = ['<', '>', '=', '<=', '>=', '!='];

	page.subscribe(($page) => {
		id = $page.params.id;
		if ($page.data.alert) {
			name = $page.data.alert.name || '';
			email = $page.data.alert.email_adresse || '';
			selectedTable = $page.data.alert.tabelle || '';
			customMessage = $page.data.alert.custom_message || '';

			const conditionParts = $page.data.alert.condition.split(/([<>!=]=?)/);
			if (conditionParts.length === 3) {
				selectedColumn = conditionParts[0].trim();
				selectedOperator = conditionParts[1].trim();
				comparisonValue = conditionParts[2].trim();
			}
		}
		tables = $page.data.tables || [];
	});

	async function fetchColumns() {
		if (!selectedTable) return;

		const response = await fetch(`?/fetchColumns`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ selectedTable })
		});

		if (response.ok) {
			const data = await response.json();
			columns = data.columns || [];
		} else {
			console.error('Failed to fetch columns');
		}
	}

</script>

<title>Edit Alert</title>

<section id="edit-alert">
	<h1>Edit Alert</h1>
	<form method="POST" use:enhance action="?/saveAlert" on:submit={async () => await invalidate('/Alerts')}>
		<input type="hidden" name="id" value={id} />
		<div class="form-group">
			<div class="form-row">
				<label>Name:
					<input type="text" name="name" bind:value={name} required />
				</label>
				<label>Email:
					<input type="email" name="email" bind:value={email} required />
				</label>
			</div>

			<label>Table:
				<select name="table" bind:value={selectedTable} on:change={fetchColumns} required>
					<option value="" disabled>Select a table</option>
					{#each tables as table}
						<option value={table}>{table}</option>
					{/each}
				</select>
			</label>

			<h3>Conditions</h3>
			<div class="form-row">
				<select name="selectedColumn" bind:value={selectedColumn} required>
					<option value="" disabled>Select a column</option>
					{#each columns as col}
						<option value={col}>{col}</option>
					{/each}
				</select>
				<select name="selectedOperator" bind:value={selectedOperator} required>
					{#each operators as op}
						<option value={op}>{op}</option>
					{/each}
				</select>
				<input type="text" name="comparisonValue" bind:value={comparisonValue} required />
			</div>

			<label>Custom Message:
				<input type="text" name="customMessage" bind:value={customMessage} required />
			</label>

			<button type="submit">Save Changes</button>
		</div>
	</form>
</section>
