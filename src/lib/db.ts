import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const db = new PrismaClient();

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

createAdminUser()
	.catch((e) => console.error(e))
	.finally(() => db.$disconnect());

export { db };
