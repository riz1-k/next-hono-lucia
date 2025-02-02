import { db } from '@/services/db';
import { USER_ROLES, users } from '@/services/db/schema';
import { eq } from 'drizzle-orm';

export async function createUser(
    googleId: string,
    email: string,
    name: string,
    picture: string,
    role: (typeof USER_ROLES)[number]
) {
    const newUser = (
        await db
            .insert(users)
            .values({
                googleId,
                email,
                name,
                picture,
                emailVerified: true,
                role,
            })
            .returning({
                id: users.id,
                googleId: users.googleId,
                email: users.email,
                name: users.name,
            })
    ).at(0);
    if (!newUser) {
        throw new Error('Unexpected error');
    }
    return newUser;
}

export async function getUserFromGoogleId(googleId: string) {
    const user = await db.query.users.findFirst({
        where: eq(users.googleId, googleId),
        columns: {
            id: true,
            googleId: true,
            email: true,
            name: true,
            picture: true,
        },
    });
    if (!user) {
        return null;
    }
    return user;
}
