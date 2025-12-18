import React from 'react';

export default function Loading() {
    return (
        <div className="flex h-full min-h-[200px] items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
    );
}
