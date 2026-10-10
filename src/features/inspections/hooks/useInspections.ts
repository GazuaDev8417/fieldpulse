import { Inspection, NewInspection } from '@/src/database/schema'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { inspectionService } from '../services/insperctionService'


export const INSPECTIONS_QUERY_KEY = ['inspections']

export function useInspections(){
    const queryClient = useQueryClient()
    const inspectionsQuery = useQuery({
        queryKey: INSPECTIONS_QUERY_KEY,
        queryFn: () => inspectionService.getAll()
    })

    const createMutation = useMutation({
        mutationFn: (data: Omit<NewInspection, 'createdAt' | 'updatedAt'> & { id:string })=>
            inspectionService.create(data),

        onSuccess: () =>{
            queryClient.invalidateQueries({ queryKey: INSPECTIONS_QUERY_KEY })
        }
    })

    const updateMutation =  useMutation({
        mutationFn: ({ id, data }: { id:string, data: Partial<Omit<Inspection, 'id' | 'createdAt'>> }) =>
            inspectionService.update(id, data),
        
        onSuccess: () =>{
            queryClient.invalidateQueries({ queryKey: INSPECTIONS_QUERY_KEY })
        }
    })

    const deleteMutation = useMutation({
        mutationFn: (id:string) => inspectionService.delete(id),
        onSuccess: () =>{
            queryClient.invalidateQueries({ queryKey: INSPECTIONS_QUERY_KEY })
        }
    })

    return {
        inspections: inspectionsQuery.data ?? [],
        isLoading: inspectionsQuery.isLoading,
        isError: inspectionsQuery.isError,
        refetch: inspectionsQuery.refetch,
        createInspection: createMutation.mutateAsync,
        updateInspection: updateMutation.mutateAsync,
        deleteInspection: deleteMutation.mutateAsync,
        isCreating: createMutation.isPending,
    }
}