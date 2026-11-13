import { apiClient } from "../../services/apiClient"
import {
  clearTokens,
  getRefreshToken,
  saveAccessToken,
  saveRefreshToken,
} from "./authStorage"

type AuthResponse = {
  user: {
    id: string
    name: string
    email: string
  }
  organization: {
    id: string
    name: string
    role: string
  }
  accessToken: string
  refreshToken: string
}

export type InvitationRole = 'ADMIN' | 'INSPECTOR' | 'VIEWER'

type CreateInvitationResonse = {
  invitation: {
    id: string
    email: string
    role: InvitationRole
    expiresAt: string
  }
}

export type UserProfile = {
  id: string
  name: string
  email: string
  organizationId: string
  organizationName: string
  role: string
}

export const authService = {
  async login(email: string, password: string) {
    const result = await apiClient.post<AuthResponse>(
      "/auth/login",
      {
        email: email.trim().toLowerCase(),
        password,
      },
    )

    await saveAccessToken(result.accessToken)
    await saveRefreshToken(result.refreshToken)

    const profile = await apiClient.get<UserProfile>(
      "/auth/me",
      true,
    )

    return { ...result, profile }
  },

  async register(
    name: string,
    email: string,
    password: string,
    organizationName: string,
  ) {
    const result = await apiClient.post<AuthResponse>(
      "/auth/register",
      {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        organizationName: organizationName.trim(),
      },
    )

    await saveAccessToken(result.accessToken)
    await saveRefreshToken(result.refreshToken)

    return result
  },

  async createInvitation(email:string, role:InvitationRole){
    const result = await apiClient.post<CreateInvitationResonse>(
      '/organizations/invitations',
      {
        email: email.trim().toLowerCase(),
        role
      },
      true
    )

    return result.invitation
  },

  async acceptInvitation(token:string){
    const result = await apiClient.post<AuthResponse>(
      '/organizations/invitations/accept',
      { token },
      true
    )

    await saveAccessToken(result.accessToken)
    await saveRefreshToken(result.refreshToken)

    return result
  },

  async registerFromInvitation(
    token: string,
    name: string,
    password: string
  ){
    const result = await apiClient.post<AuthResponse>(
      '/auth/invitations/register',
      {
        token,
        name: name.trim(),
        password
      }
    )

    await saveAccessToken(result.accessToken)
    await saveRefreshToken(result.refreshToken)

    return result
  },

  async getMe() {
    return apiClient.get<UserProfile>("/auth/me", true)
  },

  async logout() {
    const refreshToken = await getRefreshToken()

    try{
      if(refreshToken){
        await apiClient.post(
          '/auth/logout',
          { refreshToken },
          false
        )
      }
    }finally{
      await clearTokens()
    }
  },
}