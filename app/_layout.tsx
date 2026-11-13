import { authService } from '@/src/features/auth/authService'
import { clearTokens, getAccessToken } from '@/src/features/auth/authStorage'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import * as Linking from 'expo-linking'
import { router, Stack } from 'expo-router'
import { useEffect, useState } from 'react'
import { ActivityIndicator, View } from 'react-native'
import { initDatabase } from '../src/database/client'



const queryClient = new QueryClient()


export default function RootLayout() {
  const [isReady, setIsReady] = useState(false)


  useEffect(()=>{
    async function prepare() {
      try{
        await initDatabase()

        const initialUrl = await Linking.getInitialURL()

        if(initialUrl?.includes('/invitation/accept')) return

        const accessToken = await getAccessToken()

        if(!accessToken){
          router.replace('/login')
          return
        }

        await authService.getMe()
        router.replace('/(tabs)')
      }catch(e){
        await clearTokens()
        router.replace('/login')
        console.error('Session initialization failed:', e)
      }finally{
        setIsReady(true)
      }
    }
    
    prepare()
  }, [])


  if(!isReady){
    return(
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    )
  }

  return(
    <QueryClientProvider client={queryClient}>
      <Stack screenOptions={{ headerShown: false }} />
    </QueryClientProvider>
  )
}


