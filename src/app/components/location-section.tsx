export function LocationSection() {
    return (
      <div className="bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">Localização</h2>
            <p className="mt-4 text-xl text-gray-600 dark:text-gray-300">Av. da Quinta Grande Nº 14, Alfragide</p>
            <div className="mt-6 space-y-2">
              <p className="text-xl text-gray-700 dark:text-gray-200">
                <span className="font-bold text-red-700 dark:text-red-500">Horário de Funcionamento:</span>
                <br />
                Segunda - Sábado: 9:00 - 19:00
                <br />
                Domingo: Fechado
              </p>
            </div>
          </div>
          <div className="mt-8 w-full">
            <iframe
              className="w-full h-[400px] rounded-lg shadow-lg dark:shadow-gray-800"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3109.440411429894!2d-9.213320823537655!3d38.73855257176454!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd1ecd7b08781fb5%3A0xc72e45223e0fb910!2sKilly%20Ross%20%26%20Xandy%20Gavira%20Alfragide!5e0!3m2!1spt-PT!2spt"
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </div>
    );
  }