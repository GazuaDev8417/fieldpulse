import * as SecureStore from 'expo-secure-store'


const ACCESS_TOKEN_KEY = "fieldpulse_access_token"
const REFRESH_TOKEN_KEY = "fieldpulse_refresh_token"

function validateToken(token: string, name: string): void {
    if(typeof token !== 'string' || token.length === 0){
        throw new Error(`${name} is missing or invalid`)
    }
}

export async function saveAccessToken(token:string){
    validateToken(token, 'Access token')
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token)
}

export async function getAccessToken(){
    return SecureStore.getItemAsync(ACCESS_TOKEN_KEY)
}

export async function saveRefreshToken(token:string){
    validateToken(token, 'Refresh token')
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token)
}

export async function getRefreshToken(){
    return SecureStore.getItemAsync(REFRESH_TOKEN_KEY)
}

export async function clearAccessToken(){
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY)
}

export async function clearRefreshToken() {
  await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY)
}

export async function clearTokens(){
    await clearAccessToken()
    await clearRefreshToken()
}
