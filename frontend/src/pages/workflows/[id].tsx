import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import { getWorkflow, updateWorkflow, Workflow } from '@/services/workflow';
import dynamic from 'next/dynamic';
import { useWebSocket } from '@/context/WebSocketContext';
import { Play } from 'lucide-react';
import api from '@/services/api';

// Dynamic import with SSR disabled to prevent hydration issues with ReactFlow
const FlowEditor = dynamic(() => import('@/components/FlowEditor'), {
    ssr: false,
    loading: () => <div className="p-4">Loading Editor...</div>,
});

const defaultNodes = [
    { id: '1', position: { x: 250, y: 100 }, data: { label: 'Start Trigger' }, type: 'triggerNode' },
];

export default function WorkflowBuilder() {
    const router = useRouter();
    const { id } = router.query;
    const [workflow, setWorkflow] = useState<Workflow | null>(null);
    const [loading, setLoading] = useState(true);
    const { lastMessage } = useWebSocket();
    const [executionStatus, setExecutionStatus] = useState<string | null>(null);

    // Listen for WS events
    useEffect(() => {
        if (lastMessage && lastMessage.workflow_id === Number(id)) {
            if (lastMessage.type === 'workflow_start') {
                setExecutionStatus('Running...');
            } else if (lastMessage.type === 'step_start') {
                setExecutionStatus(`Running Step: ${lastMessage.label}`);
            } else if (lastMessage.type === 'step_finish') {
                // Maybe flash success?
            } else if (lastMessage.type === 'workflow_finish') {
                setExecutionStatus('Completed Successfully! ✅');
                setTimeout(() => setExecutionStatus(null), 3000);
            }
        }
    }, [lastMessage, id]);

    const handleRun = async () => {
        if (!workflow) return;
        setExecutionStatus('Starting...');
        try {
            await api.post(`/workflows/${workflow.id}/run`);
        } catch (err) {
            console.error(err);
            setExecutionStatus('Failed to start');
        }
    };

    // Load workflow data
    useEffect(() => {
        if (id) {
            loadWorkflow(Number(id));
        }
    }, [id]);

    const loadWorkflow = async (wfId: number) => {
        try {
            const wf = await getWorkflow(wfId);
            setWorkflow(wf);
        } catch (err) {
            console.error("Failed to load workflow", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (nodes: any[], edges: any[]) => {
        if (!workflow) return;
        try {
            const stepsData = { nodes, edges };
            await updateWorkflow(workflow.id, {
                name: workflow.name,
                steps: [stepsData]
            });
            alert('Workflow saved!');
        } catch (err) {
            console.error("Failed to save", err);
            alert('Failed to save');
        }
    };

    if (loading) return <Layout><div className="p-8 text-center">Loading Workflow...</div></Layout>;
    if (!workflow) return <Layout><div className="p-8 text-center text-red-500">Workflow not found</div></Layout>;

    // Prepare initial data
    let initialNodesData = defaultNodes;
    let initialEdgesData: any[] = [];

    if (workflow.steps && workflow.steps.length > 0) {
        const saved = workflow.steps[0];
        if (saved.nodes) initialNodesData = saved.nodes;
        if (saved.edges) initialEdgesData = saved.edges;
    }

    return (
        <Layout>
            <div className="h-[calc(100vh-64px)] flex flex-col">
                <div className="bg-white border-b border-gray-200 px-4 py-3 flex justify-between items-center">
                    <div>
                        <h1 className="text-lg font-bold text-gray-900">{workflow.name}</h1>
                        <p className="text-xs text-gray-500">Visual Builder</p>
                    </div>
                    <div className="flex items-center space-x-4">
                        {executionStatus && (
                            <span className="text-sm font-medium text-indigo-600 animate-pulse bg-indigo-50 px-2 py-1 rounded">
                                {executionStatus}
                            </span>
                        )}
                        <button
                            onClick={handleRun}
                            className="flex items-center px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm font-medium transition-colors shadow-sm"
                        >
                            <Play className="w-4 h-4 mr-1.5" />
                            Run Now
                        </button>
                    </div>
                </div>
                <div className="flex-grow relative">
                    <FlowEditor
                        initialNodes={initialNodesData}
                        initialEdges={initialEdgesData}
                        onSave={handleSave}
                    />
                </div>
            </div>
        </Layout>
    );
}
