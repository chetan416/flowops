import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/services/api';

export default function DashboardHome() {
    const [stats, setStats] = useState({
        totalServices: 0,
        healthyServices: 0,
        openIncidents: 0,
        systemHealth: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            // Fetch Services
            const servicesRes = await api.get('/monitoring/services');
            const services = servicesRes.data;
            const totalServices = services.length;
            const healthyServices = services.filter((s: any) => s.status === 'healthy').length;

            // Fetch Incidents
            const incidentsRes = await api.get('/incidents/?status=open');
            const openIncidents = incidentsRes.data.length;

            setStats({
                totalServices,
                healthyServices,
                openIncidents,
                systemHealth: totalServices > 0 ? Math.round((healthyServices / totalServices) * 100) : 100
            });
        } catch (error) {
            console.error("Failed to load dashboard data", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600"></div></div>;

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">Engineering Command Center</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">Real-time operational visibility.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                <div className="bg-white overflow-hidden shadow rounded-lg px-4 py-5 sm:p-6 cursor-pointer hover:shadow-md transition-shadow">
                    <dt className="text-sm font-medium text-gray-500 truncate">System Health</dt>
                    <dd className={`mt-1 text-3xl font-semibold ${stats.systemHealth < 90 ? 'text-red-600' : 'text-green-600'}`}>
                        {stats.systemHealth}%
                    </dd>
                    <p className="mt-1 text-xs text-gray-400">Operational Services</p>
                </div>

                <Link href="/incidents">
                    <div className="bg-white overflow-hidden shadow rounded-lg px-4 py-5 sm:p-6 cursor-pointer hover:shadow-md transition-shadow">
                        <dt className="text-sm font-medium text-gray-500 truncate">Active Incidents</dt>
                        <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.openIncidents}</dd>
                        <p className="mt-1 text-xs text-red-500">{stats.openIncidents > 0 ? 'Requires Attention' : 'All Clear'}</p>
                    </div>
                </Link>

                <Link href="/monitoring">
                    <div className="bg-white overflow-hidden shadow rounded-lg px-4 py-5 sm:p-6 cursor-pointer hover:shadow-md transition-shadow">
                        <dt className="text-sm font-medium text-gray-500 truncate">Monitored Services</dt>
                        <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.totalServices}</dd>
                        <p className="mt-1 text-xs text-gray-400">Total Endpoints</p>
                    </div>
                </Link>
            </div>

            {/* Quick Actions */}
            <div className="bg-white shadow sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Quick Actions</h3>
                </div>
                <div className="border-t border-gray-200 grid grid-cols-1 divide-y divide-gray-200 sm:grid-cols-2 sm:divide-y-0 sm:divide-x">
                    <div className="px-4 py-5 sm:p-6">
                        <h4 className="text-sm font-medium text-gray-900">Add New Service</h4>
                        <p className="mt-1 text-sm text-gray-500">Start monitoring a new API endpoint or microservice.</p>
                        <Link href="/monitoring" className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
                            Configure Monitor
                        </Link>
                    </div>
                    <div className="px-4 py-5 sm:p-6">
                        <h4 className="text-sm font-medium text-gray-900">Create Workflow</h4>
                        <p className="mt-1 text-sm text-gray-500">Automate incident response or routine maintenance tasks.</p>
                        <Link href="/workflows" className="mt-4 inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                            Build Workflow
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
