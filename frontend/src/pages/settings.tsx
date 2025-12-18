import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import { useRouter } from 'next/router';

export default function Settings() {
    const { user, refreshUser, loading } = useAuth();
    const router = useRouter();
    const [fullName, setFullName] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState({ type: '', text: '' });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/auth/login');
        } else if (user) {
            setFullName(user.full_name || '');
        }
    }, [user, loading, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });
        setIsSaving(true);

        try {
            const payload: any = {};
            if (fullName !== user?.full_name) payload.full_name = fullName;
            if (password) payload.password = password;

            if (Object.keys(payload).length === 0) {
                setMessage({ type: 'info', text: 'No changes to save.' });
                setIsSaving(false);
                return;
            }

            await api.put('/users/me', payload);
            await refreshUser();
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
            setPassword(''); // Clear password field
        } catch (error: any) {
            console.error("Update failed", error);
            setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
        } finally {
            setIsSaving(false);
        }
    };

    if (loading || !user) return <Layout><div>Loading...</div></Layout>;

    return (
        <Layout>
            <div className="max-w-2xl mx-auto px-4 py-12">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Account Settings</h1>

                <div className="bg-white shadow rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-6">Profile Information</h2>

                    {message.text && (
                        <div className={`mb-4 p-4 rounded ${message.type === 'success' ? 'bg-green-50 text-green-700' :
                                message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'
                            }`}>
                            {message.text}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email Address</label>
                            <input
                                type="text"
                                value={user.email}
                                disabled
                                className="mt-1 block w-full bg-gray-100 border border-gray-300 rounded-md py-2 px-3 text-gray-500 shadow-sm sm:text-sm"
                            />
                            <p className="mt-1 text-xs text-gray-500">Email cannot be changed.</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Full Name</label>
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">New Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Leave blank to keep current password"
                                className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                        </div>

                        <div className="pt-4 border-t border-gray-200 flex justify-end">
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                            >
                                {isSaving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </Layout>
    );
}
