import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material';
import DetailDrawer from '../DetailDrawer';

const mockToggleDrawer = jest.fn();

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider theme={createTheme()}>{children}</ThemeProvider>
);

describe('DetailDrawer', () => {
  const defaultProps = {
    open: true,
    toggleDrawer: mockToggleDrawer,
    children: <div data-testid="drawer-content">Contenuto di Test</div>,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the drawer when open prop is true', () => {
    render(
      <Wrapper>
        <DetailDrawer {...defaultProps} />
      </Wrapper>
    );

    const drawer = screen.getByTestId('detail-drawer');
    expect(drawer).toBeInTheDocument();
    expect(screen.getByText('Contenuto di Test')).toBeInTheDocument();
  });

  it('should not render the content when open prop is false', () => {
    render(
      <Wrapper>
        <DetailDrawer {...defaultProps} open={false} />
      </Wrapper>
    );

    expect(screen.queryByText('Contenuto di Test')).not.toBeInTheDocument();
  });

  it('should call toggleDrawer(false) when the CloseIcon button is clicked', () => {
    render(
      <Wrapper>
        <DetailDrawer {...defaultProps} />
      </Wrapper>
    );

    const closeButton = screen.getByTestId('open-detail-button');
    fireEvent.click(closeButton);

    expect(mockToggleDrawer).toHaveBeenCalledTimes(1);
    expect(mockToggleDrawer).toHaveBeenCalledWith(false);
  });

  it('should call toggleDrawer(false) when the drawer is closed via background click (onClose event)', () => {
    render(
      <Wrapper>
        <DetailDrawer {...defaultProps} />
      </Wrapper>
    );

    const drawer = screen.getByTestId('detail-drawer');

    fireEvent.keyDown(drawer, { key: 'Escape' });

    expect(mockToggleDrawer).toHaveBeenCalledTimes(1);
    expect(mockToggleDrawer).toHaveBeenCalledWith(false);
  });
});
