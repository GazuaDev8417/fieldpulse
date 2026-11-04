import { Button } from "@/src/components/ui/Button"
import { Input } from "@/src/components/ui/Input"
import { authService } from "@/src/features/auth/authService"
import { useRouter } from "expo-router"
import { useState } from "react"
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text
} from "react-native"



export default function RegisterScreen(){
    const router = useRouter()
    const [name, setName] = useState<string>("")
    const [email, setEmail] = useState<string>("")
    const [password, setPassword] = useState<string>("")
    const [organizationName, setOrganizationName] = useState<string>("")
    const [isLoading, setIsLoading] = useState<boolean>(false)



    const handleRegister = async()=>{
        setIsLoading(true)

        try{
            await authService.register(
                name,
                email,
                password,
                organizationName
            )

        router.replace('/(tabs)')
        }catch(e){
            Alert.alert(
                'Registration failed',
                e instanceof Error ? e.message : 'Could not register'
            )
            console.error(e)
        }finally{
            setIsLoading(false)
        }
    }


    return(
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : 'height'}
            keyboardVerticalOffset={0}
        >
            <ScrollView 
                contentContainerStyle={styles.content}
                keyboardShouldPersistTaps='handled'
                keyboardDismissMode="on-drag"
                automaticallyAdjustKeyboardInsets={Platform.OS === "ios"}
                showsVerticalScrollIndicator={false}
                >
                <Text style={styles.title}>Create account</Text>

                <Input
                    label="Name"
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                />

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
                    autoComplete="new-password"
                />

                <Input
                    label="Organization"
                    value={organizationName}
                    onChangeText={setOrganizationName}
                />

                <Button
                    title="Create account"
                    onPress={handleRegister}
                    isLoading={isLoading}
                />
                <Pressable onPress={() => router.replace("/login")}>
                    <Text style={styles.loginText}>Already have an account? Login</Text>
                </Pressable>
            </ScrollView>
        </KeyboardAvoidingView>
    )
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  content: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 80,
    gap: 12,
  },
  title: {
    color: "#0F172A",
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 20,
    textAlign: 'center'
  },
  loginText: {
    marginTop: 16,
    textAlign: "center",
    color: "#2563EB",
    fontWeight: "600",
  },
})