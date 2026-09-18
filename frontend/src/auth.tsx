import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { api, getToken, setToken } from './api'
import type { LoginResult, PendingLogin, Staff } from './types'

type AuthContextValue = {
  staff: Staff | null
  ready: boolean
  startLogin: (username: string, password: string) => Promise<PendingLogin>
  completeFace: (pendingToken: string, faceImage: string) => Promise<LoginResult>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [staff, setStaff] = useState<Staff | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const token = getToken()
    if (!token) {
      setReady(true)
      return
    }
    api
      .me()
      .then(setStaff)
      .catch(() => {
        setToken(null)
        setStaff(null)
      })
      .finally(() => setReady(true))
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      staff,
      ready,
      startLogin: async (username, password) => {
        const result = await api.startLogin(username, password)
        if (!result.requiresFace && result.token) {
          setToken(result.token)
          setStaff(result.staff)
        }
        return result
      },
      completeFace: async (pendingToken, faceImage) => {
        const result = await api.completeFaceLogin(pendingToken, faceImage)
        setToken(result.token)
        setStaff(result.staff)
        return result
      },
      logout: () => {
        setToken(null)
        setStaff(null)
      },
    }),
    [staff, ready],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }
  return context
}
