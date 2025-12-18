import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { PlayCircle, Zap, GitBranch, Settings } from 'lucide-react';

const NodeWrapper = ({ children, color, label, icon: Icon, selected }: any) => {
    return (
        <div
            className={`shadow-lg rounded-xl border-2 bg-white min-w-[180px] transition-all duration-200 ${selected ? 'border-indigo-600 ring-2 ring-indigo-100' : 'border-gray-200 hover:border-indigo-300'
                }`}
        >
            <div className={`p-2 rounded-t-lg flex items-center space-x-2 ${color}`}>
                <Icon className="w-4 h-4 text-white" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">{label}</span>
            </div>
            <div className="p-3">
                {children}
            </div>
        </div>
    );
};

export const TriggerNode = memo(({ data, selected }: any) => {
    return (
        <NodeWrapper label="Trigger" icon={PlayCircle} color="bg-indigo-500" selected={selected}>
            <div className="text-sm font-medium text-gray-900">{data.label}</div>
            <div className="text-xs text-gray-500 mt-1">{data.description || 'Starts the workflow'}</div>
            <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-indigo-500 border-2 border-white" />
        </NodeWrapper>
    );
});

export const ActionNode = memo(({ data, selected }: any) => {
    return (
        <NodeWrapper label="Action" icon={Zap} color="bg-emerald-500" selected={selected}>
            <Handle type="target" position={Position.Top} className="w-3 h-3 bg-emerald-500 border-2 border-white" />
            <div className="text-sm font-medium text-gray-900">{data.label}</div>
            <div className="text-xs text-gray-500 mt-1">{data.description || 'Performs a task'}</div>
            <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-emerald-500 border-2 border-white" />
        </NodeWrapper>
    );
});

export const ConditionNode = memo(({ data, selected }: any) => {
    return (
        <NodeWrapper label="Condition" icon={GitBranch} color="bg-amber-500" selected={selected}>
            <Handle type="target" position={Position.Top} className="w-3 h-3 bg-amber-500 border-2 border-white" />
            <div className="text-sm font-medium text-gray-900">{data.label}</div>
            <div className="flex justify-between mt-2 px-1">
                <div className="text-[10px] text-gray-500 font-semibold">TRUE</div>
                <div className="text-[10px] text-gray-500 font-semibold">FALSE</div>
            </div>
            <Handle type="source" position={Position.Bottom} id="true" style={{ left: '25%' }} className="w-3 h-3 bg-emerald-500 border-2 border-white" />
            <Handle type="source" position={Position.Bottom} id="false" style={{ left: '75%' }} className="w-3 h-3 bg-rose-500 border-2 border-white" />
        </NodeWrapper>
    );
});
