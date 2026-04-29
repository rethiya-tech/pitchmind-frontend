import { LandNav } from '@/components/landing/LandNav'
import { HeroSection } from '@/components/landing/HeroSection'
import { HeroDashboard } from '@/components/landing/HeroDashboard'
import { SocialProofBar } from '@/components/landing/SocialProofBar'
import { FeaturesSection } from '@/components/landing/FeaturesSection'
import { ShowcaseSection } from '@/components/landing/ShowcaseSection'
import { PhasesSection } from '@/components/landing/PhasesSection'
import { PaletteSection } from '@/components/landing/PaletteSection'
import { FaqSection } from '@/components/landing/FaqSection'
import { CtaBanner } from '@/components/landing/CtaBanner'
import { LandFooter } from '@/components/landing/LandFooter'

export function LandingPage() {
  return (
    <div className="min-h-screen">
      <LandNav />
      <HeroSection />
      <HeroDashboard />
      <SocialProofBar />
      <FeaturesSection />
      <ShowcaseSection />
      <PhasesSection />
      <PaletteSection />
      <FaqSection />
      <CtaBanner />
      <LandFooter />
    </div>
  )
}
