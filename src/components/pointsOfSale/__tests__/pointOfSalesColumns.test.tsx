import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { buildPointOfSalesColumns } from '../pointOfSalesColumns';
import { MISSING_DATA_PLACEHOLDER } from '../../../utils/constants';

describe('buildPointOfSalesColumns', () => {
  const t = (key: string) => key;
  const onActionClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const getColumns = (addressMode: 'catalog' | 'initiative' = 'catalog') =>
    buildPointOfSalesColumns({
      t,
      onActionClick,
      addressMode,
    });

  test('renders fallback placeholder when franchise name is missing', () => {
    const columns = getColumns();
    const franchiseColumn = columns.find((column) => column.field === 'franchiseName');

    render(<>{franchiseColumn?.renderCell?.({ value: '' } as any)}</>);

    expect(screen.getByText(MISSING_DATA_PLACEHOLDER)).toBeInTheDocument();
  });

  test('renders translated values for physical and online types and placeholder for unknown type', () => {
    const columns = getColumns();
    const typeColumn = columns.find((column) => column.field === 'type');

    const { rerender } = render(<>{typeColumn?.renderCell?.({ value: 'PHYSICAL' } as any)}</>);
    expect(screen.getByText('Fisico')).toBeInTheDocument();

    rerender(<>{typeColumn?.renderCell?.({ value: 'ONLINE' } as any)}</>);
    expect(screen.getByText('Online')).toBeInTheDocument();

    rerender(<>{typeColumn?.renderCell?.({ value: 'OTHER' } as any)}</>);
    expect(screen.getByText(MISSING_DATA_PLACEHOLDER)).toBeInTheDocument();
  });

  test('renders initiative address with street number and catalog address without composition', () => {
    const initiativeColumns = getColumns('initiative');
    const initiativeAddressColumn = initiativeColumns.find((column) => column.field === 'address');

    const { rerender } = render(
      <>
        {initiativeAddressColumn?.renderCell?.({
          value: 'Via Roma',
          row: { streetNumber: '10' },
        } as any)}
      </>
    );

    expect(screen.getByText('Via Roma, 10')).toBeInTheDocument();

    const catalogColumns = getColumns('catalog');
    const catalogAddressColumn = catalogColumns.find((column) => column.field === 'address');

    rerender(
      <>
        {catalogAddressColumn?.renderCell?.({
          value: 'Via Milano',
          row: { streetNumber: '99' },
        } as any)}
      </>
    );

    expect(screen.getByText('Via Milano')).toBeInTheDocument();
  });

  test('renders website and city values', () => {
    const columns = getColumns();
    const websiteColumn = columns.find((column) => column.field === 'website');
    const cityColumn = columns.find((column) => column.field === 'city');

    const { rerender } = render(<>{websiteColumn?.renderCell?.({ value: 'https://example.com' } as any)}</>);
    expect(screen.getByText('https://example.com')).toBeInTheDocument();

    rerender(<>{cityColumn?.renderCell?.({ value: 'Rome' } as any)}</>);
    expect(screen.getByText('Rome')).toBeInTheDocument();
  });

  test('renders contact name and surname placeholders when values are missing', () => {
    const columns = getColumns();
    const contactNameColumn = columns.find((column) => column.field === 'contactName');

    const { rerender } = render(
      <>
        {contactNameColumn?.renderCell?.({
          row: {
            contactName: 'Mario',
            contactSurname: 'Rossi',
          },
        } as any)}
      </>
    );

    expect(screen.getByText('Mario Rossi')).toBeInTheDocument();

    rerender(
      <>
        {contactNameColumn?.renderCell?.({
          row: {
            contactName: '',
            contactSurname: '',
          },
        } as any)}
      </>
    );

    expect(screen.getByText(`${MISSING_DATA_PLACEHOLDER} ${MISSING_DATA_PLACEHOLDER}`)).toBeInTheDocument();
  });

  test('renders contact email placeholder when missing', () => {
    const columns = getColumns();
    const contactEmailColumn = columns.find((column) => column.field === 'contactEmail');

    render(<>{contactEmailColumn?.renderCell?.({ value: '' } as any)}</>);

    expect(screen.getByText(MISSING_DATA_PLACEHOLDER)).toBeInTheDocument();
  });

  test('calls onActionClick with row data from action button', async () => {
    const columns = getColumns();
    const actionsColumn = columns.find((column) => column.field === 'actions');
    const row = { id: 'store-1', businessName: 'Store 1' };

    render(<>{actionsColumn?.renderCell?.({ row } as any)}</>);

    const user = userEvent.setup();
    await user.click(screen.getByRole('button'));

    expect(screen.getByTestId('store-1')).toBeInTheDocument();
    expect(onActionClick).toHaveBeenCalledWith(row);
  });
});
