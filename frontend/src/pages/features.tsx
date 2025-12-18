import Link from 'next/link';
import Layout from '@/components/Layout';
import { Activity, AlertTriangle, Cpu, Globe, Server, Shield } from 'lucide-react';

export default function Features() {
    const features = [
        {
            name: 'Global API Monitoring',
            description: 'Track the uptime and latency of your services from multiple regions. Get real-time health checks.',
            icon: Globe,
        },
        {
            name: 'Incident Management',
            description: 'Automatically create incidents when checks fail. Track severity, timeline, and resolution status.',
            icon: AlertTriangle,
        },
        {
            name: 'Service Ownership',
            description: 'Map services to teams. Auto-route incidents to the right people based on ownership.',
            icon: Shield,
        },
        {
            name: 'Deployment Tracking',
            description: 'Correlate incidents with code changes. See exactly which version caused a regression.',
            icon: Globe, // Keeping Globe for now, or finding a better one if available in lucide-react import
        },
        {
            name: 'SLO & Error Budgets',
            description: 'Define reliability targets (e.g. 99.9%) and track your error budget burn rate in real-time.',
            icon: Activity,
        },
        {
            name: 'AI Root Cause Analysis',
            description: 'Leverage AI to instantly analyze error logs and generate hypothesis for why your service is down.',
            icon: Cpu,
        },
        {
            name: 'Microservice Registry',
            description: 'Keep a central catalog of all your engineering services, endpoints, and owners.',
            icon: Server,
        },
        {
            name: 'Enterprise Security',
            description: 'Role-based access control (RBAC), Audit Logs, and SSO integration support.',
            icon: Shield,
        },
    ];

    return (
        <Layout>
            <div className="bg-white py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="lg:text-center">
                        <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">Capabilities</h2>
                        <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                            Engineering Command Center
                        </p>
                        <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
                            A comprehensive suite of tools to ensure your infrastructure is reliable, observable, and performant.
                        </p>
                    </div>

                    <div className="mt-10">
                        <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
                            {features.map((feature) => (
                                <div key={feature.name} className="relative">
                                    <dt>
                                        <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                                            <feature.icon className="h-6 w-6" aria-hidden="true" />
                                        </div>
                                        <p className="ml-16 text-lg leading-6 font-medium text-gray-900">{feature.name}</p>
                                    </dt>
                                    <dd className="mt-2 ml-16 text-base text-gray-500">{feature.description}</dd>
                                </div>
                            ))}
                        </dl>
                    </div>

                    <div className="mt-16 text-center">
                        <Link href="/auth/signup" className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
                            Start Monitoring Now
                        </Link>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
