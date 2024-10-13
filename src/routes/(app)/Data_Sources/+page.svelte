<script lang="ts">
	import './styles.css';
	import { onMount } from 'svelte';

	let openUpdateDatasourcePopup: boolean = false;
	let DSTypes: string[] = [];
	let dataSources: Array<{
		ip: string;
		hostname: string;
		oids: Array<{ oid: string; name: string }>;
		user: string;
		authentication: string;
		encryption: string;
		authpass: string;
		privpass: string;
		port: number;
	}> = [];

	async function fetchDatasources() {
		try {
			const response = await fetch('/api/sources');
			if (!response.ok) {
				throw new Error('Failed to fetch data sources');
			}

			const jsonData = await response.json();
			dataSources = jsonData.snmpPolls || []; // Accessing snmpPolls directly

		} catch (err) {
			console.error('Error fetching data sources:', err);
		}
	}

	async function fetchDSTypes() {
		try {
			const response = await fetch('/api/DSTypes');
			if (!response.ok) {
				throw new Error('Failed to fetch data source types');
			}

			const data = await response.json();
			DSTypes = data.types || [];
		} catch (err) {
			console.error('Error fetching data source types:', err);
		}
	}

	onMount(() => {
		fetchDatasources();
		fetchDSTypes();
	});
</script>

<style>
    p {
        color: white;
    }

    h3 {
        color: white;
    }

    h1 {
        color: white;
    }

		ul {
				color: white;
		}
</style>

<title>Data Sources</title>
<section>
	<h1>Data Sources</h1>
	<!-- Display the data sources in a list -->
	{#if dataSources.length > 0}
		<ul>
			{#each dataSources as source}
				<li>
					<h2>{source.hostname}</h2>
					<p>IP Address: {source.ip}</p>
					<p>Port: {source.port}</p>
					<h3>OID Details:</h3>
					<ul>
						{#each source.oids as oid}
							<li>{oid.name}: {oid.oid}</li>
						{/each}
					</ul>
				</li>
			{/each}
		</ul>
	{:else}
		<p>No data sources available.</p>
	{/if}
</section>
