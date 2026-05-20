import { SignIn } from '@clerk/nextjs'

export const metadata = {
  title: 'Sign In — Magpie Mediations',
}

export default function SignInPage() {
  return <SignIn />
}
