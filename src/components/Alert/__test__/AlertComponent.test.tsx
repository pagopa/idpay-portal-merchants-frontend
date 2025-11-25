import { render, screen } from '@testing-library/react';
import AlertComponent from '../AlertComponent';

const errorSetup = (title: string, message: string) => {
  render(<AlertComponent title={title} message={message} />);
};

describe('ErrorAlert', () => {
  it('should render the component with the correct message', () => {
    const testTitle = 'This is a test error title.';
    const testMessage = 'This is a test error message.';
    errorSetup(testTitle, testMessage);

    const alertMessage = screen.getByText(testMessage);
    const alertTitle = screen.getByText(testTitle);
    const alertElement = screen.getByRole('alert');

    expect(alertElement).toHaveClass('MuiAlert-standardError');

    const iconElement = screen.getByTestId('ErrorOutlineIcon');
    expect(iconElement).toBeInTheDocument();

    expect(alertMessage).toBeInTheDocument();
    expect(alertTitle).toBeInTheDocument();
  });
});