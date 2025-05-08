import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom'; 
import JobsPage from '@/app/pages/jobs/page';

describe('Jobs Page', () => {
    test('renders page heading', () => {
        render(<JobsPage />);
        expect(screen.getByText(/jobs/i)).toBeInTheDocument();
    });
});
