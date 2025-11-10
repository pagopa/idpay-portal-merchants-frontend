
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { getReportedUsersColumns } from '../columnsReportedUser';
import { MISSING_DATA_PLACEHOLDER } from '../../../utils/constants';
import * as formatUtils from '../../../utils/formatUtils';

jest.mock('../../../utils/formatUtils');

// Wrapper component to properly render the cell content with hooks
const CellWrapper = ({ renderCell, params }: any) => {
  return <>{renderCell(params)}</>;
};

describe('getReportedUsersColumns', () => {
  const mockHandleDelete = jest.fn();
  const testRow = {
    cf: 'ABCDEF12G34H567I',
    reportedDate: '2024-01-01T00:00:00Z',
    transactionId: 'TX123',
    transactionDate: '2024-01-15T10:30:00Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (formatUtils.safeFormatDate as jest.Mock).mockImplementation((date) => {
      if (!date) return MISSING_DATA_PLACEHOLDER;
      return '01/01/2024';
    });
  });

  describe('Column Structure', () => {
    it('should return array with 5 columns', () => {
      const columns = getReportedUsersColumns(mockHandleDelete);
      expect(columns).toHaveLength(5);
    });

    it('should have correct field names in order', () => {
      const columns = getReportedUsersColumns(mockHandleDelete);
      expect(columns[0].field).toBe('cf');
      expect(columns[1].field).toBe('reportedDate');
      expect(columns[2].field).toBe('transactionId');
      expect(columns[3].field).toBe('transactionDate');
      expect(columns[4].field).toBe('actions');
    });

    it('should have correct header names', () => {
      const columns = getReportedUsersColumns(mockHandleDelete);
      expect(columns[0].headerName).toMatch(/codice fiscale/i);
      expect(columns[1].headerName).toMatch(/segnalato il/i);
      expect(columns[2].headerName).toMatch(/id transazione/i);
      expect(columns[3].headerName).toMatch(/data transazione/i);
      expect(columns[4].headerName).toBe('');
    });
  });

  describe('CF Column', () => {
    it('should have correct column properties', () => {
      const columns = getReportedUsersColumns(mockHandleDelete);
      const cfColumn = columns[0];

      expect(cfColumn.flex).toBe(2);
      expect(cfColumn.editable).toBe(false);
      expect(cfColumn.disableColumnMenu).toBe(true);
    });

    it('should render masked CF by default', () => {
      const columns = getReportedUsersColumns(mockHandleDelete);
      const cfColumn = columns[0];
      const params = { value: 'ABCD1234567890' };

      const { container } = render(
        <CellWrapper renderCell={cfColumn.renderCell} params={params} />
      );
      const typography = container.querySelector('p');

      expect(typography?.textContent).toBe('**************');
    });

    it('should display CF when visibility button is pressed', async () => {
      const columns = getReportedUsersColumns(mockHandleDelete);
      const cfColumn = columns[0];
      const params = { value: 'ABCD1234567890' };

      render(<CellWrapper renderCell={cfColumn.renderCell} params={params} />);

      const button = screen.getByRole('button', {
        name: /mostra codice fiscale/i,
      });

      fireEvent.mouseDown(button);

      await waitFor(() => {
        expect(screen.getByText('ABCD1234567890')).toBeInTheDocument();
      });
    });

    it('should hide CF when visibility button is released', async () => {
      const columns = getReportedUsersColumns(mockHandleDelete);
      const cfColumn = columns[0];
      const params = { value: 'ABCD1234567890' };

      const { rerender } = render(
        <CellWrapper renderCell={cfColumn.renderCell} params={params} />
      );

      let button = screen.getByRole('button');
      fireEvent.mouseDown(button);
      fireEvent.mouseUp(button);

      rerender(<CellWrapper renderCell={cfColumn.renderCell} params={params} />);

      await waitFor(() => {
        button = screen.getByRole('button');
        expect(button).toHaveAttribute('aria-label', 'Mostra codice fiscale');
      });
    });

    it('should hide CF on mouse leave', async () => {
      const columns = getReportedUsersColumns(mockHandleDelete);
      const cfColumn = columns[0];
      const params = { value: 'ABCD1234567890' };

      const { rerender } = render(
        <CellWrapper renderCell={cfColumn.renderCell} params={params} />
      );

      const button = screen.getByRole('button');
      fireEvent.mouseDown(button);
      fireEvent.mouseLeave(button);

      rerender(<CellWrapper renderCell={cfColumn.renderCell} params={params} />);

      await waitFor(() => {
        expect(screen.getByRole('button')).toHaveAttribute(
          'aria-label',
          'Mostra codice fiscale'
        );
      });
    });

    it('should not render visibility button when CF is missing', () => {
      const columns = getReportedUsersColumns(mockHandleDelete);
      const cfColumn = columns[0];
      const params = { value: MISSING_DATA_PLACEHOLDER };

      const { container } = render(
        <CellWrapper renderCell={cfColumn.renderCell} params={params} />
      );
      const button = screen.queryByRole('button');

      expect(button).not.toBeInTheDocument();
      expect(container.querySelector('p')?.textContent).toBe(
        MISSING_DATA_PLACEHOLDER
      );
    });

    it('should display placeholder when CF is null', () => {
      const columns = getReportedUsersColumns(mockHandleDelete);
      const cfColumn = columns[0];
      const params = { value: null };

      const { container } = render(
        <CellWrapper renderCell={cfColumn.renderCell} params={params} />
      );
      const typography = container.querySelector('p');

      expect(typography?.textContent).toBe(MISSING_DATA_PLACEHOLDER);
    });

    it('should display placeholder when CF is undefined', () => {
      const columns = getReportedUsersColumns(mockHandleDelete);
      const cfColumn = columns[0];
      const params = { value: undefined };

      const { container } = render(
        <CellWrapper renderCell={cfColumn.renderCell} params={params} />
      );
      const typography = container.querySelector('p');

      expect(typography?.textContent).toBe(MISSING_DATA_PLACEHOLDER);
    });

    it('should mask CF correctly with asterisks', () => {
      const columns = getReportedUsersColumns(mockHandleDelete);
      const cfColumn = columns[0];
      const params = { value: 'ABC' };

      const { container } = render(
        <CellWrapper renderCell={cfColumn.renderCell} params={params} />
      );
      const typography = container.querySelector('p');

      expect(typography?.textContent).toBe('***');
    });

    it('should toggle visibility button aria-label correctly', async () => {
      const columns = getReportedUsersColumns(mockHandleDelete);
      const cfColumn = columns[0];
      const params = { value: 'ABCD1234567890' };

      render(<CellWrapper renderCell={cfColumn.renderCell} params={params} />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Mostra codice fiscale');

      fireEvent.mouseDown(button);

      await waitFor(() => {
        expect(button).toHaveAttribute(
          'aria-label',
          'Nascondi codice fiscale'
        );
      });
    });
  });

  describe('Reported Date Column', () => {
    it('should have correct column properties', () => {
      const columns = getReportedUsersColumns(mockHandleDelete);
      const dateColumn = columns[1];

      expect(dateColumn.flex).toBe(1.5);
      expect(dateColumn.editable).toBe(false);
      expect(dateColumn.disableColumnMenu).toBe(true);
    });

    it('should format and display reported date', () => {
      const columns = getReportedUsersColumns(mockHandleDelete);
      const dateColumn = columns[1];
      const params = { value: testRow.reportedDate };

      const { container } = render(
        <CellWrapper renderCell={dateColumn.renderCell} params={params} />
      );
      const typography = container.querySelector('p');

      expect(formatUtils.safeFormatDate).toHaveBeenCalledWith(
        testRow.reportedDate
      );
      expect(typography?.textContent).toBe('01/01/2024');
    });

    it('should handle null reported date', () => {
      const columns = getReportedUsersColumns(mockHandleDelete);
      const dateColumn = columns[1];
      const params = { value: null };

      render(<CellWrapper renderCell={dateColumn.renderCell} params={params} />);
      expect(formatUtils.safeFormatDate).toHaveBeenCalledWith(null);
    });

    it('should call safeFormatDate utility', () => {
      const columns = getReportedUsersColumns(mockHandleDelete);
      const dateColumn = columns[1];
      const testDate = '2024-06-15T10:00:00Z';
      const params = { value: testDate };

      render(<CellWrapper renderCell={dateColumn.renderCell} params={params} />);
      expect(formatUtils.safeFormatDate).toHaveBeenCalledWith(testDate);
    });
  });

  describe('Transaction ID Column', () => {
    it('should have correct column properties', () => {
      const columns = getReportedUsersColumns(mockHandleDelete);
      const idColumn = columns[2];

      expect(idColumn.flex).toBe(5);
      expect(idColumn.editable).toBe(false);
      expect(idColumn.disableColumnMenu).toBe(true);
    });

    it('should display transaction ID', () => {
      const columns = getReportedUsersColumns(mockHandleDelete);
      const idColumn = columns[2];
      const params = { value: 'TXN123456789' };

      const { container } = render(
        <CellWrapper renderCell={idColumn.renderCell} params={params} />
      );
      const typography = container.querySelector('p');

      expect(typography?.textContent).toBe('TXN123456789');
    });

    it('should display placeholder when transaction ID is null', () => {
      const columns = getReportedUsersColumns(mockHandleDelete);
      const idColumn = columns[2];
      const params = { value: null };

      const { container } = render(
        <CellWrapper renderCell={idColumn.renderCell} params={params} />
      );
      const typography = container.querySelector('p');

      expect(typography?.textContent).toBe(MISSING_DATA_PLACEHOLDER);
    });

    it('should display placeholder when transaction ID is undefined', () => {
      const columns = getReportedUsersColumns(mockHandleDelete);
      const idColumn = columns[2];
      const params = { value: undefined };

      const { container } = render(
        <CellWrapper renderCell={idColumn.renderCell} params={params} />
      );
      const typography = container.querySelector('p');

      expect(typography?.textContent).toBe(MISSING_DATA_PLACEHOLDER);
    });

    it('should display long transaction IDs', () => {
      const columns = getReportedUsersColumns(mockHandleDelete);
      const idColumn = columns[2];
      const longId = 'TXN' + 'X'.repeat(100);
      const params = { value: longId };

      const { container } = render(
        <CellWrapper renderCell={idColumn.renderCell} params={params} />
      );
      const typography = container.querySelector('p');

      expect(typography?.textContent).toBe(longId);
    });
  });

  describe('Transaction Date Column', () => {
    it('should have correct column properties', () => {
      const columns = getReportedUsersColumns(mockHandleDelete);
      const dateColumn = columns[3];

      expect(dateColumn.flex).toBe(1.5);
      expect(dateColumn.editable).toBe(false);
      expect(dateColumn.disableColumnMenu).toBe(true);
    });

    it('should format and display transaction date', () => {
      const columns = getReportedUsersColumns(mockHandleDelete);
      const dateColumn = columns[3];
      const params = { value: testRow.transactionDate };

      const { container } = render(
        <CellWrapper renderCell={dateColumn.renderCell} params={params} />
      );
      const typography = container.querySelector('p');

      expect(formatUtils.safeFormatDate).toHaveBeenCalledWith(
        testRow.transactionDate
      );
      expect(typography?.textContent).toBe('01/01/2024');
    });

    it('should handle null transaction date', () => {
      const columns = getReportedUsersColumns(mockHandleDelete);
      const dateColumn = columns[3];
      const params = { value: null };

      render(<CellWrapper renderCell={dateColumn.renderCell} params={params} />);
      expect(formatUtils.safeFormatDate).toHaveBeenCalledWith(null);
    });
  });

  describe('Actions Column', () => {
    it('should have correct column properties', () => {
      const columns = getReportedUsersColumns(mockHandleDelete);
      const actionsColumn = columns[4];

      expect(actionsColumn.flex).toBe(0.5);
      expect(actionsColumn.sortable).toBe(false);
      expect(actionsColumn.filterable).toBe(false);
      expect(actionsColumn.disableColumnMenu).toBe(true);
    });

    it('should render delete icon', () => {
      const columns = getReportedUsersColumns(mockHandleDelete);
      const actionsColumn = columns[4];
      const params = { row: testRow };

      render(
        <CellWrapper renderCell={actionsColumn.renderCell} params={params} />
      );
      expect(screen.getByTestId('DeleteOutlineIcon')).toBeInTheDocument();
    });

    it('should call handleDelete with CF when delete icon is clicked', () => {
      const columns = getReportedUsersColumns(mockHandleDelete);
      const actionsColumn = columns[4];
      const params = { row: testRow };

      render(
        <CellWrapper renderCell={actionsColumn.renderCell} params={params} />
      );
      const deleteIcon = screen.getByTestId('DeleteOutlineIcon');

      fireEvent.click(deleteIcon);
      expect(mockHandleDelete).toHaveBeenCalledWith(testRow.cf);
      expect(mockHandleDelete).toHaveBeenCalledTimes(1);
    });

    it('should have error color on delete icon', () => {
      const columns = getReportedUsersColumns(mockHandleDelete);
      const actionsColumn = columns[4];
      const params = { row: testRow };

      render(
        <CellWrapper renderCell={actionsColumn.renderCell} params={params} />
      );
      const deleteIcon = screen.getByTestId('DeleteOutlineIcon');

      expect(deleteIcon).toHaveClass('MuiSvgIcon-colorError');
    });

    it('should have cursor pointer on delete icon', () => {
      const columns = getReportedUsersColumns(mockHandleDelete);
      const actionsColumn = columns[4];
      const params = { row: testRow };

      render(
        <CellWrapper renderCell={actionsColumn.renderCell} params={params} />
      );
      const deleteIcon = screen.getByTestId('DeleteOutlineIcon');

      expect(deleteIcon).toHaveStyle('cursor: pointer');
    });

    it('should render delete icon with accessibility', () => {
      const columns = getReportedUsersColumns(mockHandleDelete);
      const actionsColumn = columns[4];
      const params = { row: testRow };

      render(
        <CellWrapper renderCell={actionsColumn.renderCell} params={params} />
      );
      const deleteIcon = screen.getByTestId('DeleteOutlineIcon');

      expect(deleteIcon).toBeInTheDocument();
      expect(deleteIcon).toHaveClass('MuiSvgIcon-colorError');
    });

    it('should call handleDelete with different CFs', () => {
      const columns = getReportedUsersColumns(mockHandleDelete);
      const actionsColumn = columns[4];

      const params1 = { row: { cf: 'AAAA1111111111A' } };
      const params2 = { row: { cf: 'BBBB2222222222B' } };

      const { rerender } = render(
        <CellWrapper renderCell={actionsColumn.renderCell} params={params1} />
      );
      fireEvent.click(screen.getByTestId('DeleteOutlineIcon'));

      rerender(
        <CellWrapper renderCell={actionsColumn.renderCell} params={params2} />
      );
      fireEvent.click(screen.getByTestId('DeleteOutlineIcon'));

      expect(mockHandleDelete).toHaveBeenNthCalledWith(1, 'AAAA1111111111A');
      expect(mockHandleDelete).toHaveBeenNthCalledWith(2, 'BBBB2222222222B');
    });

    it('should handle multiple delete clicks', () => {
      const columns = getReportedUsersColumns(mockHandleDelete);
      const actionsColumn = columns[4];
      const params = { row: testRow };

      render(
        <CellWrapper renderCell={actionsColumn.renderCell} params={params} />
      );
      const deleteIcon = screen.getByTestId('DeleteOutlineIcon');

      fireEvent.click(deleteIcon);
      fireEvent.click(deleteIcon);
      fireEvent.click(deleteIcon);

      expect(mockHandleDelete).toHaveBeenCalledTimes(3);
      expect(mockHandleDelete).toHaveBeenCalledWith(testRow.cf);
    });

    it('should render Box with correct structure', () => {
      const columns = getReportedUsersColumns(mockHandleDelete);
      const actionsColumn = columns[4];
      const params = { row: testRow };

      const { container } = render(
        <CellWrapper renderCell={actionsColumn.renderCell} params={params} />
      );
      const box = container.querySelector('[class*="MuiBox"]');

      expect(box).toBeInTheDocument();
    });
  });

  describe('Column Common Properties', () => {
    it('all columns should have disableColumnMenu set to true', () => {
      const columns = getReportedUsersColumns(mockHandleDelete);

      columns.forEach((col: any) => {
        expect(col.disableColumnMenu).toBe(true);
      });
    });

    it('data columns should be non-editable', () => {
      const columns = getReportedUsersColumns(mockHandleDelete);
      const editableColumns = columns.slice(0, 4);

      editableColumns.forEach((col: any) => {
        expect(col.editable).toBe(false);
      });
    });

    it('all columns should have renderCell defined', () => {
      const columns = getReportedUsersColumns(mockHandleDelete);

      columns.forEach((col: any) => {
        expect(typeof col.renderCell).toBe('function');
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty string CF', () => {
      const columns = getReportedUsersColumns(mockHandleDelete);
      const cfColumn = columns[0];
      const params = { value: '' };

      const { container } = render(
        <CellWrapper renderCell={cfColumn.renderCell} params={params} />
      );
      const typography = container.querySelector('p');

      expect(typography?.textContent).toBe(MISSING_DATA_PLACEHOLDER);
    });

    it('should handle special characters in transaction ID', () => {
      const columns = getReportedUsersColumns(mockHandleDelete);
      const idColumn = columns[2];
      const specialId = 'TX-123_456#789';
      const params = { value: specialId };

      const { container } = render(
        <CellWrapper renderCell={idColumn.renderCell} params={params} />
      );
      const typography = container.querySelector('p');

      expect(typography?.textContent).toBe(specialId);
    });

    it('should handle transaction ID with spaces', () => {
      const columns = getReportedUsersColumns(mockHandleDelete);
      const idColumn = columns[2];
      const params = { value: 'TX 123 456' };

      const { container } = render(
        <CellWrapper renderCell={idColumn.renderCell} params={params} />
      );
      const typography = container.querySelector('p');

      expect(typography?.textContent).toBe('TX 123 456');
    });

    it('should render CF with single character', () => {
      const columns = getReportedUsersColumns(mockHandleDelete);
      const cfColumn = columns[0];
      const params = { value: 'A' };

      const { container } = render(
        <CellWrapper renderCell={cfColumn.renderCell} params={params} />
      );
      const typography = container.querySelector('p');

      expect(typography?.textContent).toBe('*');
    });

    it('should handle CF without visibility button if value matches MISSING_DATA_PLACEHOLDER', () => {
      const columns = getReportedUsersColumns(mockHandleDelete);
      const cfColumn = columns[0];
      const params = { value: MISSING_DATA_PLACEHOLDER };

      render(
        <CellWrapper renderCell={cfColumn.renderCell} params={params} />
      );
      const buttons = screen.queryAllByRole('button');

      expect(buttons).toHaveLength(0);
    });
  });
});