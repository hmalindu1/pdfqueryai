import { db } from '@/db'
import { openai } from '@/lib/openai'
import { pinecone } from '@/lib/pinecone'
import { sendMessageValidators } from '@/lib/validators/SendMessageValidators'
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import { OpenAIEmbeddings } from '@langchain/openai'
import { PineconeStore } from '@langchain/pinecone'
import { NextRequest } from 'next/server'

import { OpenAIStream, StreamingTextResponse } from "ai";

export const POST = async (req: NextRequest) => {
    // endpoint for asking a question to a pdf file

    const body = await req.json()

    const { getUser } = getKindeServerSession()
    const user = await getUser()

    if (!user || !user.id) {
        return new Response('Unauthorized', { status: 401 })
    }

    const userId = user.id
    
    const { fileId, message } = sendMessageValidators.parse(body)

    const file = await db.file.findUnique({ where: { id: fileId, userId } })

    if (!file) {
        return new Response('Not found', { status: 404 })
    }

    await db.message.create({
        data: {
            text: message,
            isUserMessage: true,
            userId,
            fileId
        }
    })

    // 1: vectorize message

    const pineconeIndex = pinecone.Index('quizz')

    const embeddings = new OpenAIEmbeddings({
        openAIApiKey: process.env.OPENAI_API_KEY
    })

    const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
        pineconeIndex,
        namespace: file.id
    })

    const results = await vectorStore.similaritySearch(message, 4)

    const prevMessages = await db.message.findMany({
        where: {
            fileId
        },
        orderBy: {
            createdAt: 'asc'
        },
        take: 6
    })

    const formattedMessages = prevMessages.map((message) => ({
        role: message.isUserMessage
            ? ('user' as const)
            : ('assistant' as const),
        content: message.text
    }))

    const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        temperature: 0,
        stream: true,
        messages: [
            {
                role: 'system',
                content:
                    'Use the following pieces of context (or previous conversaton if needed) to answer the users question in markdown format.'
            },
            {
                role: 'user',
                content: `Use the following pieces of context (or previous conversaton if needed) to answer the users question in markdown format. \nIf you don't know the answer, just say that you don't know, don't try to make up an answer.
        
                \n----------------\n
                
                PREVIOUS CONVERSATION:
                ${formattedMessages.map((message) => {
                    if (message.role === 'user')
                        return `User: ${message.content}\n`
                    return `Assistant: ${message.content}\n`
                })}
                
                \n----------------\n
                
                CONTEXT:
                ${results.map((r) => r.pageContent).join('\n\n')}
                
                USER INPUT: ${message}`
            }
        ]
    })

    const stream = OpenAIStream(response, {
        async onCompletion(completion) {
            await db.message.create({
                data: {
                    text: completion,
                    isUserMessage: false,
                    userId,
                    fileId
                }
            })
        }
    })

    return new StreamingTextResponse(stream)

}
