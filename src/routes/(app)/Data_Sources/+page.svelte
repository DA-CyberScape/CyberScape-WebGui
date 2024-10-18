<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import './styles.css';

	let dataSources: any = null;
	let dataStructure: any = null;

	onMount(async () => {
		try {
			const sourcesResponse = await fetch('/api/sources');
			const structureResponse = await fetch('/api/dsstructure');

			if (!sourcesResponse.ok) {
				throw new Error(`Error fetching sources: ${sourcesResponse.statusText}`);
			}
			if (!structureResponse.ok) {
				throw new Error(`Error fetching structure: ${structureResponse.statusText}`);
			}

			dataSources = await sourcesResponse.json();
			dataStructure = await structureResponse.json();

			console.log('Parsed Data Sources:', dataSources);
			console.log('Parsed Data Structure:', dataStructure);
		} catch (error) {
			console.error('Error fetching data:', error);
		}
	});

	function handleRowClick(id: string) {
		goto(`/Data_Sources/${id}`).then(() => {
			window.location.reload();
		});
	}
</script>

<style>


</style>

<section>
	<h1>Data Sources</h1>
	{#if dataSources && dataStructure}
		{#each dataSources as sourceItem}
			{#each Object.keys(sourceItem) as sourceKey}
				<h2>{sourceKey}</h2>

				{#if sourceItem[sourceKey] && Array.isArray(sourceItem[sourceKey]) && sourceItem[sourceKey].length > 0}
					<table>
						<thead>
						<tr>
							{#each Object.keys(dataStructure[sourceKey][0]).filter(key => key !== 'id') as columnKey}
								<th>{columnKey}</th>
							{/each}
						</tr>
						</thead>
						<tbody>
						{#each sourceItem[sourceKey] as item}
							<tr on:click={() => handleRowClick(item.id)}>
								{#each Object.keys(dataStructure[sourceKey][0]).filter(key => key !== 'id') as columnKey}
									<td>
										{#if Array.isArray(item[columnKey])}
											<table class="nested-table">
												<thead>
												<tr>
													{#each Object.keys(item[columnKey][0]).filter(nestedKey => nestedKey !== 'id') as nestedColumnKey}
														<th>{nestedColumnKey}</th>
													{/each}
												</tr>
												</thead>
												<tbody>
												{#each item[columnKey] as nestedItem}
													<tr>
														{#each Object.keys(item[columnKey][0]).filter(nestedKey => nestedKey !== 'id') as nestedColumnKey}
															<td>
																{nestedItem[nestedColumnKey] || '-'}
															</td>
														{/each}
													</tr>
												{/each}
												</tbody>
											</table>
										{:else if typeof item[columnKey] === 'object' && item[columnKey] !== null}
											{#if columnKey === 'authParameters'}
												<table class="nested-table">
													<thead>
													<tr>
														{#each Object.keys(item[columnKey]).filter(paramKey => paramKey !== 'id') as paramKey}
															<th>{paramKey}</th>
														{/each}
													</tr>
													</thead>
													<tbody>
													<tr>
														{#each Object.keys(item[columnKey]).filter(paramKey => paramKey !== 'id') as paramKey}
															<td>
																{item[columnKey][paramKey] || '-'}
															</td>
														{/each}
													</tr>
													</tbody>
												</table>
											{:else}
												<pre>{JSON.stringify(item[columnKey], null, 2)}</pre>
											{/if}
										{:else}
											{item[columnKey] || '-'}
										{/if}
									</td>
								{/each}
							</tr>
						{/each}
						</tbody>
					</table>
				{:else}
					<p style="color: red;">No data available for {sourceKey}.</p>
				{/if}
			{/each}
		{/each}
	{:else}
		<p>Loading data sources...</p>
	{/if}
</section>
