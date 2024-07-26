import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import { db } from '@/db'

const allowedIpAddresses = [
    '34.194.127.46',
    '54.234.237.108',
    '3.208.120.145',
    '44.226.236.210',
    '44.241.183.62',
    '100.20.172.113',
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

async function validateWebhook(
    req: NextRequest,
    rawBody: string
): Promise<boolean> {
    const ipAddress = getIpAddress(req)
    console.log('Received IP Address:', ipAddress)
    if (!allowedIpAddresses.includes(ipAddress)) {
        console.error('No valid Paddle IP address')
        return false
    }

    const paddleSignature = req.headers.get('Paddle-Signature')
    if (!paddleSignature) {
        console.error('Missing Paddle signature')
        return false
    }

    const signatureParts = paddleSignature.split(';')
    const signatureMap = new Map<string, string>()
    signatureParts.forEach((part) => {
        const [key, value] = part.split('=')
        if (key && value) {
            signatureMap.set(key, value)
        }
    })

    const ts = signatureMap.get('ts')
    const h1 = signatureMap.get('h1')
    if (!ts || !h1) {
        console.error('Invalid Paddle signature format')
        return false
    }

    // Build the signed payload
    const signedPayload = `${ts}:${rawBody}`
    console.log('Signed Payload:', signedPayload)

    // Compute the HMAC
    const secretKey = process.env.PADDLE_WEBHOOK_KEY
    if (!secretKey) {
        throw new Error('Missing Paddle secret key')
    }

    const computedHmac = crypto
        .createHmac('sha256', secretKey)
        .update(signedPayload)
        .digest('hex')

    console.log('Computed HMAC:', computedHmac, 'Received HMAC:', h1)

    if (computedHmac !== h1) {
        console.error('Invalid Paddle signature')
        return false
    }

    return true
}

const routeHandler = async (req: NextRequest) => {
    try {
        const session = await getKindeServerSession()
        console.log('Session:', session)

        const user = session ? await session.getUser() : null
        console.log('Authenticated User:', user)

        if (!user?.id) {
            console.error('User ID is null or undefined')
            return new NextResponse('Unauthorized', { status: 401 })
        }

        if (req.method !== 'POST') {
            return new NextResponse('Method Not Allowed', { status: 405 })
        }

        const rawBody = await req.text() // Read the raw body only once
        const isValid = await validateWebhook(req, rawBody)
        if (!isValid) {
            return new NextResponse('Invalid Webhook Signature', {
                status: 400
            })
        }

        const event = JSON.parse(rawBody) // Parse the raw body as JSON
        console.log('=== event', event)

        if (event.event_type === 'subscription.activated') {
            console.log(
                '=== subscription.activated price Id',
                event.data.items[0].price.id
            )
            await db.user.update({
                where: { id: user.id },
                data: {
                    paddleSubscriptionId: event.data.id,
                    paddleCustomerId: event.data.customer_id,
                    paddlePriceId: event.data.items[0].price.id,
                    paddleCurrentPeriodEnd: new Date(
                        event.data.current_billing_period.ends_at
                    )
                }
            })
        }

        return new NextResponse('Webhook received', { status: 200 })
    } catch (error) {
        console.error('Error handling webhook:', error)
        return new NextResponse('Internal Server Error', { status: 500 })
    }
}

export { routeHandler as POST }
