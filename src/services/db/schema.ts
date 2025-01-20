import { relations, sql } from 'drizzle-orm';
import {
    boolean,
    numeric,
    pgEnum,
    pgTable,
    serial,
    text,
    timestamp,
    varchar,
} from 'drizzle-orm/pg-core';

export const USER_ROLES = ["user", "admin"] as const;
export const roleEnum = pgEnum('role', USER_ROLES);

export const PAYMENT_TYPES = ["online", "offline"] as const;
export const paymentTypeEnum = pgEnum('payment_type', PAYMENT_TYPES);

export const users = pgTable(
    'users',
    {
        id: varchar('id', {
            length: 255,
        })
            .primaryKey()
            .$defaultFn(() => crypto.randomUUID()),
        email: varchar('email', {
            length: 255,
        }).notNull(),
        role: roleEnum().notNull(),
        emailVerified: boolean('email_verified').default(false),
        agreedToTerms: boolean('agreed_to_terms').default(false),
        hashedPassword: varchar('hashed_password').default('').notNull(),
        googleId: varchar('google_id', {
            length: 255,
        }),
        name: varchar('name', {
            length: 255,
        }),
        picture: varchar('picture', {
            length: 255,
        }),
        createdAt: timestamp("created_at", { withTimezone: true })
            .default(sql`CURRENT_TIMESTAMP`)
            .notNull(),
        updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
            () => new Date()
        ),
    },
);

export const appointments = pgTable('appointments', {
    id: varchar('id', {
        length: 255,
    }).primaryKey().$defaultFn(() => crypto.randomUUID()),
    startTime: timestamp('start_time', {
        withTimezone: true,
        mode: 'date',
    }).notNull(),
    endTime: timestamp('end_time', {
        withTimezone: true,
        mode: 'date',
    }).notNull(),
    appointmentPrice: numeric('appointment_price', {
        precision: 2,
    }).notNull(),
    creator: varchar('creator', {
        length: 255,
    }).notNull().references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true })
        .default(sql`CURRENT_TIMESTAMP`)
        .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
        () => new Date()
    ),
});

export const appointmentSlots = pgTable('appointment_slots', {
    id: varchar('id', {
        length: 255,
    }).primaryKey().$defaultFn(() => crypto.randomUUID()),
    appointmentId: varchar('appointment_id', {
        length: 255,
    }).notNull().references(() => appointments.id),
    patientId: varchar('patient_id', {
        length: 255,
    }).notNull().references(() => users.id),
    startTime: timestamp('start_time', {
        withTimezone: true,
        mode: 'date',
    }).notNull(),
    endTime: timestamp('end_time', {
        withTimezone: true,
        mode: 'date',
    }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
        .default(sql`CURRENT_TIMESTAMP`)
        .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
        () => new Date()
    ),
});
export const payments = pgTable('payments', {
    id: varchar('id', {
        length: 255,
    }).primaryKey().$defaultFn(() => crypto.randomUUID()),
    payer: varchar('payer', {
        length: 255,
    }).notNull().references(() => users.id),
    paymentType: paymentTypeEnum().notNull(),
    slotId: varchar('slot_id', {
        length: 255,
    }).notNull().references(() => appointmentSlots.id),
    paidAmount: numeric('paid_amount', {
        precision: 2,
    }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
        .default(sql`CURRENT_TIMESTAMP`)
        .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
        () => new Date()
    ),
});

export const emailVerificationCodes = pgTable('email_verification_codes', {
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

export const sessions = pgTable('sessions', {
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

export const appointmentsRelations = relations(appointments, ({ one, many }) => ({
    creator: one(users, {
        fields: [appointments.creator],
        references: [users.id],
    }),
    patients: many(users),
    payments: many(payments),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
    slot: one(appointmentSlots, {
        fields: [payments.slotId],
        references: [appointmentSlots.id],
    }),
    users: one(users, {
        fields: [payments.payer],
        references: [users.id],
    }),
}));
