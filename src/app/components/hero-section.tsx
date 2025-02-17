import Link from 'next/link';
import Image from 'next/image';

export function HeroSection() {
  return (
    <div className="relative h-[600px]">
      <div className="absolute inset-0">
        <Image
          className="w-full h-full object-cover"
          src="/images/OutsideEntrance.jpg"
          alt="Killy Ross & Xandy Gavira Barbershop"
          width={1920}
          height={1080}
          priority
        />
        <div className="absolute inset-0 bg-black/60 mix-blend-multiply" />
      </div>
      <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
        <h1 className="text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight text-red mb-4">
          <span className="text-red-500">Killy Ross &</span>
          <span className="block text-blue-500">Xandy Gavira</span>
        </h1>
        <p className="mt-6 text-2xl text-gray-300 max-w-3xl">
          Serviços de barbearia premium em Alfragide. Experimente a combinação perfeita entre estilo e experiência.
        </p>
        <div className="mt-10">
          <Link
            href="/booking"
            className="inline-block bg-white px-8 py-4 text-lg font-semibold text-black hover:bg-white rounded-md transition-all duration-300 transform hover:scale-105"
          >
            Reservar Agora
          </Link>
        </div>
      </div>
    </div>
  );
}