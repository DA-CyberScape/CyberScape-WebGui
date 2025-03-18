<script lang="ts">
	import { onMount } from 'svelte';
	import './styles.css';

	let vlans: { network: string; subnetmask: string; name: string }[] = [];
	let newNetwork = '';
	let newSubnetmask = '';
	let newName = '';
	let errorMessage = '';
	let invalidNetwork = false;
	let invalidSubnetmask = false;
	let editingVlan: { network: string; subnetmask: string; name: string } | null = null;

	// Fetch VLANs from API
	async function getVlans() {
		try {
			const res = await fetch('/api/proxy?endpoint=vlan_assignment');
			if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);

			const data = await res.json();
			vlans = [...data.vlans]; // Ensure Svelte reactivity
		} catch (error) {
			errorMessage = 'Failed to load VLAN data.';
		}
	}

	// Validate IP Address (Any valid IPv4 address)
	function isValidIP(ip: string): boolean {
		const ipRegex =
			/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
		return ipRegex.test(ip);
	}

	// Validate Subnet Mask
	function isValidSubnetmask(subnet: string): boolean {
		const validSubnetMasks = [
			'255.0.0.0', '255.128.0.0', '255.192.0.0', '255.224.0.0', '255.240.0.0', '255.248.0.0', '255.252.0.0', '255.254.0.0',
			'255.255.0.0', '255.255.128.0', '255.255.192.0', '255.255.224.0', '255.255.240.0', '255.255.248.0', '255.255.252.0',
			'255.255.254.0', '255.255.255.0', '255.255.255.128', '255.255.255.192', '255.255.255.224', '255.255.255.240',
			'255.255.255.248', '255.255.255.252', '255.255.255.254'
		];

		return validSubnetMasks.includes(subnet);
	}

	// Add new VLAN
	async function addVlan() {
		invalidNetwork = false;
		invalidSubnetmask = false;
		errorMessage = '';

		if (!newNetwork.trim() || !isValidIP(newNetwork)) {
			invalidNetwork = true;
			errorMessage = 'Invalid IP address. Must be a valid IPv4.';
			return;
		}

		if (!newSubnetmask.trim() || !isValidSubnetmask(newSubnetmask)) {
			invalidSubnetmask = true;
			errorMessage = 'Invalid subnet mask. Must be a valid CIDR subnet mask.';
			return;
		}

		try {
			const fetchRes = await fetch('/api/proxy?endpoint=vlan_assignment');
			if (!fetchRes.ok) throw new Error(`HTTP error! Status: ${fetchRes.status}`);
			const existingData = await fetchRes.json();
			const existingVlans = existingData.vlans || [];

			const newVlan = { network: newNetwork, subnetmask: newSubnetmask, name: newName || 'VLAN' };
			const updatedVlans = [...existingVlans, newVlan];

			const resPost = await fetch('/api/proxy?endpoint=vlan_assignment', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ vlans: updatedVlans })
			});

			if (!resPost.ok) {
				errorMessage = `Failed to add VLAN: ${resPost.status}`;
				return;
			}

			vlans = updatedVlans; // Ensure reactivity
			resetForm();
		} catch (error) {
			errorMessage = 'Error adding VLAN.';
		}
	}


	// Delete VLAN
	async function deleteVlan(network: string) {
		try {
			// Fetch existing VLANs before updating
			const fetchRes = await fetch('/api/proxy?endpoint=vlan_assignment');
			if (!fetchRes.ok) throw new Error(`HTTP error! Status: ${fetchRes.status}`);
			const existingData = await fetchRes.json();
			const existingVlans = existingData.vlans || [];

			const updatedVlans = existingVlans.filter(vlan => vlan.network !== network);

			const res = await fetch('/api/proxy?endpoint=vlan_assignment', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ vlans: updatedVlans })
			});

			if (!res.ok) {
				errorMessage = `Failed to delete VLAN: ${res.status}`;
				return;
			}

			vlans = updatedVlans; // Ensure reactivity
		} catch (error) {
			errorMessage = 'Error deleting VLAN.';
		}
	}

	// Start editing VLAN
	function startEditing(vlan: { network: string; subnetmask: string; name: string }) {
		editingVlan = { ...vlan };
	}

	// Update VLAN
	async function updateVlan() {
		if (!editingVlan || !isValidIP(editingVlan.network)) {
			errorMessage = 'Invalid network address.';
			return;
		}

		try {
			// Fetch existing VLANs before updating
			const fetchRes = await fetch('/api/proxy?endpoint=vlan_assignment');
			if (!fetchRes.ok) throw new Error(`HTTP error! Status: ${fetchRes.status}`);
			const existingData = await fetchRes.json();
			const existingVlans = existingData.vlans || [];

			const updatedVlans = existingVlans.map(vlan => vlan.network === editingVlan!.network ? editingVlan! : vlan);

			const res = await fetch('/api/proxy?endpoint=vlan_assignment', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ vlans: updatedVlans })
			});

			if (!res.ok) {
				errorMessage = `Failed to update VLAN: ${res.status}`;
				return;
			}

			vlans = updatedVlans; // Ensure reactivity
			editingVlan = null;
		} catch (error) {
			errorMessage = 'Error updating VLAN.';
		}
	}

	// Reset form fields
	function resetForm() {
		newNetwork = '';
		newSubnetmask = '';
		newName = '';
	}

	onMount(getVlans);
