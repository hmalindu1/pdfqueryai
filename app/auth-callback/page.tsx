'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { trpc } from '../_trpc/client'
import { Loader2 } from 'lucide-react'

const AuthCallBack = () => {
    const router = useRouter()
    const searchParams = useSearchParams()
    const origin = searchParams.get('origin')

    const { data, error, isLoading } = trpc.authCallback.useQuery(undefined, {
        retry: true,
        retryDelay: 500
    })

    useEffect(() => {
        if (data?.success) {
            // user is synced to db
            router.push(origin || '/dashboard')
        }
        if (error && error.data?.code === 'UNAUTHORIZED') {
            router.push('/sign-in')
        }
    }, [data, error, router, origin])

    if (isLoading) {
        return (
            <div className="w-full mt-24 flex justify-center">
                <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-zinc-800" />
                    <h3 className="font-semibold text-xl">
                        Setting up your account...
                    </h3>
                    <p>You will be redirected automatically</p>
                </div>
            </div>
        )
    }

    // Optionally handle or display something else when not loading
    return null
}

export default AuthCallBack
