import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { authService } from "@/src/features/auth/authService";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';



export default function LoginScreen(){
    const router = useRouter()
    const [email, setEmail] = useState<string>('')
    const [password, setPassword] = useState<string>('')
    const [isLoading, setIsLoading] = useState<boolean>(false)


    const handleLogin = async()=>{
        setIsLoading(true)

        try{
            await  authService.login(email, password)
            router.replace('/(tabs)')
        }catch(error){
            Alert.alert(
                "Login failed",
                error instanceof Error ? error.message : "Could not log in",
            )
        }finally{
            setIsLoading(false)
        }
    }



    return (
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.content}>
          <Text style={styles.title}>FieldPulse</Text>

          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
          />

          <Input
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="password"
          />

          <Button
            title="Login"
            onPress={handleLogin}
            isLoading={isLoading}
          />

          <Pressable onPress={() => router.push('/register')}>
            <Text style={styles.registerText}>
              Create account and organization
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
  )
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  title: {
    color: "#0F172A",
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 32,
    textAlign: 'center'
  },
  registerText: {
    marginTop: 16,
    textAlign: "center",
    color: "#2563EB",
    fontWeight: "600",
  }
})