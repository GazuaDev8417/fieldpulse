import { db } from '@/src/database/client'
import { Inspection, inspections, NewInspection, syncQueue } from '@/src/database/schema'
import { apiClient } from '@/src/services/apiClient'
import { desc, eq } from 'drizzle-orm'





export type RemoteInspection = {
  id: string
  title: string
  description: string | null
  latitude: number | null
  longitude: number | null
  photoUrl: string | null
  signatureUrl: string | null
  status: string
  organizationId: string
  createdById: string
}



export async function createRemoteInspection(data: {
    title: string
    description?: string | null
    latitude?: number | null
    longitude?: number | null
}){
    return apiClient.post<RemoteInspection>('/inspections', {
        title: data.title,
        description: data.description ?? null,
        latitude: data.latitude ?? null,
        longitude: data.longitude ?? null
    }, true)
}

export async function getRemoteInspections(){
    return apiClient.get<RemoteInspection[]>(
        '/inspections',
        true
    )
}

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
        const localInspection = await this.getById(id)

        if(localInspection?.remoteId){
            await apiClient.delete(
                `/inspections/${localInspection.remoteId}`,
                true
            )
        }

        await db.delete(inspections).where(eq(inspections.id, id))
        
        await db.insert(syncQueue).values({
            id: `sync_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
            entityType: 'inspection',
            entityId: id,
            action: 'delete',
            payload: JSON.stringify({
                id,
                remoteId: localInspection?.remoteId
            }),
            attempts: 0,
            createdAt: new Date(),
        })
    },

    async syncFromRemote(): Promise<Inspection[]>{
        try{
            const remoteInspections = await getRemoteInspections()
            const remoteIds = new Set(
                remoteInspections.map((remote) => remote.id)
            )
            const localInspections = await db
                .select()
                .from(inspections)

            for(const remote of remoteInspections){
                let local = localInspections.find(
                    (item) => item.remoteId === remote.id
                )

                if(!local){
                    local = localInspections.find((item) =>(
                        item.remoteId == null
                        && item.title === remote.title
                        && item.description === remote.description
                        && item.latitude === remote.latitude
                        && item.longitude === remote.longitude
                    ))
                }

                if(local){
                    await db
                        .update(inspections)
                        .set({
                            remoteId: remote.id,
                            title: remote.title,
                            description: remote.description,
                            status: 'synced',
                            latitude: remote.latitude,
                            longitude: remote.longitude,
                            photoUri: remote.photoUrl,
                            signatureUri: remote.signatureUrl,
                            updatedAt: new Date()
                        })
                        .where(eq(inspections.id, local.id))

                        continue
                }

                const now = new Date()

                await db.insert(inspections).values({
                    id: `insp_${remote.id}`,
                    remoteId: remote.id,
                    title: remote.title,
                    description: remote.description,
                    status: 'synced',
                    latitude: remote.latitude,
                    longitude: remote.longitude,
                    photoUri: remote.photoUrl,
                    signatureUri: remote.signatureUrl,
                    createdAt: now,
                    updatedAt: now,
                })

                const syncedLocally = await db
                    .select()
                    .from(inspections)

                for(const local of syncedLocally){
                    if(
                        local.remoteId
                        && local.status === 'synced'
                        && !remoteIds.has(local.remoteId)
                    ){
                        await db
                            .delete(inspections)
                            .where(eq(inspections.id, local.id))
                    }
                }
                
            }

            return this.getAll()
        }catch(e){
            return this.getAll()
        }
    }
}

