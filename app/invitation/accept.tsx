import { Button } from "@/src/components/ui/Button"
import { Input } from "@/src/components/ui/Input"
import { authService } from "@/src/features/auth/authService"
import { router, useLocalSearchParams } from "expo-router"
import { useState } from "react"
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
} from "react-native"


type AccountMode = 'existing' | 'new'


export default function AcceptInvitationScreen(){
    const params = useLocalSearchParams<{ token?:string | string[]}>()
    const token = typeof params.token === 'string' ? params.token : ''

    const [mode, setMode] = useState<AccountMode>("existing")
    const [email, setEmail] = useState<string>("")
    const [name, setName] = useState<string>("")
    const [password, setPassword] = useState<string>("")
    const [isLoading, setIsLoading] = useState<boolean>(false)



    async function handleAccept(){
        if(!token){
            Alert.alert("Invalid invitation", "The invitation link has no token.")
            return
        }

        if(mode === 'existing' && (!email.trim() || !password)){
            Alert.alert("Missing information", "Enter your email and password.")
            return
        }

        if(mode === 'new' && (!name.trim() || !password)){
            Alert.alert("Missing information", "Enter your name and password.")
            return
        }

        setIsLoading(true)

        try{
            if(mode === 'existing'){
                await authService.login(email, password)
                await authService.acceptInvitation(token)
            }else{
                await authService.registerFromInvitation(token, name, password)
            }

            router.replace('/(tabs)')
        }catch(error){
            Alert.alert(
                'Could not accept invitation',
                error instanceof Error ? error.message : 'Please try again'
            )
        }finally{
            setIsLoading(false)
        }
    }


    return(
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView
                contentContainerStyle={styles.content}
                keyboardShouldPersistTaps='handled'
                showsVerticalScrollIndicator={false}
            >
                <Text style={styles.title}>Join an organization</Text>

                {mode === 'existing' ? (
                    <>
                        <Text style={styles.description}>
                            Sign in with the account whose email received this invitations.
                        </Text>

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
                    </>
                ): (
                    <>
                        <Text style={styles.description}>
                            Create an account with the email address that received this invitation.
                        </Text> 

                        <Input
                            label="Name"
                            value={name}
                            onChangeText={setName}
                            autoCapitalize="words"
                            autoComplete="name"
                        /> 

                        <Input
                            label="Password"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            autoComplete="new-password"
                        />
                    </>
                )}

                <Button
                    title={mode === "existing" ? "Sign in and join" : "Create account and join"}
                    onPress={handleAccept}
                    isLoading={isLoading}
                />

                <Pressable
                    onPress={() => {
                        setMode(mode === "existing" ? "new" : "existing")
                        setPassword("")
                    }}
                >
                    <Text style={styles.switchText}>
                        {mode === "existing"
                            ? "New to FieldPulse? Create an account"
                            : "Already have an account? Sign in"}
                    </Text>
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
    paddingVertical: 32,
  },
  title: {
    color: "#0F172A",
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 12,
    textAlign: "center",
  },
  description: {
    color: "#475569",
    fontSize: 15,
    marginBottom: 20,
    textAlign: "center",
  },
  switchText: {
    color: "#2563EB",
    fontWeight: "600",
    marginTop: 20,
    textAlign: "center",
  },
})