import { json, type RequestHandler } from '@sveltejs/kit';
import cookie from 'cookie';
import { findUserByUsername } from '$lib/users';

export const POST: RequestHandler = async ({ request }) => {
	const { username, password } = await request.json();
	const user = findUserByUsername(username);

	if (user && user.password === password) {
		const token = user.token;
		console.log('Token in login api:', token);
		return json(
			{ token },
			{
				headers: {
					'Set-Cookie': cookie.serialize('authToken', token, {
						httpOnly: true,
						path: '/',
						maxAge: 60 * 60
					})
				}
			}
		);
	} else {
		return json({ error: 'Incorrect username or password.' }, { status: 401 });
	}
};
