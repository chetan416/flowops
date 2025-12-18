import React from 'react';

interface Props {
    status: 'healthy' | 'degraded' | 'down' | string;
}

export default function StatusBadge({ status }: Props) {
    const s = status.toLowerCase();

    if (s === 'healthy' || s === 'up') {
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Healthy</span>;
    }
    if (s === 'degraded') {
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Degraded</span>;
    }
    if (s === 'down' || s === 'critical') {
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Down</span>;
    }

    return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">{status}</span>;
}
