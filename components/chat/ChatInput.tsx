import React, { useContext, useRef } from 'react'
import { Textarea } from '../ui/textarea'
import { Button } from '../ui/button'
import { Send } from 'lucide-react'
import { ChatContext } from './ChatContext'

interface ChatInputProps {
    isDisabled?: boolean
}

const ChatInput = ({ isDisabled }: ChatInputProps) => {
    const { addMessage, handleInputChange, isLoading, message } =
        useContext(ChatContext)

    const textAreaRef = useRef<HTMLTextAreaElement>(null)

    return (
        <div className="absolute bottom-0 left-0 w-full">
            <div className="mx-2 flex flex-row gap-3 md:mx-4 md:last:mb-6 lg:mx-auto lg:max-w-2xl xl:max-w-3xl">
                <div className="relative flex h-full flex-1 items-stretch md:flex-col">
                    <div className="relative flex flex-col w-full flex-grow p-4">
                        <div className="relative">
                            <Textarea
                                placeholder="Enter your question"
                                rows={1}
                                ref={textAreaRef}
                                value={message}
                                maxRows={4}
                                autoFocus
                                onChange={handleInputChange}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault()
                                        addMessage()
                                        textAreaRef.current?.focus()
                                    }
                                }}
                                className="resize-none pr-12 text-base py-3 scrollbar-thumb-purple scrollbar-thumb-rounded scrollbar-track-purple-lighter scrollbar-w-2 scrolling-touch"
                            />

                            <Button
                                disabled={isLoading || isDisabled}
                                aria-label="send message"
                                className="absolute bottom-1.5 right-[8px]"
                                onClick={() => {
                                    addMessage()
                                    textAreaRef.current?.focus()
                                }}
                            >
                                <Send className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ChatInput
