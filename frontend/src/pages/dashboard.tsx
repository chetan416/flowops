import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import DashboardHome from '@/components/DashboardHome';
import { useAuth } from '@/context/AuthContext';

export default function Dashboard() {
    const { user, loading, logout } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/auth/login');
        }
    }, [user, loading, router]);

    if (loading || !user) {
        return (
            <Layout>
                <div className="flex h-screen items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="md:flex md:items-center md:justify-between mb-8">
                    <div className="flex-1 min-w-0">
                        <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                            Welcome back, {user.full_name || user.email}!
                        </h2>
                    </div>
                    <div className="mt-4 flex md:mt-0 md:ml-4 space-x-3">
                        <button
                            onClick={() => router.push('/settings')}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                        >
                            Settings
                        </button>
                        <button
                            onClick={logout}
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none"
                        >
                            Sign out
                        </button>
                    </div>
                </div>

                <DashboardHome />
            </div>
        </Layout>
    );
}

