import { useRouter, useSearchParams } from 'next/navigation'
import React from 'react'
import { trpc } from '../_trpc/client'

const AuthCallBack = () => {
    const router = useRouter()
    const searchParamas = useSearchParams()
    const origin = searchParamas.get('origin')
    const {data} = trpc.test.useQuery()
}

export default AuthCallBack
