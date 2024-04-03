import { useRouter, useSearchParams } from 'next/navigation'
import React from 'react'

const AuthCallBack = () => {
    const router = useRouter()
    const searchParamas = useSearchParams()
    const origin = searchParamas.get('origin')
    return <div>AuthCallBack</div>
}

export default AuthCallBack
