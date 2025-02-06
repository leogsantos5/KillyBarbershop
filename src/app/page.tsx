'use client';

import { FC } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const Home: FC = () => {
  return (
    <div className="relative">
      {/* Hero Section */}
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

      {/* New Gallery Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-12">
            Bem-vindo à Nossa Barbearia
            <div className="w-24 h-1 bg-red-600 mx-auto mt-4"></div>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Image 1 */}
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

            {/* Image 2 */}
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

            {/* Image 3 */}
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

          {/* Brand Statement */}
          <div className="mt-16 text-center">
            <p className="text-2xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
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

      {/* Features Section */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
            {features.map((feature, index) => (
              <div key={feature.name} className="text-center group hover:scale-105 transition-transform duration-300">
                <div
                  className={`flex items-center justify-center h-16 w-16 rounded-full mx-auto transition-colors ${
                    index % 3 === 0
                      ? 'bg-red-600 group-hover:bg-red-700'
                      : index % 3 === 1
                      ? 'bg-blue-600 group-hover:bg-blue-700'
                      : 'bg-green-600 group-hover:bg-green-700'
                  } text-white`}
                >
                  <span className="text-2xl">{feature.icon}</span>
                </div>
                <h3 className="mt-6 text-xl font-bold text-gray-900">{feature.name}</h3>
                <p className="mt-2 text-base text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-8">Localização</h2>
            <p className="mt-4 text-xl text-gray-600">Av. da Quinta Grande Nº 14, Alfragide</p>
            <div className="mt-6 space-y-2">
              <p className="text-xl text-gray-700">
                <span className="font-bold text-red-700">Horário de Funcionamento:</span>
                <br />
                Segunda - Sábado: 9:00 - 19:00
                <br />
                Domingo: Fechado
              </p>
            </div>
          </div>
          <div className="mt-8 w-full">
            <iframe
              className="w-full h-[400px] rounded-lg shadow-lg"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3109.440411429894!2d-9.213320823537655!3d38.73855257176454!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd1ecd7b08781fb5%3A0xc72e45223e0fb910!2sKilly%20Ross%20%26%20Xandy%20Gavira%20Alfragide!5e0!3m2!1spt-PT!2spt"
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  );
};

const features = [
  {
    name: 'Barbeiros Especialistas',
    description: 'A nossa equipa experiente oferece cortes de precisão e estilos modernos.',
    icon: '✂️',
  },
  {
    name: 'Reserva Fácil',
    description: 'Faça a sua marcação online em poucos cliques.',
    icon: '📱',
  },
  {
    name: 'Serviço Premium',
    description: 'Desfrute de uma experiência luxuosa nas nossas instalações modernas.',
    icon: '⭐',
  },
];

export default Home;
