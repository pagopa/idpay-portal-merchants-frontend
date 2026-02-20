import { render, screen, waitFor } from '@testing-library/react';
import { AlertProvider } from '../AlertContext';
import { useAlert } from '../../hooks/useAlert';
import { useEffect } from 'react';
import AlertComponent from '../../components/Alert/AlertComponent';
import { vi } from 'vitest';

const EmptyConsumer = () => {
  const { alert, setAlert } = useAlert();

  useEffect(() => {
    setAlert();
  }, []);

  return (
    <div>
      {alert?.isOpen && <AlertComponent data-testid="alert-test" {...alert} />}
    </div>
  );
};

const Consumer = () => {
  const { alert, setAlert } = useAlert();

  useEffect(() => {
    setAlert({ title: 'title', text: 'text', isOpen: true });
  }, []);

  return (
    <div>
      {alert?.isOpen && <AlertComponent data-testid="alert-test" {...alert} />}
    </div>
  );
};

describe('AlertContext', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('renders AlertContext with empty values', () => {
    render(
      <AlertProvider>
        <EmptyConsumer />
      </AlertProvider>
    );

    expect(screen.queryByTestId('alert-test')).not.toBeInTheDocument();
  });

  it('renders AlertContext with populated state and auto closes', async () => {
    render(
      <AlertProvider>
        <Consumer />
      </AlertProvider>
    );

    expect(await screen.findByText('title')).toBeInTheDocument();
    expect(screen.getByText('text')).toBeInTheDocument();

    // advance auto-close timer (3 seconds)
    vi.advanceTimersByTime(3000);

    await waitFor(() => {
      expect(screen.queryByTestId('alert-test')).not.toBeInTheDocument();
    });
  });
});
