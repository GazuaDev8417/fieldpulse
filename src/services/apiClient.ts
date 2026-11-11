import { File, UploadType } from 'expo-file-system';
import { API_URL } from "../config/api";
import {
    clearTokens, getAccessToken, getRefreshToken,
    saveAccessToken,
    saveRefreshToken
} from "../features/auth/authStorage";

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

    if(
        response.status === 401
        && options.authenticated
        && path !== '/auth/refresh'
    ){
        const refreshToken = await getRefreshToken()

        if(!refreshToken){
            await clearTokens()
            throw new Error('Invalid or expired access token')
        }

        const refreshResponse = await fetch(`${API_URL}/auth/refresh`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ refreshToken })
        })

        if(!refreshResponse.ok){
            await clearTokens()
            throw new Error('Invalid or expired access token')
        }

        const refreshed = await refreshResponse.json() as {
            accessToken: string
            refreshToken: string
        }

        await saveAccessToken(refreshed.accessToken)
        await saveRefreshToken(refreshed.refreshToken)

        headers.set(
            'Authorization',
            `Bearer ${refreshed.accessToken}`
        )

        const retryResponse = await fetch(`${API_URL}${path}`, {
            ...options,
            headers
        })

        if(retryResponse.status === 204){
            return undefined as T
        }

        const retryData = await retryResponse.json().catch(() => null)

        if(!retryResponse.ok){
            throw new Error(
                typeof retryData?.error === 'string'
                    ? retryData.error
                    : 'Request failed'
                )
                
            }
        
        return retryData as T        
    }

    if(!response.ok){
        throw new Error(
            typeof data?.error === 'string'
                ? data.error
                : `Request failed with status ${response.status}`
        )
    }

    return data as T
}

export  function getApiAssetUrl(path:string | null):string | null {
    if(!path) return null

    if(path.startsWith('http://') || path.startsWith('https://')) return path

    return `${API_URL.replace(/\/api\/v1$/, '')}${API_URL.includes('/api/v1')
        ? '/api/v1'
        : ''}${path}`
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

    // async upload<T>(path: string, body: FormData):Promise<T>{
    //     const token = await getAccessToken()

    //     if(!token){
    //         throw new Error('Authentication required')
    //     }

    //     const response = await fetch(`${API_URL}${path}`, {
    //         method: 'POST',
    //         headers: {
    //             Authorization: `Bearer ${token}`
    //         },
    //         body
    //     })

    //     const data = await response.json().catch(() => null)

    //     if(!response.ok){
    //         throw new Error(
    //             typeof data?.error === 'string'
    //                 ? data.error
    //                 : 'Upload failed'
    //         )
    //     }

    //     return data as T
    // },    

    async uploadfile<T>(
        path: string,
        fileUri: string,
        fieldName = 'photo'
    ):Promise<T>{
        const token = await getAccessToken()

        if(!token){
            throw new Error('Authentication required')
        }

        const file = new File(fileUri)
        const result = await file.upload(`${API_URL}${path}`, {
            uploadType: UploadType.MULTIPART,
            httpMethod: 'POST',
            fieldName,
            mimeType: 'image/jpeg',
            headers: { Authorization: `Bearer ${token}`}
        })

        const data = JSON.parse(result.body || '{}')

        if(result.status < 200 || result.status >= 300){
            throw new Error(
                data.error ?? `Upload failed with status ${result.status}`
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