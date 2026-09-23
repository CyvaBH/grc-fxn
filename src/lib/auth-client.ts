import { createAuthClient } from "better-auth/client"
import { emailOTPClient, twoFactorClient } from "better-auth/client/plugins"
import { useSyncExternalStore } from "react"

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  plugins: [
    emailOTPClient(),
    twoFactorClient(),
  ],
})

export const { signIn, signUp, signOut } = authClient

interface SessionState {
  data: {
    user: {
      id: string
      name: string
      email: string
      image?: string | null
    }
    session: unknown
  } | null
  error: unknown
  isPending: boolean
  isRefetching: boolean
  refetch: () => void
}

type SessionAtom = {
  get(): SessionState
  listen(cb: () => void): () => void
}

/**
 * React hook over Better Auth's session atom (nanostores).
 * `authClient.useSession` is an Atom, not a hook — this subscribes to it.
 */
export function useSession(): SessionState {
  const atom = authClient.useSession as unknown as SessionAtom
  return useSyncExternalStore(
    (onChange) => atom.listen(onChange),
    () => atom.get(),
    () => atom.get()
  )
}
