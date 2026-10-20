"use client";

import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { useState } from "react";
import { ApiClientError } from "@/lib/api";

// An expired or invalid session on any request sends the user back to the login page.
function handleSessionExpiry(error: unknown) {
  if (error instanceof ApiClientError && error.status === 401) {
    // Hard navigation on purpose: it also clears the cached data of the expired session.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.assign("/login");
  }
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({ onError: handleSessionExpiry }),
        mutationCache: new MutationCache({ onError: handleSessionExpiry }),
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            // Client errors (4xx) will not succeed on retry.
            retry: (failureCount, error) =>
              !(
                error instanceof ApiClientError &&
                error.status >= 400 &&
                error.status < 500
              ) && failureCount < 2,
          },
        },
      }),
  );

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
