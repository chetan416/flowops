import api from './api';

export interface Workflow {
    id: number;
    name: string;
    description?: string;
    steps: any[];
    owner_id: number;
    is_active: number;
    created_at: string;
    updated_at?: string;
}

export interface WorkflowCreate {
    name: string;
    description?: string;
    steps?: any[];
}

export const getWorkflows = async () => {
    const response = await api.get<Workflow[]>('/workflows/');
    return response.data;
};

export const getWorkflow = async (id: number) => {
    const response = await api.get<Workflow>(`/workflows/${id}`);
    return response.data;
};

export const createWorkflow = async (data: WorkflowCreate) => {
    const response = await api.post<Workflow>('/workflows/', data);
    return response.data;
};

export const updateWorkflow = async (id: number, data: Partial<WorkflowCreate>) => {
    const response = await api.put<Workflow>(`/workflows/${id}`, data);
    return response.data;
};

export const deleteWorkflow = async (id: number) => {
    await api.delete(`/workflows/${id}`);
};

