<script lang="ts">
	import './styles.css';
	import { onMount } from 'svelte';
	import type { Datasource } from '$lib/datasources';

	let dataSources: Datasource[] = [];
	let oldName: string = '';
	let updateDataSource: Datasource = {
		name: '',
		type: 'Type',
		active: false
	};
	let newDataSource: Datasource = {
		name: '',
		type: 'Type',
		active: false
	};
	let openUpdateDatasourcePopup: boolean = false;
	let DSTypes: string[] = [];
	let dataError: string = '';


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

	async function fetchDatasources() {
		try {
			const response = await fetch('api/datasources');
			if (!response.ok) {
				throw new Error('Failed to fetch data sources');
			}

			const data = await response.json();
			dataSources = data.sources || [];

			console.log(dataSources);
		} catch (err) {
			console.error('Error fetching data sources:', err);
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
				throw new Error(`Datasource with name ${updateDataSource.name} already exists`);
			}

			if (!response.ok) {
				throw new Error('Failed to update data source');
			}

			const data = await response.json();
			if (data.error) {
				console.error('Error updating data source:', data.error);
			} else {
				console.log('Data source updated successfully:', data);
				await fetchDatasources();
				updateDataSource = {
					name: '',
					type: 'Type',
					active: false
				};
				closeChangeDataSourcePopup();
			}
		} catch (err) {
			console.error('Error updating data source:', err);
		}
	}

	async function removeDatasource(name: string) {
		try {
			const response = await fetch(`/api/datasources?name=${name}`, {
				method: 'DELETE'
			});
			if (!response.ok) {
				throw new Error('Failed to remove data source');
			}

			const data = await response.json();
			if (data.error) {
				console.error('Error removing data source:', data.error);
			} else {
				console.log('Data source removed successfully:', data);
				await fetchDatasources();
			}
		} catch (err) {
			console.error('Error removing data source:', err);
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
				throw new Error(`Datasource with name ${newDataSource.name} already exists`);
			}

			if (!response.ok) {
				throw new Error('Failed to add data source');
			}

			const data = await response.json();
			if (data.error) {
				console.error('Error adding data source:', data.error);
			} else {
				console.log('Data source added successfully:', data);
				await fetchDatasources();
				newDataSource = {
					name: '',
					type: 'Type',
					active: false
				};
			}
		} catch (err) {
			console.error('Error adding data source:', err);
		}
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
		newDataSource.type = type;
		const dropdown = document.getElementById('myDropdown') as HTMLElement;
		dropdown.classList.toggle('show');
	}

	async function openChangeDataSourcePopup(name: string): Promise<void> {
		try {
			await fetchSingleDatasource(name);
			openUpdateDatasourcePopup = true;
		} catch (error) {
			console.error('Failed to open datasource popup:', error);
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

	function closeChangeDataSourcePopup(): void {
		openUpdateDatasourcePopup = false;
		updateDataSource = {
			name: '',
			type: '',
			active: false
		};
	}

	onMount(() => {
		fetchDatasources();
		fetchDSTypes();
	});
</script>


<title>Data Sources</title>
<section>
	<h1>Data Sources</h1>
	<table>
		<thead>
		<tr>
			<th>Name</th>
			<th>Type</th>
			<th>Active</th>
		</tr>
		</thead>
		<tbody>
		{#each dataSources as datasource}
			<tr>
				<td>{datasource.name}</td>
				<td>{datasource.type}</td>
				<td>{datasource.active ? 'Yes' : 'No'}</td>
				<td>
					<button title="Edit Data Source" on:click={() => openChangeDataSourcePopup(datasource.name)}>
						<i class="material-icons">edit</i>
					</button>
					<button title="Delete Data Source" on:click={() => removeDatasource(datasource.name)}>
						<i class="material-icons">delete</i>
					</button>
				</td>
			</tr>
		{/each}
		<tr>
			<td><input type="text" bind:value={newDataSource.name}></td>
			<td>
				<div class="dropdown">
					<button type="button" on:click={openDropdown} class="dropbtn">{newDataSource.type}</button>
					<div id="myDropdown" class="dropdown-content">
						<input type="text" placeholder="Search.." id="myInput" on:keyup={filterFunction}>
						{#each DSTypes as type}
							<button type="button" on:click={() => selectType(type)} class="dropdown-item">
								{type}
							</button>
						{/each}
					</div>
				</div>
			</td>
			<td class="checkbox-cell">
				<input type="checkbox" bind:checked={newDataSource.active}>
			</td>
			<td>
				<button title="Add Data Source" on:click={() => addDatasource()}>
					<i class="material-icons">add</i>
				</button>
			</td>
		</tr>
		</tbody>
	</table>


	{#if openUpdateDatasourcePopup}
		<div class="popup" role="dialog" aria-modal="true" on:click={closeChangeDataSourcePopup}>
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
</section>

