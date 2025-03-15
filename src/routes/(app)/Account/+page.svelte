<script lang="ts">
	import type { PageData } from './$types';
	import './styles.css';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';

	export let data: PageData;

	const { user } = data;

	let showPasswdPopup: boolean = false;
	let showUsernamePopup: boolean = false;
	let showCreateUserPopup: boolean = false; // New state for creating a user

	let newUsername: string = '';
	let newPassword: string = '';
	let confirmPassword: string = '';

	// Functions to open and close popups
	function openPasswdPopup() {
		showPasswdPopup = true;
	}

	function closePasswdPopup() {
		showPasswdPopup = false;
	}

	function openUsernamePopup() {
		showUsernamePopup = true;
	}

	function closeUsernamePopup() {
		showUsernamePopup = false;
	}

	// New functions to open and close the Create User popup
	function openCreateUserPopup() {
		showCreateUserPopup = true;
	}

	function closeCreateUserPopup() {
		showCreateUserPopup = false;
	}

	// Stop propagation for clicks inside the popup to avoid closing
	function stopClickPropagation(event: MouseEvent) {
		event.stopPropagation();
	}

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

<style>
    .popup-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    }
</style>

<svelte:head>
	<title>Account</title>
</svelte:head>

<section>
	<div>
		<h1>Account</h1>

		{#if user}
			<p style="color: white">Logged in as <b><i>{user.username}</i></b></p>
		{:else}
			<p style="color: red;">User not logged in</p>
		{/if}
	</div>

	<div class="form-group">
		<div class="formcontainer">
			<h2>Change Username</h2>
			<button class="AccountButton" on:click={openUsernamePopup}>Change Username</button>

			<h2>Change Password</h2>
			<button class="AccountButton" on:click={openPasswdPopup}>Change Password</button>

			<h2>Create New User</h2> <!-- New button for user creation -->
			<button class="AccountButton" on:click={openCreateUserPopup}>Create New User</button>

			<h2>Logout</h2>
			<form method="POST" action="?/logout">
				<button class="AccountButton" type="submit" name="logout" value="true">Logout</button>
			</form>
		</div>
	</div>

	<!-- Popup for changing username -->
	{#if showUsernamePopup}
		<div class="popup-overlay" on:click={closeUsernamePopup}>
			<div class="popup-box" on:click={stopClickPropagation}>
				<button class="close" on:click={closeUsernamePopup}>&times;</button>
				<h2>Change your username</h2>
				<form method="POST" action="?/updateUsername">
					<div class="user-box">
						<input type="text" name="username" id="username" autocomplete="username" required>
						<label for="username">New Username</label>
					</div>

					<button type="button" class="submit" style="background-color: red; color: white"
									on:click={closeUsernamePopup}>Abort
					</button>
					<input type="submit" class="submit" style="background-color: green; color: white" value="Update Username">
				</form>
			</div>
		</div>
	{/if}

	<!-- Popup for changing password -->
	{#if showPasswdPopup}
		<div class="popup-overlay" on:click={closePasswdPopup}>
			<div class="popup-box" on:click={stopClickPropagation}>
				<button class="close" on:click={closePasswdPopup}>&times;</button>
				<h2>Change your password</h2>
				<form method="POST" action="?/updatePassword">
					<input type="text" name="username" id="username" autocomplete="username" hidden>
					<!-- Hidden field for accesaibility -->

					<div class="user-box">
						<input type="password" name="OldPassword" id="OldPassword" autocomplete="current-password" required>
						<label for="OldPassword">Old Password</label>
					</div>

					<div class="user-box">
						<input type="password" name="NewPassword" id="NewPassword" autocomplete="new-password" required>
						<label for="NewPassword">New Password</label>
					</div>

					<div class="user-box">
						<input type="password" name="ConfirmPassword" id="ConfirmPassword" autocomplete="new-password" required>
						<label for="ConfirmPassword">Confirm New Password</label>
					</div>

					<button type="button" class="submit" style="background-color: red; color: white" on:click={closePasswdPopup}>
						Abort
					</button>
					<input type="submit" class="submit" style="background-color: green; color: white" value="Update Password">
				</form>
			</div>
		</div>
	{/if}

	<!-- Popup for creating a new user -->
	{#if showCreateUserPopup}
		<div class="popup-overlay" on:click={closeCreateUserPopup}>
			<div class="popup-box" on:click={stopClickPropagation}>
				<button class="close" on:click={closeCreateUserPopup}>&times;</button>
				<h2>Create a New User</h2>
				<!-- Changed method to POST -->
				<form action="?/createUser" method="POST">
					<div class="user-box">
						<input type="text" id="newUsername" name="username" autocomplete="username" bind:value={newUsername}
									 required>
						<label for="newUsername">Username</label>
					</div>

					<div class="user-box">
						<input type="password" id="newPassword" name="password" autocomplete="new-password" bind:value={newPassword}
									 required>
						<label for="newPassword">Password</label>
					</div>

					<div class="user-box">
						<input type="password" id="confirmPassword" name="confirmPassword" autocomplete="new-password"
									 bind:value={confirmPassword} required>
						<label for="confirmPassword">Confirm Password</label>
					</div>

					<button type="button" class="submit" style="background-color: red; color: white"
									on:click={closeCreateUserPopup}>
						Cancel
					</button>
					<input type="submit" class="submit" style="background-color: green; color: white" value="Create User">
				</form>
			</div>
		</div>
	{/if}

</section>
