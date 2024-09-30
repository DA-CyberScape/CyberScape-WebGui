export interface User {
	username: string;
	password: string;
	token: string;
}

export const users: User[] = [
	{ username: 'admin', password: 'admin', token: 'admin-token' },
	{ username: 'user1', password: 'user1', token: 'user1-token' },
	{ username: 'user2', password: 'user2', token: 'user2-token' }
];

export function findUserByToken(token: string): User | undefined {
	return users.find(user => user.token === token);
}

export function findUserByUsername(username: string): User | undefined {
	return users.find(user => user.username === username);
}

export function addUser(user: User): void {
	users.push(user);
}

export function updateUser(oldUsername: string, newUsername: string, newPassword: string): boolean {
	const user = findUserByUsername(oldUsername);
	if (user) {
		user.username = newUsername;
		user.password = newPassword;
		return true;
	}
	return false;
}

export function verifyPassword(username: string, inputPassword: string): boolean {
	const user = findUserByUsername(username);
	if (!user) {
		return false;
	}
	return inputPassword == user.password;
}
