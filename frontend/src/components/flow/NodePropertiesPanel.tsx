import React, { useEffect, useState } from 'react';
import { Node } from 'reactflow';
import { X } from 'lucide-react';

interface NodePropertiesPanelProps {
    selectedNode: Node | null;
    onChange: (nodeId: string, data: any) => void;
    onClose: () => void;
}

export default function NodePropertiesPanel({ selectedNode, onChange, onClose }: NodePropertiesPanelProps) {
    const [label, setLabel] = useState('');
    const [description, setDescription] = useState('');

    // HTTP Request Properties
    const [method, setMethod] = useState('GET');
    const [url, setUrl] = useState('');
    const [headers, setHeaders] = useState('{}');
    const [body, setBody] = useState('{}');

    // Slack Properties
    const [channel, setChannel] = useState('');
    const [message, setMessage] = useState('');
    const [webhookUrl, setWebhookUrl] = useState('');

    useEffect(() => {
        if (selectedNode) {
            setLabel(selectedNode.data.label || '');
            setDescription(selectedNode.data.description || '');

            // HTTP Defaults
            setMethod(selectedNode.data.method || 'GET');
            setUrl(selectedNode.data.url || '');
            setHeaders(typeof selectedNode.data.headers === 'string' ? selectedNode.data.headers : JSON.stringify(selectedNode.data.headers || {}, null, 2));
            setBody(typeof selectedNode.data.body === 'string' ? selectedNode.data.body : JSON.stringify(selectedNode.data.body || {}, null, 2));

            // Slack Defaults
            setChannel(selectedNode.data.channel || '');
            setMessage(selectedNode.data.message || '');
            setWebhookUrl(selectedNode.data.webhookUrl || '');
        }
    }, [selectedNode]);

    const handleChange = (key: string, value: any) => {
        if (!selectedNode) return;

        const newData = {
            ...selectedNode.data,
            [key]: value
        };

        // Update local state for immediate feedback if needed, but props update on selection change
        // Here we just push up
        onChange(selectedNode.id, newData);

        // Update local state to match (though typically we rely on re-render from parent if fully controlled)
        // For simplicity allow local state to drive inputs
        if (key === 'label') setLabel(value);
        if (key === 'description') setDescription(value);
        if (key === 'method') setMethod(value);
        if (key === 'url') setUrl(value);
        if (key === 'headers') setHeaders(value);
        if (key === 'body') setBody(value);
        if (key === 'channel') setChannel(value);
        if (key === 'message') setMessage(value);
        if (key === 'webhookUrl') setWebhookUrl(value);
    };

    if (!selectedNode) return null;

    const isHttp = selectedNode.data.actionType === 'http-request';
    const isSlack = selectedNode.data.actionType === 'slack-notification';

    return (
        <div className="w-80 border-l border-gray-200 bg-white h-full shadow-xl flex flex-col z-20 absolute right-0 top-0 bottom-0">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Properties</h3>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                    <X className="w-4 h-4" />
                </button>
            </div>

            <div className="p-4 space-y-4 overflow-y-auto flex-1">
                <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Label</label>
                    <input
                        className="w-full text-sm p-2 border border-gray-300 rounded focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                        value={label}
                        onChange={(e) => handleChange('label', e.target.value)}
                    />
                </div>

                <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Description</label>
                    <textarea
                        className="w-full text-sm p-2 border border-gray-300 rounded focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                        rows={2}
                        value={description}
                        onChange={(e) => handleChange('description', e.target.value)}
                    />
                </div>

                <hr className="border-gray-100" />

                {/* HTTP Request Fields */}
                {isHttp && (
                    <div className="space-y-4 animate-in slide-in-from-right-2">
                        <h4 className="text-xs font-bold text-blue-600 uppercase">HTTP Configuration</h4>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Method</label>
                            <select
                                className="w-full text-sm p-2 border border-gray-300 rounded"
                                value={method}
                                onChange={(e) => handleChange('method', e.target.value)}
                            >
                                <option value="GET">GET</option>
                                <option value="POST">POST</option>
                                <option value="PUT">PUT</option>
                                <option value="DELETE">DELETE</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">URL</label>
                            <input
                                className="w-full text-sm p-2 border border-gray-300 rounded font-mono text-xs"
                                value={url}
                                placeholder="https://api.example.com/v1/..."
                                onChange={(e) => handleChange('url', e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Headers (JSON)</label>
                            <textarea
                                className="w-full text-sm p-2 border border-gray-300 rounded font-mono text-xs"
                                rows={3}
                                value={headers}
                                onChange={(e) => handleChange('headers', e.target.value)}
                            />
                        </div>
                        {(method === 'POST' || method === 'PUT') && (
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Body (JSON)</label>
                                <textarea
                                    className="w-full text-sm p-2 border border-gray-300 rounded font-mono text-xs"
                                    rows={5}
                                    value={body}
                                    onChange={(e) => handleChange('body', e.target.value)}
                                />
                            </div>
                        )}
                    </div>
                )}

                {/* Slack Fields */}
                {isSlack && (
                    <div className="space-y-4 animate-in slide-in-from-right-2">
                        <h4 className="text-xs font-bold text-purple-600 uppercase">Slack Configuration</h4>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Webhook URL</label>
                            <input
                                className="w-full text-sm p-2 border border-gray-300 rounded font-mono text-xs"
                                value={webhookUrl}
                                placeholder="https://hooks.slack.com/services/..."
                                onChange={(e) => handleChange('webhookUrl', e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Channel (Optional)</label>
                            <input
                                className="w-full text-sm p-2 border border-gray-300 rounded"
                                value={channel}
                                placeholder="#alerts"
                                onChange={(e) => handleChange('channel', e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Message</label>
                            <textarea
                                className="w-full text-sm p-2 border border-gray-300 rounded"
                                rows={3}
                                value={message}
                                placeholder="Something happened!"
                                onChange={(e) => handleChange('message', e.target.value)}
                            />
                        </div>
                    </div>
                )}

                {(!isHttp && !isSlack) && (
                    <div className="text-xs text-gray-400 italic">
                        Select a specific action type to see more options.
                    </div>
                )}

            </div>
        </div>
    );
}
