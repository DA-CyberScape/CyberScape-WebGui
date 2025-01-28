<script lang="ts">
	import { onMount } from 'svelte';
	import './styles.css';
	import { page } from '$app/stores';

	let hosts = [];
	let newHostname = '';
	let newIpAddress = '';
	let errorMessage = ''; // To store the validation error message
	let invalidHostname = false; // Tracks if hostname input is invalid
	let invalidIpAddress = false; // Tracks if IP address input is invalid

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

	// Validate IP Address
	function isValidIP(ip: string): boolean {
		const ipRegex =
			/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
		return ipRegex.test(ip);
	}


	// Add a new host
	async function addHost() {
		// Reset validation states
		invalidHostname = false;
		invalidIpAddress = false;
		errorMessage = '';

		if (!newHostname.trim()) {
			invalidHostname = true;
			errorMessage = 'Hostname is required.';
			return;
		}

		if (!newIpAddress.trim()) {
			invalidIpAddress = true;
			errorMessage = 'IP Address is required.';
			return;
		}

		if (!isValidIP(newIpAddress)) {
			invalidIpAddress = true;
			errorMessage = 'Please enter a valid IP address.';
			return;
		}

		// Check for duplicate IP address
		if (hosts.some((host) => host.ipAddress === newIpAddress)) {
			invalidIpAddress = true;
			errorMessage = 'The IP address already exists in the list.';
			return;
		}

		const newHost = { hostname: newHostname, ipAddress: newIpAddress };

		try {
			const res = await fetch('/api/hosts', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(newHost)
			});

			// Log the response status and body for debugging
			if (!res.ok) {
				const resBody = await res.text(); // Get the response body as text
				console.error('Failed to add host. Response status:', res.status, 'Response body:', resBody);
				errorMessage = `Failed to add host: ${res.status} - ${resBody}`;
				return;
			}

			const responseData = await res.json();
			if (responseData.hosts) {
				hosts = responseData.hosts; // Use updated hosts from the server
				newHostname = ''; // Clear the input fields
				newIpAddress = '';
			} else {
				errorMessage = 'Failed to get updated hosts data.';
			}
			location.reload(); // Reload the page to update the hosts list
		} catch (error) {
			console.error('Error adding host:', error);
			errorMessage = 'Error adding host.';
		}
	}

	// Fetch hosts when the component mounts
	onMount(getHosts);

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
						class={invalidHostname ? 'input-error' : ''}
						on:keydown={(e) => e.key === 'Enter' && addHost()}
						autofocus
					/>
				</td>
				<td>
					<input
						type="text"
						bind:value={newIpAddress}
						placeholder="IP Address"
						class={invalidIpAddress ? 'input-error' : ''}
						on:keydown={(e) => e.key === 'Enter' && addHost()}
					/>
				</td>
			</tr>
			</tbody>
		</table>
		{#if errorMessage}
			<p class="error">{errorMessage}</p>
		{/if}
	{/if}
</section>
