import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import { useRouter } from 'next/router';
import Loading from '@/components/Loading';

export default function AdminDashboard() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [stats, setStats] = useState<any>(null);
    const [usersList, setUsersList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading) {
            if (!user || user.role !== 'admin') {
                // router.push('/dashboard'); 
                // Note: user object in frontend might not have role yet if we didn't update the User interface/API response.
                // For now, let's assume if API fails with 403, we redirect.
            } else {
                fetchAdminData();
            }
        }
    }, [user, authLoading]);

    const fetchAdminData = async () => {
        try {
            const [statsRes, usersRes] = await Promise.all([
                api.get('/admin/stats'),
                api.get('/admin/users?limit=20')
            ]);
            setStats(statsRes.data);
            setUsersList(usersRes.data);
        } catch (error) {
            console.error("Admin Access Denied", error);
            router.push('/dashboard');
        } finally {
            setLoading(false);
        }
    };

    const toggleUserStatus = async (userId: number) => {
        try {
            await api.put(`/admin/users/${userId}/toggle-active`);
            setUsersList(usersList.map(u => {
                if (u.id === userId) return { ...u, is_active: u.is_active ? 0 : 1 };
                return u;
            }));
        } catch (err) {
            alert("Failed to update user");
        }
    };

    if (authLoading || loading) return <Layout><Loading /></Layout>;

    return (
        <Layout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

                {/* Stats */}
                {stats && (
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-10">
                        <div className="bg-white overflow-hidden shadow rounded-lg px-4 py-5 sm:p-6">
                            <dt className="text-sm font-medium text-gray-500">Total Users</dt>
                            <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.total_users}</dd>
                        </div>
                        <div className="bg-white overflow-hidden shadow rounded-lg px-4 py-5 sm:p-6">
                            <dt className="text-sm font-medium text-gray-500">Active Users</dt>
                            <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.active_users}</dd>
                        </div>
                        <div className="bg-white overflow-hidden shadow rounded-lg px-4 py-5 sm:p-6">
                            <dt className="text-sm font-medium text-gray-500">Total Workflows</dt>
                            <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.total_workflows}</dd>
                        </div>
                    </div>
                )}

                {/* User Table */}
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <div className="px-4 py-5 sm:px-6">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">User Management</h3>
                    </div>
                    <div className="border-t border-gray-200">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {usersList.map((u) => (
                                    <tr key={u.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.id}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{u.email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.role}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${u.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {u.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button
                                                onClick={() => toggleUserStatus(u.id)}
                                                className="text-indigo-600 hover:text-indigo-900"
                                            >
                                                {u.is_active ? 'Deactivate' : 'Activate'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
