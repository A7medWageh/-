'use client'

import dynamic from 'next/dynamic'

const DynamicLightningIntro = dynamic(
  () => import('@/components/store/lightning-intro').then(mod => mod.LightningIntro),
  { ssr: false }
)

export function LightningIntroWrapper() {
  return <DynamicLightningIntro />
}
