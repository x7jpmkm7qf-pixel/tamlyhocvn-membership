'use client'
import { useEffect, useState } from 'react'
import { usePostHog } from 'posthog-js/react'

export const AB_FLAG = 'ban-do-headline-v2'
const LS_KEY = 'ban-do-ab-v'

export type ABVariant = 'control' | 'treatment'

function localVariant(): ABVariant {
  try {
    const stored = localStorage.getItem(LS_KEY) as ABVariant | null
    if (stored === 'control' || stored === 'treatment') return stored
    const v: ABVariant = Math.random() < 0.5 ? 'control' : 'treatment'
    localStorage.setItem(LS_KEY, v)
    return v
  } catch {
    return 'control'
  }
}

/**
 * 50/50 A/B test for the ban-do landing page.
 *
 * Assignment priority:
 *   1. localStorage (sticky across reloads, assigned on first visit)
 *   2. PostHog feature flag (overrides localStorage when PostHog loads — only
 *      active when NEXT_PUBLIC_POSTHOG_KEY is set AND a flag exists in PostHog)
 *
 * This means the user always sees the same variant instantly (no flash), and
 * PostHog can override if you later want server-controlled rollout.
 */
export function useBanDoABTest() {
  const [variant, setVariant] = useState<ABVariant>('control')
  const posthog = usePostHog()

  // Step 1: assign from localStorage immediately on mount
  useEffect(() => {
    const v = localVariant()
    setVariant(v)

    // Register as PostHog super-property so every event carries the variant
    // posthog may not be initialized yet — safe to call later too
    posthog?.register({ [`$feature/${AB_FLAG}`]: v, ab_variant: v })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Step 2: if PostHog has a server-side flag, let it override (once)
  useEffect(() => {
    if (!posthog) return

    const onFlags = () => {
      const flagEnabled = posthog.isFeatureEnabled(AB_FLAG)
      if (flagEnabled === undefined) return // flag not configured in PostHog — keep local
      const phVariant: ABVariant = flagEnabled ? 'treatment' : 'control'
      try { localStorage.setItem(LS_KEY, phVariant) } catch {}
      setVariant(phVariant)
      posthog.register({ [`$feature/${AB_FLAG}`]: phVariant, ab_variant: phVariant })
    }

    // Flags may already be loaded
    onFlags()
    // Or fire when PostHog finishes loading flags
    posthog.onFeatureFlags(onFlags)
  }, [posthog])

  /** Call on successful form submission */
  const trackSubmit = () => {
    posthog?.capture('leadmagnet_submit', {
      variant,
      [`$feature/${AB_FLAG}`]: variant,
      flag: AB_FLAG,
    })
  }

  return { variant, trackSubmit }
}
