import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

const allowedIpAddresses = [
    // Sandbox
    '34.194.127.46',
    '54.234.237.108',
    '3.208.120.145',
    '44.226.236.210',
    '44.241.183.62',
    '100.20.172.113',
    // Production
    '34.232.58.13',
    '34.195.105.136',
    '34.237.3.244',
    '35.155.119.135',
    '52.11.166.252',
    '34.212.5.7'
]

const getIpAddress = (req: NextRequest): string => {
    const forwarded = req.headers.get('x-forwarded-for') || ''
    if (typeof forwarded === 'string') {
        return forwarded.split(',')[0] || req.ip || ''
    }
    return req.ip || ''
}

async function validateWebhook(req: NextRequest) {
    const ipAddress = getIpAddress(req)
    if (!allowedIpAddresses.includes(ipAddress)) {
        console.error('No valid Paddle IP address')
        return false
    }

    const rawBody = await req.text()
    const paddleSignature = req.headers.get('Paddle-Signature')
    if (!paddleSignature) {
        console.error('Missing Paddle signature')
        return false
    }

    const signatureParts = paddleSignature.split(';')
    const signatureMap = new Map()
    signatureParts.forEach((part) => {
        const [key, value] = part.split('=')
        signatureMap.set(key, value)
    })

    const ts = signatureMap.get('ts')
    const h1 = signatureMap.get('h1')
    if (!ts || !h1) {
        console.error('Invalid Paddle signature format')
        return false
    }

    // Build the signed payload
    const signedPayload = `${ts}:${rawBody}`

    // Compute the HMAC
    const secretKey = process.env.PADDLE_WEBHOOK_KEY
    if (!secretKey) {
        throw new Error('Missing Paddle secret key')
    }

    const computedHmac = crypto
        .createHmac('sha256', secretKey)
        .update(signedPayload)
        .digest('hex')

    if (computedHmac !== h1) {
        console.error('Invalid Paddle signature')
        return false
    }

    return true
}

const routeHandler = async (req: NextRequest) => {
    if (req.method !== 'POST') {
        return new NextResponse('Method Not Allowed', { status: 405 })
    }

    const isValid = await validateWebhook(req)
    if (!isValid) {
        return new NextResponse('Invalid Webhook Signature', { status: 400 })
    }

    const event = await req.json()
    console.log('=== event', event)

    // Handle the event here as needed
    // const subscriptionId = event.subscription_id;
    // const userId = event.user_id; // assuming you have a user_id in the metadata

    // if (!userId) {
    //     return new NextResponse('No user_id in metadata', { status: 200 });
    // }

    // if (event.alert_name === 'subscription_created' || event.alert_name === 'subscription_updated') {
    //     await db.user.update({
    //         where: { id: userId },
    //         data: {
    //             paddleSubscriptionId: subscriptionId,
    //             paddleCustomerId: event.customer_id,
    //             paddlePlanId: event.subscription_plan_id,
    //             paddleCurrentPeriodEnd: new Date(event.next_bill_date),
    //         },
    //     });
    // }

    // if (event.alert_name === 'subscription_payment_succeeded') {
    //     await db.user.update({
    //         where: { paddleSubscriptionId: subscriptionId },
    //         data: {
    //             paddlePlanId: event.subscription_plan_id,
    //             paddleCurrentPeriodEnd: new Date(event.next_bill_date),
    //         },
    //     });
    // }

    return new NextResponse('Webhook received', { status: 200 })
}

export { routeHandler as POST }
