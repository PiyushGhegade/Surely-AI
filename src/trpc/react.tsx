"use client";

import {
  createTRPCClient,
  createWSClient,
  httpBatchLink,
  splitLink,
  wsLink,
  type TRPCLink,
} from "@trpc/client";
import { type inferRouterInputs, type inferRouterOutputs } from "@trpc/server";
import SuperJSON from "superjson";

import { type AppRouter } from "@/server/api/root";
import { type TRPCError } from "@trpc/server";
import { toast } from "react-toastify";

export const getTrpcClient = () => {
  return createTRPCClient<AppRouter>({
    links: [getEndingLink()],
  });
};
export type GetTrpcClientType = ReturnType<typeof getTrpcClient>;

function getEndingLink(): TRPCLink<AppRouter> {
  const getBaseUrl = () => {
    if (typeof window !== "undefined") return "";
    if (process.env.NEXT_PUBLIC_URL) return process.env.NEXT_PUBLIC_URL;
    return "http://localhost:3000";
  };

  if (typeof window === "undefined") {
    return httpBatchLink({
      transformer: SuperJSON,
      url: getBaseUrl() + "/api/trpc",
      headers: () => {
        const headers = new Headers();
        headers.set("x-trpc-source", "nextjs-react");
        return headers;
      },
    });
  }

  const host = process.env.NEXT_PUBLIC_SOCKET_HOST || "localhost";
  const port = process.env.NEXT_PUBLIC_SOCKET_SERVER_EXPOSED_PORT || "3001";
  let socket_url = host.includes(":") ? host : `${host}:${port}`;
  if (!socket_url.startsWith("ws://") && !socket_url.startsWith("wss://")) {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    socket_url = `${protocol}//${socket_url}`;
  }
  console.log(`created websocket client for: ${socket_url}`);
  const client = createWSClient({
    url: socket_url,
  });

  return splitLink({
    condition: (op) => op.type === "subscription",
    true: wsLink({
      client,
      transformer: SuperJSON,
    }),
    false: httpBatchLink({
      transformer: SuperJSON,
      url: getBaseUrl() + "/api/trpc",
      headers: () => {
        const headers = new Headers();
        headers.set("x-trpc-source", "nextjs-react");
        return headers;
      },
    }),
  });
}

export function handleErr<T>(
  promise: Promise<T>,
  onSuccess?: (res: T) => void,
  onErr?: (err: TRPCError) => void,
) {
  promise.then(onSuccess).catch((err: TRPCError) => {
    toast.error(err.message);
    console.error("An error occurred:", err);
    onErr?.(err);
  });
}

/**
 * Inference helper for inputs.
 *
 * @example type HelloInput = RouterInputs['example']['hello']
 */
export type RouterInputs = inferRouterInputs<AppRouter>;

/**
 * Inference helper for outputs.
 *
 * @example type HelloOutput = RouterOutputs['example']['hello']
 */
export type RouterOutputs = inferRouterOutputs<AppRouter>;
