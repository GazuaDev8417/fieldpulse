import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core'


export const inspections = sqliteTable('inspections', {
    id: text('id').primaryKey(),
    title: text('title').notNull(),
    description: text('description'),
    status: text('status', { enum: ['draft', 'pending_sync', 'synced'] }).default('draft').notNull(),
    latitude: real('latitude'),
    longitude: real('longitude'),
    photoUri: text('photo_uri'),
    signatureUri: text('signature_uri'),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
})

export const syncQueue = sqliteTable('sync_queue', {
    id: text('id').primaryKey(),
    entityType: text('entity_type').notNull(), // ex: 'inspection'
    entityId: text('entity_id').notNull(),
    action: text('action', { enum: ['create', 'update', 'delete'] }).notNull(),
    payload: text('payload').notNull(), // JSON serializado
    attempts: integer('attempts').default(0).notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
})

export type Inspection = typeof inspections.$inferSelect
export type NewInspection = typeof inspections.$inferInsert
export type SyncItem = typeof syncQueue.$inferSelect