'use client';

import { HeroSection } from './components/hero-section';
import { GallerySection } from './components/barber-services-section';
import { LocationSection } from './components/location-section';

export default function Home() {
  return (
    <div className="relative">
      <HeroSection />
      <GallerySection />
      <LocationSection />
    </div>
  );
}
