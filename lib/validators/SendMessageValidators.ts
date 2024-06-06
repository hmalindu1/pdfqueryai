import { z } from 'zod'

export const sendMessageValidators = z.object({
    fileId: z.string(),
    message: z.string()
})
