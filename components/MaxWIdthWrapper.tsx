/* ================================================================================================ /
 * Title : Wrapper
 * Description : Spacing of the left and right hand side accross all pages
 * Author : Hashan
 * Date : March 9th, 2024
 /* ================================================================================================ */

import { cn } from '@/lib/utils'
import React, { ReactNode } from 'react'

/**
 * A higher-order component that wraps the children with a div, applying a max width and centering the content.
 *
 * @param {string} className - optional class name for the wrapping div
 * @param {ReactNode} children - the children to be wrapped
 * @return {ReactNode} the wrapped children within a centered and max width div
 */
const MaxWIdthWrapper = ({
    className,
    children
}: {
    className?: string
    children: ReactNode
}) => {
    return (
        <div
            className={cn(
                'mx-auto w-full max-w-screen-xl px-2.5 md:px-20',
                className
            )}
        >
            {children}
        </div>
    )
}
export default MaxWIdthWrapper
