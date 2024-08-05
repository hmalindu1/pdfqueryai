import { PLANS } from '@/config/paddle'
import { db } from '@/db'
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import { Environment, Paddle } from '@paddle/paddle-node-sdk'

export const paddle = new Paddle(`${process.env.PADDLE_API_KEY}`, {environment: Environment.sandbox});

export async function getUserSubscriptionPlan() {
    // console.log('=== running getUserSubscriptionPlan');
    
    const { getUser } = getKindeServerSession()
    const user = await getUser()

    if (!user?.id) {
        return {
            ...PLANS[0],
            isSubscribed: false,
            isCanceled: false,
            paddleCurrentPeriodEnd: null,
            cancelUrl: null
        }
    }

    const dbUser = await db.user.findFirst({
        where: {
            id: user.id
        }
    })

    if (!dbUser) {
        return {
            ...PLANS[0],
            isSubscribed: false,
            isCanceled: false,
            paddleCurrentPeriodEnd: null,
            cancelUrl: null
        }
    }

    const isSubscribed = Boolean(
        dbUser.paddlePriceId &&
            dbUser.paddleCurrentPeriodEnd && // 86400000 = 1 day
            dbUser.paddleCurrentPeriodEnd.getTime() + 86_400_000 > Date.now()
    )

    // console.log('=== isSubscribed', isSubscribed);
    

    const plan = isSubscribed
        ? PLANS.find(
              (plan) => plan.price.priceIds.test === dbUser.paddlePriceId
          )
        : null

        // console.log('=== plan pro price ids : ',PLANS[1].price.priceIds.test);
        // console.log('=== user db price id : ', dbUser.paddlePriceId)
        
        
    // console.log('=== plan', plan);

    let isCanceled = false
    let cancelUrl
    if (isSubscribed && dbUser.paddleSubscriptionId) {
        try {
            const paddlePlan = await paddle.subscriptions.get(
                dbUser.paddleSubscriptionId
            )
            // console.log('=== paddlePlan', paddlePlan);
            
            // Check if the subscription is canceled
            if (paddlePlan.canceledAt) {
                isCanceled = true
            }

            if (paddlePlan.managementUrls && paddlePlan.managementUrls.cancel) {
                cancelUrl = paddlePlan.managementUrls.cancel
            }
            
        } catch (error) {
            console.error('Error retrieving Paddle subscription:', error)
        }
    }

    // Now you can use isCanceled as needed
    // console.log('Is subscription canceled:', isCanceled)


    return {
        ...plan,
        paddleSubscriptionId: dbUser.paddleSubscriptionId,
        paddleCurrentPeriodEnd: dbUser.paddleCurrentPeriodEnd,
        paddleCustomerId: dbUser.paddleCustomerId,
        isSubscribed,
        isCanceled,
        cancelUrl
    }
}
