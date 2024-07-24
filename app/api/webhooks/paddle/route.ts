import { db } from '@/db'
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import * as Serialize from 'php-serialize'

const allowedIpAdresses = [
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

function ksort(obj: any) {
    const keys = Object.keys(obj).sort()
    const sortedObj: any = {}
    for (const key of keys) {
        sortedObj[key] = obj[key]
    }
    return sortedObj
}

async function validateWebhook(req: NextRequest) {
    if (!allowedIpAdresses.includes(getIpAddress(req))) {
        console.error('No valid Paddle IP address')
        return false
    }

    let jsonObj = await req.json()

    if (!jsonObj) {
        console.error('Invalid JSON object')
        return false
    }

    const paddleSignature = req.headers.get('Paddle-Signature')

    if (!paddleSignature) {
        console.error('Missing Paddle signature')
        return false
    }

    const mySig = paddleSignature // Already a string
    jsonObj = ksort(jsonObj)

    for (const property in jsonObj) {
        if (
            jsonObj.hasOwnProperty(property) &&
            typeof jsonObj[property] !== 'string'
        ) {
            if (Array.isArray(jsonObj[property])) {
                jsonObj[property] = jsonObj[property].toString()
            } else {
                jsonObj[property] = JSON.stringify(jsonObj[property])
            }
        }
    }

    const serialized = Serialize.serialize(jsonObj)
    const verifier = crypto.createVerify('sha1')
    verifier.update(serialized)
    verifier.end()

    const publicKey = process.env.PADDLE_PUBLIC_KEY?.replace(/\\n/g, '\n') || ''
    const isValid = verifier.verify(publicKey, mySig, 'base64')

    if (!isValid) {
        console.error('Invalid Paddle signature')
    }

    return isValid
}

const routeHandler = async (req: NextRequest) => {
    if (req.method !== 'POST') {
        return new NextResponse('Method Not Allowed', { status: 405 })
    }

    if (!(await validateWebhook(req))) {
        return new NextResponse('Invalid Webhook Signature', { status: 400 })
    }

    const event = await req.json()

    console.log('=== event', event)

    // const subscriptionId = event.subscription_id
    // const userId = event.user_id // assuming you have a user_id in the metadata

    // if (!userId) {
    //     return new NextResponse('No user_id in metadata', { status: 200 })
    // }

    // if (
    //     event.alert_name === 'subscription_created' ||
    //     event.alert_name === 'subscription_updated'
    // ) {
    //     await db.user.update({
    //         where: { id: userId },
    //         data: {
    //             paddleSubscriptionId: subscriptionId,
    //             paddleCustomerId: event.customer_id,
    //             paddlePlanId: event.subscription_plan_id,
    //             paddleCurrentPeriodEnd: new Date(event.next_bill_date)
    //         }
    //     })
    // }

    // if (event.alert_name === 'subscription_payment_succeeded') {
    //     await db.user.update({
    //         where: { paddleSubscriptionId: subscriptionId },
    //         data: {
    //             paddlePlanId: event.subscription_plan_id,
    //             paddleCurrentPeriodEnd: new Date(event.next_bill_date)
    //         }
    //     })
    // }

    return new NextResponse('Webhook received', { status: 200 })
}

export { routeHandler as POST }
