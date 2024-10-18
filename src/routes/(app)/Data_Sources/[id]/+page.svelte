<script lang="ts">
	import './styles.css';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';

	const id = $page.params.id;
	let dataSources: any = null;
	let selectedDataSource: any = null;

	onMount(async () => {
		try {
			const sourcesResponse = await fetch('/api/sources');

			if (!sourcesResponse.ok) {
				throw new Error(`Error fetching sources: ${sourcesResponse.statusText}`);
			}

			dataSources = await sourcesResponse.json();

			// Find the data source that matches the provided ID
			selectedDataSource = findDataSourceById(id);
			console.log('Selected Data Source:', selectedDataSource);
		} catch (error) {
			console.error('Error fetching data:', error);
		}
	});

	// Function to find the data source by ID
	function findDataSourceById(id: string) {
		if (!dataSources) return null;

		// Iterate over dataSources to find the item with the matching ID
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
							{#each selectedDataSource[key] as oid, index}
								<h5>OID {index + 1}:</h5>
								<div class="form-group">
									<label for={oid.oid}>OID Nummer:</label>
									<input
										type="text"
										id={oid.oid}
										name={`oid-${oid.oid}`}
										value={oid.oid}
										readonly
									/>
								</div>
								<div class="form-group">
									<label for={oid.name}>OID Name:</label>
									<input
										type="text"
										id={oid.name}
										name={`name-${oid.oid}`}
										value={oid.name}
										readonly
									/>
								</div>
							{/each}
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

<style>
    .form-group {
        margin-bottom: 1rem;
    }

    label {
        display: block;
        margin-bottom: 0.5rem;
    }

    input {
        width: 100%;
        padding: 0.5rem;
        border: 1px solid #ccc;
        border-radius: 4px;
    }

    h5 {
        color: white;
    }
</style>
