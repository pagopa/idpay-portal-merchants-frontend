import { render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import TableHeader from '../TableHeader';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => `translated_${key}`,
  }),
}));

describe('TableHeader', () => {
  it('renderizza tutte le celle di intestazione passate nei props', () => {
    const data = [
      { width: '20%', label: 'header.first' },
      { width: '30%', label: 'header.second' },
      { width: '50%', label: 'header.third' },
    ];

    render(<TableHeader data={data} />);

    data.forEach((d) => {
      const cell = screen.getByText(`translated_${d.label}`);
      expect(cell).toBeInTheDocument();
    });
  });

  it('usa la traduzione solo per le label non vuote', () => {
    const data = [
      { width: '20%', label: 'header.first' },
      { width: '30%', label: '' },
    ];

    render(<TableHeader data={data} />);

    expect(screen.getByText('translated_header.first')).toBeInTheDocument();

    const headerRow = screen.getByRole('row');
    const cells = within(headerRow).getAllByRole('columnheader');

    expect(cells[1]).toBeEmptyDOMElement();
  });

  it('applica la width corretta alle celle', () => {
    const data = [
      { width: '10%', label: 'header.first' },
      { width: '40%', label: 'header.second' },
    ];

    render(<TableHeader data={data} />);

    const headerRow = screen.getByRole('row');
    const cells = within(headerRow).getAllByRole('columnheader');

    expect(cells[0]).toHaveAttribute('width', '10%');
    expect(cells[1]).toHaveAttribute('width', '40%');
  });
});
