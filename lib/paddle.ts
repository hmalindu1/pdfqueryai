import { PLANS } from '@/config/paddle'
import { db } from '@/db'
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import { Environment, Paddle } from '@paddle/paddle-node-sdk'

export const paddle = new Paddle(`${process.env.PADDLE_API_KEY}`, {environment: Environment.sandbox});

export async function getUserSubscriptionPlan() {
    console.log('=== running getUserSubscriptionPlan');
    
    const { getUser } = getKindeServerSession()
    const user = await getUser()

    if (!user?.id) {
        return {
            ...PLANS[0],
            isSubscribed: false,
            isCanceled: false,
            paddleCurrentPeriodEnd: null
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
            paddleCurrentPeriodEnd: null
        }
    }

    const isSubscribed = Boolean(
        dbUser.paddlePriceId &&
            dbUser.paddleCurrentPeriodEnd && // 86400000 = 1 day
            dbUser.paddleCurrentPeriodEnd.getTime() + 86_400_000 > Date.now()
    )

    console.log('=== isSubscribed', isSubscribed);
    

    const plan = isSubscribed
        ? PLANS.find(
              (plan) => plan.price.priceIds.test === dbUser.paddlePriceId
          )
        : null

        console.log('=== plan pro price ids : ',PLANS[1].price.priceIds.test);
        console.log('=== user db price id : ', dbUser.paddlePriceId)
        
        
    console.log('=== plan', plan);

    let isCanceled = false
    if (isSubscribed && dbUser.paddleSubscriptionId) {
        const paddlePlan = await paddle.subscriptions.get(
            dbUser.paddleSubscriptionId
        )
        isCanceled = !!paddlePlan?.canceledAt
    }

    return {
        ...plan,
        paddleSubscriptionId: dbUser.paddleSubscriptionId,
        paddleCurrentPeriodEnd: dbUser.paddleCurrentPeriodEnd,
        paddleCustomerId: dbUser.paddleCustomerId,
        isSubscribed,
        isCanceled
    }
}
