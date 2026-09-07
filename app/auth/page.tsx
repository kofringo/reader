import type { Metadata } from 'next'
import AuthForm from './auth-form'

export const metadata: Metadata = {
  title: 'Sign In & Account Access - Web Novel Reader',
  description: 'Log in or create an account to manage your web novel library.',
  robots: {
    index: false,
    follow: true,
  },
}

export default function Page() {
  return <AuthForm />
}