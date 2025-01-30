import { FC } from 'react';

interface Service {
  name: string;
  price: number;
  duration: string;
  description: string;
}

const services: Service[] = [
  {
    name: 'Corte Clássico',
    price: 25,
    duration: '45 min',
    description: 'Corte de cabelo profissional incluindo lavagem e finalização',
  },
  {
    name: 'Barba',
    price: 15,
    duration: '30 min',
    description: 'Aparar e modelar a sua barba com perfeição',
  },
  {
    name: 'Cabelo & Barba',
    price: 35,
    duration: '1 hora',
    description: 'Pacote completo com corte de cabelo e barba',
  },
  {
    name: 'Corte Criança',
    price: 20,
    duration: '30 min',
    description: 'Serviço gentil e paciente para os nossos clientes mais jovens',
  },
];

const Services: FC = () => {
  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-5xl font-bold tracking-tight text-gray-900 mb-4">
            Os Nossos Serviços
          </h2>
          <div className="w-24 h-1 bg-red-600 mx-auto mb-8"></div>
          <p className="text-xl leading-8 text-gray-600">
            Cortes de cabelo profissionais e serviços de barbearia para todos os estilos
          </p>
        </div>
        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-2">
          {services.map((service) => (
            <div
              key={service.name}
              className="flex flex-col border-2 rounded-lg p-8 hover:border-blue-600 hover:shadow-xl transition-all duration-300 group"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-900 group-hover:text-blue-700 transition-colors">
                  {service.name}
                </h3>
                <div className="text-xl font-bold text-red-600">
                  {service.price}€
                </div>
              </div>
              <p className="mt-4 text-lg leading-7 text-gray-600">{service.description}</p>
              <p className="mt-4 text-sm font-medium text-black-700">Duration: {service.duration}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Services;
