<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import './styles.css';

	let username: string = '';
	let newUsername: string = '';
	let newPassword: string = '';
	let currentPassword = '';
	let confirmPassword = '';
	let showPasswdPopup = false;
	let showUsernamePopup = false;
	let error: string | null = null;


	async function fetchUser() {
		try {
			const response = await fetch('/api/users');
			if (!response.ok) {
				throw new Error('Failed to fetch user');
			}

			const data = await response.json();
			if (data.username) {
				username = data.username;
			} else {
				error = data.error || 'Unknown error';
			}
		} catch (err) {
			if (err instanceof Error) {
				error = err.message;
			} else {
				error = 'An unknown error occurred';
			}
		}
	}

	async function updateUsername() {
		error = '';

		try {
			const response = await fetch('/api/users', {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ newUsername })
			});

			if (!response.ok) {
				throw new Error(`Error: ${response.status} ${response.statusText}`);
			}

			const result = await response.json();
			if (result.success) {
				newUsername = '';
				await fetchUser();
				closeUsernamePopup();
			} else {
				error = result.error || 'Update failed';
			}
		} catch (err) {
			error = err instanceof Error ? err.message : 'An unknown error occurred';
		} finally {
		}
	}

	async function updatePassword() {
		error = '';

		if (!currentPassword || !newPassword || !confirmPassword) {
			return;
		}

		if (newPassword !== confirmPassword) {
			error = 'New Passwords do not match';
			return;
		}

		try {
			const response = await fetch('/api/users', {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ currentPassword, newPassword })
			});

			if (!response.ok) {
				throw new Error(`Error: ${response.status} ${response.statusText}`);
			}

			const result = await response.json();
			if (result.success) {
				newPassword = '';
				await fetchUser();
				closePasswdPopup();
			} else {
				error = result.error || 'Update failed';
			}
		} catch (err) {
			error = err instanceof Error ? err.message : 'An unknown error occurred';
		} finally {
		}
	}

	async function handleLogout() {
		await fetch('/api/logout', {
			method: 'POST'
		});
		goto('/login');
		location.reload();
	}

	function openPasswdPopup() {
		showPasswdPopup = true;
		if (error) {
			error = null;
		}
	}

	function closePasswdPopup() {
		showPasswdPopup = false;
		if (error) {
			error = null;
		}
	}

	function openUsernamePopup() {
		showUsernamePopup = true;
		if (error) {
			error = null;
		}
	}

	function closeUsernamePopup() {
		showUsernamePopup = false;
		if (error) {
			error = null;
		}
	}

	function handleOverlayClick(event: MouseEvent): void {
		closePasswdPopup();
		closeUsernamePopup();
	}

	onMount(() => {
		fetchUser();
	});
</script>


<title>Account</title>
<section>
	<h1>Account</h1>
	{#if username}
		<h2>Hello, {username}!</h2>

		<button on:click={openUsernamePopup}>Change Username</button>
		<br />
		<button on:click={openPasswdPopup}>Change Password</button>
		<br />
		<button on:click={handleLogout}>Logout</button>

	{/if}
	{#if showUsernamePopup}
		<div class="popup" role="dialog" aria-modal="true" on:click={handleOverlayClick}>
			<div class="container">
				<div class="popup-box" role="document" on:click|stopPropagation>
					<button class="close" on:click={closeUsernamePopup}>✖</button>
					<h2>Change Username</h2>
					<form on:submit|preventDefault={updateUsername}>

						<div class="user-box">
							<input type="text" name="newUsername" autofocus required bind:value={newUsername} />
							<label for="newUsername">New Username</label>
						</div>

						<button type="submit">
							Update
						</button>

						{#if error}
							<p class="error">{error}</p>
						{/if}

					</form>
				</div>
			</div>
		</div>
	{/if}
	<br />
	{#if showPasswdPopup}
		<div class="popup" role="dialog" aria-modal="true" on:click={handleOverlayClick}>
			<div class="container">
				<div class="popup-box" role="document" on:click|stopPropagation>
					<button class="close" on:click={closePasswdPopup}>✖</button>
					<h2>Change Password</h2>
					<form on:submit|preventDefault={updatePassword}>

						<div class="user-box">
							<input type="password" name="oldPasswd" autofocus required bind:value={currentPassword} />
							<label for="oldPasswd">Old Password</label>
						</div>

						<div class="user-box">
							<input type="password" name="newPasswd" required bind:value={newPassword} />
							<label for="newPasswd">New Password</label>
						</div>

						<div class="user-box">
							<input type="password" name="newPasswd2" required bind:value={confirmPassword} />
							<label for="newPasswd2">Confirm New Password</label>
						</div>

						<button type="submit">
							Update
						</button>

						{#if error}
							<p class="error">{error}</p>
						{/if}

					</form>
				</div>
			</div>
		</div>
	{/if}

</section>