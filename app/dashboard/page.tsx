import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import { redirect } from 'next/navigation'
import React from 'react'

/**
 * Generates the Dashboard component asynchronously.
 *
 * @return {JSX.Element} The JSX element displaying the user's email within a div.
 */
const Dashboard = async () => {
    const { getUser } = getKindeServerSession()
    const user = await getUser()

    if (!user || !user.id) redirect('/auth-callback?origin=dashboard')

    return <div>{user?.email}</div>
}

export default Dashboard
