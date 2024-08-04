'use client'

import { ArrowRight } from 'lucide-react'
import { Button } from './ui/button'
import { trpc } from '@/app/_trpc/client'
import { initializePaddle, Paddle } from '@paddle/paddle-js'
import { useEffect, useState } from 'react'

interface UpgradeButtonProps {
    userId: string
}

const UpgradeButton = ({ userId }: UpgradeButtonProps) => {
    const [paddle, setPaddle] = useState<Paddle>()

    useEffect(() => {
        initializePaddle({
            environment: 'sandbox',
            token: `${process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN}`
        }).then((paddleInstance: Paddle | undefined) => {
            if (paddleInstance) {
                setPaddle(paddleInstance)
            }
        })
    }, [])

    const openCheckout = () => {
        paddle?.Checkout.open({
            items: [
                {
                    priceId: `${process.env.NEXT_PUBLIC_PADDLE_PRICE_ID}`,
                    quantity: 1
                }
            ],
            customData: {
                user_id: userId
            }
        })
    }

    const { mutate: createPaddleSession } =
        trpc.createPaddleSession.useMutation({
            onSuccess: (respons) => {
                console.log('=== respons from UpgradeButton', respons)
                if (respons === false) {
                    openCheckout()
                }
                if (typeof respons !== 'boolean' && respons.url) {
                    window.location.href = respons.url ?? '/dashboard/billing'
                }
            }
        })

    return (
        <Button
            onClick={() => createPaddleSession({ action: 'upgrade' })}
            className="w-full"
        >
            Upgrade now <ArrowRight className="h-5 w-5 ml-1.5" />
        </Button>
    )
}

export default UpgradeButton
