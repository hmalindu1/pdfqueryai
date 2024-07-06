import { ReactNode, createContext, useRef, useState } from 'react'
import { useToast } from '../ui/use-toast'
import { useMutation } from '@tanstack/react-query'
import { trpc } from '@/app/_trpc/client'
import { INFINITE_QUERY_LIMIT } from '@/config/infinite-query'
import { useIntersection } from "@mantine/hooks";

type StreamResponse = {
    addMessage: () => void
    message: string
    handleInputChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void
    isLoading: boolean
}

export const ChatContext = createContext<StreamResponse>({
    addMessage: () => {},
    message: '',
    handleInputChange: () => {},
    isLoading: false
})

interface Props {
    fileId: string
    children: ReactNode
}

/**
 * Chat context provider function that handles sending messages, updating message history, and managing loading states.
 *
 * @param {Props} fileId - The ID of the file
 * @param {Props} children - The children elements to be rendered
 * @return {void}
 */
export const ChatContextProvider = ({ fileId, children }: Props) => {
    const [message, setMessage] = useState<string>('')
    const [isLoading, setIsLoading] = useState<boolean>(false)

    const utils = trpc.useUtils()

    const { toast } = useToast()

    const backupMessage = useRef('')

    const { mutate: sendMessage } = useMutation({
        /**
         * Sends a message to the server using the '/api/message' endpoint.
         *
         * @param {Object} options - The options object.
         * @param {string} options.message - The message to be sent.
         * @return {Promise<ReadableStream>} The response body from the server.
         * @throws {Error} If the server response is not ok.
         */
        mutationFn: async ({ message }: { message: string }) => {
            const response = await fetch('/api/message', {
                method: 'POST',
                body: JSON.stringify({
                    fileId,
                    message
                })
            })

            if (!response.ok) {
                throw new Error('Failed to send message')
            }

            return response.body
        },
    /**
     * Saves the current message as a backup, clears the message input, cancels any ongoing file messages requests,
     * retrieves the previous messages, updates the file messages with the new message, and sets the loading state to true.
     *
     * @param {Object} options - The options object.
     * @param {string} options.message - The message to be sent.
     * @return {Promise<Object>} An object containing the previous messages.
     * @throws {Error} If the server response is not ok.
     */
        onMutate: async ({ message }) => {
            backupMessage.current = message
            setMessage('')

            // step 1
            await utils.getFileMessages.cancel()

            // step 2
            const previousMessages = utils.getFileMessages.getInfiniteData()

            // step 3
            utils.getFileMessages.setInfiniteData(
                { fileId, limit: INFINITE_QUERY_LIMIT },
                (old) => {
                    if (!old) {
                        return {
                            pages: [],
                            pageParams: []
                        }
                    }

                    let newPages = [...old.pages]

                    let latestPage = newPages[0]!

                    latestPage.messages = [
                        {
                           createdAt: new Date().toISOString(),
                            id: crypto.randomUUID(),
                            text: message,
                            isUserMessage: true
                        },
                        ...latestPage.messages
                    ]

                    newPages[0] = latestPage

                    return {
                        ...old,
                        pages: newPages
                    }
                }
            )

            setIsLoading(true)

            return {
                previousMessages:
                    previousMessages?.pages.flatMap((page) => page.messages) ??
                    []
            }
        },
        /**
         * Handles the success callback for the stream.
         *
         * @param {ReadableStream} stream - The stream object.
         * @return {Promise<void>} - A promise that resolves when the function completes.
         */
        onSuccess: async (stream) => {
            setIsLoading(false)

            if (!stream) {
                return toast({
                    title: 'There was a problem sending this message',
                    description: 'Please refresh this page and try again',
                    variant: 'destructive'
                })
            }

            const reader = stream.getReader()
            const decoder = new TextDecoder()
            let done = false

            // accumulated response
            let accResponse = ''

            while (!done) {
                const { value, done: doneReading } = await reader.read()
                done = doneReading
                if (value) {
                    const chunkValue = decoder.decode(value, { stream: true })
                    accResponse += chunkValue

                    // Remove unwanted characters from chunkValue (if necessary)
                    const cleanedChunk = chunkValue
                        .replace(/0:/g, '')
                        .replace(/\n/g, '')
                        .replace(/"/g, '')

                    // Update the UI with the chunk response
                    utils.getFileMessages.setInfiniteData(
                        { fileId, limit: INFINITE_QUERY_LIMIT },
                        (old) => {
                            if (!old) return { pages: [], pageParams: [] }

                            let isAiResponseCreated = old.pages.some((page) =>
                                page.messages.some(
                                    (message) => message.id === 'ai-response'
                                )
                            )

                            let updatedPages = old.pages.map((page) => {
                                if (page === old.pages[0]) {
                                    let updatedMessages

                                    if (!isAiResponseCreated) {
                                        updatedMessages = [
                                            {
                                                createdAt:
                                                    new Date().toISOString(),
                                                id: 'ai-response',
                                                text: cleanedChunk,
                                                isUserMessage: false
                                            },
                                            ...page.messages
                                        ]
                                    } else {
                                        updatedMessages = page.messages.map(
                                            (message) => {
                                                if (
                                                    message.id === 'ai-response'
                                                ) {
                                                    return {
                                                        ...message,
                                                        text:
                                                            message.text +
                                                            cleanedChunk
                                                    }
                                                }
                                                return message
                                            }
                                        )
                                    }

                                    return {
                                        ...page,
                                        messages: updatedMessages
                                    }
                                }

                                return page
                            })

                            return { ...old, pages: updatedPages }
                        }
                    )
                }
            }
        },
        /**
         * Handles the error by restoring the backup message and updating the file messages.
         *
         * @param {unknown} _ - The first unused parameter.
         * @param {unknown} __ - The second unused parameter.
         * @param {object} context - The context object containing the previous messages.
         * @return {void} This function does not return anything.
         */
        onError: (_, __, context) => {
            setMessage(backupMessage.current)
            utils.getFileMessages.setData(
                { fileId },
                { messages: context?.previousMessages ?? [] }
            )
        },
        onSettled: async () => {
            setIsLoading(false)

            await utils.getFileMessages.invalidate({ fileId })
        }
    })

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setMessage(e.target.value)
    }

    const addMessage = () => sendMessage({ message })

    return (
        <ChatContext.Provider
            value={{
                addMessage,
                message,
                handleInputChange,
                isLoading
            }}
        >
            {children}
        </ChatContext.Provider>
    )
}
