import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '@/trpc';

/**
 * A function that handles the request by fetching data from a specified endpoint using the given request object.
 *
 * @param {Request} req - the request object containing information about the request
 * @return {Promise<any>} a promise that resolves to the fetched data
 */
const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: () => ({})
  });

export { handler as GET, handler as POST };