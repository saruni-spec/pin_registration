'use client';

import { useRouter } from 'next/navigation';
import { Layout } from '../_components/Layout';
import { clearRegistrationData } from '../_lib/store';
import { Plus, Home, LogOut } from 'lucide-react';

export default function PostCompletionMenu() {
  const router = useRouter();

  const handleRegisterAnother = () => {
    clearRegistrationData();
    router.push('/pin-registration');
  };

  const handleMainMenu = () => {
    router.push('/');
  };

  const handleLogout = () => {
    clearRegistrationData();
    alert('Logging out and returning to WhatsApp (Mock implementation)');
    window.history.back();
  };

  return (
    <Layout title="What would you like to do next?">
      <div className="space-y-4">
        <button
          onClick={handleRegisterAnother}
          className="w-full bg-white border-2 border-gray-300 rounded-xl p-5 hover:border-green-600 hover:bg-green-50 transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Plus className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-left flex-1">
              <h3 className="text-gray-900 font-semibold">Register Another PIN</h3>
            </div>
          </div>
        </button>

        <button
          onClick={handleMainMenu}
          className="w-full bg-white border-2 border-gray-300 rounded-xl p-5 hover:border-green-600 hover:bg-green-50 transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Home className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-left flex-1">
              <h3 className="text-gray-900 font-semibold">Main Menu</h3>
            </div>
          </div>
        </button>

        <button
          onClick={handleLogout}
          className="w-full bg-white border-2 border-gray-300 rounded-xl p-5 hover:border-red-600 hover:bg-red-50 transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
              <LogOut className="w-6 h-6 text-red-600" />
            </div>
            <div className="text-left flex-1">
              <h3 className="text-gray-900 font-semibold">Log Out</h3>
            </div>
          </div>
        </button>
      </div>
    </Layout>
  );
}
