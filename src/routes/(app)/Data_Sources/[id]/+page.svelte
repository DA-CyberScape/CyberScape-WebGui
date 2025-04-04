<script lang="ts">
	import './styles.css';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	let dataSources: any = null;
	let selectedDataSource: any = null;
	let dataStructure: any = null;
	let oids: { oid: string; name: string }[] = [];

	let id: string;
	page.subscribe(($page) => {
		id = $page.params.id;
	});

	onMount(async () => {
		try {
			const sourcesResponse = await fetch('/api/proxy?endpoint=configurations/');
			const structureResponse = await fetch('/api/dsstructure');

			if (!sourcesResponse.ok || !structureResponse.ok) {
				throw new Error('Error fetching data');
			}

			dataSources = await sourcesResponse.json();
			dataStructure = await structureResponse.json();

			selectedDataSource = findDataSourceById(id);

			if (selectedDataSource && selectedDataSource.oids && Array.isArray(selectedDataSource.oids)) {
				oids = [...selectedDataSource.oids.map(oid => ({ oid: oid.oid, name: oid.name }))];
				oids.push({ oid: '', name: '' });
			}
		} catch (error) {
			console.error('Error fetching data:', error);
		}
	});

	function findDataSourceById(id: string) {
		if (!dataSources) return null;

		for (const sourceItem of dataSources) {
			for (const sourceKey in sourceItem) {
				const sourceArray = sourceItem[sourceKey];
				if (Array.isArray(sourceArray)) {
					const matchedItem = sourceArray.find((item: any) => String(item.id) === id);
					if (matchedItem) {
						return matchedItem;
					}
				}
			}
		}
		return null;
	}

	function handleInputChange(index: number) {
		if (index === oids.length - 1 && (oids[index].oid !== '' || oids[index].name !== '')) {
			oids.push({ oid: '', name: '' });
		}
	}

	// Function to determine the input type for a given field
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

	// Function to get options for select fields
	function getOptions(key: string): string[] {
		function findEnumOptions(obj: any): string[] | null {
			if (obj && typeof obj === 'object') {
				if (Array.isArray(obj)) {
					for (const item of obj) {
						const result = findEnumOptions(item);
						if (result) return result;
					}
				} else {
					for (const [k, v] of Object.entries(obj)) {
						if (k === key && v && typeof v === 'object' && 'enum' in v) {
							return v.enum;
						}
						const result = findEnumOptions(v);
						if (result) return result;
					}
				}
			}
			return null;
		}

		return findEnumOptions(dataStructure) || [];
	}

	// Function to handle checkbox changes
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

	// Function to convert input values to the correct type (number, string, etc.)
	function convertValueToCorrectType(key: string, value: any): any {
		const fieldType = getFieldTypeFromStructure(key);
		if (fieldType === 'number' && value !== '') {
			return Number(value);
		}
		return value;
	}

	// Function to get field type from data structure
	function getFieldTypeFromStructure(key: string): string {
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

	// Function to update the data source with new values
	function updateDataSource() {
		const filteredOids = oids.filter(oid => oid.oid && oid.name);

		let updatedDataSource: any = {
			...selectedDataSource,
			oids: filteredOids
		};

		// Update other fields with values from input elements
		for (const key of Object.keys(selectedDataSource)) {
			if (key !== 'oids' && key !== 'id') {
				const inputElement = document.getElementById(key) as HTMLInputElement;
				if (inputElement) {
					updatedDataSource[key] = convertValueToCorrectType(key, inputElement.value);
				}
			}
		}

		// Find and update the selected data source in dataSources
		if (dataSources) {
			for (const sourceItem of dataSources) {
				for (const sourceKey in sourceItem) {
					const sourceArray = sourceItem[sourceKey];
					if (Array.isArray(sourceArray)) {
						const index = sourceArray.findIndex((item: any) => String(item.id) === id);
						if (index !== -1) {
							sourceArray[index] = updatedDataSource;
							break;
						}
					}
				}
			}
		}

		// Send the updated data sources to the server
		fetch('/api/proxy?endpoint=configurations/', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(dataSources)
		})
			.then(response => {
				if (!response.ok) {
					throw new Error(`Error updating data source: ${response.statusText}`);
				}
				window.alert('Data source updated successfully');
				goto('/Data_Sources');
			})
			.catch(error => {
				console.error('Error updating data:', error);
			});
	}

	// Reactive cleanup of empty OIDs
	$: {
		for (let i = oids.length - 2; i >= 0; i--) {
			if (oids[i].oid === '' && oids[i].name === '') {
				oids.splice(i, 1);
			}
		}
	}
</script>


<title>Data Source: {id}</title>
<section>

	<h1>Data Source Details</h1>

	{#if selectedDataSource}
		<form on:submit|preventDefault={updateDataSource}>
			{#each Object.keys(selectedDataSource).filter(key => key !== 'id') as key}
				<div class="form-group">
					<label for={key}>{key}</label>

					{#if Array.isArray(selectedDataSource[key])}
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
													checked={oids[index].oid.endsWith('.x')}
													on:change={(event) => handleCheckboxChange(index, event.target.checked)}
												/>
												SNMP Walk
											</label>
										</div>

									</div>
								{/each}
							</div>
						{:else}
							<h4>{key}</h4>
							{#each selectedDataSource[key] as item, index}
								<div class="form-group">
									<label for={`${key}-${index}`}>{item}</label>
									<input
										type="text"
										id={`${key}-${index}`}
										name={item}
										bind:value={selectedDataSource[key][index]}
									/>
								</div>
							{/each}
						{/if}

					{:else if typeof selectedDataSource[key] === 'object' && selectedDataSource[key] !== null}
						<h4>{key}</h4>
						<pre>{JSON.stringify(selectedDataSource[key], null, 2)}</pre>
					{:else}
						{#if getInputType(key) === 'select'}
							<select id={key} bind:value={selectedDataSource[key]}>
								{#each getOptions(key) as option}
									<option value={option}>{option}</option>
								{/each}
							</select>
						{:else if getInputType(key) === 'number'}
							<input
								type="number"
								id={key}
								name={key}
								bind:value={selectedDataSource[key]}
							/>
						{:else}
							<input
								type="text"
								id={key}
								name={key}
								bind:value={selectedDataSource[key]}
							/>
						{/if}
					{/if}
				</div>
			{/each}
			<input type="submit" value="Save" />
		</form>
	{:else}
		<p style="color: red">No Data Source found with ID: {id}</p>
	{/if}
</section>
