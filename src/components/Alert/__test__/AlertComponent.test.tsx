import { render, screen } from '@testing-library/react';
import { useEffect } from 'react';
import AlertComponent from '../AlertComponent';
import { useAlert } from '../../../hooks/useAlert';
import { AlertProvider } from '../../../contexts/AlertContext';

const ErrorAlert = () => {
  const {setAlert} = useAlert();

  useEffect(() => {
    setAlert({title: 'This is a test error title.', text: 'This is a test error message.', isOpen: true});
  }, []);

  return <AlertComponent />;
};

describe('ErrorAlert', () => {
  it('should render the error component with the correct message', async () => {
    render(
      <AlertProvider>
          <ErrorAlert />
      </AlertProvider>
    );

    const testTitle = 'This is a test error title.';
    const testMessage = 'This is a test error message.';

    const alertMessage = screen.getByText(testMessage);
    const alertTitle = screen.getByText(testTitle);

    expect(alertMessage).toBeInTheDocument();
    expect(alertTitle).toBeInTheDocument();
  });
});