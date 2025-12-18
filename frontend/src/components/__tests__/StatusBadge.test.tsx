import React from 'react';
import { render, screen } from '@testing-library/react';
import StatusBadge from '../StatusBadge';

describe('StatusBadge', () => {
    it('renders Healthy for "healthy" status', () => {
        render(<StatusBadge status="healthy" />);
        expect(screen.getByText('Healthy')).toBeInTheDocument();
        expect(screen.getByText('Healthy')).toHaveClass('bg-green-100');
    });

    it('renders Degraded for "degraded" status', () => {
        render(<StatusBadge status="degraded" />);
        expect(screen.getByText('Degraded')).toBeInTheDocument();
        expect(screen.getByText('Degraded')).toHaveClass('bg-yellow-100');
    });

    it('renders Down for "down" status', () => {
        render(<StatusBadge status="down" />);
        expect(screen.getByText('Down')).toBeInTheDocument();
        expect(screen.getByText('Down')).toHaveClass('bg-red-100');
    });

    it('renders custom status for unknown status', () => {
        render(<StatusBadge status="unknown" />);
        expect(screen.getByText('unknown')).toBeInTheDocument();
        expect(screen.getByText('unknown')).toHaveClass('bg-gray-100');
    });
});
