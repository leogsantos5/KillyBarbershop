'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '../supabase/authService';
import { LoginFormState } from '../types/other';

export default function SecretLogin() {
  const [formData, setFormData] = useState<LoginFormState>({name: '', password: ''});
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const error = await authService.signIn(formData.name, formData.password);
      
      if (error) {
        setError(error);
        return;
      }

      router.push('/dashboard');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 p-8 mb-20 rounded-xl shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white"> Área Reservada </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Nome" disabled={isLoading}
            />
          </div>
          <div>
            <input
              type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Password" disabled={isLoading}
            />
          </div>
          {error && ( <p className="text-red-500 text-sm">{error}</p> )}
          <button
            type="submit" disabled={isLoading}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 flex items-center justify-center">
            {isLoading ? (
              <div className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
            ) : ( 'Entrar' )}
          </button>
        </form>
      </div>
    </div>
  );
}
