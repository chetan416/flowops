import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import api from '@/services/api';
import { getWorkflows, createWorkflow, deleteWorkflow, Workflow } from '@/services/workflow';
import { Plus, Trash2, ArrowRight } from 'lucide-react';
import Loading from '@/components/Loading';

export default function WorkflowsList() {
    const [workflows, setWorkflows] = useState<Workflow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [newWorkflowName, setNewWorkflowName] = useState('');
    const router = useRouter();

    useEffect(() => {
        loadWorkflows();
    }, []);

    const loadWorkflows = async () => {
        try {
            const data = await getWorkflows();
            setWorkflows(data);
        } catch (error) {
            console.error("Failed to load workflows", error);
            setError("Failed to load workflows. Please check your connection.");
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const newWf = await createWorkflow({ name: newWorkflowName, description: 'New workflow' });
            setWorkflows([...workflows, newWf]);
            setNewWorkflowName('');
            setIsCreating(false);
            router.push(`/workflows/${newWf.id}`);
        } catch (error) {
            console.error("Failed to create workflow", error);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure?")) return;
        try {
            await deleteWorkflow(id);
            setWorkflows(workflows.filter(w => w.id !== id));
        } catch (error) {
            console.error("Failed to delete", error);
        }
    };

    const handleRun = async (id: number) => {
        try {
            await api.post(`/workflows/${id}/run`);
            alert("Workflow execution started!");
        } catch (error) {
            console.error("Failed to run workflow", error);
            alert("Failed to start workflow");
        }
    };

    return (
        <Layout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Your Workflows</h1>
                    <button
                        onClick={() => setIsCreating(true)}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors flex items-center"
                    >
                        + New Workflow
                    </button>
                </div>

                {isCreating && (
                    <div className="mb-8 bg-white p-6 rounded-lg shadow border border-gray-200">
                        <form onSubmit={handleCreate} className="flex gap-4">
                            <input
                                type="text"
                                placeholder="Workflow Name"
                                value={newWorkflowName}
                                onChange={(e) => setNewWorkflowName(e.target.value)}
                                className="flex-grow rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border px-4 py-2"
                                required
                            />
                            <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-md">Create</button>
                            <button
                                type="button"
                                onClick={() => setIsCreating(false)}
                                className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md"
                            >
                                Cancel
                            </button>
                        </form>
                    </div>
                )}

                {error && (
                    <div className="mb-8 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                        {error}
                    </div>
                )}

                {loading ? (
                    <Loading />
                ) : workflows.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                        <p className="text-gray-500 text-lg">No workflows found. Create your first one!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {workflows.map((wf) => (
                            <div key={wf.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200 p-6 flex flex-col justify-between h-48">
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-800 mb-2 truncate">{wf.name}</h3>
                                    <p className="text-gray-500 text-sm line-clamp-2">{wf.description}</p>
                                </div>
                                <div className="flex justify-between items-center mt-4">
                                    <Link href={`/workflows/${wf.id}`} className="text-indigo-600 font-medium hover:text-indigo-800 flex items-center">
                                        Open Builder &rarr;
                                    </Link>
                                    <button
                                        onClick={() => handleRun(wf.id)}
                                        className="text-green-600 hover:text-green-800 text-sm font-medium"
                                    >
                                        Run Now
                                    </button>
                                    <button
                                        onClick={() => handleDelete(wf.id)}
                                        className="text-red-500 hover:text-red-700 text-sm"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Layout>
    );
}
