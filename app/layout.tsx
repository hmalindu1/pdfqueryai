import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { cn, constructMetadata } from '@/lib/utils'
import Navbar from '@/components/Navbar'
import Providers from '@/components/Providers'

import 'react-loading-skeleton/dist/skeleton.css'
import "simplebar-react/dist/simplebar.min.css";
import { Toaster } from '@/components/ui/toaster'
import Footer from '@/components/Footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata = constructMetadata()

/**
 * Component for the root layout of the application.
 *
 * @param {React.ReactNode} children - The child elements to be rendered within the layout.
 * @return {JSX.Element} The root layout component.
 */
export default function RootLayout({
    children
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="en">
            <Providers>
                <body
                    className={cn(
                        `min-h-screen font-sans antialiased grainy `,
                        inter.className
                    )}
                >
                    <Toaster />
                    <Navbar />
                    {children}
                    <Footer />
                </body>
            </Providers>
        </html>
    )
}
