import { useRouter, useSearchParams } from 'next/navigation'
import React from 'react'
import { trpc } from '../_trpc/client'

const AuthCallBack = () => {
    const router = useRouter()
    const searchParamas = useSearchParams()
    const origin = searchParamas.get('origin')
    const { data } = trpc.authCallback.useMutation({
        onSuccess: ({ success }) => {
            if (success) {
                router.push(origin ? `/${origin}` : '/dashboard')
            }
        }
    })
}

export default AuthCallBack
