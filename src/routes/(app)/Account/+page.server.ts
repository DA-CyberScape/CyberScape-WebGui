import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { createUser as createNewUser } from '$lib/db'; // Importing the createUser function

const db = new PrismaClient();

export const actions: Actions = {
	// Action to update username
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

		// Skip update if the new username is the same as the current one
		if (newUsername === user.username) {
			return { success: 'Your username is already set to that.' };
		}

		// Update the username in the database
		await db.user.update({
			where: { id: user.id },
			data: { username: newUsername }
		});

		// Redirect after successful update
		throw redirect(302, '/Account');
	},

	// Action to update password
	updatePassword: async (event) => {
		const { user } = event.locals;

		// Ensure the user is logged in
		if (!user) {
			return fail(400, { error: 'You must be logged in to update your password.' });
		}

		const formData = await event.request.formData();
		const oldPassword = formData.get('OldPassword')?.toString();
		const newPassword = formData.get('NewPassword')?.toString();
		const confirmPassword = formData.get('ConfirmPassword')?.toString();

		// Validate password fields
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

	// Action to create a new user
	createUser: async ({ request }) => {
		const formData = await request.formData();
		const username = formData.get('username')?.toString();
		const password = formData.get('password')?.toString();
		const confirmPassword = formData.get('confirmPassword')?.toString();

		// Validate fields
		if (!username || !password || !confirmPassword) {
			return fail(400, { error: 'All fields are required.' });
		}

		// Check if passwords match
		if (password !== confirmPassword) {
			return fail(400, { error: 'Passwords do not match.' });
		}

		// Check if the username already exists
		const existingUser = await db.user.findUnique({ where: { username } });
		if (existingUser) {
			return fail(400, { error: 'Username is already taken.' });
		}

		// Use the createUser function from $lib/db
		try {
			const result = await createNewUser(username, password);
			if (result.error) {
				return fail(400, { error: result.error });
			}
			return { success: 'User created successfully.' };
		} catch (error) {
			return fail(500, { error: 'An error occurred while creating the user.' });
		}
	},

	// Action to log out
	logout: async ({ cookies }) => {
		// Delete the authorization token
		cookies.delete('AuthorizationToken', {
			httpOnly: true,
			path: '/',
			sameSite: 'lax',
			secure: false // Set to true in production
		});

		// Redirect to login page after logout
		throw redirect(302, '/login');
	}
};
