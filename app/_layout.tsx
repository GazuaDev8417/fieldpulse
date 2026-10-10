import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Stack } from 'expo-router'
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
      }catch(e){
        console.error('Error initializing database:', e)
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


