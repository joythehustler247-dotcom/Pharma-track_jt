import {
  pgTable,
  pgEnum,
  text,
  varchar,
  integer,
  boolean,
  timestamp,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { createId } from '@paralleldrive/cuid2'

export const actorRoleEnum = pgEnum('role', [
  'MANUFACTURER',
  'DISTRIBUTOR',
  'PHARMACY',
  'ADMIN',
])

export const batchStatusEnum = pgEnum('batch_status', [
  'MANUFACTURED',
  'WITH_DISTRIBUTOR',
  'WITH_PHARMACY',
  'PARTIALLY_SOLD',
  'FULLY_SOLD',
])

export const eventTypeEnum = pgEnum('event_type', [
  'MANUFACTURED',
  'DISTRIBUTOR_RECEIVED',
  'PHARMACY_RECEIVED',
  'SOLD',
])

export const actors = pgTable('actors', {
  id:            text('id').primaryKey().$defaultFn(() => createId()),
  walletAddress: varchar('wallet_address', { length: 42 }).notNull().unique(),
  role:          actorRoleEnum('role').notNull(),
  name:          varchar('name', { length: 100 }).notNull(),
  licenseNumber: varchar('license_number', { length: 50 }),
  city:          varchar('city', { length: 100 }),
  isVerified:    boolean('is_verified').default(false).notNull(),
  createdAt:     timestamp('created_at').defaultNow().notNull(),
})

export const batches = pgTable('batches', {
  id:              text('id').primaryKey().$defaultFn(() => createId()),
  onChainId:       varchar('on_chain_id', { length: 66 }).notNull().unique(),
  medicineName:    varchar('medicine_name', { length: 100 }).notNull(),
  batchNumber:     varchar('batch_number', { length: 50 }).notNull(),
  manufactureDate: timestamp('manufacture_date').notNull(),
  expiryDate:      timestamp('expiry_date').notNull(),
  totalStrips:     integer('total_strips').notNull(),
  status:          batchStatusEnum('status').default('MANUFACTURED').notNull(),
  qrImageUrl:      text('qr_image_url'),
  txHash:          varchar('tx_hash', { length: 66 }),
  isExpired:       boolean('is_expired').default(false).notNull(),
  isFlagged:       boolean('is_flagged').default(false).notNull(),
  manufacturerId:  text('manufacturer_id')
                     .notNull()
                     .references(() => actors.id),
  createdAt:       timestamp('created_at').defaultNow().notNull(),
})

export const strips = pgTable('strips', {
  id:               text('id').primaryKey().$defaultFn(() => createId()),
  onChainId:        varchar('on_chain_id', { length: 66 }).notNull().unique(),
  stripNumber:      integer('strip_number').notNull(),
  tabletsTotal:     integer('tablets_total').notNull(),
  tabletsRemaining: integer('tablets_remaining').notNull(),
  qrImageUrl:       text('qr_image_url'),
  isSold:           boolean('is_sold').default(false).notNull(),
  batchId:          text('batch_id')
                      .notNull()
                      .references(() => batches.id),
  createdAt:        timestamp('created_at').defaultNow().notNull(),
})

export const supplyChainEvents = pgTable('supply_chain_events', {
  id:        text('id').primaryKey().$defaultFn(() => createId()),
  eventType: eventTypeEnum('event_type').notNull(),
  actorName: varchar('actor_name', { length: 100 }).notNull(),
  actorCity: varchar('actor_city', { length: 100 }),
  txHash:    varchar('tx_hash', { length: 66 }),
  batchId:   text('batch_id')
               .notNull()
               .references(() => batches.id),
  actorId:   text('actor_id')
               .references(() => actors.id),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
})

export const saleTokens = pgTable('sale_tokens', {
  id:          text('id').primaryKey().$defaultFn(() => createId()),
  onChainId:   varchar('on_chain_id', { length: 66 }).notNull().unique(),
  tabletsSold: integer('tablets_sold').notNull(),
  qrImageUrl:  text('qr_image_url'),
  txHash:      varchar('tx_hash', { length: 66 }),
  stripId:     text('strip_id')
                 .notNull()
                 .references(() => strips.id),
  pharmacyId:  text('pharmacy_id')
                 .notNull()
                 .references(() => actors.id),
  createdAt:   timestamp('created_at').defaultNow().notNull(),
})

export const counterfeitReports = pgTable('counterfeit_reports', {
  id:          text('id').primaryKey().$defaultFn(() => createId()),
  reportedQR:  text('reported_qr').notNull(),
  reporterIP:  varchar('reporter_ip', { length: 45 }),
  city:        varchar('city', { length: 100 }),
  batchId:     text('batch_id')
                 .references(() => batches.id),
  createdAt:   timestamp('created_at').defaultNow().notNull(),
})

export const authNonces = pgTable('auth_nonces', {
  id:            text('id').primaryKey().$defaultFn(() => createId()),
  walletAddress: varchar('wallet_address', { length: 42 }).notNull(),
  nonce:         varchar('nonce', { length: 100 }).notNull(),
  expiresAt:     timestamp('expires_at').notNull(),
  createdAt:     timestamp('created_at').defaultNow().notNull(),
})

export const actorsRelations = relations(actors, ({ many }) => ({
  batches:    many(batches),
  events:     many(supplyChainEvents),
  saleTokens: many(saleTokens),
}))

export const batchesRelations = relations(batches, ({ one, many }) => ({
  manufacturer: one(actors, {
    fields:     [batches.manufacturerId],
    references: [actors.id],
  }),
  strips:  many(strips),
  events:  many(supplyChainEvents),
  reports: many(counterfeitReports),
}))

export const stripsRelations = relations(strips, ({ one, many }) => ({
  batch: one(batches, {
    fields:     [strips.batchId],
    references: [batches.id],
  }),
  saleTokens: many(saleTokens),
}))

export const supplyChainEventsRelations = relations(supplyChainEvents, ({ one }) => ({
  batch: one(batches, {
    fields:     [supplyChainEvents.batchId],
    references: [batches.id],
  }),
  actor: one(actors, {
    fields:     [supplyChainEvents.actorId],
    references: [actors.id],
  }),
}))

export const saleTokensRelations = relations(saleTokens, ({ one }) => ({
  strip: one(strips, {
    fields:     [saleTokens.stripId],
    references: [strips.id],
  }),
  pharmacy: one(actors, {
    fields:     [saleTokens.pharmacyId],
    references: [actors.id],
  }),
}))

export const counterfeitReportsRelations = relations(counterfeitReports, ({ one }) => ({
  batch: one(batches, {
    fields:     [counterfeitReports.batchId],
    references: [batches.id],
  }),
}))

export type ActorInsert        = typeof actors.$inferInsert
export type ActorSelect        = typeof actors.$inferSelect
export type BatchInsert        = typeof batches.$inferInsert
export type BatchSelect        = typeof batches.$inferSelect
export type StripInsert        = typeof strips.$inferInsert
export type StripSelect        = typeof strips.$inferSelect
export type SaleTokenInsert    = typeof saleTokens.$inferInsert
export type SaleTokenSelect    = typeof saleTokens.$inferSelect
export type EventInsert        = typeof supplyChainEvents.$inferInsert
export type EventSelect        = typeof supplyChainEvents.$inferSelect
export type ReportInsert       = typeof counterfeitReports.$inferInsert
export type NonceInsert        = typeof authNonces.$inferInsert
