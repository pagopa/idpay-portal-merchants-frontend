import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material';
import TransactionRowDetail from '../TransactionRowDetail';

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider theme={createTheme()}>{children}</ThemeProvider>
);

describe('TransactionRowDetail', () => {
  const defaultProps = {
    label: 'Test Label',
    value: 'Test Value',
  };

  it('should render the label and value correctly with default variants (body1 and body2)', () => {
    render(
      <Wrapper>
        <TransactionRowDetail {...defaultProps} />
      </Wrapper>
    );

    const labelElement = screen.getByText(defaultProps.label);
    const valueElement = screen.getByText(defaultProps.value);

    expect(labelElement).toBeInTheDocument();
    expect(valueElement).toBeInTheDocument();
  });

  it('should apply custom labelVariant (body2) and valueVariant (h6)', () => {
    render(
      <Wrapper>
        <TransactionRowDetail {...defaultProps} labelVariant="body2" valueVariant="h6" />
      </Wrapper>
    );

    const labelElement = screen.getByText(defaultProps.label);
    const valueElement = screen.getByText(defaultProps.value);

    expect(labelElement).toHaveClass('MuiTypography-body2');
    expect(valueElement).toHaveClass('MuiTypography-h6');
  });

  it('should render ReactNode content for value prop', () => {
    const CustomValue = () => <span data-testid="custom-value">Custom Element</span>;

    render(
      <Wrapper>
        <TransactionRowDetail {...defaultProps} value={<CustomValue />} />
      </Wrapper>
    );

    expect(screen.getByTestId('custom-value')).toBeInTheDocument();
    expect(screen.getByTestId('custom-value')).toHaveTextContent('Custom Element');
  });

  it('should apply custom sx prop to the wrapping Box', () => {
    const customSx = { border: '1px solid red', padding: '10px' };

    render(
      <Wrapper>
        <TransactionRowDetail {...defaultProps} sx={customSx} />
      </Wrapper>
    );

    const containerBox = screen.getByText(defaultProps.label).closest('div');

    expect(containerBox).toHaveStyle('border: 1px solid red');
    expect(containerBox).toHaveStyle('padding: 10px');
  });

  it('should apply fontWeightMedium to the value element', () => {
    render(
      <Wrapper>
        <TransactionRowDetail {...defaultProps} />
      </Wrapper>
    );

    const valueElement = screen.getByText(defaultProps.value);

    expect(valueElement).toHaveStyle('font-weight: 500');
  });
});
