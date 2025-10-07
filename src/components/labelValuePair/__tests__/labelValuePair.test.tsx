import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import LabelValuePair from '../LabelValuePair';
import { MISSING_DATA_PLACEHOLDER } from '../../../utils/constants';

describe('LabelValuePair', () => {
  test('should render a simple label and value when isLink is false', () => {
    const label = 'Nome';
    const value = 'Mario Rossi';

    render(<LabelValuePair label={label} value={value} isLink={false} />);

    expect(screen.getByText(`${label}:`)).toBeInTheDocument();
    expect(screen.getByText(value)).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  test('should render a link when isLink is true', () => {
    const label = 'Sito Web';
    const value = 'https://www.pagopa.it';

    render(<LabelValuePair label={label} value={value} isLink={true} />);

    expect(screen.getByText(`${label}:`)).toBeInTheDocument();

    const linkElement = screen.getByRole('link', { name: value });
    expect(linkElement).toBeInTheDocument();
    expect(linkElement).toHaveAttribute('href', value);
    expect(linkElement).toHaveAttribute('target', 'blank');
  });

  test('should render the placeholder for a missing value when isLink is false', () => {
    const label = 'Indirizzo';
    const value = null;

    render(<LabelValuePair label={label} value={value as any} isLink={false} />);

    expect(screen.getByText(`${label}:`)).toBeInTheDocument();
    expect(screen.getByText(MISSING_DATA_PLACEHOLDER)).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  test('should render a link with the placeholder for a missing value when isLink is true', () => {
    const label = 'Link Profilo';
    const value = undefined;

    render(<LabelValuePair label={label} value={value as any} isLink={true} />);

    expect(screen.getByText(`${label}:`)).toBeInTheDocument();

    const linkElement = screen.getByRole('link', { name: MISSING_DATA_PLACEHOLDER });
    expect(linkElement).toBeInTheDocument();

    expect(linkElement).toHaveAttribute('href', 'undefined');
  });
});
