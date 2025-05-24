import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { SecureLogin } from './SecureLogin';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { currentAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-400 to-pink-400">
        <div className="bg-white rounded-xl p-8 shadow-xl">
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            <span className="text-lg font-medium text-gray-700">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!currentAdmin) {
    return <SecureLogin onLogin={() => {}} />;
  }

  return <>{children}</>;
}
