import Link from 'next/link';
import Image from 'next/image';

export function GallerySection() {
  return (
    <div className="py-12 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-bold text-gray-900 dark:text-white text-center mb-12">
          Bem-vindo à Nossa Barbearia
          <div className="w-24 h-1 bg-red-600 mx-auto mt-4"></div>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="relative group overflow-hidden rounded-lg shadow-xl h-64">
            <Image
              className="w-full h-full object-cover"
              src="/images/OutsideEntrance.jpg"
              alt="Interior da Barbearia"
              width={400}
              height={300}
            />
            <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <span className="text-white text-xl font-bold">Entrada Moderna</span>
            </div>
          </div>

          <div className="relative group overflow-hidden rounded-lg shadow-xl h-64">
            <Image
              className="w-full h-full object-cover"
              src="/images/KillyBackBrand.jpg"
              alt="Cadeiras da Barbearia"
              width={400}
              height={300}
            />
            <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <span className="text-white text-xl font-bold">Equipamento de ponta</span>
            </div>
          </div>

          <div className="relative group overflow-hidden rounded-lg shadow-xl h-64">
            <Image
              className="w-full h-full object-cover"
              src="/images/KillySitting.jpg"
              alt="Ferramentas de Barbeiro"
              width={400}
              height={300}
            />
            <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <span className="text-white text-xl font-bold">Ambiente Profissional</span>
            </div>
          </div>
        </div>

        <div className="mt-16 text-center">
          <p className="text-2xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Experimente a combinação perfeita entre barbearia tradicional e estilo moderno na Killy Ross & Xandy Gavira. Onde cada corte conta uma história.
          </p>
          <div className="flex gap-4 justify-center mt-8">
            <Link
              href="/booking"
              className="inline-block bg-blue-600 px-8 py-4 text-lg font-semibold text-white hover:bg-blue-700 rounded-md transition-all duration-300 transform hover:scale-105"
            >
              Fazer Reserva
            </Link>
            <Link
              href="/services"
              className="inline-block bg-red-600 px-8 py-4 text-lg font-semibold text-white hover:bg-red-700 rounded-md transition-all duration-300 transform hover:scale-105"
            >
              Nossos Serviços
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}