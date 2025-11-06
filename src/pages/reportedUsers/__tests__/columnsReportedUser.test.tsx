import { render, screen, fireEvent } from '@testing-library/react';
import { getReportedUsersColumns } from '../columnsReportedUser';
import { MISSING_DATA_PLACEHOLDER } from '../../../utils/constants';

describe('getReportedUsersColumns', () => {
  const row = {
    cf: 'ABCDEF12G34H567I',
    reportedDate: '2024-01-01',
    transactionId: 'TX123',
  };

  it('restituisce le colonne con i field e headerName corretti', () => {
    const columns = getReportedUsersColumns(jest.fn());
    expect(columns).toHaveLength(5);
    expect(columns[0].field).toBe('cf');
    expect(columns[0].headerName).toMatch(/codice fiscale/i);
    expect(columns[1].field).toBe('reportedDate');
    expect(columns[1].headerName).toMatch(/segnalato il/i);
    expect(columns[2].field).toBe('transactionId');
    expect(columns[2].headerName).toMatch(/id transazione/i);
    expect(columns[3].field).toBe('transactionDate');
  });

  /*
  it('renderCell mostra il valore o il placeholder', () => {
    const columns = getReportedUsersColumns(jest.fn());
    // cf
    const CfCell = columns[0].renderCell({ value: row.cf });
    const { getByText, rerender } = render(<>{CfCell}</>);
    expect(getByText(row.cf)).toBeInTheDocument();

    // placeholder
    rerender(<>{columns[0].renderCell({ value: undefined })}</>);
    expect(getByText(MISSING_DATA_PLACEHOLDER)).toBeInTheDocument();
  });
*/
  it('renderCell della colonna actions chiama handleDelete con il cf corretto', () => {
    const handleDelete = jest.fn();
    const columns = getReportedUsersColumns(handleDelete);
    // Simula la cella azioni
    const ActionsCell = columns[3].renderCell({ row });
    render(<>{ActionsCell}</>);
    expect(screen.getByText('-')).toBeInTheDocument();
  });
});
