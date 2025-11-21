import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RefundRequests from './RefundRequests';

// Mock delle dipendenze
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

jest.mock('@pagopa/selfcare-common-frontend', () => ({
  TitleBox: ({ title, subTitle }: any) => (
    <div>
      <h4>{title}</h4>
      <p>{subTitle}</p>
    </div>
  ),
}));

jest.mock('../../components/dataTable/DataTable', () => ({
  __esModule: true,
  default: ({ 
    columns, 
    rows, 
    onRowSelectionChange, 
    isRowSelectable 
  }: any) => (
    <div data-testid="data-table">
      <table>
        <thead>
          <tr>
            {columns.map((col: any) => (
              <th key={col.field}>{col.headerName}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row: any) => (
            <tr key={row.id}>
              <td>
                {isRowSelectable({ row }) && (
                  <input
                    type="checkbox"
                    data-testid={`checkbox-${row.id}`}
                    onChange={() => onRowSelectionChange([row.id])}
                  />
                )}
              </td>
              {columns.slice(1).map((col: any) => (
                <td key={col.field}>
                  {col.renderCell 
                    ? col.renderCell({ value: row[col.field], row }) 
                    : row[col.field]
                  }
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ),
}));

jest.mock('../../components/Chip/CustomChip', () => ({
  __esModule: true,
  default: ({ label }: any) => <span data-testid="custom-chip">{label}</span>,
}));

jest.mock('../../components/Transactions/useStatus', () => ({
  __esModule: true,
  default: (status: string) => ({
    label: status,
    color: 'primary',
    textColor: 'white',
  }),
}));

jest.mock('../../components/Transactions/CurrencyColumn', () => ({
  __esModule: true,
  default: ({ value }: any) => <span>{value.toFixed(2)} €</span>,
}));

describe('RefundRequests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the component correctly', () => {
    render(<RefundRequests />);
    
    expect(screen.getByText('pages.refundRequests.title')).toBeInTheDocument();
    expect(screen.getByText('pages.refundRequests.subtitle')).toBeInTheDocument();
    expect(screen.getByTestId('data-table')).toBeInTheDocument();
  });

  it('should render mock data in the table', () => {
    render(<RefundRequests />);
    
    expect(screen.getByText('001-20251125 223')).toBeInTheDocument();
    expect(screen.getByText('002-20251125 224')).toBeInTheDocument();
    expect(screen.getByText('003-20251125 225')).toBeInTheDocument();
  });

  it('should not show send button when no rows are selected', () => {
    render(<RefundRequests />);
    
    expect(screen.queryByRole('button', { name: /pages.refundRequests.sendRequests/i })).not.toBeInTheDocument();
  });

  it('should show send button when rows are selected', async () => {
    const user = userEvent.setup();
    render(<RefundRequests />);
    
    const checkbox = screen.getByTestId('checkbox-1');
    await user.click(checkbox);
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /pages.refundRequests.sendRequests \(1\)/i })).toBeInTheDocument();
    });
  });

  it('should only allow selection of rows with CREATED status', () => {
    render(<RefundRequests />);
    
    // Solo la prima riga (status CREATED) dovrebbe avere il checkbox
    expect(screen.getByTestId('checkbox-1')).toBeInTheDocument();
    expect(screen.queryByTestId('checkbox-2')).not.toBeInTheDocument();
    expect(screen.queryByTestId('checkbox-3')).not.toBeInTheDocument();
  });

  it('should render table columns correctly', () => {
    render(<RefundRequests />);
    
    expect(screen.getByText('Lotto')).toBeInTheDocument();
    expect(screen.getByText('Tipologia')).toBeInTheDocument();
    expect(screen.getByText('Importo')).toBeInTheDocument();
    expect(screen.getByText('Stato')).toBeInTheDocument();
  });

  it('should display status chips for each row', () => {
    render(<RefundRequests />);
    
    const chips = screen.getAllByTestId('custom-chip');
    expect(chips).toHaveLength(3);
    expect(chips[0]).toHaveTextContent('CREATED');
    expect(chips[1]).toHaveTextContent('APPROVED');
    expect(chips[2]).toHaveTextContent('EVALUATING');
  });

  it('should display formatted currency amounts', () => {
    render(<RefundRequests />);
    
    expect(screen.getByText('100.00 €')).toBeInTheDocument();
    expect(screen.getByText('200.00 €')).toBeInTheDocument();
    expect(screen.getByText('3000.00 €')).toBeInTheDocument();
  });

  it('should update selected rows count in button text', async () => {
    const user = userEvent.setup();
    render(<RefundRequests />);
    
    const checkbox = screen.getByTestId('checkbox-1');
    await user.click(checkbox);
    
    await waitFor(() => {
      const button = screen.getByRole('button', { name: /pages.refundRequests.sendRequests \(1\)/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('(1)');
    });
  });

  it('should render SendIcon in the button', async () => {
    const user = userEvent.setup();
    render(<RefundRequests />);
    
    const checkbox = screen.getByTestId('checkbox-1');
    await user.click(checkbox);
    
    await waitFor(() => {
      const button = screen.getByRole('button', { name: /pages.refundRequests.sendRequests/i });
      expect(button.querySelector('svg')).toBeInTheDocument();
    });
  });
});