</script>


<svelte:head>
	<title>VLANs</title>
</svelte:head>

<section id="vlans-management">
	<h1>VLANs</h1>

	{#if vlans.length === 0}
		<p>Loading...</p>
	{:else}
		<table>
			<thead>
			<tr>
				<th>Network</th>
				<th>Subnet Mask</th>
				<th>Name</th>
			</tr>
			</thead>
			<tbody>
			{#each vlans as vlan}
				<tr>
					<td>
						{#if editingVlan && editingVlan.network === vlan.network}
							<input
								type="text"
								bind:value={editingVlan.network}
								class={invalidNetwork ? 'input-error' : ''}
								on:keydown={(e) => e.key === 'Enter' && updateVlan()}
							/>
						{:else}
							{vlan.network}
						{/if}
					</td>
					<td>
						{#if editingVlan && editingVlan.network === vlan.network}
							<input
								type="text"
								bind:value={editingVlan.subnetmask}
								class={invalidSubnetmask ? 'input-error' : ''}
								on:keydown={(e) => e.key === 'Enter' && updateVlan()}
							/>
						{:else}
							{vlan.subnetmask}
						{/if}
					</td>
					<td>
						{#if editingVlan && editingVlan.network === vlan.network}
							<input
								type="text"
								bind:value={editingVlan.name}
								on:keydown={(e) => e.key === 'Enter' && updateVlan()}
							/>
						{:else}
							{vlan.name}
						{/if}
					</td>
					<td>
						{#if editingVlan && editingVlan.network === vlan.network}
							<button class="save-btn" on:click={updateVlan}>Save</button>
						{:else}
							<button class="edit-btn" title="Edit {vlan.name}" on:click={() => startEditing(vlan)}>
								<i class="material-icons">edit</i>
							</button>
						{/if}
					</td>
					<td>
						<button class="delete-btn" title="Delete {vlan.name}" on:click={() => deleteVlan(vlan.network)}>
							<i class="material-icons">delete</i>
						</button>
					</td>
				</tr>
			{/each}
			<tr>
				<td>
					<input
						type="text"
						bind:value={newNetwork}
						placeholder="Network (e.g., 192.168.1.0)"
						class={invalidNetwork ? 'input-error' : ''}
						on:keydown={(e) => e.key === 'Enter' && addVlan()}
					/>
				</td>
				<td>
					<input
						type="text"
						bind:value={newSubnetmask}
						placeholder="Subnet Mask (e.g., 255.255.255.0)"
						class={invalidSubnetmask ? 'input-error' : ''}
						on:keydown={(e) => e.key === 'Enter' && addVlan()}
					/>
				</td>
				<td>
					<input
						type="text"
						bind:value={newName}
						placeholder="VLAN Name"
						on:keydown={(e) => e.key === 'Enter' && addVlan()}
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
