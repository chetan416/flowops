import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import api from '@/services/api';
import { useRouter } from 'next/router';
import StatusBadge from '@/components/StatusBadge';
import Loading from '@/components/Loading';

interface Endpoint {
    id: number;
    name: string;
    url: string;
    method: string;
    is_active: boolean;
    check_interval: number;
    latest_check_success?: boolean;
}

interface Service {
    id: number;
    name: string;
    description?: string;
    status: string;
    endpoints: Endpoint[];
}

interface Deployment {
    id: number;
    version: string;
    git_commit?: string;
    status: string;
    environment: string;
    created_at: string;
}

interface SLO {
    id: number;
    name: string;
    target_percentage: number;
    time_window_days: number;
    current_availability?: number;
    error_budget_remaining_minutes?: number;
}

export default function ServiceDetails() {
    const router = useRouter();
    const { id } = router.query;
    const [service, setService] = useState<Service | null>(null);
    const [deployments, setDeployments] = useState<Deployment[]>([]);
    const [slos, setSlos] = useState<SLO[]>([]);
    const [loading, setLoading] = useState(true);

    // Form State
    const [isAddingSLO, setIsAddingSLO] = useState(false);
    const [sloName, setSloName] = useState('99.9% Availability');
    const [sloTarget, setSloTarget] = useState(99.9);
    const [isAddingEndpoint, setIsAddingEndpoint] = useState(false);
    const [epName, setEpName] = useState('');
    const [epUrl, setEpUrl] = useState('');
    const [epMethod, setEpMethod] = useState('GET');

    useEffect(() => {
        if (id) {
            fetchService();
        }
    }, [id]);

    const fetchService = async () => {
        try {
            const res = await api.get(`/monitoring/services/${id}`);
            setService(res.data);

            // Fetch deployments
            const depRes = await api.get(`/deployments/service/${id}`);
            setDeployments(depRes.data);

            // Fetch SLOs
            const sloRes = await api.get(`/reliability/slos/service/${id}`);
            setSlos(sloRes.data);
        } catch (err) {
            console.error("Failed to load service", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddSLO = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/reliability/slos', {
                service_id: id,
                name: sloName,
                target_percentage: parseFloat(String(sloTarget)),
                time_window_days: 30
            });
            setIsAddingSLO(false);
            fetchService();
        } catch (err) {
            alert("Failed to create SLO");
        }
    };

    const handleAddEndpoint = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                name: epName,
                url: epUrl,
                method: epMethod,
                expected_status: 200,
                check_interval: 60
            };
            await api.post(`/monitoring/services/${id}/endpoints`, payload);
            setIsAddingEndpoint(false);
            setEpName('');
            setEpUrl('');
            fetchService(); // Refresh list
        } catch (err) {
            alert("Failed to add endpoint");
        }
    };

    if (loading) return <Layout><Loading /></Layout>;
    if (!service) return <Layout><div className="p-10 text-center">Service not found</div></Layout>;

    return (
        <Layout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {/* Header */}
                <div className="md:flex md:items-center md:justify-between mb-8">
                    <div className="flex-1 min-w-0">
                        <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                            {service.name}
                        </h2>
                        <div className="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:mt-0 sm:space-x-6">
                            <div className="mt-2 flex items-center text-sm text-gray-500">
                                Status: <span className="ml-2"><StatusBadge status={service.status} /></span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
                    <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                        <div>
                            <h3 className="text-lg leading-6 font-medium text-gray-900">Monitored Endpoints</h3>
                            <p className="mt-1 max-w-2xl text-sm text-gray-500">List of API endpoints being checked for this service.</p>
                        </div>
                        <button
                            onClick={() => setIsAddingEndpoint(true)}
                            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 text-sm"
                        >
                            + Add Endpoint
                        </button>
                    </div>

                    {isAddingEndpoint && (
                        <div className="px-4 py-5 bg-gray-50 border-t border-b border-gray-200">
                            <form onSubmit={handleAddEndpoint} className="grid grid-cols-1 gap-4 sm:grid-cols-4 items-end">
                                <div className="sm:col-span-1">
                                    <label className="block text-sm font-medium text-gray-700">Name</label>
                                    <input type="text" required value={epName} onChange={e => setEpName(e.target.value)} placeholder="e.g. List Users" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">URL</label>
                                    <input type="url" required value={epUrl} onChange={e => setEpUrl(e.target.value)} placeholder="https://api.example.com/users" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                                </div>
                                <div className="sm:col-span-1">
                                    <label className="block text-sm font-medium text-gray-700">Method</label>
                                    <select value={epMethod} onChange={e => setEpMethod(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                                        <option>GET</option>
                                        <option>POST</option>
                                        <option>PUT</option>
                                        <option>DELETE</option>
                                    </select>
                                </div>
                                <div className="sm:col-span-4 flex justify-end gap-2 mt-2">
                                    <button type="button" onClick={() => setIsAddingEndpoint(false)} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                                    <button type="submit" className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">Save Endpoint</button>
                                </div>
                            </form>
                        </div>
                    )}

                    <div className="border-t border-gray-200">
                        {service.endpoints.length === 0 ? (
                            <div className="px-4 py-12 text-center text-gray-500">
                                No endpoints added yet. Click "Add Endpoint" to verify your API.
                            </div>
                        ) : (
                            <ul className="divide-y divide-gray-200">
                                {service.endpoints.map((ep) => (
                                    <li key={ep.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${ep.method === 'GET' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
                                                    {ep.method}
                                                </span>
                                                <p className="ml-4 text-sm font-medium text-indigo-600 truncate">{ep.name}</p>
                                                <p className="ml-2 text-sm text-gray-500 truncate">{ep.url}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {!ep.is_active && (
                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                                        Paused
                                                    </span>
                                                )}
                                                {ep.is_active && ep.latest_check_success === true && (
                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                        Healthy
                                                    </span>
                                                )}
                                                {ep.is_active && ep.latest_check_success === false && (
                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                                        Failed
                                                    </span>
                                                )}
                                                {ep.is_active && ep.latest_check_success === undefined && (
                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                                        Pending
                                                    </span>
                                                )}
                                                <button
                                                    onClick={async () => {
                                                        if (confirm('Delete this endpoint?')) {
                                                            try {
                                                                await api.delete(`/monitoring/endpoints/${ep.id}`);
                                                                fetchService();
                                                            } catch (e) {
                                                                alert('Failed to delete endpoint');
                                                            }
                                                        }
                                                    }}
                                                    className="text-gray-400 hover:text-red-500 ml-2"
                                                    title="Delete Endpoint"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                                                </button>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>


                {/* Reliability & SLOs */}
                <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
                    <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                        <div>
                            <h3 className="text-lg leading-6 font-medium text-gray-900">Reliability & SLOs</h3>
                            <p className="mt-1 max-w-2xl text-sm text-gray-500">Service Level Objectives and Error Budgets (30-day window).</p>
                        </div>
                        <button
                            onClick={() => setIsAddingSLO(true)}
                            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 text-sm"
                        >
                            + Define SLO
                        </button>
                    </div>

                    {isAddingSLO && (
                        <div className="px-4 py-5 bg-gray-50 border-t border-b border-gray-200">
                            <form onSubmit={handleAddSLO} className="flex gap-4 items-end">
                                <div className="flex-grow">
                                    <label className="block text-sm font-medium text-gray-700">Name</label>
                                    <input type="text" value={sloName} onChange={e => setSloName(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border px-3 py-2" />
                                </div>
                                <div className="w-32">
                                    <label className="block text-sm font-medium text-gray-700">Target %</label>
                                    <input type="number" step="0.01" value={sloTarget} onChange={e => setSloTarget(parseFloat(e.target.value))} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border px-3 py-2" />
                                </div>
                                <div className="flex gap-2">
                                    <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-md">Save</button>
                                    <button type="button" onClick={() => setIsAddingSLO(false)} className="bg-white border border-gray-300 px-4 py-2 rounded-md text-gray-700">Cancel</button>
                                </div>
                            </form>
                        </div>
                    )}

                    <div className="border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                        {slos.length === 0 ? (
                            <div className="col-span-full text-center text-gray-500 italic">No SLOs defined.</div>
                        ) : slos.map(slo => (
                            <div key={slo.id} className="bg-gray-50 rounded-lg p-5 border border-gray-200 relative overflow-hidden">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h4 className="font-semibold text-gray-900">{slo.name}</h4>
                                        <div className="text-xs text-gray-500">Target: {slo.target_percentage}%</div>
                                    </div>
                                    <div className={`text-2xl font-bold ${(slo.current_availability || 100) >= slo.target_percentage ? 'text-green-600' : 'text-red-600'}`}>
                                        {slo.current_availability?.toFixed(3)}%
                                    </div>
                                </div>

                                {/* Error Budget Gauge */}
                                <div className="mt-2">
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-gray-500">Error Budget Remaining</span>
                                        <span className="font-medium">{Math.floor(slo.error_budget_remaining_minutes || 0)} min</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                                        <div
                                            className={`h-2.5 rounded-full ${(slo.error_budget_remaining_minutes || 0) > 0 ? 'bg-green-500' : 'bg-red-500'}`}
                                            style={{ width: `${Math.min(Math.max(((slo.error_budget_remaining_minutes || 0) / (30 * 24 * 60 * (1 - slo.target_percentage / 100)) * 100), 0), 100)}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Deployment History */}
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <div className="px-4 py-5 sm:px-6">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">Deployment History</h3>
                        <p className="mt-1 max-w-2xl text-sm text-gray-500">Recent deployments for this service.</p>
                    </div>
                    <div className="border-t border-gray-200">
                        {deployments.length === 0 ? (
                            <div className="px-4 py-12 text-center text-gray-500">
                                No deployments recorded yet.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Version</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Environment</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Git Commit</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {deployments.map((deploy) => (
                                            <tr key={deploy.id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{deploy.version}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${deploy.status === 'success' ? 'bg-green-100 text-green-800' : deploy.status === 'failed' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                                                        {deploy.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{deploy.environment}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(deploy.created_at).toLocaleString()}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">{deploy.git_commit ? deploy.git_commit.substring(0, 7) : '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout >
    );
}
