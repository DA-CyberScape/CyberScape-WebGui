import type { PageServerLoad, Actions } from './$types';
import { redirect, fail } from '@sveltejs/kit';
import { loginUser } from '$lib/user.model';

export const load: PageServerLoad = (event: any) => {
	const user = event.locals.user;

	console.log('Load function: Checking user session...');

	if (user) {
		console.log('User found in session. Redirecting to home page.');
		throw redirect(302, '/?reload=true');
	}
};

export const actions: Actions = {
	default: async (event) => {
		console.log('Login action started. Parsing form data...');

		// Extract form data from the request
		const formData = Object.fromEntries(await event.request.formData());
		console.log('Form data received:', formData);

		// Check if the form has both username and password fields
		if (!formData.username || !formData.password) {
			console.log('Missing username or password.');
			return fail(400, {
				error: 'Missing username or password'
			});
		}

		// Destructure username and password from the form data
		const { username, password } = formData as { username: string; password: string };
		console.log(`Attempting to log in with username: ${username}`);

		// Call the loginUser function to validate the user credentials
		const { error, token } = await loginUser(username, password);
		console.log('LoginUser response:', { error, token });

		// If there is an error (invalid credentials), return 401 Unauthorized
		if (error) {
			console.log('Login failed:', error);
			return fail(401, {
				error
			});
		}

		// If login is successful, set the token in the cookies
		console.log('Login successful. Setting AuthorizationToken cookie.');
		event.cookies.set('AuthorizationToken', `Bearer ${token}`, {
			httpOnly: true,
			path: '/',
			sameSite: 'none',
			secure: false, // For local dev purposes; set to true in production
			maxAge: 60 * 60 * 24 // Cookie expires in 1 day
		});

		// Redirect to the homepage with a reload query parameter
		console.log('Redirecting to homepage with reload=true.');
		throw redirect(302, '/?reload=true');
	}
};
