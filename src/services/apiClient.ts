import { API_URL } from "../config/api";
import { getAccessToken } from "../features/auth/authStorage";


type ApiOptions = RequestInit & {
    authenticated?: boolean
}

export async function apiRequest<T>(
    path:string,
    options:ApiOptions = {}
):Promise<T>{
    const headers = new Headers(options.headers)

    if(!headers.has('Content-Type') && options.body){
        headers.set('Content-Type', 'application/json')
    }

    if(options.authenticated){
        const token = await getAccessToken()

        if(!token){
            throw new Error('Authentication required')
        }

        headers.set('Authorization', `Bearer ${token}`)
    }

    const response = await fetch(`${API_URL}${path}`, {
        ...options,
        headers
    })

    if(response.status === 204){
        return undefined as T
    }

    const data = await response.json().catch(() => null)

    if(!response.ok){
        throw new Error(
            typeof data?.error === 'string'
                ? data.error
                : 'Request failed'
        )
    }

    return data as T
}


export const apiClient = {
    async post<T>(
        path: string, 
        body: unknown,
        authenticated = false
    ):Promise<T>{
        return apiRequest<T>(path, {
            method: 'POST',
            body: JSON.stringify(body),
            authenticated
        })
    },

    async upload<T>(path: string, body: FormData):Promise<T>{
        const token = await getAccessToken()

        if(!token){
            throw new Error('Authentication required')
        }

        const response = await fetch(`${API_URL}${path}`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`
            },
            body
        })

        const data = await response.json().catch(() => null)

        if(!response.ok){
            throw new Error(
                typeof data?.error === 'string'
                    ? data.error
                    : 'Upload failed'
            )
        }

        return data as T
    },    

    get<T>(path: string, authenticated = false){
        return apiRequest<T>(path, {
            method: 'GET',
            authenticated
        })
    },

    async delete<T>(
        path:string,
        authenticated = true
    ):Promise<T>{
        return apiRequest<T>(path, {
            method:'DELETE',
            authenticated
        })
    }
}