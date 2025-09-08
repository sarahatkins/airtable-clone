import {
  defaultShouldDehydrateQuery,
  QueryClient,
} from "@tanstack/react-query";
import SuperJSON from "superjson";
import type { AppRouter } from "~/server/api/root";
import {
  createTRPCClient,
  httpBatchLink,
  httpBatchStreamLink,
  splitLink
} from "@trpc/client";
import superjson from "superjson";

export const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        // With SSR, we usually want to set some default staleTime
        // above 0 to avoid refetching immediately on the client
        staleTime: 30 * 1000,
      },
      dehydrate: {
        serializeData: SuperJSON.serialize,
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === "pending",
      },
      hydrate: {
        deserializeData: SuperJSON.deserialize,
      },
    },
  });

export const trpcClient = createTRPCClient<AppRouter>({
  links: [
    splitLink({
      condition(op) {
        return Boolean(op.context.skipBatch);
      },
      true: httpBatchStreamLink({
        transformer: superjson,
        url: "/api/trpc",
      }),
      false: httpBatchLink({
        transformer: superjson,
        url: "/api/trpc",
      }),
    }),
  ],
});
