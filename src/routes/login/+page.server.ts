import type { PageServerLoad, Actions } from './$types';
import { redirect, fail } from '@sveltejs/kit';
import { loginUser } from '$lib/user.model';

export const load: PageServerLoad = (event: any) => {
	const user = event.locals.user;

	if (user) {
		throw redirect(302, '/home?reload=true');
	}
};

export const actions: Actions = {
	default: async (event) => {
		const formData = Object.fromEntries(await event.request.formData());

		if (!formData.username || !formData.password) {
			return fail(400, {
				error: 'Missing username or password'
			});
		}

		const { username, password } = formData as { username: string; password: string };
		console.log(`Attempting to log in with username: ${username}`);

		const { error, token } = await loginUser(username, password);

		if (error) {
			console.log('Login failed:', error);
			return fail(401, {
				error
			});
		}

		console.log('Login successful as:', username);
		event.cookies.set('AuthorizationToken', `Bearer ${token}`, {
			httpOnly: true,
			path: '/',
			sameSite: 'lax',
			secure: false,
			maxAge: 60 * 60 * 24
		});
		console.log('Set-Cookie Header:', event.cookies.getAll());

		throw redirect(302, '/home?reload=true');
	}
};
