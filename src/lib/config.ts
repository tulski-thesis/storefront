import Medusa from "@medusajs/medusa-js"
import { QueryClient } from "@tanstack/react-query"

// Defaults to standard port for Medusa server
let BACKEND_URL = "http://localhost:9000"

if (process.env.NEXT_PUBLIC_BACKEND_URL) {
  BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 60 * 24,
      retry: 1,
    },
  },
})

const medusaClient = new Medusa({ baseUrl: BACKEND_URL, maxRetries: 3 })

export { BACKEND_URL, queryClient, medusaClient }
