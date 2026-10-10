import { useQuery } from "@tanstack/react-query";
import { inspectionService } from "../services/insperctionService";
import { INSPECTIONS_QUERY_KEY } from "./useInspections";



export function useInspectionDetail(id:string){
    const inspectionQuery = useQuery({
        queryKey: [...INSPECTIONS_QUERY_KEY, id],
        queryFn: () => inspectionService.getById(id),
        enabled: Boolean(id)
    })

    return{
        inspection: inspectionQuery.data,
        isLoading: inspectionQuery.isLoading,
        isError: inspectionQuery.isError,
        refetch: inspectionQuery.refetch
    }
}