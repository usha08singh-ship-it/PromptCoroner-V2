'use client';

import { useState } from 'react';

export function AdminPaymentsClient({ initialRequests }: { initialRequests: any[] }) {
    const [requests, setRequests] = useState(initialRequests);
    const [loadingId, setLoadingId] = useState<string|null>(null);

    const handleAction = async (id: string, action: 'approve' | 'reject') => {
        setLoadingId(id);
        try {
            const res = await fetch('/api/payments/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ request_id: id, action })
            });
            if (res.ok) {
                const data = await res.json();
                setRequests(prev => prev.map(req => req.id === id ? { ...req, status: data.status } : req));
            } else {
                alert('Action failed');
            }
        } catch (err) {
            alert('Error performing action');
        } finally {
            setLoadingId(null);
        }
    };

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b border-neutral-800 text-neutral-400">
                        <th className="p-4">Email</th>
                        <th className="p-4">UTR Number</th>
                        <th className="p-4">Submitted At</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {requests.map(req => (
                        <tr key={req.id} className="border-b border-neutral-800/50 hover:bg-neutral-900/20">
                            <td className="p-4">{req.email}</td>
                            <td className="p-4 font-mono">{req.utr_number}</td>
                            <td className="p-4 text-sm text-neutral-500">{new Date(req.created_at).toLocaleString()}</td>
                            <td className="p-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                    req.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                                    req.status === 'approved' ? 'bg-green-500/20 text-green-500' :
                                    'bg-red-500/20 text-red-500'
                                }`}>
                                    {req.status}
                                </span>
                            </td>
                            <td className="p-4">
                                {req.status === 'pending' && (
                                    <div className="flex gap-2">
                                        <button 
                                            disabled={loadingId === req.id}
                                            onClick={() => handleAction(req.id, 'approve')}
                                            className="bg-green-600 hover:bg-green-500 px-3 py-1 text-sm rounded transition disabled:opacity-50"
                                        >
                                            Approve
                                        </button>
                                        <button 
                                            disabled={loadingId === req.id}
                                            onClick={() => handleAction(req.id, 'reject')}
                                            className="bg-red-600 hover:bg-red-500 px-3 py-1 text-sm rounded transition disabled:opacity-50"
                                        >
                                            Reject
                                        </button>
                                    </div>
                                )}
                            </td>
                        </tr>
                    ))}
                    {requests.length === 0 && (
                        <tr>
                            <td colSpan={5} className="p-8 text-center text-neutral-500">No payment requests found.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
