import { HeroSection } from '@/components/home/hero-section'
import { PostalCodeChecker } from '@/components/home/postal-code-checker'
import { FeaturedMeals } from '@/components/home/featured-meals'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <PostalCodeChecker />
      <FeaturedMeals />
    </div>
  )
}
