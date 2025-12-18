import React, { useState } from 'react';
import api from '@/services/api';
import { Zap as ZapIcon, Play as PlayIcon } from 'lucide-react';

interface RemediationSuggestion {
    workflow_id: number;
    workflow_name: string;
    confidence: number;
    reasoning: string;
}

interface AiAnalysisCardProps {
    incidentId: number;
}

const AiAnalysisCard: React.FC<AiAnalysisCardProps> = ({ incidentId }) => {
    const [analysis, setAnalysis] = useState<string | null>(null);
    const [remediation, setRemediation] = useState<RemediationSuggestion | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAnalyze = async () => {
        setLoading(true);
        setError(null);
        setRemediation(null);
        try {
            const res = await api.post(`/ai/analyze/${incidentId}`);
            setAnalysis(res.data.analysis);

            // Try to get remediation
            try {
                const remRes = await api.get(`/incidents/${incidentId}/remediation`);
                if (remRes.data.suggestion) {
                    setRemediation(remRes.data.suggestion);
                }
            } catch (ignore) { }

        } catch (err: any) {
            setError(err.message || 'Failed to generate analysis');
        } finally {
            setLoading(false);
        }
    };

    const handleRunRemediation = async (suggestion: RemediationSuggestion) => {
        try {
            const confirm = window.confirm(`Are you sure you want to run workflow "${suggestion.workflow_name}"?`);
            if (!confirm) return;

            await api.post(`/workflows/${suggestion.workflow_id}/run`);
            alert(`🚀 Auto-remediation triggered: ${suggestion.workflow_name}`);
        } catch (err) {
            alert('Failed to trigger workflow');
        }
    };

    return (
        <div className="bg-white shadow sm:rounded-lg overflow-hidden border border-gray-100">
            <div className="px-4 py-5 sm:px-6 bg-gradient-to-r from-purple-50 to-white flex justify-between items-center">
                <div>
                    <h3 className="text-lg leading-6 font-medium text-purple-900 flex items-center gap-2">
                        <span className="p-1 bg-purple-100 rounded text-purple-600">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                        </span>
                        AI Insights
                    </h3>
                    <p className="mt-1 max-w-2xl text-sm text-purple-700">Get immediate hypothesis and recommendations.</p>
                </div>
                <button
                    onClick={handleAnalyze}
                    disabled={loading}
                    className={`px-4 py-2 rounded-md text-white text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 ${loading ? 'bg-purple-300 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700 shadow-sm'
                        }`}
                >
                    {loading ? (
                        <span className="flex items-center gap-2">
                            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Analyzing...
                        </span>
                    ) : 'Analyze Root Cause'}
                </button>
            </div>

            <div className="border-t border-gray-100 bg-gray-50/50 p-6">
                {error && (
                    <div className="rounded-md bg-red-50 p-4 mb-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800">Error</h3>
                                <div className="mt-2 text-sm text-red-700"><p>{error}</p></div>
                            </div>
                        </div>
                    </div>
                )}

                {!analysis ? (
                    <div className="text-center py-10">
                        <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        <p className="mt-2 text-sm text-gray-500">Tap the button above to let AI investigate potential root causes.</p>
                    </div>
                ) : (
                    <div className="prose prose-purple max-w-none">
                        <div className="bg-white p-6 rounded-lg border border-purple-100 shadow-sm">
                            <div className="markdown-body whitespace-pre-wrap font-sans text-gray-800 text-sm leading-7">
                                {analysis}
                            </div>
                        </div>
                    </div>
                )}

                {/* Remediation Section */}
                {remediation && (
                    <div className="mt-6 border-t border-purple-100 pt-6">
                        <div className="flex items-center justify-between bg-gradient-to-r from-indigo-50 to-white p-4 rounded-lg border border-indigo-100 shadow-sm">
                            <div>
                                <h4 className="flex items-center text-sm font-bold text-indigo-900 uppercase tracking-wide">
                                    <ZapIcon className="w-4 h-4 mr-2 text-indigo-600" />
                                    AI Remediation Suggested
                                </h4>
                                <p className="text-indigo-800 font-medium mt-1 text-sm">
                                    Recommended Action: <span className="underline">{remediation.workflow_name}</span>
                                </p>
                                <p className="text-xs text-indigo-600 mt-1 max-w-lg">
                                    {remediation.reasoning} (Confidence: {Math.round(remediation.confidence * 100)}%)
                                </p>
                            </div>
                            <button
                                onClick={() => handleRunRemediation(remediation)}
                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded shadow-md transition-all flex items-center transform hover:scale-105"
                            >
                                <PlayIcon className="w-3 h-3 mr-2" />
                                Run Fix Workflow
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AiAnalysisCard;
