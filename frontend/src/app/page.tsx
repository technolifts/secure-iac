import Link from 'next/link';
import Head from 'next/head';

export default function Home() {
  return (
    <>
      <Head>
        <title>Secure IaC - Build Secure Infrastructure as Code</title>
        <meta name="description" content="Generate secure infrastructure as code templates for AWS services" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="flex flex-col items-center justify-center min-h-screen py-12 px-4">
        <h1 className="text-4xl font-bold text-center mb-6">
          Build Secure Cloud Infrastructure by Default
        </h1>
        <p className="text-xl text-gray-600 text-center max-w-2xl mb-8">
          Generate infrastructure as code templates with security best practices built in for AWS services.
        </p>
        <Link 
          href="/create" 
          className="inline-block bg-primary hover:bg-primary-dark text-black font-bold py-3 px-6 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
        >
          Get Started
        </Link>
      </div>
    </>
  );
};