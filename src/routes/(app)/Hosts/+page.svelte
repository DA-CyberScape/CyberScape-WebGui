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
	let editingHost: { hostname: string, ipAddress: string } | null = null; // Stores the host being edited

	// Fetch hosts from the backend API
	async function getHosts() {
		try {
			const res = await fetch('http://10.0.1.10:5073/host_assignment/');
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

	// Add new host
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

		try {
			const resGet = await fetch('http://10.0.1.10:5073/host_assignment/');
			if (!resGet.ok) {
				const resBody = await resGet.text();
				console.error('Failed to fetch existing hosts. Response:', resGet.status, resBody);
				errorMessage = `Failed to fetch hosts: ${resGet.status} - ${resBody}`;
				return;
			}

			const existingData = await resGet.json();

			if (!existingData.assignments) {
				existingData.assignments = [];
			}

			const updatedHosts = {
				assignments: [...existingData.assignments, { hostname: newHostname, ipAddress: newIpAddress }]
			};

			const resPost = await fetch('http://10.0.1.10:5073/host_assignment/', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(updatedHosts)
			});

			if (!resPost.ok) {
				const resBody = await resPost.text();
				console.error('Failed to add host. Response:', resPost.status, resBody);
				errorMessage = `Failed to add host: ${resPost.status} - ${resBody}`;
				return;
			}

			hosts = updatedHosts.assignments;
			newHostname = '';
			newIpAddress = '';

			location.reload(); // Reload the page to reflect updates
		} catch (error) {
			console.error('Error adding host:', error);
			errorMessage = 'Error adding host.';
		}
	}

	// Delete host
	async function deleteHost(ipAddress: string) {
		try {
			// Filter out the host with the given IP address
			const updatedHosts = hosts.filter((host) => host.ipAddress !== ipAddress);

			// Send the updated host list to the server
			const resPost = await fetch('http://10.0.1.10:5073/host_assignment/', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ assignments: updatedHosts })
			});

			if (!resPost.ok) {
				const resBody = await resPost.text();
				console.error('Failed to delete host. Response:', resPost.status, resBody);
				errorMessage = `Failed to delete host: ${resPost.status} - ${resBody}`;
				return;
			}

			hosts = updatedHosts;

			// Reload the page to reflect updates
			location.reload();
		} catch (error) {
			console.error('Error deleting host:', error);
			errorMessage = 'Error deleting host.';
		}
	}

	// Start editing a host
	function startEditing(host: { hostname: string, ipAddress: string }) {
		editingHost = { ...host }; // Create a copy of the host data to edit
	}

	// Update host
	async function updateHost() {
		if (!editingHost || !editingHost.hostname.trim() || !editingHost.ipAddress.trim()) return;

		// Validate IP Address
		if (!isValidIP(editingHost.ipAddress)) {
			errorMessage = 'Please enter a valid IP address.';
			return;
		}

		// Update the host
		try {
			const updatedHosts = hosts.map((host) =>
				host.ipAddress === editingHost.ipAddress
					? { hostname: editingHost.hostname, ipAddress: editingHost.ipAddress }
					: host
			);

			// Send updated JSON to the server
			const resPost = await fetch('http://10.0.1.10:5073/host_assignment/', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ assignments: updatedHosts })
			});

			if (!resPost.ok) {
				const resBody = await resPost.text();
				console.error('Failed to update host. Response:', resPost.status, resBody);
				errorMessage = `Failed to update host: ${resPost.status} - ${resBody}`;
				return;
			}

			// Successfully updated, update UI
			hosts = updatedHosts;
			editingHost = null;
		} catch (error) {
			console.error('Error updating host:', error);
			errorMessage = 'Error updating host.';
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
							<button class="save-btn" on:click={updateHost}>Save</button>
						{:else}
							<button class="edit-btn" title="Edit {host.hostname}" style="cursor: pointer" on:click={() => startEditing(host)}>
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
