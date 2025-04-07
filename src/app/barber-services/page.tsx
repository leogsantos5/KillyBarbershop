'use client';
import { FC, useEffect, useState } from 'react';
import { Service } from '../types/booking';
import { servicesService } from '../supabase/servicesService';

const BarberServices: FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    const { data: servicesData } = await servicesService.fetchAllServices();
    if (servicesData) {
      setServices(servicesData);
    }
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="text-center my-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-red-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 py-12">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-5xl font-bold tracking-tight text-gray-900 dark:text-white mb-4">
            Os Nossos Serviços
          </h2>
          <div className="w-24 h-1 bg-red-600 mx-auto mb-8"></div>
          <p className="text-xl leading-8 text-gray-600 dark:text-gray-300">
            Cortes de cabelo e barba profissionais e serviços de barbearia para todos os estilos de penteado masculinos
          </p>
        </div>
        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-2">
          {services.map((service) => (
            <div
              key={service.Id}
              className="flex flex-col border-2 dark:border-gray-700 rounded-lg p-8 hover:border-blue-600 dark:hover:border-blue-500 transition-all duration-300 group bg-white dark:bg-gray-800">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-900 group-hover:text-blue-700 transition-colors dark:text-white">
                  {service.Name}
                </h3>
                <div className="text-xl font-bold text-red-600">
                  {service.Price}€ ({service.Duration} mins)
                </div>
              </div>
              <p className="mt-4 text-lg leading-7 text-gray-600 dark:text-gray-300">{service.Description.replace(/['"]/g, '')}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BarberServices;
