'use client'; 
import { useState, useEffect } from 'react';

interface BookingFormProps {
  onSubmit: (formData: { Name: string; Phone: string }) => void;
  onCancel: () => void;
  isLoading: boolean;
  error?: string;
  success?: boolean;
}

export function BookingForm({onSubmit, onCancel, isLoading, error, success}: BookingFormProps) {
  const [formData, setFormData] = useState({Name: '', Phone: ''});
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (success) {
      const fadeTimer = setTimeout(() => {  
        setIsClosing(true);
      }, 2000);

      const closeTimer = setTimeout(() => {
        onCancel();
      }, 4000); 

      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(closeTimer);
      };
    }
  }, [success, onCancel]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div
      className={`fixed inset-0 bg-black transition-opacity duration-500 flex items-center justify-center p-4 ${
        isClosing ? 'bg-opacity-0' : 'bg-opacity-50'}`}>
      <div
        className={`bg-white rounded-xl p-8 max-w-md w-full transition-all duration-500 ${
          isClosing ? 'opacity-0 transform translate-y-4' : 'opacity-100 transform translate-y-0'}`}
      >
        <h3 className="text-2xl font-bold mb-4">Nova Reserva</h3>

        {error && (
          <div className="mb-4 p-3 text-red-700 bg-red-100 rounded-md text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 text-green-700 bg-green-100 rounded-md text-sm">
            ✓ Reserva confirmada com sucesso!
          </div>
        )}

        {!success && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nome</label>
              <input
                type="text"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                value={formData.Name}
                onChange={(e) => setFormData((prev) => ({ ...prev, Name: e.target.value }))}/>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Telemóvel</label>
              <div className="relative mt-1">
                <span className="absolute inset-y-0 left-3 flex items-center text-gray-500 pointer-events-none mr-2">
                  +351
                </span>
                <input
                  type="tel"
                  required
                  pattern="[0-9]{9}"
                  className="pl-14 block w-full rounded-md border border-gray-300 px-3 py-2"
                  value={formData.Phone}
                  onChange={(e) => setFormData((prev) => ({ ...prev, Phone: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-4 py-2 text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50">
                {isLoading ? 'A Processar...' : 'Confirmar'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
