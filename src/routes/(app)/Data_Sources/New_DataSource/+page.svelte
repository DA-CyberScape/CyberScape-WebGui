<script lang="ts">
	import './styles.css';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	let newDataSource: any = {};
	let oids: { oid: string; name: string }[] = [{ oid: '', name: '' }];
	let dataStructure: any = null;
	let type: string;
	let availableTypes: string[] = [];

	page.subscribe(($page) => {
		type = $page.url.searchParams.get('type') || '';
	});

	onMount(async () => {
		try {
			await fetchDataStructure();
			await filterAvailableTypes();
			initializeNewDataSource();
		} catch (error) {
			console.error('Error during onMount:', error);
		}
	});

	async function fetchDataStructure() {
		const response = await fetch('/api/dsstructure');
		if (!response.ok) {
			throw new Error(`Failed to fetch structure: ${response.statusText}`);
		}
		dataStructure = await response.json();
		availableTypes = Object.keys(dataStructure);
	}

	async function filterAvailableTypes() {
		try {
			const response = await fetch('/api/proxy?endpoint=configurations/');
			if (!response.ok) {
				throw new Error(`Failed to fetch existing sources: ${response.statusText}`);
			}
			const existingDataSources = await response.json();

			// Check if "Syslog" or "snmpTrapReceiver" already exist and remove them if necessary
			const existingTypes = new Set(
				existingDataSources.flatMap((section: any) => Object.keys(section))
			);
			availableTypes = availableTypes.filter(
				(type) => type !== 'Syslog' && type !== 'snmpTrapReceiver' || !existingTypes.has(type)
			);
		} catch (error) {
			console.error('Error filtering available types:', error);
		}
	}

	async function initializeNewDataSource() {
		if (!type || !dataStructure || !(type in dataStructure)) {
			console.error('Invalid or missing data source type:', type);
			return;
		}

		newDataSource = createEmptyDataSource(dataStructure[type][0]);

		try {
			const highestId = await getHighestDataSourceId();
			newDataSource.id = highestId + 1;
		} catch (error) {
			console.error('Error getting the highest data source ID:', error);
		}
	}

	function createEmptyDataSource(structureItem: any) {
		const emptyObject: any = {};

		for (const key in structureItem) {
			const field = structureItem[key];

			if (key === 'oids' && type === 'snmpPolls') {
				emptyObject[key] = [{ oid: '', name: '' }];
			} else if (Array.isArray(field)) {
				emptyObject[key] = [];
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

	async function getHighestDataSourceId() {
		let highestId = 0;

		try {
			const response = await fetch('/api/proxy?endpoint=configurations/');
			if (!response.ok) {
				throw new Error(`Error fetching data sources: ${response.statusText}`);
			}

			const existingDataSources = await response.json();

			existingDataSources.forEach((section: any) => {
				// Only process sections that have arrays
				Object.values(section).forEach((dataSourceArray: any) => {
					// Ignore sections that don't have arrays or have irrelevant data like 'ScyllaDB'
					if (Array.isArray(dataSourceArray)) {
						dataSourceArray.forEach((dataSource: any) => {
							if (dataSource.id > highestId) {
								highestId = dataSource.id;
							}
						});
					}
				});
			});
		} catch (error) {
			console.error('Error fetching existing data sources:', error);
		}

		return highestId;
	}

	async function saveDataSource() {
		if (type !== 'snmpPolls') {
			delete newDataSource.oids;
		} else {
			newDataSource.oids = oids.filter((oid) => oid.oid && oid.name);
		}

		try {
			const response = await fetch('/api/proxy?endpoint=configurations/');
			if (!response.ok) {
				throw new Error(`Error fetching data sources: ${response.statusText}`);
			}

			const existingDataSources = await response.json();

			const typeSection = existingDataSources.find((section: any) => type in section);

			if (typeSection) {
				typeSection[type].push(newDataSource);
			} else {
				console.error(`Type "${type}" not found in the data structure`);
				window.alert(`Failed to save. Type "${type}" does not exist.`);
				return;
			}

			const saveResponse = await fetch('/api/proxy?endpoint=configurations/', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(existingDataSources)
			});

			if (!saveResponse.ok) {
				throw new Error(`Error saving updated data sources: ${saveResponse.statusText}`);
			}

			window.alert('Data source saved successfully');
			await goto('/Data_Sources');
		} catch (error) {
			console.error('Error saving data:', error);
		}
	}

	function handleInputChange(index: number) {
		if (index === oids.length - 1 && (oids[index].oid !== '' || oids[index].name !== '')) {
			oids = [...oids, { oid: '', name: '' }];
		}
	}

	function handleCheckboxChange(index: number, isChecked: boolean) {
		if (isChecked) {
			if (!oids[index].oid.endsWith('.x')) {
				oids[index].oid += '.x';
			}
		} else {
			if (oids[index].oid.endsWith('.x')) {
				oids[index].oid = oids[index].oid.slice(0, -2); // Remove `.x`
			}
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

	function changeType(selectedType: string) {
		goto(`?type=${selectedType}`);
	}

	$: {
		for (let i = oids.length - 2; i >= 0; i--) {
			if (oids[i].oid === '' && oids[i].name === '') {
				oids.splice(i, 1);
			}
		}
	}
</script>

<title>New {type} Data Source</title>
<section>
	<h1>New {type} Data Source</h1>

	<div class="form-group">
		<label for="type-dropdown">Select Data Source Type:</label>
		<select id="type-dropdown" bind:value={type} on:change={() => changeType(type)}>
			{#each availableTypes as availableType}
				<option value={availableType} selected={availableType === type}>{availableType}</option>
			{/each}
		</select>
	</div>

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
											on:input={() => handleInputChange(index)}
										/>
									</div>

									<div class="form-group" id="styled-box">
										<label>
											<input
												type="checkbox"
												on:change={(event) => handleCheckboxChange(index, event.target.checked)}
											/>
											SNMP Walk
										</label>
									</div>

								</div>
							{/each}
						</div>

					{:else if getInputType(key) === 'select'}
						<select id={key} bind:value={newDataSource[key]} required>
							{#each dataStructure[type][0][key].enum as option}
								<option value={option}>{option}</option>
							{/each}
						</select>

					{:else if getInputType(key) === 'number'}
						<input type="number" id={key} name={key} bind:value={newDataSource[key]} required />

					{:else}
						<input type="text" id={key} name={key} bind:value={newDataSource[key]} required />
					{/if}
				</div>
			{/each}

			<input type="submit" value="Save" />
		</form>
	{:else}
		<p>Loading data structure or type is invalid. Please check the API or type query parameter.</p>
	{/if}
</section>
