import React from 'react';
import '../styles/globals.css';
import { Metadata } from 'next';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

export const metadata: Metadata = {
  title: 'Secure IaC - Build Secure Infrastructure as Code',
  description: 'Generate secure infrastructure as code templates for AWS services',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
    <div className="flex flex-col min-h-screen">
      <Header />
      <body>
        <main className="flex-grow container mx-auto px-4 py-8">
          {children}
        </main>
      </body>
      <Footer />
    </div>
    </html>
  );
};

