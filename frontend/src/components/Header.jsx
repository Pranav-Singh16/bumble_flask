import React from 'react';
import { Shield } from 'lucide-react';

export const Header = () => (
  <header className="bg-purple-800 shadow-lg">
    <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="flex h-16 items-center justify-between">
        <div className="flex items-center">
          <Shield className="h-8 w-8 text-white" />
          <span className="ml-2 text-xl font-bold text-white">Partner Loyalty Checker</span>
        </div>
        <div className="flex items-center">
          <a href="#support" className="text-white hover:text-indigo-200">Support</a>
        </div>
      </div>
    </nav>
  </header>
);

