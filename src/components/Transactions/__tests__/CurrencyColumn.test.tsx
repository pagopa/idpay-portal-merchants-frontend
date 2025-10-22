import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material';
import CurrencyColumn from '../CurrencyColumn';

jest.mock('../../../utils/formatUtils', () => ({
  currencyFormatter: jest.fn(),
}));

const formatUtils = require('../../../utils/formatUtils');
const mockCurrencyFormatter = formatUtils.currencyFormatter as jest.Mock;

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider theme={createTheme()}>{children}</ThemeProvider>
);

describe('CurrencyColumn', () => {
  const testValue = 1234.56;

  beforeEach(() => {
    mockCurrencyFormatter.mockImplementation((value: number) => `€ ${value.toFixed(2)}`);
    mockCurrencyFormatter.mockClear();
  });

  it('should format the value and render it inside Typography with default variant (body1)', () => {
    render(
      <Wrapper>
        <CurrencyColumn value={testValue} />
      </Wrapper>
    );

    expect(mockCurrencyFormatter).toHaveBeenCalledWith(testValue);

    const expectedText = `€ ${testValue.toFixed(2)}`;
    const typographyElement = screen.getByText(expectedText);
    expect(typographyElement).toBeInTheDocument();

    expect(typographyElement).toHaveClass('MuiTypography-body1');
  });

  it('should render with the specified variant "body2"', () => {
    render(
      <Wrapper>
        <CurrencyColumn value={testValue} type="body2" />
      </Wrapper>
    );

    const expectedText = `€ ${testValue.toFixed(2)}`;
    const typographyElement = screen.getByText(expectedText);
    expect(typographyElement).toHaveClass('MuiTypography-body2');
    expect(typographyElement).not.toHaveClass('MuiTypography-body1');
  });

  it('should handle string input and convert it to number for formatting', () => {
    const stringValue = '98.76';
    render(
      <Wrapper>
        <CurrencyColumn value={stringValue} />
      </Wrapper>
    );

    expect(mockCurrencyFormatter).toHaveBeenCalledWith(Number(stringValue));

    const expectedText = `€ ${Number(stringValue).toFixed(2)}`;
    expect(screen.getByText(expectedText)).toBeInTheDocument();
  });
});
