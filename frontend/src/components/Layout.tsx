import React, { ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';

interface LayoutProps {
    children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const { user } = useAuth();
    const router = useRouter();

    return (
        <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900 font-sans">
            <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center">
                        <Link href="/" className="text-2xl font-bold text-indigo-600 tracking-tight">
                            FlowOps
                        </Link>
                    </div>
                    <nav className="hidden md:flex space-x-8">
                        <Link href="/workflows" className="text-gray-600 hover:text-indigo-600 transition-colors">
                            Workflows
                        </Link>
                        <Link href="/monitoring" className="text-gray-600 hover:text-indigo-600 transition-colors">
                            Monitoring
                        </Link>
                        <Link href="/monitoring/system" className="text-gray-600 hover:text-indigo-600 transition-colors">
                            System Status
                        </Link>
                        <Link href="/incidents" className="text-gray-600 hover:text-indigo-600 transition-colors">
                            Incidents
                        </Link>
                        <Link href="/teams" className="text-gray-600 hover:text-indigo-600 transition-colors">
                            Teams
                        </Link>
                        <Link href="/features" className="text-gray-600 hover:text-indigo-600 transition-colors">
                            Features
                        </Link>
                        <Link href="/pricing" className="text-gray-600 hover:text-indigo-600 transition-colors">
                            Pricing
                        </Link>
                        <Link href="/docs" className="text-gray-600 hover:text-indigo-600 transition-colors">
                            Docs
                        </Link>
                        {user?.role === 'admin' && (
                            <Link href="/admin/dashboard" className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${router.pathname.startsWith('/admin') ? 'border-indigo-500 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}`}>
                                Admin
                            </Link>
                        )}
                    </nav>
                    <div className="flex items-center space-x-4">
                        {user ? (
                            <div className="flex items-center space-x-4">
                                <span className="text-sm text-gray-700 font-medium">
                                    Hello, {user.full_name || user.email}
                                </span>
                                <Link
                                    href="/dashboard"
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-sm"
                                >
                                    Dashboard
                                </Link>
                            </div>
                        ) : (
                            <>
                                <Link href="/auth/login" className="text-gray-600 hover:text-gray-900 font-medium">
                                    Log in
                                </Link>
                                <Link
                                    href="/auth/signup"
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-sm"
                                >
                                    Sign up
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </header>

            <main className="flex-grow">
                {children}
            </main>

            <footer className="bg-gray-900 text-white py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div className="col-span-1 md:col-span-1">
                            <h3 className="text-xl font-bold mb-4">FlowOps</h3>
                            <p className="text-gray-400 text-sm">Automate your workflow with enterprise-grade operational tools.</p>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4 text-gray-200">Product</h4>
                            <ul className="space-y-2 text-sm text-gray-400">
                                <li><Link href="#" className="hover:text-white">Features</Link></li>
                                <li><Link href="/workflows" className="hover:text-white">Workflows</Link></li>
                                <li><Link href="/settings" className="hover:text-white">Settings</Link></li>
                                <li><Link href="#" className="hover:text-white">Integrations</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4 text-gray-200">Company</h4>
                            <ul className="space-y-2 text-sm text-gray-400">
                                <li><Link href="#" className="hover:text-white">About</Link></li>
                                <li><Link href="#" className="hover:text-white">Blog</Link></li>
                                <li><Link href="#" className="hover:text-white">Careers</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4 text-gray-200">Legal</h4>
                            <ul className="space-y-2 text-sm text-gray-400">
                                <li><Link href="#" className="hover:text-white">Privacy</Link></li>
                                <li><Link href="#" className="hover:text-white">Terms</Link></li>
                            </ul>
                        </div>
                    </div>
                    <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-500 text-sm">
                        © {new Date().getFullYear()} FlowOps Inc. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Layout;
