import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

const db = new PrismaClient();

export const actions: Actions = {
	// Action to handle user update (username and/or password change)
	update: async (event) => {
		const { user } = event.locals;
		if (!user) {
			return fail(400, { error: 'You must be logged in to update your account.' });
		}

		const formData = await event.request.formData();
		const newUsername = formData.get('newUsername')?.toString();
		const newPassword = formData.get('newPassword')?.toString();

		const updateData: { username?: string; password?: string } = {};

		// Check for a new username
		if (newUsername) {
			const existingUser = await db.user.findUnique({ where: { username: newUsername } });
			if (existingUser) {
				return fail(400, { error: 'Username is already taken.' });
			}
			updateData.username = newUsername;
		}

		// Check for a new password
		if (newPassword) {
			updateData.password = await bcrypt.hash(newPassword, 10);
		}

		// Update the user's data in the database
		await db.user.update({
			where: { id: user.id },
			data: updateData
		});

		return { success: 'Your account has been updated successfully.' };
	},

	// Action to handle logging out
	logout: async (event) => {
		// Delete the AuthorizationToken cookie to log the user out
		event.cookies.delete('AuthorizationToken', { path: '/' });

		// Redirect the user to the login page
		throw redirect(302, '/login');
	}
};
