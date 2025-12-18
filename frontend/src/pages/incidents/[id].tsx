import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import api from '@/services/api';
import { useRouter } from 'next/router';
import StatusBadge from '@/components/StatusBadge';
import Loading from '@/components/Loading';
import AiAnalysisCard from '@/components/AiAnalysisCard';

interface Incident {
    id: number;
    title: string;
    description: string;
    status: string;
    severity: string;
    service_id: number;
    owner_team_id?: number;
    created_at: string;
}

export default function IncidentDetails() {
    const router = useRouter();
    const { id } = router.query;
    const [incident, setIncident] = useState<Incident | null>(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [report, setReport] = useState<string | null>(null);

    useEffect(() => {
        if (id) fetchIncident();
    }, [id]);

    const fetchIncident = async () => {
        try {
            const res = await api.get(`/incidents/${id}`);
            setIncident(res.data);
        } catch (err) {
            console.error("Failed to load incident", err);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateReview = async () => {
        setGenerating(true);
        try {
            const res = await api.post(`/ai/review/${id}`);
            setReport(res.data.report);
        } catch (err) {
            alert("Failed to generate report");
        } finally {
            setGenerating(false);
        }
    };

    if (loading) return <Layout><Loading /></Layout>;
    if (!incident) return <Layout><div className="p-10 text-center">Incident not found</div></Layout>;

    return (
        <Layout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
                    <div className="px-4 py-5 sm:px-6 flex justify-between items-start">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">{incident.title}</h2>
                            <p className="mt-1 max-w-2xl text-sm text-gray-500">Incident #{incident.id}</p>
                        </div>
                        <StatusBadge status={incident.status} />
                    </div>
                    <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Description</h3>
                                <p className="mt-1 text-sm text-gray-900">{incident.description}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Severity</h3>
                                <p className="mt-1 text-sm text-gray-900 uppercase">{incident.severity}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mb-8">
                    <AiAnalysisCard incidentId={incident.id} />
                </div>

                {/* AI Post-Mortem Section (Legacy/Detailed) */}
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                        <div>
                            <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center gap-2">
                                <span className="p-1 bg-gray-100 rounded text-gray-600">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                                </span>
                                Deployment Post-Mortem
                            </h3>
                            <p className="mt-1 max-w-2xl text-sm text-gray-500">Generate a full report correlating recent deployments.</p>
                        </div>
                        <button
                            onClick={handleGenerateReview}
                            disabled={generating}
                            className={`px-4 py-2 rounded-md text-white text-sm font-medium ${generating ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-600 hover:bg-gray-700'}`}
                        >
                            {generating ? 'Generating...' : 'Generate Report'}
                        </button>
                    </div>
                    <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                        {!report ? (
                            <div className="text-center text-gray-500 italic py-4">
                                Click to generate a detailed post-mortem.
                            </div>
                        ) : (
                            <div className="prose prose-indigo max-w-none bg-gray-50 p-6 rounded-md border border-gray-200">
                                <pre className="whitespace-pre-wrap font-sans text-sm text-gray-800 leading-relaxed">
                                    {report}
                                </pre>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
}
