import BillingForm from '@/components/BillingForm'
import { getUserSubscriptionPlan } from '@/lib/paddle'

const Page = async () => {
    const subscriptionPlan = await getUserSubscriptionPlan()

    return <BillingForm subscriptionPlan={subscriptionPlan} />
}

export default Page
