<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import './styles.css';
	import { page } from '$app/stores';

	let dataSources: any = null;
	let dataStructure: any = null;
	let showPopup: boolean = false;
	let selectedSourceId: string | null = null;

	onMount(async () => {
		try {
			const sourcesResponse = await fetch('http://10.0.1.10:5073/configurations/');
			const structureResponse = await fetch('/api/dsstructure');

			if (!sourcesResponse.ok) {
				throw new Error(`Error fetching sources: ${sourcesResponse.statusText}`);
			}
			if (!structureResponse.ok) {
				throw new Error(`Error fetching structure: ${structureResponse.statusText}`);
			}

			dataSources = await sourcesResponse.json();
			dataStructure = await structureResponse.json();

		} catch (error) {
			console.error('Error fetching data:', error);
		}
	});

	function handleRowClick(id: string) {
		goto(`/Data_Sources/${id}`).then(() => {
			window.location.reload();
		});
	}

	function openPopup(id: string) {
		selectedSourceId = id;
		showPopup = true;
	}

	function closePopup() {
		showPopup = false;
	}

	async function deleteDataSource() {
		if (!selectedSourceId) return;

		try {
			console.log('Selected ID to delete:', selectedSourceId);
			console.log('Before deletion:', JSON.stringify(dataSources, null, 2));

			const updatedDataSources = dataSources.map((source) => {
				const key = Object.keys(source)[0];
				return {
					[key]: source[key].filter((ds) => ds.id !== selectedSourceId)
				};
			});

			console.log('Posting updated sources:', JSON.stringify(updatedDataSources, null, 2));

			// Send the full updated list
			const response = await fetch('http://10.0.1.10:5073/configurations/', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(updatedDataSources)
			});

			if (!response.ok) {
				throw new Error('Failed to delete data source');
			}

			// Force reactivity
			dataSources = [...updatedDataSources];

			console.log('Updated sources after deletion:', JSON.stringify(dataSources, null, 2));

			closePopup();
		} catch (error) {
			console.error('Error deleting data source:', error);
		}
	}

	onMount(() => {
		const unsubscribe = page.subscribe(($page) => {
			if ($page.url.searchParams.get('reload') === 'true') {
				window.history.replaceState({}, '', '/home');
				window.location.reload();
			}
		});
		unsubscribe();
	});
</script>

<style>
    .popup-overlay {
        position: fixed; /* Keeps the overlay fixed relative to the viewport */
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5); /* Semi-transparent background */
        display: flex;
        justify-content: center; /* Centers the popup horizontally */
        align-items: center; /* Centers the popup vertically */
        z-index: 1000;
    }
</style>

<title>Data Sources</title>

<section id="data-sources">
	<h1>Data Sources</h1>
	{#if dataSources && dataStructure}
		{#each dataSources as sourceItem}
			{#each Object.keys(sourceItem) as sourceKey}
				<h2>{sourceKey}</h2>
				{#if (sourceKey !== 'Syslog' && sourceKey !== 'snmpTrapReceiver') || sourceItem[sourceKey]?.length === 0}
					<button class="addSourceButton" on:click={() => goto(`/Data_Sources/New_DataSource?type=${sourceKey}`)}>
						+ Add new
					</button>
				{/if}
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
								<td id="delete-column">
									<button class="delete-btn" style="cursor: pointer" title="Delete DatSource {item.name}"
													on:click={(event) => { event.stopPropagation(); openPopup(item.id); }}>
										<i class="material-icons">delete</i>
									</button>
								</td>
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

	{#if showPopup}
		<div class="popup-overlay" on:click={closePopup}>
			<div class="popup-box">
				<button class="close" on:click={closePopup}>&times;</button>
				<h2>Confirm Deletion</h2>
				<p>Are you sure you want to delete this Data-Source?</p>

				<button class="submit" style="background-color: green; color: white; cursor: pointer"
								on:click={deleteDataSource}>Yes
				</button>
				<button class="submit" style="background-color: red; color: white; cursor: pointer" on:click={closePopup}>No
				</button>
			</div>
		</div>
	{/if}
</section>
