import React, { useState, useEffect } from 'react';
import { PlayCircle, Zap, GitBranch, Plus, Trash2 } from 'lucide-react';

interface CustomNodeDef {
    id: string;
    type: string;
    label: string;
    description: string;
}

export default function Sidebar() {
    const [customNodes, setCustomNodes] = useState<CustomNodeDef[]>([]);
    const [isCreating, setIsCreating] = useState(false);

    // Form State
    const [newNodeType, setNewNodeType] = useState('actionNode');
    const [newNodeLabel, setNewNodeLabel] = useState('');
    const [newNodeDesc, setNewNodeDesc] = useState('');

    useEffect(() => {
        const saved = localStorage.getItem('flowops_custom_nodes');
        if (saved) {
            try {
                setCustomNodes(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse custom nodes", e);
            }
        }
    }, []);

    const saveCustomNodes = (nodes: CustomNodeDef[]) => {
        setCustomNodes(nodes);
        localStorage.setItem('flowops_custom_nodes', JSON.stringify(nodes));
    };

    const handleCreateNode = () => {
        if (!newNodeLabel) return;

        const newNode: CustomNodeDef = {
            id: Date.now().toString(),
            type: newNodeType,
            label: newNodeLabel,
            description: newNodeDesc
        };

        saveCustomNodes([...customNodes, newNode]);
        setIsCreating(false);
        setNewNodeLabel('');
        setNewNodeDesc('');
    };

    const handleDeleteNode = (id: string) => {
        saveCustomNodes(customNodes.filter(n => n.id !== id));
    };

    const onDragStart = (event: React.DragEvent, nodeType: string, nodeData?: any) => {
        // Pass a JSON string to carrying rich data
        const payload = JSON.stringify({
            type: nodeType,
            data: nodeData
        });
        event.dataTransfer.setData('application/reactflow/json', payload);
        event.dataTransfer.effectAllowed = 'move';

        // Fallback for older drop handlers if any (though we will update them)
        event.dataTransfer.setData('application/reactflow', nodeType);
    };

    const renderNodeItem = (type: string, label: string, description: string, icon: any, customId?: string) => (
        <div
            className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg cursor-grab hover:shadow-md transition-all active:cursor-grabbing group"
            onDragStart={(event) => onDragStart(event, type, { label, description })}
            draggable
        >
            <div className="flex items-center space-x-3">
                <div className={`p-1.5 rounded-md ${type === 'triggerNode' ? 'bg-indigo-500' :
                    type === 'actionNode' ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}>
                    {React.createElement(icon, { className: "w-4 h-4 text-white" })}
                </div>
                <div>
                    <span className="text-sm font-medium text-gray-700 block">{label}</span>
                    <span className="text-[10px] text-gray-500">{description}</span>
                </div>
            </div>
            {customId && (
                <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteNode(customId); }}
                    className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 p-1"
                >
                    <Trash2 className="w-3 h-3" />
                </button>
            )}
        </div>
    );

    return (
        <aside className="w-72 bg-gray-50 border-l border-gray-200 flex flex-col h-full shadow-sm z-10 overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-white">
                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-tighter">Library</h3>
                <button
                    onClick={() => setIsCreating(!isCreating)}
                    className="p-1 rounded bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
                    title="Create Custom Node"
                >
                    <Plus className="w-4 h-4" />
                </button>
            </div>

            {isCreating && (
                <div className="p-4 bg-indigo-50 border-b border-indigo-100 animate-in slide-in-from-top-2">
                    <h4 className="text-xs font-bold text-indigo-800 mb-2 uppercase">New Node</h4>
                    <div className="space-y-2">
                        <select
                            className="w-full text-xs p-2 rounded border border-indigo-200"
                            value={newNodeType}
                            onChange={(e) => setNewNodeType(e.target.value)}
                        >
                            <option value="triggerNode">Trigger</option>
                            <option value="actionNode">Action</option>
                            <option value="conditionNode">Condition</option>
                        </select>
                        <input
                            className="w-full text-xs p-2 rounded border border-indigo-200"
                            placeholder="Label (e.g. Send Slack Message)"
                            value={newNodeLabel}
                            onChange={(e) => setNewNodeLabel(e.target.value)}
                        />
                        <input
                            className="w-full text-xs p-2 rounded border border-indigo-200"
                            placeholder="Description (optional)"
                            value={newNodeDesc}
                            onChange={(e) => setNewNodeDesc(e.target.value)}
                        />
                        <div className="flex space-x-2 pt-1">
                            <button
                                onClick={handleCreateNode}
                                className="flex-1 bg-indigo-600 text-white text-xs py-1.5 rounded hover:bg-indigo-700 font-medium"
                            >
                                Create
                            </button>
                            <button
                                onClick={() => setIsCreating(false)}
                                className="flex-1 bg-white text-gray-600 text-xs py-1.5 rounded border border-gray-300 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {/* Standard Library */}
                <div className="space-y-2">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Standard</h4>
                    {renderNodeItem('triggerNode', 'Start Trigger', 'API, Schedule, or Webhook', PlayCircle)}
                    {renderNodeItem('actionNode', 'Generic Action', 'Run script, HTTP Request', Zap)}
                    {renderNodeItem('conditionNode', 'Logic Condition', 'If/Else Logic Branch', GitBranch)}

                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 mt-4">Integrations</h4>
                    <div
                        className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg cursor-grab hover:shadow-md transition-all active:cursor-grabbing group"
                        onDragStart={(event) => onDragStart(event, 'actionNode', { label: 'HTTP Request', actionType: 'http-request', method: 'GET', url: 'https://api.example.com' })}
                        draggable
                    >
                        <div className="flex items-center space-x-3">
                            <div className="p-1.5 rounded-md bg-blue-500">
                                <Zap className="w-4 h-4 text-white" />
                            </div>
                            <div>
                                <span className="text-sm font-medium text-gray-700 block">HTTP Request</span>
                                <span className="text-[10px] text-gray-500">Make an API call</span>
                            </div>
                        </div>
                    </div>

                    <div
                        className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg cursor-grab hover:shadow-md transition-all active:cursor-grabbing group"
                        onDragStart={(event) => onDragStart(event, 'actionNode', { label: 'Slack Notify', actionType: 'slack-notification', channel: '#alerts' })}
                        draggable
                    >
                        <div className="flex items-center space-x-3">
                            <div className="p-1.5 rounded-md bg-[#4A154B]">
                                <img src="https://cdn.icon-icons.com/icons2/2699/PNG/512/slack_logo_icon_168702.png" alt="" className="w-4 h-4 filter invert brightness-200" style={{ filter: 'brightness(0) invert(1)' }} />
                            </div>
                            <div>
                                <span className="text-sm font-medium text-gray-700 block">Slack Notification</span>
                                <span className="text-[10px] text-gray-500">Send a message</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Custom Library */}
                {customNodes.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-gray-200">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">My Custom Nodes</h4>
                        {customNodes.map(node => (
                            <div key={node.id}>
                                {renderNodeItem(node.type, node.label, node.description,
                                    node.type === 'triggerNode' ? PlayCircle :
                                        node.type === 'actionNode' ? Zap : GitBranch,
                                    node.id
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="p-3 bg-white border-t border-gray-200 text-center">
                <p className="text-[10px] text-gray-400">
                    Drag nodes to canvas
                </p>
            </div>
        </aside>
    );
};
