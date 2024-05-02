'use client'
import React, { useState } from 'react'
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog'
import { Button } from './ui/button'
import Dropzone from 'react-dropzone'
import { Cloud, File } from 'lucide-react'

const UploadDropzone = () => {
    return (
        <Dropzone
            multiple={false}
            onDrop={(acceptedFiles) => console.log(acceptedFiles)}
        >
            {({ getRootProps, getInputProps, acceptedFiles }) => (
                <div
                    {...getRootProps()}
                    className="border h-64 m-4 border-dashed border-gray-300 rounded-lg"
                >
                    <div className="flex items-center justify-center h-full w-full">
                        <label
                            htmlFor="dropzone-file"
                            className="flex flex-col items-center justify-center w-full h-full cursor-pointer bg-gray-50 hover:bg-gray-100 rounded-lg transition-all duration-300"
                        >
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <input {...getInputProps()} />
                                <Cloud className="h-6 w-6 text-zinc-500 mb-2" />
                                <p className="mb-2 text-sm text-zinc-700">
                                    <span className="font-semibold">
                                        Click to upload
                                    </span>{' '}
                                    or drag and drop
                                </p>
                                <p className="text-xs text-zinc-500">
                                    PDF (up to 4MB)
                                </p>
                            </div>
                            {acceptedFiles && acceptedFiles[0] ? (
                                <div className="max-w-xs bg-white flex items-center rounded-md overflow-hidden outline outline-[1px] outline-zinc-200 devide-x devider-zinc-200">
                                    <div className="px-3 py-2 h-full grid place-items-center">
                                        <File className="h-4 w-4 text-purple-500" />
                                    </div>
                                    <div className='px-3 py-2 h-full text-sm truncate'>
                                        Lorem ipsum dolor sit amet consectetur adipisicing elit. Asperiores, voluptatem!
                                    </div>
                                </div>
                            ) : null}
                        </label>
                    </div>
                </div>
            )}
        </Dropzone>
    )
}

const UploadButton = () => {
    const [isOpen, setIsOpen] = useState<boolean>(false)
    return (
        <Dialog
            open={isOpen}
            onOpenChange={(v) => {
                if (!v) {
                    setIsOpen(v)
                }
            }}
        >
            <DialogTrigger asChild onClick={() => setIsOpen(true)}>
                <Button>Upload PDF</Button>
            </DialogTrigger>

            <DialogContent>
                <UploadDropzone />
            </DialogContent>
        </Dialog>
    )
}

export default UploadButton
