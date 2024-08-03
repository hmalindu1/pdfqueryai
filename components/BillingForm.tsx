'use client'

import { useToast } from './ui/use-toast'
import { trpc } from '@/app/_trpc/client'
import {
    Card,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from './ui/card'
import { Button } from './ui/button'
import { Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { getUserSubscriptionPlan } from '@/lib/paddle'
import MaxWIdthWrapper from './MaxWIdthWrapper'

interface BillingFormProps {
    subscriptionPlan: Awaited<ReturnType<typeof getUserSubscriptionPlan>>
}

const BillingForm = ({ subscriptionPlan }: BillingFormProps) => {
    const { toast } = useToast()

    const { mutate: createPaddleSession, isPending } =
        trpc.createPaddleSession.useMutation({
            onSuccess: (response) => {
                console.log('=== response from createPaddleSession', response);
                if (typeof response !== 'boolean' && response.url) {
                    if (response.url) window.location.href = response.url
                    if (!response.url) {
                        toast({
                            title: 'There was a problem...',
                            description: 'Please try again in a moment',
                            variant: 'destructive'
                        })
                    }
                }
            }
        })

    return (
        <MaxWIdthWrapper className="max-w-5xl">
            <form
                className="mt-12"
                onSubmit={(e) => {
                    e.preventDefault()
                    createPaddleSession()
                }}
            >
                <Card>
                    <CardHeader>
                        <CardTitle>Subscription Plan</CardTitle>
                        <CardDescription>
                            You are currently on the{' '}
                            <strong>{subscriptionPlan.name}</strong> plan.
                        </CardDescription>
                    </CardHeader>

                    <CardFooter className="flex flex-col items-start space-y-2 md:flex-row md:justify-between md:space-x-0">
                        <Button type="submit">
                            {isPending ? (
                                <Loader2 className="mr-4 h-4 w-4 animate-spin" />
                            ) : null}
                            {subscriptionPlan.isSubscribed
                                ? 'Manage Subscription'
                                : 'Upgrade to PRO'}
                        </Button>

                        {subscriptionPlan.isSubscribed ? (
                            <p className="rounded-full text-xs font-medium">
                                {subscriptionPlan.isCanceled
                                    ? 'Your plan will be canceled on '
                                    : 'Your plan renews on '}
                                {format(
                                    subscriptionPlan.paddleCurrentPeriodEnd!,
                                    'dd.MM.yyyy'
                                )}
                                .
                            </p>
                        ) : null}
                    </CardFooter>
                </Card>
            </form>
        </MaxWIdthWrapper>
    )
}

export default BillingForm
