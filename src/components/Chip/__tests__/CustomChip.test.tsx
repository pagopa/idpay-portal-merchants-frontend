import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material';
import CustomChip from '../CustomChip';

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider theme={createTheme()}>{children}</ThemeProvider>
);

describe('CustomChip', () => {
  const defaultProps = {
    label: 'Test Label',
    sizeChip: 'medium' as const,
    variantChip: 'filled' as const,
  };

  it('should render the chip with default label, size, and variant', () => {
    render(
      <Wrapper>
        <CustomChip {...defaultProps} />
      </Wrapper>
    );

    const chipElement = screen.getByText(defaultProps.label).closest('.MuiChip-root');

    expect(screen.getByText(defaultProps.label)).toBeInTheDocument();

    expect(chipElement).toHaveClass('MuiChip-filled');
  });

  it('should render the chip with "small" size and "outlined" variant', () => {
    render(
      <Wrapper>
        <CustomChip label="Small Outlined" sizeChip="small" variantChip="outlined" />
      </Wrapper>
    );

    const chipElement = screen.getByText('Small Outlined').closest('.MuiChip-root');
    expect(chipElement).toHaveClass('MuiChip-sizeSmall');
    expect(chipElement).toHaveClass('MuiChip-outlined');
  });

  it('should apply custom backgroundColor and textColor for "filled" variant', () => {
    const customColorProps = {
      ...defaultProps,
      colorChip: '#FF0000',
      textColorChip: '#FFFFFF',
    };

    render(
      <Wrapper>
        <CustomChip {...customColorProps} />
      </Wrapper>
    );

    const chipElement = screen.getByText(customColorProps.label).closest('.MuiChip-filled');

    expect(chipElement).toHaveStyle('background-color: #ff0000');

    const labelElement = screen.getByText(customColorProps.label);
  });

  it('should NOT apply custom colors when variant is "outlined"', () => {
    const customColorProps = {
      label: 'Outlined Chip',
      variantChip: 'outlined' as const,
      colorChip: '#FF0000',
      textColorChip: '#FFFFFF',
    };

    render(
      <Wrapper>
        <CustomChip {...customColorProps} />
      </Wrapper>
    );

    const chipElement = screen.getByText(customColorProps.label).closest('.MuiChip-root');
    expect(chipElement).not.toHaveClass('MuiChip-filled');
    expect(chipElement).not.toHaveStyle('background-color: #ff0000');
  });
});
