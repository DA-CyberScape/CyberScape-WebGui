<script lang="ts">
	import './styles.css';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';

	const id = $page.params.id;
	let dataSources: any = null;
	let selectedDataSource: any = null;
	let oids: { oid: string; name: string }[] = []; // Track OIDs here

	onMount(async () => {
		try {
			const sourcesResponse = await fetch('/api/sources');

			if (!sourcesResponse.ok) {
				throw new Error(`Error fetching sources: ${sourcesResponse.statusText}`);
			}

			dataSources = await sourcesResponse.json();

			selectedDataSource = findDataSourceById(id);
			console.log('Selected Data Source:', selectedDataSource);

			// Initialize the oids array with existing OIDs
			if (selectedDataSource && Array.isArray(selectedDataSource.oids)) {
				oids = [...selectedDataSource.oids.map(oid => ({ oid: oid.oid, name: oid.name }))]; // Clone existing OIDs
			}
			// Always add an empty OID at the end for new entries
			oids.push({ oid: '', name: '' });
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
		// Always add a new empty OID if last OID is filled
		if (index === oids.length - 1 && (oids[index].oid !== '' || oids[index].name !== '')) {
			oids.push({ oid: '', name: '' });
		}
	}

	$: {
		// Remove OIDs if both fields are empty (except the last one)
		for (let i = oids.length - 2; i >= 0; i--) {
			if (oids[i].oid === '' && oids[i].name === '') {
				oids.splice(i, 1);
			}
		}
	}
</script>

<section>
	<h1>Data Source Details</h1>

	{#if selectedDataSource}
		<form>
			{#each Object.keys(selectedDataSource).filter(key => key !== 'id') as key}
				<div class="form-group">
					<label for={key}>{key}</label>

					{#if Array.isArray(selectedDataSource[key])}
						{#if key === 'oids'}
							<div class="oid-group"> <!-- Wrap the OID fields -->
								{#each oids as oid, index}
									<h5 class="oid-header">OID {index + 1}:</h5> <!-- Header for each OID pair -->

									<div class="oid-pair"> <!-- Use a class for OID pairs -->
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
									</div>
								{/each}
							</div>
						{:else}
							<h4>{key}</h4>
							{#each selectedDataSource[key] as item}
								<div class="form-group">
									<label for={item}>{item}</label>
									<input
										type="text"
										id={item}
										name={item}
										value={item}
										readonly
									/>
								</div>
							{/each}
						{/if}
					{:else if typeof selectedDataSource[key] === 'object' && selectedDataSource[key] !== null}
						<h4>{key}</h4>
						<pre>{JSON.stringify(selectedDataSource[key], null, 2)}</pre>
					{:else}
						<input
							type="text"
							id={key}
							name={key}
							value={selectedDataSource[key] ?? ''}
							readonly
						/>
					{/if}
				</div>
			{/each}
		</form>
	{:else}
		<p>Loading data source details...</p>
	{/if}
</section>
