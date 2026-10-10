import { db } from '@/src/database/client';
import { inspections, SyncItem, syncQueue } from '@/src/database/schema';
import { eq, inArray } from 'drizzle-orm';



export const syncService = {
  /**
   * Busca todas as mutações pendentes na fila de sincronização local.
   */
  async getPendingQueue(): Promise<SyncItem[]> {
    return await db.select().from(syncQueue);
  },

  /**
   * Processa a fila de sincronização offline enviando os itens pendentes.
   * Em uma aplicação com backend/Supabase, aqui seriam disparadas as chamadas HTTP/SDK.
   */
  async processSyncQueue(): Promise<{ success: boolean; processedCount: number }> {
    const pendingItems = await this.getPendingQueue();

    if (pendingItems.length === 0) {
      return { success: true, processedCount: 0 };
    }

    const processedIds: string[] = [];
    const syncedEntityIds: string[] = [];

    for (const item of pendingItems) {
      try {
        // Exemplo de payload parseado
        const payload = JSON.parse(item.payload);

        // Aqui ocorreria a chamada para a API remota/BaaS
        // ex: await api.post(`/sync/${item.entityType}`, { action: item.action, payload });

        processedIds.push(item.id);
        if (item.entityType === 'inspection') {
          syncedEntityIds.push(item.entityId);
        }
      } catch (error) {
        // Incrementa o contador de tentativas em caso de falha de rede/servidor
        await db
          .update(syncQueue)
          .set({ attempts: item.attempts + 1 })
          .where(eq(syncQueue.id, item.id));
      }
    }

    // Atualiza o status das inspeções locais sincronizadas para 'synced'
    if (syncedEntityIds.length > 0) {
      await db
        .update(inspections)
        .set({ status: 'synced', updatedAt: new Date() })
        .where(inArray(inspections.id, syncedEntityIds));
    }

    // Remove da fila local os itens processados com sucesso
    if (processedIds.length > 0) {
      await db.delete(syncQueue).where(inArray(syncQueue.id, processedIds));
    }

    return {
      success: true,
      processedCount: processedIds.length,
    };
  },
};