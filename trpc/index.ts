import { publicProcedure, router } from './trpc'
export const appRouter = router({
    test: publicProcedure.query(() => {
        return
    }),     
})
export type AppRouter = typeof appRouter
