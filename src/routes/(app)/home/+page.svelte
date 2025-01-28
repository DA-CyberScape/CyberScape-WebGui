<script lang="ts">
	import './styles.css';
	import { goto } from '$app/navigation';
</script>

<title>Home</title>

<section id="home">
	<h1>Home</h1>
	<div class="floating-box-container">

		<div class="FloatingBox" on:click={() => goto('/Data_Sources')}>
			<p class="boxHeader">Data Sources</p>

			<div class="boxItem">
				<p>Click here to view the Data Sources.</p>
			</div>
		</div>

		<div class="FloatingBox" on:click={() => goto('/Data_Base')}>
			<p class="boxHeader">Data Base Cluster</p>
			<div class="boxItem">
				<p>Click here to view the Data Base Cluster.</p>
			</div>
		</div>

		<div class="FloatingBox" on:click={() => goto('/Hosts')}>
			<p class="boxHeader">Host Editor</p>

			<div class="boxItem">
				<p>Click here to view the Hosts that are being monitored.</p>
			</div>
		</div>

		<div class="FloatingBox" on:click={() => goto('/Alerts')}>
			<p class="boxHeader">Alerts</p>

			<div class="boxItem">
				<p>Click here to view the Alerts.</p>
			</div>
		</div>

		<div class="FloatingBox" on:click={() => goto('/Account')}>
			<p class="boxHeader">Account</p>

			<div class="boxItem">
				<p>Click here to view the Account Settings and change username & password.</p>
			</div>
		</div>

	</div>

</section>