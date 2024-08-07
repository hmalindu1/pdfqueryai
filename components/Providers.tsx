'use client'

import React, { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { trpc } from '@/app/_trpc/client'
import { httpBatchLink } from '@trpc/client'
import { absoluteUrl } from '@/lib/utils'

/***
 * Component that provides the TRPC and QueryClient context to its children.
 *
 * @param {React.ReactNode} children - The children components to be wrapped by the Providers.
 * @return {React.ReactElement} The wrapped components with TRPC and QueryClient context.
 */
const Providers = ({ children }: { children: React.ReactNode }) => {
    const [queryClient] = useState(() => new QueryClient())
    const [trpcClient] = useState(() =>
        trpc.createClient({
            links: [
                httpBatchLink({
                    url: absoluteUrl('/api/trpc')
                })
            ]
        })
    )
    return (
        <trpc.Provider client={trpcClient} queryClient={queryClient}>
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </trpc.Provider>
    )
}

export default Providers
