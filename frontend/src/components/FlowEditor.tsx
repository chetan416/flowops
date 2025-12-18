import React, { useCallback, useRef, useState, useMemo } from 'react';
import ReactFlow, {
    addEdge,
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    Connection,
    Edge,
    Node,
    ReactFlowProvider,
    Panel
} from 'reactflow';
import 'reactflow/dist/style.css';
import Sidebar from './flow/Sidebar';
import { TriggerNode, ActionNode, ConditionNode } from './flow/CustomNodes';
import NodePropertiesPanel from './flow/NodePropertiesPanel';

interface FlowEditorProps {
    initialNodes: Node[];
    initialEdges: Edge[];
    onSave: (nodes: Node[], edges: Edge[]) => void;
}

const FlowEditorContent: React.FC<FlowEditorProps> = ({ initialNodes, initialEdges, onSave }) => {
    const reactFlowWrapper = useRef<HTMLDivElement>(null);
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
    const [selectedNode, setSelectedNode] = useState<Node | null>(null);

    const nodeTypes = useMemo(() => ({
        triggerNode: TriggerNode,
        actionNode: ActionNode,
        conditionNode: ConditionNode,
    }), []);

    const onConnect = useCallback((params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    // ... inside FlowEditorContent ...
    const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
        setSelectedNode(node);
    }, []);

    const onPaneClick = useCallback(() => {
        setSelectedNode(null);
    }, []);

    const onNodeDataChange = useCallback((nodeId: string, newData: any) => {
        setNodes((nds) => nds.map((node) => {
            if (node.id === nodeId) {
                return { ...node, data: newData };
            }
            return node;
        }));
        // Update selected node reference as well to keep panel in sync
        setSelectedNode((prev) => prev && prev.id === nodeId ? { ...prev, data: newData } : prev);
    }, [setNodes]);

    const onDrop = useCallback(
        (event: React.DragEvent) => {
            event.preventDefault();

            const jsonPayload = event.dataTransfer.getData('application/reactflow/json');
            let type = event.dataTransfer.getData('application/reactflow');
            let data = { label: `${type.replace('Node', '')} node` };

            if (jsonPayload) {
                try {
                    const parsed = JSON.parse(jsonPayload);
                    type = parsed.type;
                    if (parsed.data) {
                        data = { ...data, ...parsed.data };
                    }
                } catch (e) {
                    console.error("Failed to parse node payload");
                }
            }

            // check if the dropped element is valid (compat with old logic)
            if (typeof type === 'undefined' || !type) {
                return;
            }

            const position = reactFlowInstance.screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });

            const newNode: Node = {
                id: `${type}-${Date.now()}`,
                type,
                position,
                data: data,
            };

            setNodes((nds) => nds.concat(newNode));
        },
        [reactFlowInstance, setNodes]
    );

    const handleSaveInternal = () => {
        onSave(nodes, edges);
    };

    const handleDeleteSelected = useCallback(() => {
        const selectedNodes = nodes.filter((node) => node.selected);
        const selectedEdges = edges.filter((edge) => edge.selected);

        if (selectedNodes.length === 0 && selectedEdges.length === 0) {
            return;
        }

        if (reactFlowInstance) {
            reactFlowInstance.deleteElements({ nodes: selectedNodes, edges: selectedEdges });
        }
    }, [nodes, edges, reactFlowInstance]);

    return (
        <div className="flex h-full flex-row relative">
            <div className="flex-grow h-full relative" ref={reactFlowWrapper}>
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onInit={setReactFlowInstance}
                    onDrop={onDrop}
                    onDragOver={onDragOver}
                    onNodeClick={onNodeClick}
                    onPaneClick={onPaneClick}
                    nodeTypes={nodeTypes}
                    deleteKeyCode={['Backspace', 'Delete']}
                    fitView
                >
                    <MiniMap className="!bg-white !border !border-gray-200 !shadow-sm !rounded-md" />
                    <Controls className="!bg-white !border !border-gray-200 !shadow-sm !rounded-md" />
                    <Background color="#f1f5f9" gap={16} />
                    <Panel position="top-right" className="m-4 flex gap-2">
                        {/* ... existing buttons ... */}
                        <button
                            onClick={handleDeleteSelected}
                            className="p-2 bg-white hover:bg-red-50 text-red-600 border border-gray-200 rounded-lg shadow-sm transition-all flex items-center justify-center hover:border-red-200"
                            title="Delete Selected (Backspace)"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                        </button>
                        <button
                            onClick={handleSaveInternal}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium shadow-md transition-all flex items-center shadow-indigo-200"
                        >
                            Save Workflow
                        </button>
                    </Panel>
                </ReactFlow>
            </div>

            {selectedNode && (
                <NodePropertiesPanel
                    selectedNode={selectedNode}
                    onChange={onNodeDataChange}
                    onClose={() => setSelectedNode(null)}
                />
            )}

            <Sidebar />
        </div>
    );
};

const FlowEditor: React.FC<FlowEditorProps> = (props) => {
    return (
        <ReactFlowProvider>
            <FlowEditorContent {...props} />
        </ReactFlowProvider>
    );
};


export default FlowEditor;
