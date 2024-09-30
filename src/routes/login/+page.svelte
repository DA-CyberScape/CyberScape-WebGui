<script lang="ts">
	import { goto } from '$app/navigation';
	import './styles.css';

	let username: string = '';
	let password: string = '';
	let error: string = '';
	let loading: boolean = false;

	async function handleSubmit(event: Event) {
		event.preventDefault();
		loading = true;
		error = '';

		try {
			const response = await fetch('/api/login', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ username, password })
			});

			if (!response.ok) {
				throw new Error('Incorrect username or password');
			}

			const redirectTo = new URLSearchParams(window.location.search).get('redirectTo') || '/';
			goto(redirectTo);
			location.reload();
		} catch (err) {
			if (err instanceof Error) {
				error = err.message;
			} else {
				error = 'An unknown error occurred';
			}
		} finally {
			loading = false;
		}
	}
</script>

<title>Login</title>

<div class="login-page">
	<div class="container">
		<div class="popup-box">
			<h2>Sign In</h2>
			<form on:submit|preventDefault={handleSubmit}>
				<div class="user-box">
					<input type="text" name="username" autofocus required bind:value={username} />
					<label for="username">Username</label>
				</div>
				<div class="user-box">
					<input type="password" name="password" required bind:value={password} />
					<label for="password">Password</label>
				</div>
				<button type="submit" disabled={loading}>
					{#if loading}
						<span class="loading">Loading...</span>
					{:else}
						Login
					{/if}
				</button>
				{#if error}
					<p class="error">{error}</p>
				{/if}
			</form>
		</div>
	</div>
</div>