import { pgEnum } from 'drizzle-orm/pg-core';

export const USER_ROLES = ["user", "admin"] as const;
export const roleEnum = pgEnum('role', USER_ROLES);

export const APPOINTMENT_STATUS = ["active", "completed", "cancelled"] as const;
export const appointmentStatusEnum = pgEnum('appointment_status', APPOINTMENT_STATUS);

export const SLOT_STATUS = ["booked", "completed", "cancelled"] as const;
export const slotStatusEnum = pgEnum('slot_status', SLOT_STATUS);

export const PAYMENT_TYPES = ["online", "offline"] as const;
export const paymentTypeEnum = pgEnum('payment_type', PAYMENT_TYPES);

export const PAYMENT_STATUS = ["pending", "completed", "failed", "refunded"] as const;
export const paymentStatusEnum = pgEnum('payment_status', PAYMENT_STATUS);

export const PAYMENT_PROCESSORS = ["razorpay"] as const;
export const paymentProcessorEnum = pgEnum('payment_processor', PAYMENT_PROCESSORS);

