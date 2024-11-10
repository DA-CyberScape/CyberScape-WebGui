import type { PageServerLoad, Actions } from './$types';
import { redirect, fail } from '@sveltejs/kit';
import { loginUser } from '$lib/user.model';

export const load: PageServerLoad = (event: any) => {
	const user = event.locals.user;

	console.log('user loginpage:', user);

	if (user) {
		throw redirect(302, '/?reload=true');
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

		const { error, token } = await loginUser(username, password);

		if (error) {
			return fail(401, {
				error
			});
		}

		// Set the cookie
		event.cookies.set('AuthorizationToken', `Bearer ${token}`, {
			httpOnly: true,
			path: '/',
			sameSite: 'strict',
			maxAge: 60 * 60 * 24 // 1 day
		});

		throw redirect(302, '/?reload=true');
	}
};
