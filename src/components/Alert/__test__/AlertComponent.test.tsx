import { render, screen } from '@testing-library/react';
import AlertComponent from '../AlertComponent';

describe('ErrorAlert', () => {
  it('should render the error component with the correct message', async () => {

    const testTitle = 'This is a test error title.';
    const testMessage = 'This is a test error message.';

    render(<AlertComponent title={testTitle} text={testMessage} severity='error' isOpen={true}/>);

    const alertMessage = screen.getByText(testMessage);
    const alertTitle = screen.getByText(testTitle);

    expect(alertMessage).toBeInTheDocument();
    expect(alertTitle).toBeInTheDocument();
  });

  it('should render the component with the correct message', async () => {

    const testTitle = 'This is a test title.';
    const testMessage = 'This is a test message.';

    render(<AlertComponent title={testTitle} text={testMessage} severity='success' isOpen={true} />);

    const alertMessage = screen.getByText(testMessage);
    const alertTitle = screen.getByText(testTitle);

    expect(alertMessage).toBeInTheDocument();
    expect(alertTitle).toBeInTheDocument();
  });
});