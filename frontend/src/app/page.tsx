/**
 * Home page component
 *
 * This is the landing page that introduces the application and provides
 * a call-to-action to get started with creating secure infrastructure templates.
 */

import Link from 'next/link'

export default function Home() {
  return (
    <div className="bg-background">
      {/* Hero section */}
      <div className="pt-10 sm:pt-16 lg:pt-8 lg:pb-14 lg:overflow-hidden">
        <div className="mx-auto max-w-7xl lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8">
            <div className="mx-auto max-w-md px-4 sm:max-w-2xl sm:px-6 sm:text-center lg:px-0 lg:text-left lg:flex lg:items-center">
              <div className="lg:py-24">
                <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
                  <span className="block">Build AWS Infrastructure</span>
                  <span className="block text-primary">Secure by Default</span>
                </h1>
                <p className="mt-3 text-base text-gray-600 sm:mt-5 sm:text-xl lg:text-lg xl:text-xl">
                  Generate infrastructure as code templates with security best practices 
                  built-in. Start with a secure foundation and avoid security debt later.
                </p>
                <div className="mt-8 sm:mt-12">
                  <Link href="/create" className="btn-primary text-base font-medium px-8 py-3">
                    Get Started
                  </Link>
                </div>
              </div>
            </div>
            <div className="mt-12 lg:m-0">
              <div className="mx-auto max-w-md px-4 sm:max-w-2xl sm:px-6 lg:max-w-none lg:px-0">
                <img
                  className="w-full lg:absolute lg:inset-y-0 lg:right-0 lg:h-full lg:w-auto lg:max-w-none"
                  src="/hero-illustration.svg"
                  alt="Secure Infrastructure Illustration"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features section */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-primary font-semibold tracking-wide uppercase">
              Features
            </h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Security at the foundation
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Build your cloud infrastructure with security controls applied from the start.
            </p>
          </div>

          <div className="mt-10">
            <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-3 md:gap-x-8 md:gap-y-10">
              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                </div>
                <div className="ml-16">
                  <h3 className="text-lg font-medium text-gray-900">Security by Default</h3>
                  <p className="mt-2 text-base text-gray-500">
                    All generated templates include security best practices baked in from the start.
                  </p>
                </div>
              </div>

              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                </div>
                <div className="ml-16">
                  <h3 className="text-lg font-medium text-gray-900">Compliance Ready</h3>
                  <p className="mt-2 text-base text-gray-500">
                    Templates are built with compliance requirements in mind, documented with explanations.
                  </p>
                </div>
              </div>

              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                </div>
                <div className="ml-16">
                  <h3 className="text-lg font-medium text-gray-900">Developer Friendly</h3>
                  <p className="mt-2 text-base text-gray-500">
                    Get production-ready code with clear explanations of security decisions in comments.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}