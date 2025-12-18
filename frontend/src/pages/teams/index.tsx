import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import api from '@/services/api';
import Link from 'next/link';
import Loading from '@/components/Loading';

interface Team {
    id: number;
    name: string;
    description: string;
    slug: string;
    created_at: string;
}

export default function TeamsList() {
    const [teams, setTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [newName, setNewName] = useState('');
    const [newDesc, setNewDesc] = useState('');

    useEffect(() => {
        fetchTeams();
    }, []);

    const fetchTeams = async () => {
        try {
            const res = await api.get('/teams');
            setTeams(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/teams', { name: newName, description: newDesc });
            setNewName('');
            setNewDesc('');
            setIsCreating(false);
            fetchTeams();
        } catch (err) {
            alert('Failed to create team');
        }
    };

    if (loading) return <Layout><Loading /></Layout>;

    return (
        <Layout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Teams</h1>
                        <p className="mt-1 text-sm text-gray-500">Manage your engineering teams and service ownership.</p>
                    </div>
                    <button
                        onClick={() => setIsCreating(true)}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 font-medium"
                    >
                        + Create Team
                    </button>
                </div>

                {isCreating && (
                    <div className="mb-6 bg-white p-6 rounded-lg shadow border border-gray-200">
                        <h3 className="text-lg font-medium mb-4">New Team</h3>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Team Name</label>
                                <input
                                    type="text"
                                    required
                                    value={newName}
                                    onChange={e => setNewName(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border px-3 py-2"
                                    placeholder="e.g. Platform Engineering"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Description</label>
                                <input
                                    type="text"
                                    value={newDesc}
                                    onChange={e => setNewDesc(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border px-3 py-2"
                                    placeholder="e.g. Responsible for core infrastructure"
                                />
                            </div>
                            <div className="flex gap-2">
                                <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-md">Create</button>
                                <button type="button" onClick={() => setIsCreating(false)} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md">Cancel</button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {teams.map(team => (
                        <Link href={`/teams/${team.id}`} key={team.id} className="block group">
                            <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200 group-hover:border-indigo-500 transition-colors h-full">
                                <div className="px-4 py-5 sm:p-6">
                                    <h3 className="text-lg font-medium text-gray-900">{team.name}</h3>
                                    <p className="mt-1 text-sm text-gray-500 line-clamp-2">{team.description}</p>
                                    <div className="mt-4 flex items-center text-xs text-gray-400">
                                        <span className="truncate">Slug: {team.slug}</span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                    {teams.length === 0 && !loading && (
                        <div className="col-span-full text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
                            <p className="text-gray-500">You are not a member of any teams yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
}
