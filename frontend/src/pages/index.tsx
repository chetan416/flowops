import Link from 'next/link';
import Layout from '@/components/Layout';
import { ArrowRight, CheckCircle, Zap, Shield, BarChart } from 'lucide-react';

export default function Home() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-white overflow-hidden pt-16 pb-20 lg:pt-24 lg:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl mb-6">
              <span className="block">Automate your workflow</span>
              <span className="block text-indigo-600">Scale your business</span>
            </h1>
            <p className="mt-4 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              FlowOps provides the essential infrastructure to streamline your operations, manage users, and grow your revenue with built-in subscription management.
            </p>
            <div className="mt-8 max-w-md mx-auto sm:flex sm:justify-center md:mt-10">
              <div className="rounded-md shadow">
                <Link
                  href="/auth/signup"
                  className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10"
                >
                  Get started
                </Link>
              </div>
              <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
                <Link
                  href="/features"
                  className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10"
                >
                  Live demo
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="bg-gray-50 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base font-semibold text-indigo-600 tracking-wide uppercase">Features</h2>
            <p className="mt-1 text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight">
              Everything you need
            </p>
            <p className="max-w-xl mt-5 mx-auto text-xl text-gray-500">
              A complete stack for building modern SaaS applications.
            </p>
          </div>

          <div className="mt-12 grid gap-8 grid-cols-1 md:grid-cols-3">
            {[
              {
                title: 'High Performance',
                description: 'Built on FastAPI and Next.js for blazing fast response times.',
                icon: Zap,
              },
              {
                title: 'Secure by Default',
                description: 'Enterprise-grade security with JWT authentication and role-based access.',
                icon: Shield,
              },
              {
                title: 'Analytics Ready',
                description: 'Integrated monitoring and analytics dashboards to track growth.',
                icon: BarChart,
              },
            ].map((feature) => (
              <div key={feature.title} className="bg-white rounded-xl shadow-sm p-8 hover:shadow-md transition-shadow">
                <div className="h-12 w-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-6">
                  <feature.icon className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-500">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="bg-indigo-700">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            <span className="block">Ready to dive in?</span>
            <span className="block text-indigo-200">Start your free trial today.</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <Link
                href="/auth/signup"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50"
              >
                Get started
              </Link>
            </div>
            <div className="ml-3 inline-flex rounded-md shadow">
              <Link
                href="#"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Learn more
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
