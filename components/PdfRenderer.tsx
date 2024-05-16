'use client'

import { ChevronDown, ChevronUp, Loader2 } from 'lucide-react'
import React, { useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'
import { useToast } from './ui/use-toast'
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`
import { useResizeDetector } from 'react-resize-detector'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { cn } from '@/lib/utils'

interface PdfRendererProps {
    url: string
}

/**
 * Renders a PDF document based on the provided URL.
 *
 * @param {string} url - The URL of the PDF file to render
 * @return {JSX.Element} The rendered PDF document component
 */
const PdfRenderer = ({ url }: PdfRendererProps) => {
    const { toast } = useToast()

    const [numPages, setNumPages] = useState<number>()
    const [currPage, setCurrPage] = useState<number>(1)

    const customPageValidator = z.object({
        page: z
            .string()
            .refine((num) => Number(num) > 0 && Number(num) <= numPages!)
    })

    type TCustomPageValidator = z.infer<typeof customPageValidator>

    const {
        register,
        formState: { errors },
        handleSubmit,
        setValue
    } = useForm<TCustomPageValidator>({
        defaultValues: {
            page: '1'
        },
        resolver: zodResolver(customPageValidator)
    })

    const { width, ref } = useResizeDetector()

    /**
     * Updates the current page number and sets the value for the page.
     *
     * @param {TCustomPageValidator} page - The page object containing the page number
     * @return {void} No return value
     */
    const handlePageSubmit = ({ page }: TCustomPageValidator) => {
        setCurrPage(Number(page))
        setValue('page', String(page))
    }

    return (
        <div className="w-full bg-white rounded-md shadow flex flex-col items-center">
            <div className="h-14 w-full border-b border-zinc-200 flex items-center justify-between px-2">
                <div className="flex items-center gap-1.5">
                    <Button
                        variant="ghost"
                        aria-label="Previous Page"
                        disabled={currPage <= 1}
                        onClick={() =>
                            setCurrPage((prev) => (prev - 1 > 1 ? prev - 1 : 1))
                        }
                    >
                        <ChevronDown className="h-4 w-4" />
                    </Button>

                    <div className="flex items-center gap-1.5">
                        <Input
                            {...register('page')}
                            className={cn('w-12 h-8', errors.page && 'focus-visible:ring-red-500')}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter') {
                                    handleSubmit(handlePageSubmit)()
                                }
                            }}
                        />
                        <p className="text-zinc-700 text-sm space-x-1">
                            <span>/</span>
                            <span>{numPages ?? 'x'}</span>
                        </p>
                    </div>

                    <Button
                        disabled={
                            numPages === undefined || currPage === numPages
                        }
                        variant="ghost"
                        aria-label="Next Page"
                        onClick={() =>
                            setCurrPage((prev) =>
                                prev + 1 > numPages! ? numPages! : prev + 1
                            )
                        }
                    >
                        <ChevronUp className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className="flex-1 w-full max-h-screen">
                <div ref={ref}>
                    <Document
                        loading={
                            <div className="flex justify-center">
                                <Loader2 className="my-24 h-6 w-6 animate-spin" />
                            </div>
                        }
                        onLoadError={() => {
                            toast({
                                title: 'Error loading PDF',
                                description: 'Please try again later',
                                variant: 'destructive'
                            })
                        }}
                        onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                        file={url}
                        className="max-h-full"
                    >
                        <Page width={width ? width : 1} pageNumber={currPage} />
                    </Document>
                </div>
            </div>
        </div>
    )
}

export default PdfRenderer
