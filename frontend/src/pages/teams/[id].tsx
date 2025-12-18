import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import api from '@/services/api';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Loading from '@/components/Loading';

interface Team {
    id: number;
    name: string;
    description: string;
    slug: string;
}

interface User {
    id: number;
    email: string;
    full_name: string;
}

interface TeamMember {
    user: User;
    role: string;
    joined_at: string;
}

export default function TeamDetails() {
    const router = useRouter();
    const { id } = router.query;
    const [team, setTeam] = useState<Team | null>(null);
    const [loading, setLoading] = useState(true);
    const [isAddingMember, setIsAddingMember] = useState(false);
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('member');

    useEffect(() => {
        if (id) fetchTeam();
    }, [id]);

    const fetchTeam = async () => {
        try {
            const res = await api.get(`/teams/${id}`);
            setTeam(res.data);
            // In a real app, we'd fetch members separately or include them
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddMember = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post(`/teams/${id}/members`, { user_email: email, role });
            alert('Member added successfully');
            setEmail('');
            setIsAddingMember(false);
            fetchTeam();
        } catch (err) {
            alert('Failed to add member. User email must exist.');
        }
    };

    if (loading) return <Layout><Loading /></Layout>;
    if (!team) return <Layout><div className="p-10 text-center">Team not found</div></Layout>;

    return (
        <Layout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="md:flex md:items-center md:justify-between mb-8">
                    <div className="flex-1 min-w-0">
                        <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                            {team.name}
                        </h2>
                        <div className="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:mt-0 sm:space-x-6">
                            <div className="mt-2 flex items-center text-sm text-gray-500">
                                {team.description}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
                    <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                        <div>
                            <h3 className="text-lg leading-6 font-medium text-gray-900">Members</h3>
                            <p className="mt-1 max-w-2xl text-sm text-gray-500">People with access to this team's resources.</p>
                        </div>
                        <button
                            onClick={() => setIsAddingMember(true)}
                            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 text-sm"
                        >
                            + Add Member
                        </button>
                    </div>

                    {isAddingMember && (
                        <div className="px-4 py-5 bg-gray-50 border-t border-b border-gray-200">
                            <form onSubmit={handleAddMember} className="flex gap-4 items-end">
                                <div className="flex-grow">
                                    <label className="block text-sm font-medium text-gray-700">User Email</label>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border px-3 py-2"
                                        placeholder="colleague@company.com"
                                    />
                                </div>
                                <div className="w-32">
                                    <label className="block text-sm font-medium text-gray-700">Role</label>
                                    <select value={role} onChange={e => setRole(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border px-3 py-2 bg-white">
                                        <option value="member">Member</option>
                                        <option value="admin">Admin</option>
                                        <option value="owner">Owner</option>
                                    </select>
                                </div>
                                <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-md mb-px">Add</button>
                                <button type="button" onClick={() => setIsAddingMember(false)} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md mb-px">Cancel</button>
                            </form>
                        </div>
                    )}

                    <div className="border-t border-gray-200 px-4 py-5 sm:p-6 text-center text-gray-500 text-sm italic">
                        (Member list fetching coming next)
                    </div>
                </div>

                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <div className="px-4 py-5 sm:px-6">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">Owned Services</h3>
                        <p className="mt-1 max-w-2xl text-sm text-gray-500">Services owned and maintained by this team.</p>
                    </div>
                    <div className="border-t border-gray-200 px-4 py-5 sm:p-6 text-center text-gray-500 text-sm italic">
                        (Service list coming next)
                    </div>
                </div>
            </div>
        </Layout>
    );
}
