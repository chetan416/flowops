import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import api from '@/services/api';
import StatusBadge from '@/components/StatusBadge';
import Loading from '@/components/Loading';
import Link from 'next/link';

interface Endpoint {
    id: number;
    name: string;
    url: string;
    method: string;
    is_active: boolean;
}

interface Service {
    id: number;
    name: string;
    description?: string;
    status: string;
    endpoints: Endpoint[];
}

export default function MonitoringDashboard() {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [newServiceName, setNewServiceName] = useState('');

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        try {
            const res = await api.get('/monitoring/services');
            setServices(res.data);
        } catch (err) {
            console.error("Failed to fetch services", err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await api.post('/monitoring/services', { name: newServiceName });
            setServices([...services, res.data]);
            setNewServiceName('');
            setIsCreating(false);
        } catch (err) {
            alert("Failed to create service");
        }
    };

    if (loading) return <Layout><Loading /></Layout>;

    return (
        <Layout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Service Health</h1>
                        <p className="mt-1 text-sm text-gray-500">Real-time monitoring of your API ecosystem.</p>
                    </div>
                    <div className="flex space-x-3">
                        <button
                            onClick={async () => {
                                try {
                                    setLoading(true);
                                    await api.post('/monitoring/run-checks?sync=true');
                                    await fetchServices(); // Refresh data immediately after check
                                    alert('Checks completed successfully!');
                                }
                                catch (e) {
                                    console.error(e);
                                    alert('Failed to run checks');
                                } finally {
                                    setLoading(false);
                                }
                            }}
                            className="bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-50 font-medium"
                        >
                            ↻ Run Checks
                        </button>
                        <button
                            onClick={() => setIsCreating(true)}
                            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 font-medium"
                        >
                            + Add Service
                        </button>
                    </div>
                </div>

                {isCreating && (
                    <div className="mb-6 bg-white p-6 rounded-lg shadow border border-gray-200">
                        <form onSubmit={handleCreate} className="flex gap-4">
                            <input
                                type="text"
                                placeholder="Service Name (e.g. Auth Service)"
                                value={newServiceName}
                                onChange={(e) => setNewServiceName(e.target.value)}
                                className="flex-grow rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border px-4 py-2"
                                required
                            />
                            <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-md">Save</button>
                            <button type="button" onClick={() => setIsCreating(false)} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md">Cancel</button>
                        </form>
                    </div>
                )}

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {services.map((service) => (
                        <div key={service.id} className="bg-white overflow-hidden shadow rounded-lg border border-gray-200 hover:border-indigo-500 transition-colors">
                            <div className="px-4 py-5 sm:p-6">
                                <div className="flex justify-between items-start">
                                    <h3 className="text-lg font-medium text-gray-900 truncate">{service.name}</h3>
                                    <div className="flex items-center gap-2">
                                        <StatusBadge status={service.status} />
                                        <button
                                            onClick={async (e) => {
                                                e.preventDefault(); // Prevent Link navigation if any
                                                if (confirm('Are you sure you want to delete this service?')) {
                                                    try {
                                                        await api.delete(`/monitoring/services/${service.id}`);
                                                        setServices(services.filter(s => s.id !== service.id));
                                                    } catch (err) {
                                                        alert('Failed to delete service');
                                                    }
                                                }
                                            }}
                                            className="text-gray-400 hover:text-red-600 transition-colors"
                                            title="Delete Service"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                                        </button>
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <Link href={`/monitoring/${service.id}`}>
                                        <div className="cursor-pointer">
                                            <p className="text-sm text-gray-500 mb-2">Endpoints: {service.endpoints.length}</p>
                                            <div className="space-y-2">
                                                {service.endpoints.slice(0, 3).map(ep => (
                                                    <div key={ep.id} className="flex justify-between text-xs bg-gray-50 p-2 rounded">
                                                        <span className="font-mono text-gray-700">{ep.method} {ep.url}</span>
                                                    </div>
                                                ))}
                                                {service.endpoints.length > 3 && (
                                                    <p className="text-xs text-gray-400">+ {service.endpoints.length - 3} more</p>
                                                )}
                                                {service.endpoints.length === 0 && (
                                                    <p className="text-xs text-gray-400 italic">No endpoints monitored</p>
                                                )}
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                                <div className="mt-6">
                                    <Link href={`/monitoring/${service.id}`} className="text-indigo-600 hover:text-indigo-900 text-sm font-medium">
                                        View Details &rarr;
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </Layout>
    );
}
