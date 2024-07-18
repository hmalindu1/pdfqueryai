'use client'

import { ArrowRight } from 'lucide-react'
import { Button } from './ui/button'
import { trpc } from '@/app/_trpc/client'
import { initializePaddle, Paddle } from '@paddle/paddle-js'
import { useEffect, useState } from 'react'

const UpgradeButton = () => {
    const [paddle, setPaddle] = useState<Paddle>()

    useEffect(() => {
        console.log('running useEffect');
        
        initializePaddle({
            environment: 'sandbox',
            token: `${process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN}`
        }).then((paddleInstance: Paddle | undefined) => {
            if (paddleInstance) {
                setPaddle(paddleInstance)
            }
        })
    }, [])

    console.log('=== paddle', paddle);
    

    const openCheckout = () => {
        paddle?.Checkout.open({
            items: [
                {
                    priceId: `${process.env.NEXT_PUBLIC_PADDLE_PRICE_ID}`,
                    quantity: 1
                }
            ]
        })
    }


    const { mutate: createPaddleSession } =
        trpc.createPaddleSession.useMutation({
            // onSuccess: ({ url }) => {
            //     window.location.href = url ?? '/dashboard/billing'
            // }
            onSuccess: (respons) => {
                console.log('=== respons from UpgradeButton', respons)
                if (respons === false) {
                    openCheckout()
                }
            }
        })

    return (
        <Button onClick={() => createPaddleSession()} className="w-full">
            Upgrade now <ArrowRight className="h-5 w-5 ml-1.5" />
        </Button>
    )
}

export default UpgradeButton
