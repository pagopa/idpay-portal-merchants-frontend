import { render, screen, act, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MsgResult } from '../MsgResult';

jest.useFakeTimers();

describe('MsgResult', () => {
  afterEach(() => {
    cleanup();
    jest.clearAllTimers();
    jest.clearAllMocks();
  });

  it('renders with defaults and shows success icon', () => {
    render(<MsgResult message="Saved successfully" />);
    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent('Saved successfully');
    expect(alert.className).toMatch(/MuiAlert-outlined/);
    expect(alert.querySelector('svg')).toBeTruthy();
  });

  it('renders children', () => {
    render(
      <MsgResult message="Base message">
        <span data-testid="child">extra</span>
      </MsgResult>
    );
    expect(screen.getByText('Base message')).toBeInTheDocument();
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('supports custom severity and variant', () => {
    render(<MsgResult message="Warning" severity="error" variant="filled" />);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('Warning');
    expect(alert.className).toMatch(/MuiAlert-filled/);
    expect(alert.querySelector('svg')).not.toBeFalsy();
  });

  it('auto-hides after 5 seconds', () => {
    render(<MsgResult message="Will disappear" />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
    act(() => {
      jest.advanceTimersByTime(5000);
    });
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('cleans the timeout on unmount', () => {
    const { unmount } = render(<MsgResult message="Unmount me" />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
    unmount();
    act(() => {
      jest.advanceTimersByTime(6000);
    });
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('renders with custom bottom value', () => {
    render(<MsgResult message="Positioned" bottom={80} />);
    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
  });
});
