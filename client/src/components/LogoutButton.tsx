import React from 'react';
import { useAuth } from '../contexts/AuthContext';

export function LogoutButton() {
  const { logout, user } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="flex items-center space-x-4">
      <span className="text-sm text-gray-600">
        Hoş geldiniz, {user?.username}
      </span>
      <button
        onClick={handleLogout}
        className="bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-1 rounded transition-colors"
      >
        Çıkış
      </button>
    </div>
  );
}
