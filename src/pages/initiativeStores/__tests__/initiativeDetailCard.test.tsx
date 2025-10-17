import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import InitiativeDetailCard from '../InitiativeDetailCard';

describe('InitiativeDetailCard', () => {
  test('should render the title and children correctly', () => {
    const title = 'Informazioni sull’iniziativa';
    const childText = 'This is the child content.';

    render(
      <InitiativeDetailCard titleBox={title}>
        <p>{childText}</p>
      </InitiativeDetailCard>
    );

    expect(screen.getByText(title)).toBeInTheDocument();

    expect(screen.getByText(childText)).toBeInTheDocument();
  });

  test('should render only the title when no children are provided', () => {
    const title = 'Card senza contenuto';

    render(<InitiativeDetailCard titleBox={title} />);

    expect(screen.getByText(title)).toBeInTheDocument();
  });
});
