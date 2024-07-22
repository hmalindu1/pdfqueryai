import clsx, { ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merges and concatenates class values using the `clsx` and `twMerge` functions.
 *
 * @param {ClassValue[]} input - An array of class values to be merged and concatenated.
 * @return {ClassValue} - The merged and concatenated class value.
 */
export const cn = (...input: ClassValue[]) => {
    return twMerge(clsx(input))
}


export function absoluteUrl(path: string) {
    if (typeof window !== 'undefined') return path
    if (process.env.VERCEL_URL)
        return `https://${process.env.VERCEL_URL}${path}`
    return `http://localhost:${process.env.PORT ?? 3000}${path}`
}

