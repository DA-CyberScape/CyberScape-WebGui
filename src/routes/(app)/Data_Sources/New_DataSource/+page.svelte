<script lang="ts">
	import './styles.css';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	let selectedDataSource: any = {};
	let oids: { oid: string; name: string }[] = [{ oid: '', name: '' }];
	let dataStructure: any = null;
	let type: string;

	page.subscribe(($page) => {
		type = $page.url.searchParams.get('type') || '';
	});

	onMount(async () => {
		try {
			await fetchDataStructure();
			initializeNewDataSource();
		} catch (error) {
			console.error('Error fetching data structure:', error);
		}
	});

	async function fetchDataStructure() {
		const response = await fetch('/api/dsstructure');
		if (!response.ok) {
			throw new Error(`Failed to fetch structure: ${response.statusText}`);
		}
		dataStructure = await response.json();
	}

	function initializeNewDataSource() {
		if (!type || !dataStructure || !(type in dataStructure)) {
			console.error('Invalid or missing data source type:', type);
			return;
		}

		selectedDataSource = createEmptyDataSource(dataStructure[type][0]);
	}

	function createEmptyDataSource(structureItem: any) {
		const emptyObject: any = {};

		for (const key in structureItem) {
			const field = structureItem[key];

			if (Array.isArray(field)) {
				emptyObject[key] = key === 'oids' ? [{ oid: '', name: '' }] : [];
			} else if (typeof field === 'object' && 'enum' in field) {
				emptyObject[key] = field.enum[0] || '';
			} else if (field === 'integer') {
				emptyObject[key] = 0;
			} else {
				emptyObject[key] = '';
			}
		}

		return emptyObject;
	}

	async function saveDataSource() {
		selectedDataSource.oids = oids.filter((oid) => oid.oid && oid.name);

		try {
			const response = await fetch('/api/sources');
			if (!response.ok) {
				throw new Error(`Error fetching data sources: ${response.statusText}`);
			}

			const existingDataSources = await response.json();

			const typeSection = existingDataSources.find((section: any) => type in section);

			if (typeSection) {
				typeSection[type].push(selectedDataSource);
			} else {
				console.error(`Type "${type}" not found in the data structure`);
				window.alert(`Failed to save. Type "${type}" does not exist.`);
				return;
			}

			const saveResponse = await fetch('/api/sources', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(existingDataSources)
			});

			if (!saveResponse.ok) {
				throw new Error(`Error saving updated data sources: ${saveResponse.statusText}`);
			}

			window.alert('Data source saved successfully');
			goto('/Data_Sources');
		} catch (error) {
			console.error('Error saving data:', error);
		}
	}

	function handleInputChange(index: number) {
		if (index === oids.length - 1 && (oids[index].oid !== '' || oids[index].name !== '')) {
			if (oids.length > 1 && oids[oids.length - 2].oid === '' && oids[oids.length - 2].name === '') {
				oids.pop();
			}
			oids.push({ oid: '', name: '' });
		}
	}

	function getInputType(key: string) {
		function findFieldType(obj: any): string | null {
			if (obj && typeof obj === 'object') {
				if (Array.isArray(obj)) {
					for (const item of obj) {
						const result = findFieldType(item);
						if (result) return result;
					}
				} else {
					for (const [k, v] of Object.entries(obj)) {
						if (k === key) {
							if (v && typeof v === 'object' && 'enum' in v) {
								return 'select';
							} else if (v === 'integer') {
								return 'number';
							} else {
								return 'text';
							}
						}
						const result = findFieldType(v);
						if (result) return result;
					}
				}
			}
			return null;
		}

		return findFieldType(dataStructure) || 'text';
	}
</script>

<section>
	<h1>New {type} Data Source</h1>

	{#if dataStructure && type in dataStructure}
		<form on:submit|preventDefault={saveDataSource}>
			{#each Object.keys(dataStructure[type][0]).filter(key => key !== 'id') as key}
				<div class="form-group">
					<label for={key}>{key}</label>

					{#if key === 'oids'}
						<div class="oid-group">
							{#each oids as oid, index}
								<h5 class="oid-header">OID {index + 1}:</h5>

								<div class="oid-pair">
									<div class="form-group">
										<label for={`oid-${index}`}>OID Number:</label>
										<input
											type="text"
											id={`oid-${index}`}
											name={`oid-${index}`}
											bind:value={oid.oid}
											required
											on:input={() => handleInputChange(index)}
										/>
									</div>

									<div class="form-group">
										<label for={`name-${index}`}>OID Name:</label>
										<input
											type="text"
											id={`name-${index}`}
											name={`name-${index}`}
											bind:value={oid.name}
											required
											on:input={() => handleInputChange(index)}
										/>
									</div>
								</div>
							{/each}
						</div>

					{:else if getInputType(key) === 'select'}
						<select id={key} bind:value={selectedDataSource[key]} required>
							{#each dataStructure[type][0][key].enum as option}
								<option value={option}>{option}</option>
							{/each}
						</select>

					{:else if getInputType(key) === 'number'}
						<input type="number" id={key} name={key} bind:value={selectedDataSource[key]} required />

					{:else}
						<input type="text" id={key} name={key} bind:value={selectedDataSource[key]} required />
					{/if}
				</div>
			{/each}

			<input type="submit" value="Save" />
		</form>
	{:else}
		<p>Loading data structure or type is invalid. Please check the API or type query parameter.</p>
	{/if}
</section>
