import { json, type RequestHandler } from '@sveltejs/kit';
import cookie from 'cookie';
import { users, findUserByToken, findUserByUsername, updateUser, verifyPassword } from '$lib/users';


export const GET: RequestHandler = async ({ request }) => {
	const cookies = request.headers.get('cookie') || '';
	const cookiesParsed = cookie.parse(cookies);
	const token = cookiesParsed['authToken'];

	if (!token) {
		return json({ error: 'Not authenticated' }, { status: 401 });
	}

	const user = findUserByToken(token);

	if (user) {
		return json({ username: user.username });
	} else {
		return json({ error: 'Invalid token' }, { status: 401 });
	}
};

export const PUT: RequestHandler = async ({ request }) => {
	const cookies = request.headers.get('cookie') || '';
	const cookiesParsed = cookie.parse(cookies);
	const token = cookiesParsed['authToken'];

	if (!token) {
		return json({ error: 'Not authenticated' }, { status: 401 });
	}

	const user = findUserByToken(token);

	if (!user) {
		return json({ error: 'Invalid token' }, { status: 401 });
	}

	const { currentPassword, newUsername, newPassword } = await request.json();

	if (newPassword) {
		if (!currentPassword) {
			return json({ error: 'Current password is required to change the password' }, { status: 400 });
		}

		const passwordMatches = verifyPassword(user.username, currentPassword);

		if (!passwordMatches) {
			return json({ error: 'Incorrect current password' }, { status: 403 });
		}
	}

	// Perform the update, preserving the old username or password if not provided
	const success = updateUser(user.username, newUsername || user.username, newPassword || user.password);

	if (success) {
		return json({ success: true });
	} else {
		return json({ error: 'Update failed' }, { status: 400 });
	}
};
