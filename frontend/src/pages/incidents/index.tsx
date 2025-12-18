import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Layout from '@/components/Layout';
import api from '@/services/api';
import Loading from '@/components/Loading';
import { useWebSocket } from '@/context/WebSocketContext';

interface Incident {
    id: number;
    title: string;
    description: string;
    severity: string;
    status: string;
    created_at: string;
    ai_analysis?: string; // Add field for UI state
}

export default function IncidentsPage() {
    const [incidents, setIncidents] = useState<Incident[]>([]);
    const [loading, setLoading] = useState(true);
    const { lastMessage } = useWebSocket();

    useEffect(() => {
        fetchIncidents();
    }, []);

    useEffect(() => {
        if (lastMessage && lastMessage.type === 'check_result' && lastMessage.status === 'down') {
            // Service went down! Refresh incidents to show the new one.
            console.log("Real-time event received:", lastMessage);
            fetchIncidents();
        }
    }, [lastMessage]);

    const fetchIncidents = async () => {
        try {
            const res = await api.get('/incidents/');
            setIncidents(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAnalyze = async (id: number) => {
        try {
            const res = await api.post(`/ai/analyze/${id}`);
            setIncidents(prev => prev.map(inc =>
                inc.id === id ? { ...inc, ai_analysis: res.data.analysis } : inc
            ));
        } catch (err) {
            alert("Failed to run AI analysis");
        }
    };

    if (loading) return <Layout><Loading /></Layout>;

    return (
        <Layout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Incidents</h1>
                        <p className="text-gray-500">Track and manage system outages.</p>
                    </div>
                    <div className="flex items-center bg-green-50 border border-green-200 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
                        <span className="relative flex h-2 w-2 mr-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        Real-time Updates Active
                    </div>
                </div>

                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                    {incidents.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            No incidents found. Your system is healthy! 🎉
                        </div>
                    ) : (
                        <ul className="divide-y divide-gray-200">
                            {incidents.map((incident) => (
                                <li key={incident.id} className="block hover:bg-gray-50">
                                    <div className="px-4 py-4 sm:px-6">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-medium text-indigo-600 truncate">
                                                <Link href={`/incidents/${incident.id}`} className="hover:underline">
                                                    {incident.title}
                                                </Link>
                                            </p>
                                            <div className="ml-2 flex-shrink-0 flex">
                                                <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${incident.severity === 'critical' ? 'bg-red-100 text-red-800' :
                                                    incident.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                                                        'bg-green-100 text-green-800'
                                                    }`}>
                                                    {incident.severity}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="mt-2 sm:flex sm:justify-between">
                                            <div className="sm:flex">
                                                <p className="flex items-center text-sm text-gray-500">
                                                    {incident.description}
                                                </p>
                                            </div>
                                            <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                                <p>
                                                    {new Date(incident.created_at).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>

                                        {/* AI Section */}
                                        <div className="mt-4 border-t border-gray-100 pt-3 flex justify-end">
                                            <Link href={`/incidents/${incident.id}`} className="text-indigo-600 hover:text-indigo-900 text-sm font-medium flex items-center">
                                                View Details & AI Review &rarr;
                                            </Link>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </Layout>
    );
}
