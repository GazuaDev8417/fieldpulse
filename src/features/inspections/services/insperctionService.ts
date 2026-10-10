import { db } from '@/src/database/client'
import { Inspection, inspections, NewInspection, syncQueue } from '@/src/database/schema'
import { desc, eq } from 'drizzle-orm'



export const inspectionService = {
    async getAll(): Promise<Inspection[]>{
        return await db.select().from(inspections).orderBy(desc(inspections.createdAt))
    },

    async getById(id:string): Promise<Inspection | null>{
        const results = await db.select().from(inspections).where(eq(inspections.id, id))

        return results[0] ?? null
    },

    async create(data: Omit<NewInspection, 'createdAt' | 'updatedAt'>): Promise<Inspection>{
        const now = new Date()
        const newInspection: NewInspection = {
            ...data,
            status: data.status ?? 'draft',
            createdAt: now,
            updatedAt: now
        }

        await db.insert(inspections).values(newInspection)

        await db.insert(syncQueue).values({
            id: `sync_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
            entityType: 'inspection',
            entityId: data.id,
            action: 'create',
            payload: JSON.stringify(newInspection),
            attempts: 0,
            createdAt: now
        })

        return newInspection as Inspection
    },

    async update(id:string, data: Partial<Omit<Inspection, 'id' | 'createdAt'>>): Promise<void>{
        const now = new Date()
        const updatePayload = {
            ...data,
            updatedAt: now
        }

        await db.update(inspections).set(updatePayload).where(eq(inspections.id, id))

        await db.insert(syncQueue).values({
            id: `sync_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
            entityType: 'inspection',
            entityId: id,
            action: 'update',
            payload: JSON.stringify(updatePayload),
            attempts: 0,
            createdAt: now
        })
    },

    async delete(id:string): Promise<void>{
        await db.delete(inspections).where(eq(inspections.id, id))
        
        await db.insert(syncQueue).values({
            id: `sync_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
            entityType: 'inspection',
            entityId: id,
            action: 'delete',
            payload: JSON.stringify({ id }),
            attempts: 0,
            createdAt: new Date(),
        })
    }
}