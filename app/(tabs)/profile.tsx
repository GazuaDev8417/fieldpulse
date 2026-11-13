import { Button } from "@/src/components/ui/Button"
import { Input } from "@/src/components/ui/Input"
import { authService, InvitationRole, UserProfile } from "@/src/features/auth/authService"
import { router } from "expo-router"
import { useEffect, useState } from "react"
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native"



export default function ProfileScreen(){
    const [profile, setProfile] = useState<UserProfile | null>(null)
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [invitationEmail, setInvitationEmail] = useState<string>("")
    const [isInviting, setIsInviting] = useState<boolean>(false)

    
    
    useEffect(()=>{
        async function loadProfile(){
            try{
                const result = await authService.getMe()
                setProfile(result)
            }catch{
                Alert.alert(
                    'Session expired',
                    'Please log in again'
                )
                await authService.logout()
                router.replace('/login')
            }finally{
                setIsLoading(false)
            }
        }

        loadProfile()
    },[])



    async function handleInvite(role:InvitationRole){
        if(!invitationEmail.trim()){
            Alert.alert("Missing email", "Enter the email address to invite.")
            return
        }

        setIsInviting(true)

        try{
            const invitation = await authService.createInvitation(
                invitationEmail,
                role
            )

            Alert.alert(
                'Invitation sent',
                `An invitation was sent to ${invitation.email}`
            )
            setInvitationEmail('')
        }catch(error){
            Alert.alert(
                'Could not send invitation',
                error instanceof Error ? error.message : 'Please try again.'
            )
        }finally{
            setIsInviting(false)
        }
    }


    async function handleLogout(){
        Alert.alert(
            'Logout',
            'Do you really want to leave this session?',
            [
                { text: 'Cancel', style: 'cancel'},
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async () =>{
                        await authService.logout()
                        router.replace('/login')
                    }
                }
            ]
        )
    }

    if(isLoading){
        return(
            <View style={styles.center}>
                <ActivityIndicator size='large'/>
            </View>
        )
    }


    return(
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            automaticallyAdjustKeyboardInsets
            showsVerticalScrollIndicator={false}
        >
            <View style={styles.header}>
                <Text style={styles.title}>Profile</Text>
            </View>

            <View style={styles.card}>
                <View style={styles.field}>
                <Text style={styles.label}>Name</Text>
                <Text style={styles.value}>{profile?.name}</Text>
                </View>

                <View style={styles.field}>
                <Text style={styles.label}>Email</Text>
                <Text style={styles.value}>{profile?.email}</Text>
                </View>

                <View style={styles.field}>
                <Text style={styles.label}>Organization</Text>
                <Text style={styles.value}>{profile?.organizationName}</Text>
                </View>

                <View style={styles.field}>
                <Text style={styles.label}>Role</Text>
                <Text style={styles.value}>{profile?.role}</Text>
                </View>
            </View>

            {profile?.role === 'OWNER' && (
                <View style={styles.card}>
                    <Text style={styles.title}>Invite a member</Text>

                    <Input
                        label='Email'
                        value={invitationEmail}
                        onChangeText={setInvitationEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                        autoComplete="email"
                    />

                    <Button
                        title="Invite as admin"
                        onPress={() => handleInvite('ADMIN')}
                        isLoading={isInviting}
                    />

                    <Button
                        title="Invite as inspector"
                        onPress={() => handleInvite('INSPECTOR')}
                        isLoading={isInviting}
                        style={{ marginTop: 8}}
                    />

                    <Button
                        title="Invite as viewer"
                        variant="outline"
                        onPress={() => handleInvite('VIEWER')}
                        disabled={isInviting}
                        style={{ marginTop: 8}}
                    />
                </View>
            )}

            <TouchableOpacity
                style={styles.logoutButton}
                onPress={handleLogout}
                activeOpacity={0.8}
            >
                <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
        </ScrollView>
    )
}




const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  content: {
    paddingBottom: 24,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0F172A",
  },
  card: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: "#0F172A",
    fontWeight: "500",
  },
  logoutButton: {
    marginHorizontal: 16,
    height: 48,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#DC2626",
  },
  logoutText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
})