<script lang="ts">
	import { onMount } from 'svelte';
	import './styles.css';

	let hosts: { hostname: string; ipAddress: string; device_type: string }[] = [];
	let newHostname = '';
	let newIpAddress = '';
	let newDevice_type = 'PC';
	let errorMessage = '';
	let invalidHostname = false;
	let invalidIpAddress = false;
	let editingHost: { hostname: string, ipAddress: string, device_type: string } | null = null;

	// Fetch hosts from API
	async function getHosts() {
		try {
			const res = await fetch('/api/proxy?endpoint=host_assignment');
			if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);

			const data = await res.json();
			hosts = data?.assignments || [];
		} catch (error) {
			console.error('Error fetching hosts:', error);
			errorMessage = 'Failed to load host data.';
		}
	}

	// Validate IP Address
	function isValidIP(ip: string): boolean {
		const ipRegex =
			/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
		return ipRegex.test(ip);
	}

	// Add new host
	async function addHost() {
		invalidHostname = false;
		invalidIpAddress = false;
		errorMessage = '';

		if (!newHostname.trim()) {
			invalidHostname = true;
			errorMessage = 'Hostname is required.';
			return;
		}

		if (!newIpAddress.trim() || !isValidIP(newIpAddress)) {
			invalidIpAddress = true;
			errorMessage = 'Please enter a valid IP address.';
			return;
		}

		if (hosts.some((host) => host.ipAddress === newIpAddress)) {
			invalidIpAddress = true;
			errorMessage = 'The IP address already exists in the list.';
			return;
		}

		try {
			// Construct the new host object
			const newHost = {
				hostname: newHostname,
				ipAddress: newIpAddress,
				device_type: newDevice_type || 'PC'
			};

			// Send the new host object in the correct format
			const resPost = await fetch('/api/proxy', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					endpoint: 'host_assignment',
					body: {
						assignments: [...hosts, newHost]
					}
				})
			});

			if (!resPost.ok) {
				const resBody = await resPost.text();
				errorMessage = `Failed to add host: ${resPost.status} - ${resBody}`;
				console.error(errorMessage);
				return;
			}

			// Update the local state
			hosts = [...hosts, newHost];
			resetForm();

		} catch (error) {
			console.error('Error adding host:', error);
			errorMessage = 'Error adding host.';
		}
	}


	// Delete a host
	async function deleteHost(ipAddress: string) {
		try {
			const updatedHosts = hosts.filter(host => host.ipAddress !== ipAddress);

			const res = await fetch('/api/proxy', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ endpoint: 'host_assignment', body: { assignments: updatedHosts } })
			});

			if (!res.ok) {
				errorMessage = `Failed to delete host: ${res.status}`;
				return;
			}

			hosts = updatedHosts;
		} catch (error) {
			errorMessage = 'Error deleting host.';
		}
	}

	// Start editing a host
	function startEditing(host: { hostname: string; ipAddress: string; device_type: string }) {
		editingHost = { ...host };
	}

	// Update host
	async function updateHost() {
		if (!editingHost || !isValidIP(editingHost.ipAddress)) {
			errorMessage = 'Invalid IP address.';
			return;
		}

		try {
			const updatedHosts = hosts.map(host =>
				host.ipAddress === editingHost!.ipAddress ? editingHost! : host
			);

			const res = await fetch('/api/proxy', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ endpoint: 'host_assignment', body: { assignments: updatedHosts } })
			});

			if (!res.ok) {
				errorMessage = `Failed to update host: ${res.status}`;
				return;
			}

			hosts = updatedHosts;
			editingHost = null;
		} catch (error) {
			errorMessage = 'Error updating host.';
		}
	}

	// Reset form fields
	function resetForm() {
		newHostname = '';
		newIpAddress = '';
		newDevice_type = 'PC';
	}

	onMount(getHosts);
</script>


<svelte:head>
	<title>Hosts</title>
</svelte:head>

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
				<th>Device Type</th>
			</tr>
			</thead>
			<tbody>
			{#each hosts as host}
				<tr>
					<td>
						{#if editingHost && editingHost.ipAddress === host.ipAddress}
							<input type="text" bind:value={editingHost.hostname}
										 on:keydown={(e) => e.key === 'Enter' && updateHost()} />
						{:else}
							{host.hostname}
						{/if}
					</td>
					<td>
						{host.ipAddress}
					</td>
					<td>
						{#if editingHost && editingHost.ipAddress === host.ipAddress}
							<select bind:value={editingHost.device_type} on:change={updateHost}>
								<option value="PC">PC</option>
								<option value="Switch">Switch</option>
								<option value="Router">Router</option>
								<option value="Firewall">Firewall</option>
								<option value="Server">Server</option>
							</select>
						{:else}
							{host.device_type}
						{/if}
					</td>
					<td>
						{#if editingHost && editingHost.ipAddress === host.ipAddress}
							<button class="save-btn" on:click={updateHost}>Save</button>
						{:else}
							<button class="edit-btn" title="Edit {host.hostname}" style="cursor: pointer"
											on:click={() => startEditing(host)}>
								<i class="material-icons">edit</i>
							</button>
						{/if}
					</td>
					<td>
						<button class="delete-btn" title="Delete {host.hostname}" style="cursor: pointer"
										on:click={() => deleteHost(host.ipAddress)}>
							<i class="material-icons">delete</i>
						</button>
					</td>
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
				<td>
					<select bind:value={newDevice_type}>
						<option value="PC">PC</option>
						<option value="Switch">Switch</option>
						<option value="Router">Router</option>
						<option value="Firewall">Firewall</option>
						<option value="Server">Server</option>
					</select>
				</td>
			</tr>
			</tbody>
		</table>
		{#if errorMessage}
			<p class="error">{errorMessage}</p>
		{/if}
	{/if}
</section>
