'use client'
import posthog from 'posthog-js'
import { PostHogProvider } from 'posthog-js/react'
import { useEffect } from 'react'

const KEY  = process.env.NEXT_PUBLIC_POSTHOG_KEY
const HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com'

export default function PHProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (!KEY || posthog.__loaded) return
    posthog.init(KEY, {
      api_host: HOST,
      capture_pageview: true,
      persistence: 'localStorage+cookie',
      autocapture: false,
      // Disable session recording to keep bundle lean
      disable_session_recording: true,
    })
  }, [])

  // Always wrap so usePostHog() and useFeatureFlagEnabled() are safe to call
  return <PostHogProvider client={posthog}>{children}</PostHogProvider>
}
