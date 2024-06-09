import React from 'react'
import MaxWIdthWrapper from './MaxWIdthWrapper'
import Link from 'next/link'
import { buttonVariants } from './ui/button'
import { LoginLink, RegisterLink } from '@kinde-oss/kinde-auth-nextjs/server'
import { ArrowRight } from 'lucide-react'

/**
 * Renders the navigation bar component.
 *
 * @return {JSX.Element} The navigation bar component.
 */
const Navbar = () => {
    return (
        <nav className="sticky h-14 inset-x-0 top-0 z-30 w-full border-b border-gray-200 bg-white/75 backdrop-blur-lg transition-all">
            <MaxWIdthWrapper>
                <div className="flex h-14 items-center justify-between border-b boreder-zinc-200">
                    <Link href="/" className="flex z-40 font-semibold">
                        <span>PDF Query Ai</span>
                    </Link>

                    {/* todoo: add mobile navbar */}

                    <div className="hidden items-center space-x-4 sm:flex">
                        <>
                            <Link
                                href={'/pricing'}
                                className={buttonVariants({
                                    variant: 'ghost',
                                    size: 'sm'
                                })}
                            >
                                Pricing
                            </Link>
                            <LoginLink
                                className={buttonVariants({
                                    variant: 'ghost',
                                    size: 'sm'
                                })}
                            >
                                Sign In
                            </LoginLink>
                            <RegisterLink
                                className={buttonVariants({
                                    size: 'sm'
                                })}
                            >
                                Get Started{' '}
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </RegisterLink>
                        </>
                    </div>
                </div>
            </MaxWIdthWrapper>
        </nav>
    )
}

export default Navbar
