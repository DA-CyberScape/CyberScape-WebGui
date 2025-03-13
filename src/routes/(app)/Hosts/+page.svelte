<script lang="ts">
	import { onMount } from 'svelte';
	import './styles.css';

	let hosts: any = [];
	let newHostname = '';
	let newIpAddress = '';
	let errorMessage = '';
	let invalidHostname = false;
	let invalidIpAddress = false;
	let editingHost: { hostname: string; ipAddress: string } | null = null;

	// Validate IP address
	function isValidIP(ip: string) {
		return /^(25[0-5]|2[0-4][0-9]|1?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|1?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|1?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|1?[0-9][0-9]?)$/.test(ip);
	}

	// Fetch hosts from the backend
	async function fetchHosts() {
		try {
			const res = await fetch('/Hosts');
			const data = await res.json();
			hosts = data;
		} catch (error) {
			console.error('Error fetching hosts:', error);
		}
	}

	// Add a new host
	async function addHost() {
		errorMessage = '';
		invalidHostname = false;
		invalidIpAddress = false;

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

		// Check if the IP address already exists in the list
		if (hosts.some((host) => host.ipAddress === newIpAddress)) {
			invalidIpAddress = true;
			errorMessage = 'The IP address already exists in the list.';
			return;
		}

		// Send POST request to add host
		try {
			const res = await fetch('/Hosts', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ hostname: newHostname, ipAddress: newIpAddress })
			});

			const data = await res.json();
			if (res.ok) {
				hosts = data;
				newHostname = '';
				newIpAddress = '';
			} else {
				errorMessage = data.error || 'Failed to add host.';
			}
		} catch (error) {
			console.error('Error adding host:', error);
			errorMessage = 'Error adding host.';
		}
	}

	// Delete a host
	async function deleteHost(ipAddress: string) {
		try {
			const res = await fetch('/Hosts', {
				method: 'DELETE',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ ipAddress })
			});

			const data = await res.json();
			if (res.ok) {
				hosts = data;
			} else {
				errorMessage = data.error || 'Failed to delete host.';
			}
		} catch (error) {
			console.error('Error deleting host:', error);
			errorMessage = 'Error deleting host.';
		}
	}

	// Edit an existing host
	async function editHost(ipAddress: string, updatedHostname: string, updatedIpAddress: string) {
		errorMessage = '';
		invalidHostname = false;
		invalidIpAddress = false;

		if (!updatedHostname.trim()) {
			invalidHostname = true;
			errorMessage = 'Hostname is required.';
			return;
		}

		if (!updatedIpAddress.trim()) {
			invalidIpAddress = true;
			errorMessage = 'IP Address is required.';
			return;
		}

		if (!isValidIP(updatedIpAddress)) {
			invalidIpAddress = true;
			errorMessage = 'Please enter a valid IP address.';
			return;
		}

		// Check if the new IP address already exists
		if (hosts.some((host) => host.ipAddress === updatedIpAddress && host.ipAddress !== ipAddress)) {
			invalidIpAddress = true;
			errorMessage = 'The IP address already exists in the list.';
			return;
		}

		// Send PUT request to update host
		try {
			const res = await fetch('/Hosts', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ oldIpAddress: ipAddress, hostname: updatedHostname, ipAddress: updatedIpAddress })
			});

			const data = await res.json();
			if (res.ok) {
				hosts = data;
				editingHost = null;
				newHostname = '';
				newIpAddress = '';
			} else {
				errorMessage = data.error || 'Failed to edit host.';
			}
		} catch (error) {
			console.error('Error editing host:', error);
			errorMessage = 'Error editing host.';
		}
	}

	// Start editing a host
	function startEditHost(host: any) {
		editingHost = { hostname: host.hostname, ipAddress: host.ipAddress };
		newHostname = host.hostname;
		newIpAddress = host.ipAddress;
	}

	onMount(fetchHosts);
</script>

<title>Hosts</title>

<section id="hosts-management">
	<h1>Hosts</h1>

	{#if hosts.length === 0}
		<p>Loading...</p>
	{:else}
		<table>
			<thead>
			<tr>
				<th>Name</th>
				<th>IP Address</th>
				<th>Actions</th>
			</tr>
			</thead>
			<tbody>
			{#each hosts as host}
				<tr>
					<td>{host.hostname}</td>
					<td>{host.ipAddress}</td>
					<td>
						<button class="delete-btn" style="cursor: pointer" title="Delete Alert {host.hostname}"
										on:click={() => deleteHost(host.ipAddress)}>
							<i class="material-icons">delete</i>
						</button>
						<button class="edit-btn" style="cursor: pointer" title="Edit Host {host.hostname}"
										on:click={() => startEditHost(host)}>
							<i class="material-icons">edit</i>
						</button>
					</td>
				</tr>
			{/each}
			{#if editingHost}
				<tr>
					<td>
						<input
							type="text"
							bind:value={newHostname}
							placeholder="Hostname"
							class={invalidHostname ? 'input-error' : ''}
							on:keydown={(e) => e.key === 'Enter' && editHost(editingHost.ipAddress, newHostname, newIpAddress)}
							autofocus
						/>
					</td>
					<td>
						<input
							type="text"
							bind:value={newIpAddress}
							placeholder="IP Address"
							class={invalidIpAddress ? 'input-error' : ''}
							on:keydown={(e) => e.key === 'Enter' && editHost(editingHost.ipAddress, newHostname, newIpAddress)}
						/>
					</td>
				</tr>
			{/if}
			<tr>
				<td>
					<input
						type="text"
						bind:value={newHostname}
						placeholder="Hostname"
						class={invalidHostname ? 'input-error' : ''}
						on:keydown={(e) => e.key === 'Enter' && addHost()}
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
