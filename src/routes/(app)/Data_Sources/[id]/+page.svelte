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

			selectedDataSource = findDataSourceById(id);
			console.log('Selected Data Source:', selectedDataSource);
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
								{#each selectedDataSource[key] as oid, index}
									<h5 class="oid-header">OID {index + 1}:</h5> <!-- Header for each OID pair -->

									<div class="oid-pair"> <!-- Use a class for OID pairs -->
										<div class="form-group">
											<label for={`oid-${oid.oid}`}>Oid number:</label>
											<input
												type="text"
												id={`oid-${oid.oid}`}
												name={`oid-${oid.oid}`}
												value={oid.oid}
												readonly
											/>
										</div>

										<div class="form-group">
											<label for={`name-${oid.oid}`}>Oid name:</label>
											<input
												type="text"
												id={`name-${oid.oid}`}
												name={`name-${oid.oid}`}
												value={oid.name}
												readonly
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
