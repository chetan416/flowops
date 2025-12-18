import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AiAnalysisCard from '../AiAnalysisCard';
import api from '@/services/api';

// Mock the API module
jest.mock('@/services/api', () => ({
    post: jest.fn(),
}));

describe('AiAnalysisCard', () => {
    const incidentId = 123;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders initial state correctly', () => {
        render(<AiAnalysisCard incidentId={incidentId} />);
        expect(screen.getByText('AI Insights')).toBeInTheDocument();
        expect(screen.getByText('Analyze Root Cause')).toBeInTheDocument();
    });

    it('calls API and displays analysis on success', async () => {
        const mockAnalysis = "The issue was caused by a database timeout.";
        (api.post as jest.Mock).mockResolvedValueOnce({ data: { analysis: mockAnalysis } });

        render(<AiAnalysisCard incidentId={incidentId} />);

        fireEvent.click(screen.getByText('Analyze Root Cause'));

        expect(screen.getByText('Analyzing...')).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.getByText(mockAnalysis)).toBeInTheDocument();
        });

        expect(api.post).toHaveBeenCalledWith(`/ai/analyze/${incidentId}`);
    });

    it('displays error message on API failure', async () => {
        const errorMessage = "Network Error";
        (api.post as jest.Mock).mockRejectedValueOnce({ message: errorMessage });

        render(<AiAnalysisCard incidentId={incidentId} />);

        fireEvent.click(screen.getByText('Analyze Root Cause'));

        await waitFor(() => {
            expect(screen.getByText(errorMessage)).toBeInTheDocument();
        });
    });
});
