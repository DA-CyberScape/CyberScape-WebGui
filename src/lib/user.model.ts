import { JWT_ACCESS_SECRET } from '$env/static/private';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import { db } from '$lib/db';

const loginUser = async (username: string, password: string) => {
	const user = await db.user.findUnique({
		where: {
			username
		}
	});

	if (!user) {
		return {
			error: 'Invalid Username'
		};
	}

	const passwordIsValid = await bcrypt.compare(password, user.password);

	if (!passwordIsValid) {
		return {
			error: 'Wrong Password'
		};
	}

	const jwtUser = {
		id: user.id,
		username: user.username
	};

	const token = jwt.sign(jwtUser, JWT_ACCESS_SECRET, {
		expiresIn: '1d'
	});

	return { token };
};

export { loginUser };
