import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AiAnalysisCard from '../components/AiAnalysisCard';
import api from '../services/api';

// Mock the API
jest.mock('../services/api', () => ({
    post: jest.fn(),
    get: jest.fn(),
}));

describe('AiAnalysisCard', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders initial state correctly', () => {
        render(<AiAnalysisCard incidentId={1} />);
        expect(screen.getByText(/AI Insights/i)).toBeInTheDocument();
        expect(screen.getByText(/Analyze Root Cause/i)).toBeInTheDocument();
    });

    it('fetches analysis and remediation on click', async () => {
        const mockAnalysis = { data: { analysis: 'Root cause identified.' } };
        const mockRemediation = {
            data: {
                suggestion: {
                    workflow_id: 123,
                    workflow_name: 'Fix DB',
                    confidence: 0.95,
                    reasoning: 'Matches database error.'
                }
            }
        };

        (api.post as jest.Mock).mockResolvedValueOnce(mockAnalysis);
        (api.get as jest.Mock).mockResolvedValueOnce(mockRemediation);

        render(<AiAnalysisCard incidentId={1} />);

        const button = screen.getByText(/Analyze Root Cause/i);
        fireEvent.click(button);

        // Initial loading state
        expect(screen.getByText(/Analyzing/i)).toBeInTheDocument();

        // Check for analysis result
        await waitFor(() => {
            expect(screen.getByText('Root cause identified.')).toBeInTheDocument();
        });

        // Check for remediation suggestion
        await waitFor(() => {
            expect(screen.getByText('AI Remediation Suggested')).toBeInTheDocument();
            expect(screen.getByText('Fix DB')).toBeInTheDocument();
        });
    });

    it('handles API errors gracefully', async () => {
        (api.post as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

        render(<AiAnalysisCard incidentId={1} />);

        fireEvent.click(screen.getByText(/Analyze Root Cause/i));

        await waitFor(() => {
            expect(screen.getByText('Error')).toBeInTheDocument();
            expect(screen.getByText(/Network error/i)).toBeInTheDocument();
        });
    });
});
