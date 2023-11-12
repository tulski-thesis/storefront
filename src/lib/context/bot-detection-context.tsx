import { createContext, useEffect, useState } from "react"
import { useLocalStorage } from "@lib/hooks/use-local-storage"
import { BotClient, BotAnalysisResult } from "@tulski/bot-client"
import * as process from "process"
import { medusaClient } from "@lib/config"
import { medusaRequestHeaders } from "@lib/medusa-fetch"
import { useMedusa } from "medusa-react"
import SkeletonCollectionPage from "@modules/skeletons/templates/skeleton-collection-page"

const BOT_ENABLED = process.env.NEXT_PUBLIC_BOT_ENABLED || false
const BOT_API = process.env.NEXT_PUBLIC_BOT_API_URL || "http://localhost:3030"
const BOT_HEADER_KEY = process.env.NEXT_PUBLIC_BOT_HEADER || "x-bot-id"
const BOT_STORAGE_KEY = process.env.NEXT_PUBLIC_BOT_STORAGE || "bot-report"

interface BotDetectionContext {
  result: BotAnalysisResult | null
  analyze: () => void
}

export const BotDetectionContext = createContext<BotDetectionContext | null>(
  null
)

interface BotDetectionProviderProps {
  children?: React.ReactNode
}

export const BotDetectionProvider = ({
  children,
}: BotDetectionProviderProps) => {
  const [result, setResult] = useLocalStorage(BOT_STORAGE_KEY, null)
  const [isLoading, setIsLoading] = useState(BOT_ENABLED)
  const medusa = useMedusa()

  const analyze = async () => {
    const client = await BotClient.load(BOT_API)
    const result = await client.analyze()
    setResult(result)
  }

  const getBotId = () => {
    return result?.id || ""
  }

  const setupHeader = () => {
    medusaRequestHeaders[BOT_HEADER_KEY] = getBotId()
    // @ts-ignore
    medusa.client.client.config.customHeaders = {
      // @ts-ignore
      ...medusa.client.client.config.customHeaders,
      [BOT_HEADER_KEY]: getBotId(),
    }
    // @ts-ignore
    medusaClient.client.config.customHeaders = {
      // @ts-ignore
      ...medusaClient.client.config.customHeaders,
      [BOT_HEADER_KEY]: getBotId(),
    }
  }

  useEffect(() => {
    if (BOT_ENABLED && !result) {
      analyze()
    }
  }, [])

  useEffect(() => {
    if (result) {
      setIsLoading(false)
      setResult(result)
      setupHeader()
    }
  }, [result])

  return (
    <BotDetectionContext.Provider
      value={{
        result,
        analyze,
      }}
    >
      {isLoading ? <SkeletonCollectionPage /> : children}
    </BotDetectionContext.Provider>
  )
}
