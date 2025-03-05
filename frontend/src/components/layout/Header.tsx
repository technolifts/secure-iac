/**
 * Header component
 *
 * This component renders the application header with navigation links.
 */

import Link from 'next/link'
import React from 'react'

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-2xl font-bold text-primary">
                Secure IaC
              </Link>
            </div>
            <nav className="ml-6 flex items-center space-x-8">
              <Link href="/" className="text-gray-700 hover:text-primary px-3 py-2 text-sm font-medium">
                Home
              </Link>
              <Link href="/create" className="text-gray-700 hover:text-primary px-3 py-2 text-sm font-medium">
                Create Template
              </Link>
            </nav>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header