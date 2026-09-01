import { Hero } from '@/components/home/Hero';
import { PropertyDiscoveryBar } from '@/components/home/PropertyDiscoveryBar';
import { FourWorlds } from '@/components/home/FourWorlds';
import { FeaturedProperties } from '@/components/home/FeaturedProperties';
import { PhilosophySection } from '@/components/home/PhilosophySection';
import { JournalSection } from '@/components/home/JournalSection';
import { FinalCTA } from '@/components/home/FinalCTA';

export default function HomePage() {
  return (
    <>
      <Hero />
      <PropertyDiscoveryBar />
      <FourWorlds />
      <FeaturedProperties />
      <PhilosophySection />
      <JournalSection />
      <FinalCTA />
    </>
  );
}
