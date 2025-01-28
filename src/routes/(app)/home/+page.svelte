<script lang="ts">
	import './styles.css';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';

	let ipAddress: string = '';
	let netmask: string = '';
	let gateway: string = '';
	let dhcp: boolean = true;
	let ipError: string = '';
	let isIpValid: boolean = true;
	let isNetmaskValid: boolean = true;
	let isGatewayValid: boolean = true;
	let isFormValid: boolean = false;

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

	$: isFormValid = isIpValid && isNetmaskValid && isGatewayValid;

	onMount(fetchIP);
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