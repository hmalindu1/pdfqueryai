'use client'

import React from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`

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
    return (
        <div className="w-full bg-white rounded-md shadow flex flex-col items-center">
            <div className="h-14 w-full border-b border-zinc-200 flex items-center justify-between px-2">
                <div className="flex items-center gap-1.5">Top Bar</div>
            </div>

            <div className="flex-1 w-full max-h-screen">
                <div>
                    <Document file={url} className="max-h-full">
                        <Page pageNumber={1} />
                    </Document>
                </div>
            </div>
        </div>
    )
}

export default PdfRenderer
