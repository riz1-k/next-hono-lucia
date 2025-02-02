import { relations, sql } from 'drizzle-orm';
import { boolean, index, pgEnum, serial, text, timestamp, varchar } from 'drizzle-orm/pg-core';
import { pgTableCreator } from 'drizzle-orm/pg-core';

export const createTable = pgTableCreator(name => `appointment.${name}`);

export const USER_ROLES = ['user', 'admin'] as const;
export const roleEnum = pgEnum('role', USER_ROLES);

export const users = createTable(
    'users',
    {
        id: varchar('id', {
            length: 255,
        })
            .primaryKey()
            .$defaultFn(() => crypto.randomUUID()),
        email: varchar('email', {
            length: 255,
        })
            .notNull()
            .unique(),
        role: roleEnum().notNull(),
        emailVerified: boolean('email_verified').default(false),
        agreedToTerms: boolean('agreed_to_terms').default(false),
        hashedPassword: varchar('hashed_password').default('').notNull(),
        googleId: varchar('google_id', {
            length: 255,
        }).unique(),
        name: varchar('name', {
            length: 255,
        }),
        picture: varchar('picture', {
            length: 512,
        }),
        phoneNumber: varchar('phone_number', { length: 20 }),
        lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
        deletedAt: timestamp('deleted_at', { withTimezone: true }),
        createdAt: timestamp('created_at', { withTimezone: true })
            .default(sql`CURRENT_TIMESTAMP`)
            .notNull(),
        updatedAt: timestamp('updated_at', { withTimezone: true }).$onUpdate(() => new Date()),
    },
    table => [index('email_idx').on(table.email), index('name_idx').on(table.name)]
);
export const emailVerificationCodes = createTable('email_verification_codes', {
    id: serial('id').primaryKey(),
    code: varchar('code', {
        length: 8,
    }).notNull(),
    expiresAt: timestamp('expires_at', {
        withTimezone: true,
        mode: 'date',
    }).notNull(),

    userId: varchar('user_id')
        .notNull()
        .references(() => users.id),
});

export const sessions = createTable('sessions', {
    id: text('id').primaryKey(),
    expiresAt: timestamp('expires_at', {
        withTimezone: true,
        mode: 'date',
    }).notNull(),

    userId: varchar('user_id')
        .notNull()
        .references(() => users.id),
});

export const usersRelations = relations(users, ({ many }) => ({
    emailVerificationCodes: many(emailVerificationCodes),
    sessions: many(sessions),
}));

export const emailVerificationCodesRelations = relations(emailVerificationCodes, ({ one }) => ({
    users: one(users, {
        fields: [emailVerificationCodes.userId],
        references: [users.id],
    }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
    users: one(users, {
        fields: [sessions.userId],
        references: [users.id],
    }),
}));
