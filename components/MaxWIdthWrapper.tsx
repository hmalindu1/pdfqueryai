/* ================================================================================================ /
 * Title : Wrapper
 * Description : Spacing of the left and right hand side accross all pages
 * Author : Hashan
 * Date : March 9th, 2024
 /* ================================================================================================ */

import { cn } from '@/lib/utils'
import React, { ReactNode } from 'react'


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
