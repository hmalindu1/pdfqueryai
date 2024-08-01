import clsx, { ClassValue } from 'clsx'
import { Metadata } from 'next/types'
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

export function constructMetadata({
    title = 'PDFQueryAi - Chat with your PDF files',
    description = 'PDFQueryAi is a powerful chatbot that can help you with your PDF files. Chat with PDFQueryAi now!',
    image = '/thumbnail.png',
    icons = '/favicon.ico',
    noIndex = false
}: {
    title?: string
    description?: string
    image?: string
    icons?: string
    noIndex?: boolean
} = {}): Metadata {
    return {
        title,
        description,
        openGraph: {
            title,
            description,
            images: [
                {
                    url: image
                }
            ]
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [image],
            creator: ''
        },
        icons,
        metadataBase: new URL('https://www.pdfqueryai.com'),
        themeColor: '#FFF',
        ...(noIndex && {
            robots: {
                index: false,
                follow: false
            }
        })
    }
}