import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const db = new PrismaClient();

// Create the admin user if it doesn't exist
async function createAdminUser() {
	const existingUser = await db.user.findUnique({
		where: { username: 'admin' }
	});

	if (!existingUser) {
		const hashedPassword = await bcrypt.hash('admin', 10);
		await db.user.create({
			data: {
				username: 'admin',
				password: hashedPassword
			}
		});
		console.log('Admin user created');
	} else {
		console.log('Admin user already exists');
	}
}

// The function to create a user
export async function createUser(
	username: string,
	password: string
): Promise<{ success?: string; error?: string }> {
	try {
		// Check if the user already exists
		const existingUser = await db.user.findUnique({
			where: { username }
		});

		// If the username already exists, return an error message
		if (existingUser) {
			return { error: `User with username '${username}' already exists.` };
		}

		// Hash the password for storage
		const hashedPassword = await bcrypt.hash(password, 10);

		// Create the new user in the database
		await db.user.create({
			data: {
				username,
				password: hashedPassword
			}
		});

		// Return success message
		return { success: `User '${username}' created successfully.` };
	} catch (error) {
		// Catch unexpected errors and log them
		console.error('Error occurred while creating user:', error);

		// Return a general error message
		return { error: 'An error occurred while creating the user. Please try again later.' };
	}
}

// Run the admin user creation logic
createAdminUser()
	.catch((e) => console.error(e))
	.finally(() => db.$disconnect());

// Export db and createUser function
export { db };
