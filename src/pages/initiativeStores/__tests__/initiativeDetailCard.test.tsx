import { fireEvent, render, screen } from '@testing-library/react';
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

  test('renders edit button only when onEdit is provided and triggers callback', () => {
    const onEdit = jest.fn();
    render(<InitiativeDetailCard titleBox="Card" onEdit={onEdit} />);

    const editButton = screen.getByTestId('edit-point-of-sale-button');
    expect(editButton).toBeInTheDocument();

    fireEvent.click(editButton);
    expect(onEdit).toHaveBeenCalledTimes(1);
  });

  test('disables edit button when editDisabled is true', () => {
    const onEdit = jest.fn();
    render(<InitiativeDetailCard titleBox="Card" onEdit={onEdit} editDisabled={true} />);

    const editButton = screen.getByTestId('edit-point-of-sale-button');
    expect(editButton).toBeDisabled();

    fireEvent.click(editButton);
    expect(onEdit).not.toHaveBeenCalled();
  });
});
