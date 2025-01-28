import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

const db = new PrismaClient();

export const actions: Actions = {
	// Action to handle username update
	updateUsername: async (event) => {
		const { user } = event.locals;

		// Ensure the user is logged in
		if (!user) {
			return fail(400, { error: 'You must be logged in to update your username.' });
		}

		const formData = await event.request.formData();
		const newUsername = formData.get('username')?.toString();

		// Validate the new username
		if (!newUsername || newUsername.trim().length === 0) {
			return fail(400, { error: 'New username cannot be empty.' });
		}

		// Check if the username is already taken
		const existingUser = await db.user.findUnique({ where: { username: newUsername } });
		if (existingUser) {
			return fail(400, { error: 'Username is already taken.' });
		}

		// Update the username in the database
		await db.user.update({
			where: { id: user.id },
			data: { username: newUsername }
		});

		throw redirect(302, '/Account');
	},
	// Action to handle password update
	updatePassword: async (event) => {
		const { user } = event.locals;

		// Ensure the user is logged in
		if (!user) {
			return fail(400, { error: 'You must be logged in to update your password.' });
		}

		// Retrieve form data
		const formData = await event.request.formData();
		const oldPassword = formData.get('OldPassword')?.toString();
		const newPassword = formData.get('NewPassword')?.toString();
		const confirmPassword = formData.get('ConfirmPassword')?.toString();

		// Validate passwords
		if (!oldPassword || !newPassword || !confirmPassword) {
			return fail(400, { error: 'All password fields are required.' });
		}

		// Verify the old password
		const userRecord = await db.user.findUnique({ where: { id: user.id } });
		if (!userRecord || !(await bcrypt.compare(oldPassword, userRecord.password))) {
			return fail(400, { error: 'Incorrect old password.' });
		}

		// Ensure new passwords match
		if (newPassword !== confirmPassword) {
			return fail(400, { error: 'New password and confirmation password do not match.' });
		}

		// Hash the new password and update it in the database
		const hashedPassword = await bcrypt.hash(newPassword, 10);
		await db.user.update({
			where: { id: user.id },
			data: { password: hashedPassword }
		});

		return { success: 'Your password has been updated successfully.' };
	},

	logout: async ({ cookies }) => {
		console.log('Logout action triggered');
		cookies.delete('AuthorizationToken', { path: '/' });

		console.log('Cookie deleted');
		throw redirect(302, '/login');
	}
};
