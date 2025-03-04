'use client'; // Client component for using hooks

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Header: React.FC = () => {
  const pathname = usePathname();
  
  return (
    <header className="bg-white shadow-md py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-primary">
          Secure IaC
        </Link>
        <nav>
          <ul className="flex space-x-6">
            <li>
              <Link 
                href="/" 
                className={`${pathname === '/' ? 'text-primary' : 'text-gray-600'} hover:text-primary transition`}
              >
                Home
              </Link>
            </li>
            <li>
              <Link 
                href="/create" 
                className={`${pathname.startsWith('/create') ? 'text-primary' : 'text-gray-600'} hover:text-primary transition`}
              >
                Create Template
              </Link>
            </li>
            <li>
              <Link 
                href="/docs" 
                className={`${pathname.startsWith('/docs') ? 'text-primary' : 'text-gray-600'} hover:text-primary transition`}
              >
                Documentation
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;