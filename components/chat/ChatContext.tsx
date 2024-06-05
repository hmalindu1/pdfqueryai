import { createContext, useState } from 'react'
import { useToast } from '../ui/use-toast'
import { useMutation } from '@tanstack/react-query'

type StreamResponse = {
    addMessage: () => void
    message: string
    handleInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void
    isLoading: boolean
}

export const ChatContext = createContext<StreamResponse>({
    addMessage: () => {},
    message: '',
    handleInputChange: () => {},
    isLoading: false
})

interface ChatContextProviderProps {
    fileId: string
    children: React.ReactNode
}

export const ChatContextProvider = ({
    fileId,
    children
}: ChatContextProviderProps) => {
    const [message, setMessage] = useState<string>('')
    const [isLoading, setIsLoading] = useState<boolean>(false)

    const { toast } = useToast()

    const { mutate: sendMessage } = useMutation({
        mutationFn: async ({message} : {message: string}) => {
            const response = await fetch('api/message', {
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
        }
    })

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setMessage(e.target.value)
    }

    const addMessage = () => {
        sendMessage({ message })
    }

    return (<div>
        <ChatContext.Provider value={{
            addMessage, message, handleInputChange, isLoading

        }}>
            {children}
        </ChatContext.Provider>
    </div>)
}