import { render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { setupInitiativeMocks } from '../../../test-utils/mockInitiativeContext';
import Table from '@mui/material/Table';
import TableHeader from '../TableHeader';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => `translated_${key}`,
  }),
}));


describe('TableHeader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupInitiativeMocks();
  });

  const renderHeader = (data: { width: string; label: string }[]) =>
    render(
      <Table>
        <TableHeader data={data} />
      </Table>
    );

  it('renderizza tutte le celle di intestazione passate nei props', () => {
    const data = [
      { width: '20%', label: 'header.first' },
      { width: '30%', label: 'header.second' },
      { width: '50%', label: 'header.third' },
    ];

    renderHeader(data);

    data.forEach(({ label }) => {
      expect(
        screen.getByText(`translated_${label}`)
      ).toBeInTheDocument();
    });
  });

  it('translates only non-empty labels', () => {
    const data = [
      { width: '20%', label: 'header.first' },
      { width: '30%', label: '' },
    ];

    renderHeader(data);

    expect(
      screen.getByText('translated_header.first')
    ).toBeInTheDocument();

    const cells = within(screen.getByRole('row')).getAllByRole(
      'columnheader'
    );

    expect(cells[1]).toBeEmptyDOMElement();
  });

  it('applies correct width to each cell', () => {
    const data = [
      { width: '10%', label: 'header.first' },
      { width: '40%', label: 'header.second' },
    ];

    renderHeader(data);

    const cells = within(screen.getByRole('row')).getAllByRole(
      'columnheader'
    );

    data.forEach(({ width }, index) => {
      expect(cells[index]).toHaveAttribute('width', width);
    });
  });
});
