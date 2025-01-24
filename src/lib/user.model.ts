import { JWT_ACCESS_SECRET } from '$env/static/private';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import { db } from '$lib/db';

const loginUser = async (username: string, password: string) => {
	console.log('Starting login process...');

	// Step 1: Find the user from the database by username
	const user = await db.user.findUnique({
		where: {
			username
		}
	});

	if (!user) {
		console.log('Error: User not found in the database');
		return {
			error: 'Invalid Username'
		};
	}

	console.log('User found in the database:', user);

	// Step 2: Log the password inputs for debugging purposes
	console.log('User input password:', password);
	console.log('Stored password hash:', user.password);

	// Step 3: Compare passwords
	const passwordIsValid = await bcrypt.compare(password, user.password);

	if (!passwordIsValid) {
		console.log('Error: Invalid password');
		return {
			error: 'Wrong Password'
		};
	}

	console.log('Password is valid');

	// Step 4: Create JWT token
	const jwtUser = {
		id: user.id,
		username: user.username
	};

	console.log('Creating JWT token for user:', jwtUser);
	const token = jwt.sign(jwtUser, JWT_ACCESS_SECRET, {
		expiresIn: '1d'
	});

	console.log('JWT token created:', token);

	return { token };
};

export { loginUser };
