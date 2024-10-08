<script lang="ts">
	import './styles.css';
	import { onMount } from 'svelte';
	import type { Datasource } from '$lib/datasources';

	let ipAddress: string = '';
	let netmask: string = '';
	let gateway: string = '';
	let dhcp: boolean = true;
	let ipError: string = '';
	let isIpValid: boolean = true;
	let isNetmaskValid: boolean = true;
	let isGatewayValid: boolean = true;
	let isFormValid: boolean = false;
	let dataError: string = '';
	let dataSources: Datasource[] = [];
	let newDataSource: Datasource = {
		name: '',
		type: '',
		active: false
	};
	let oldName: string = '';
	let updateDataSource: Datasource = {
		name: '',
		type: '',
		active: false
	};
	let openNewDatasourcePopup: boolean = false;
	let openUpdateDatasourcePopup: boolean = false;
	let DSTypes: string[];


	function validateIPAddress(value: string): void {
		const ipPattern = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
		isIpValid = ipPattern.test(value.trim());
	}

	function validateNetmask(value: string): void {
		const netmaskValue = parseInt(value.trim());
		isNetmaskValid = !isNaN(netmaskValue) && netmaskValue >= 0 && netmaskValue <= 32;
	}

	function validateGateway(value: string): void {
		const ipPattern = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-5][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-5][0-9]|[01]?[0-9][0-9]?)$/;
		isGatewayValid = ipPattern.test(value.trim());
	}

	async function fetchIP() {
		try {
			const response = await fetch('/api/ipaddress');
			if (!response.ok) {
				throw new Error('Failed to get IP address');
			}

			const data = await response.json();
			ipAddress = data.address || '';
			netmask = data.netmask || '';
			gateway = data.gateway || '';
			dhcp = data.dhcp ?? true; // Fallback to `true` if `data.dhcp` is undefined

			if (!ipAddress || !netmask || !gateway) {
				ipError = 'Error fetching IP address details';
			} else {
				ipError = '';
			}
		} catch (err) {
			if (err instanceof Error) {
				ipError = err.message;
			} else {
				ipError = 'An unknown error occurred';
			}
		}
	}

	async function changeIP() {
		try {
			const response = await fetch('/api/ipaddress', {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					address: ipAddress,
					netmask: netmask,
					gateway: gateway,
					dhcp: dhcp
				})
			});
			if (!response.ok) {
				const errorData = await response.json();
				ipError = errorData.error || 'Failed to update IP address';
				alert('Error: ' + response.status + ' ' + response.statusText);
				throw new Error(ipError);
			}

			const data = await response.json();
			if (data.error) {
				ipError = data.error;
			} else {
				ipError = '';
				alert('IP address updated successfully');
				await fetchIP();
			}
		} catch (err) {
			if (err instanceof Error) {
				ipError = err.message;
				alert('Error: ' + ipError);
			} else {
				ipError = 'An unknown error occurred';
				alert('Error: ' + ipError);
			}
		}
	}

	async function fetchDatasources() {
		try {
			const response = await fetch('/api/datasources');
			if (!response.ok) {
				throw new Error('Failed to fetch data sources');
			}

			const data = await response.json();
			dataSources = data.sources || [];

		} catch (err) {
			console.error('Error fetching data sources:', err);
		}
	}

	async function fetchSingleDatasource(name: string) {
		try {
			const response = await fetch(`/api/datasources?name=${name}`);
			if (!response.ok) {
				throw new Error('Failed to fetch data source');
			}

			const data = await response.json();

			updateDataSource = data.sources[0] || {};
			oldName = updateDataSource.name;

		} catch (err) {
			console.error('Error fetching data source:', err);
		}
	}

	async function addDatasource() {
		try {
			const response = await fetch('/api/datasources', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					name: newDataSource.name,
					type: newDataSource.type,
					active: newDataSource.active
				})
			});
			if (response.status === 409) {
				dataError = `Datasource with name ${newDataSource.name} already exists`;
				throw new Error(`Datasource with name ${newDataSource.name} already exists`);
			}

			if (!response.ok) {
				throw new Error('Failed to add data source');
			}

			const data = await response.json();
			if (data.error) {
				console.error('Error adding data source:', data.error);
			} else {
				await fetchDatasources();
				newDataSource = {
					name: '',
					type: '',
					active: false
				};
			}
		} catch (err) {
			console.error('Error adding data source:', err);
		}
	}

	async function changeDatasource(name: string) {
		try {
			const response = await fetch(`/api/datasources?name=${name}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					name: updateDataSource.name,
					type: updateDataSource.type,
					active: updateDataSource.active
				})
			});
			if (response.status === 409) {
				dataError = `Datasource with name ${updateDataSource.name} already exists`;
				throw new Error(`Datasource with name ${updateDataSource.name} already exists`);
			}

			if (!response.ok) {
				throw new Error('Failed to update data source');
			}

			const data = await response.json();
			if (data.error) {
				console.error('Error updating data source:', data.error);
			} else {
				await fetchDatasources();
				closeChangeDataSourcePopup();
				updateDataSource = {
					name: '',
					type: '',
					active: false
				};
			}
		} catch (err) {
			console.error('Error updating data source:', err);
		}
	}

	function openAddDataSourcePopup() {
		openNewDatasourcePopup = true;
	}

	async function openChangeDataSourcePopup(name: string): Promise<void> {
		try {
			await fetchSingleDatasource(name);
			openUpdateDatasourcePopup = true;
		} catch (error) {
			console.error('Failed to open datasource popup:', error);
		}
	}

	function handleOverlayClick(): void {
		closeChangeDataSourcePopup();
		closeAddDataSourcePopup();
	}

	function closeChangeDataSourcePopup(): void {
		openUpdateDatasourcePopup = false;
		updateDataSource = {
			name: '',
			type: '',
			active: false
		};
	}

	function closeAddDataSourcePopup(): void {
		openNewDatasourcePopup = false;
		newDataSource = {
			name: '',
			type: '',
			active: false
		};
	}

	function openDropdown(event: MouseEvent) {
		event.preventDefault();
		const dropdown = document.getElementById('myDropdown') as HTMLElement;
		dropdown.classList.toggle('show');
	}

	function filterFunction(): void {
		const input = document.getElementById('myInput') as HTMLInputElement;
		const filter = input.value.toUpperCase();
		const div = document.getElementById('myDropdown') as HTMLElement;
		const buttons = div.getElementsByClassName('dropdown-item');

		for (let i = 0; i < buttons.length; i++) {
			const button = buttons[i] as HTMLButtonElement;
			const txtValue = button.textContent || button.innerText;
			button.style.display = txtValue.toUpperCase().indexOf(filter) > -1 ? '' : 'none';
		}
	}

	function selectType(type: string): void {
		if (openUpdateDatasourcePopup) {
			updateDataSource.type = type;
		} else {
			newDataSource.type = type;
		}
		const dropdown = document.getElementById('myDropdown') as HTMLElement;
		dropdown.classList.toggle('show');
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

	$: isFormValid = isIpValid && isNetmaskValid && isGatewayValid;

	onMount(fetchIP);
	onMount(fetchDatasources);
	onMount(fetchDSTypes);
</script>

<title>Home</title>

<!--Power Options-->
<div class="powerOptions">
	<p class="boxHeader">Power Options</p>

	<div class="boxItem">
		<p class="boxText">Power on</p>
		<button class="boxButton powerOnButton" title="Turn the Server on"><i class="material-icons">power_settings_new</i>
		</button>
	</div>

	<div class="boxItem">
		<p class="boxText">Power off</p>
		<button class="boxButton powerOffButton" title="Turn the Server off"><i
			class="material-icons">power_settings_new</i></button>
	</div>

	<div class="boxItem">
		<p class="boxText">Restart</p>
		<button class="boxButton restartButton" title="Restart the Server"><i class="material-icons">refresh</i></button>
	</div>
</div>

<!--Data Sources-->
<div class="dataSources">
	<p class="boxHeader">Data Sources</p>

	{#if dataSources.length > 0}
		{#each dataSources as source}
			<div class="boxItem">
				<p class="boxText">{source.name}</p>

				{#if source.active}
					<button class="editSourceButton" on:click={() => openChangeDataSourcePopup(source.name)}
									title="Edit Source: {source.name}. Status: active">
						edit<i class="material-icons">download</i>
					</button>
				{:else}
					<button class="editSourceButton" on:click={() => openChangeDataSourcePopup(source.name)}
									title="Edit Source: {source.name}. Status: inactive">
						edit<i class="material-icons">file_download_off</i>
					</button>
				{/if}

			</div>
		{/each}
	{:else}
		<div class="boxItem">
			<p class="boxText">No data sources available.</p>
		</div>
	{/if}
	<div class="boxItem">
		<p class="boxText">Add Sources</p>
		<button class="addSourceButton" title="Add a new Source" on:click={openAddDataSourcePopup}>+new</button>
	</div>
</div>

<!--IP Settings-->
<div class="IPSettings">
	<p class="boxHeader">IP Settings</p>

	<div class="boxItem">
		<label for="manual" class="customRadioLabel">
			Manual
			<input
				type="radio"
				id="manual"
				name="dhcpRadiobutton"
				class="customRadioButton"
				bind:group={dhcp}
				value={false}
			/>
			<span class="customRadio"></span>
		</label>

		<label for="dhcp" class="customRadioLabel">
			DHCP
			<input
				type="radio"
				id="dhcp"
				name="dhcpRadiobutton"
				class="customRadioButton"
				bind:group={dhcp}
				value={true}
			/>
			<span class="customRadio"></span>
		</label>
	</div>

	<div class="boxItem">
		<p class="boxText">IP Address</p>
		<textarea
			class="ipInput {isIpValid ? '' : 'invalid'}"
			bind:value={ipAddress}
			on:blur={() => validateIPAddress(ipAddress)}
			placeholder="192.168.0.10"
			maxlength="15"
			disabled={dhcp}
		></textarea>
	</div>

	<div class="boxItem">
		<p class="boxText">Netmask</p>
		<textarea
			class="netmaskInput {isNetmaskValid ? '' : 'invalid'}"
			bind:value={netmask}
			on:blur={() => validateNetmask(netmask)}
			placeholder="24"
			maxlength="2"
			disabled={dhcp}
		></textarea>
	</div>

	<div class="boxItem">
		<p class="boxText">Gateway</p>
		<textarea
			class="ipInput {isGatewayValid ? '' : 'invalid'}"
			bind:value={gateway}
			on:blur={() => validateGateway(gateway)}
			placeholder="192.168.0.1"
			maxlength="15"
			disabled={dhcp}
		></textarea>
	</div>

	<div class="boxItem">
		<p class="boxText">Update IP</p>
		<button title="Update IP Settings" class="updateIPButton" on:click={changeIP} disabled={!isFormValid}>
			Update
		</button>
	</div>
</div>

{#if openNewDatasourcePopup}
	<div class="popup" role="dialog" aria-modal="true" on:click={handleOverlayClick}>
		<div class="container">
			<div class="popup-box" role="document" on:click|stopPropagation>
				<button class="close" on:click={closeAddDataSourcePopup} aria-label="Close popup">✖</button>
				<h2>Add a Datasource</h2>
				<form on:submit|preventDefault={addDatasource}>

					<div class="user-box">
						<input type="text" name="sourceName" required bind:value={newDataSource.name} />
						<label for="sourceName">Name</label>
					</div>

					<div class="user-box">
						<div class="dropdown">
							{#if newDataSource.type}
								<button type="button" on:click={openDropdown} class="dropbtn">{newDataSource.type}</button>
							{:else}
								<button type="button" on:click={openDropdown} class="dropbtn">Type</button>
							{/if}
							<div id="myDropdown" class="dropdown-content">
								<input type="text" placeholder="Search.." id="myInput" on:keyup={filterFunction}>
								{#each DSTypes as type}
									<button type="button" on:click={() => selectType(type)} class="dropdown-item">
										{type}
									</button>
								{/each}
							</div>
						</div>
					</div>

					{#if newDataSource.type === 'snmpPolls'}
						<div class="user-box">
							<input type="text" name="ipAddress" bind:value={newDataSource.ipAddress} />
							<label for="sourceURL">IP Address</label>
						</div>
					{/if}

					<div class="user-box">
						<input type="checkbox" id="sourceState" name="sourceState" class="customCheckbox"
									 bind:checked={newDataSource.active} />
						<label for="sourceState" class="customCheckboxLabel">
							Active:
							<span class="customCheckboxBox"></span>
						</label>
					</div>

					<div class="error">
						{dataError}
					</div>

					<button type="submit" class="submit">
						Add
					</button>

				</form>
			</div>
		</div>
	</div>
{/if}

{#if openUpdateDatasourcePopup}
	<div class="popup" role="dialog" aria-modal="true" on:click={handleOverlayClick}>
		<div class="container">
			<div class="popup-box" role="document" on:click|stopPropagation>
				<button class="close" on:click={closeChangeDataSourcePopup} aria-label="Close popup">✖</button>
				<h2>Update Datasource</h2>
				<form on:submit|preventDefault={() => changeDatasource(oldName)}>

					<div class="user-box">
						<input type="text" name="sourceName" required bind:value={updateDataSource.name} />
						<label for="sourceName">Name</label>
					</div>

					<div class="user-box">
						<div class="dropdown">
							{#if updateDataSource.type}
								<button type="button" on:click={openDropdown} class="dropbtn">{updateDataSource.type}</button>
							{:else}
								<button type="button" on:click={openDropdown} class="dropbtn">Type</button>
							{/if}
							<div id="myDropdown" class="dropdown-content">
								<input type="text" placeholder="Search.." id="myInput" on:keyup={filterFunction}>
								{#each DSTypes as type}
									<button type="button" on:click={() => selectType(type)} class="dropdown-item">
										{type}
									</button>
								{/each}
							</div>
						</div>
					</div>

					<div class="user-box">
						<input type="checkbox" id="sourceState" name="sourceState" class="customCheckbox"
									 bind:checked={updateDataSource.active} />
						<label for="sourceState" class="customCheckboxLabel">
							Active:
							<span class="customCheckboxBox"></span>
						</label>
					</div>

					<div class="error">
						{dataError}
					</div>

					<button type="submit" class="submit">
						Update
					</button>

				</form>
			</div>
		</div>
	</div>
{/if}