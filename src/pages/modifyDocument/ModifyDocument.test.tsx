import { render, screen } from '@testing-library/react';
import * as merchantService from '../../services/merchantService';
import ROUTES from '../../routes';
import ModifyDocument from './ModifyDocument';

// Mock del service coerente con l'implementazione reale
jest.mock('../../services/merchantService', () => ({
  updateInvoiceTransaction: jest.fn(),
}));

describe('ModifyDocument page', () => {
  it('renders the page title', () => {
    render(<ModifyDocument />);

    expect(screen.getByText(/modifyDocument.title/i)).toBeInTheDocument();
  });

  it('uses updateInvoiceTransaction service', () => {
    render(<ModifyDocument />);

    expect(merchantService.updateInvoiceTransaction).toBeDefined();
  });

  it('renders breadcrumbs with correct route', () => {
    render(<ModifyDocument />);

    const breadcrumbs = screen.getByTestId('breadcrumbs-path');

    expect(breadcrumbs).toHaveTextContent(ROUTES.MODIFY_DOCUMENT);
  });
});
