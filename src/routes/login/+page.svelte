<script lang="ts">
	import './styles.css';
	import type { ActionData } from './$types';
	import { enhance } from '$app/forms';

	export let form: ActionData;
</script>

<title>Login</title>

<div class="login-page">
	<div class="container">
		<div class="popup-box">
			<h2>Sign In</h2>
			<form method="post" use:enhance>
				<div class="user-box">
					<input
						type="text"
						name="username"
						id="username"
						aria-invalid={form?.error ? 'true' : 'false'}
						autofocus
						autocomplete="username"
						required
					/>
					<label for="username">Username</label>
				</div>
				<div class="user-box">
					<input
						type="password"
						name="password"
						id="password"
						aria-invalid={form?.error ? 'true' : 'false'}
						autocomplete="current-password"
						required
					/>
					<label for="password">Password</label>
				</div>
				<button type="submit">Login</button>
				{#if form?.error}
					<div class="notice error" aria-live="polite">
						{form.error}
					</div>
				{/if}
			</form>
		</div>
	</div>
</div>
