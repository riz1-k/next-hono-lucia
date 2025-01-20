import { relations, sql } from 'drizzle-orm';
import {
    boolean,
    index,
    numeric,
    serial,
    text,
    timestamp,
    varchar,
} from 'drizzle-orm/pg-core';
import { pgTableCreator } from 'drizzle-orm/pg-core';
import { roleEnum, appointmentStatusEnum, slotStatusEnum, paymentTypeEnum, paymentStatusEnum, paymentProcessorEnum } from './db-enums';

export const createTable = pgTableCreator(name => `appointment.${name}`);

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
        }).notNull().unique(),
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
        createdAt: timestamp("created_at", { withTimezone: true })
            .default(sql`CURRENT_TIMESTAMP`)
            .notNull(),
        updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
            () => new Date()
        ),
    },
    (table) => ({
        emailIdx: index('email_idx').on(table.email),
        nameIdx: index('name_idx').on(table.name),
    })
);

export const appointments = createTable('appointments', {
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
    appointmentFee: numeric('appointment_fee', {
        precision: 2,
    }).notNull(),
    status: appointmentStatusEnum().notNull(),
    creator: varchar('creator', {
        length: 255,
    }).notNull().references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true })
        .default(sql`CURRENT_TIMESTAMP`)
        .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
        () => new Date()
    ),
}, (table) => ({
    timeIdx: index('appointment_time_idx').on(table.startTime, table.endTime),
    statusIdx: index('appointment_status_idx').on(table.status),
}));

export const appointmentSlots = createTable('appointment_slots', {
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
    status: slotStatusEnum().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
        .default(sql`CURRENT_TIMESTAMP`)
        .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
        () => new Date()
    ),
}, (table) => ({
    slotTimeIdx: index('slot_time_idx').on(table.startTime, table.endTime),
}));

export const payments = createTable('payments', {
    id: varchar('id', { length: 255 })
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    payer: varchar('payer', { length: 255 })
        .notNull()
        .references(() => users.id),
    paymentType: paymentTypeEnum('payment_type').notNull(),
    paymentStatus: paymentStatusEnum('payment_status')
        .notNull()
        .default('pending'),
    slotId: varchar('slot_id', { length: 255 })
        .notNull()
        .references(() => appointmentSlots.id),
    paidAmount: numeric('paid_amount', { precision: 10, scale: 2 }).notNull(),
    transactionId: varchar('transaction_id', { length: 255 }),
    paymentProcessor: paymentProcessorEnum('payment_processor').notNull(),
    paymentMetadata: text('payment_metadata'),
    refundAmount: numeric('refund_amount', { precision: 10, scale: 2 }),
    refundReason: text('refund_reason'),
    createdAt: timestamp("created_at", { withTimezone: true })
        .default(sql`CURRENT_TIMESTAMP`)
        .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
        .default(sql`CURRENT_TIMESTAMP`)
        .notNull(),
}, (table) => ({
    statusIdx: index('payment_status_idx').on(table.paymentStatus),
    transactionIdx: index('transaction_id_idx').on(table.transactionId),
}));

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
    createdAppointments: many(appointments, { relationName: 'createdAppointments' }),
    bookedAppointments: many(appointmentSlots, { relationName: 'bookedAppointments' }),
    payments: many(payments),
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
