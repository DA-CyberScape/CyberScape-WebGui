<script lang="ts">
	import { onMount } from 'svelte';
	import './sytles.css';

	let hosts = [];
	let newHostname = '';
	let newIpAddress = '';

	// Fetch hosts from the backend API
	async function getHosts() {
		try {
			const res = await fetch('/api/hosts');
			const data = await res.json();

			if (data && data.assignments) {
				hosts = data.assignments; // Correctly assign the 'assignments' property
			} else {
				console.error('Error: Invalid data structure');
			}
		} catch (error) {
			console.error('Error fetching hosts:', error);
		}
	}

	// Add a new host
	async function addHost() {
		if (newHostname.trim() && newIpAddress.trim()) {
			const newHost = { hostname: newHostname, ipAddress: newIpAddress };
			try {
				const res = await fetch('/api/hosts', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(newHost)
				});
				if (res.ok) {
					const responseData = await res.json();
					if (responseData.hosts) {
						hosts = responseData.hosts; // Use updated hosts from the server
						newHostname = ''; // Clear the input fields
						newIpAddress = '';
					} else {
						console.error('Failed to get updated hosts data');
					}
				} else {
					console.error('Failed to add host');
				}
			} catch (error) {
				console.error('Error adding host:', error);
			}
		} else {
			console.error('Hostname and IP Address are required');
		}
	}

	// Fetch hosts when the component mounts
	onMount(getHosts);
</script>

<svelte:head>
	<title>Hosts</title>
</svelte:head>

<section>
	<h1>Hosts</h1>

	{#if hosts.length === 0}
		<p>Loading...</p>
	{:else}
		<table>
			<thead>
			<tr>
				<th>Name</th>
				<th>IP Address</th>
			</tr>
			</thead>
			<tbody>
			{#each hosts as host}
				<tr>
					<td>{host.hostname}</td>
					<td>{host.ipAddress}</td>
				</tr>
			{/each}
			<tr>
				<td>
					<input
						type="text"
						bind:value={newHostname}
						placeholder="Hostname"
						on:keydown={(e) => e.key === 'Enter' && addHost()}
					/>
				</td>
				<td>
					<input
						type="text"
						bind:value={newIpAddress}
						placeholder="IP Address"
						on:keydown={(e) => e.key === 'Enter' && addHost()}
					/>
				</td>
			</tr>
			</tbody>
		</table>
	{/if}
</section>
