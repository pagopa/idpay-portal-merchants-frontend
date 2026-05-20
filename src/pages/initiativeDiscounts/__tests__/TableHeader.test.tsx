import { render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useAppSelector } from '../../../redux/hooks';
import Table from '@mui/material/Table';
import TableHeader from '../TableHeader';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => `translated_${key}`,
  }),
}));

jest.mock('../../../hooks/useCurrentInitiativeId', () => ({
  useCurrentInitiativeId: () => 'initiative-1',
}));

jest.mock('../../../redux/slices/initiativesSlice', () => ({
  setInitiativesList: jest.fn(),
  intiativesListSelector: jest.fn(),
  initiativesReducer: jest.fn(), 
}));

jest.mock('../../../redux/hooks', () => ({
  useAppSelector: jest.fn(),
}));

jest.mock('../../../hooks/useCurrentInitiativeId', () => ({
  useCurrentInitiativeId: () => 'initiative-1',
}));

jest.mock('../../../redux/slices/initiativesSlice', () => ({
  setInitiativesList: jest.fn(),
  intiativesListSelector: jest.fn(),
  initiativesReducer: jest.fn(), 
}));

jest.mock('../../../redux/hooks', () => ({
  useAppSelector: jest.fn(),
}));

describe('TableHeader', () => {
    (useAppSelector as jest.Mock).mockReturnValue([{initiativeId: 'initiative-1'}])

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
