import Link from 'next/link'
import { XCircle, ArrowLeft } from 'lucide-react'
import Button from '@/components/ui/Button'

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark px-4">
      <div className="w-full max-w-md">
        <div className="bg-surface-light dark:bg-surface-dark rounded-2xl shadow-xl border border-border-light dark:border-border-dark p-8 text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Authentication Error
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
            There was a problem with your authentication request. The link may have expired or is invalid.
          </p>
          <Link href="/auth/login">
            <Button variant="primary" fullWidth>
              <ArrowLeft className="w-4 h-4" />
              Back to Sign In
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
