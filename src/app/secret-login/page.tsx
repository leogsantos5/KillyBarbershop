'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '../services/supabaseClient';

export default function SecretLogin() {
  const [formData, setFormData] = useState({ name: '', password: '' });
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      // Check if it's the owner
      if (formData.name === process.env.NEXT_PUBLIC_OWNER_NAME && 
          formData.password === process.env.NEXT_PUBLIC_OWNER_PASSWORD) {
        localStorage.setItem('barberAuth', 'owner');
        router.push('/owner-dashboard');
        return;
      }

      // Check if it's a barber
      const { data: barber, error } = await supabase
        .from('Barbers')
        .select('Id, Name')
        .eq('Name', formData.name)
        .eq('Password', formData.password)
        .single();

      if (error || !barber) {
        setError('Nome ou password inválidos');
        return;
      }

      localStorage.setItem('barberAuth', barber.Id.toString());
      router.push(`/barber-dashboard/${barber.Id}`);

    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Área Reservada</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Nome"
            />
          </div>
          <div>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Password"
            />
          </div>
          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}
