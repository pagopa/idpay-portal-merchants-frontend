import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material';
import DetailDrawer from '../DetailDrawer';
import { getDetailValueText } from '../detailDrawerShared';
import { MISSING_DATA_PLACEHOLDER, TYPE_TEXT } from '../../../utils/constants';

const mockToggleDrawer = jest.fn();

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider theme={createTheme()}>{children}</ThemeProvider>
);

describe('DetailDrawer', () => {
  const defaultProps = {
    isOpen: true,
    setIsOpen: mockToggleDrawer,
    children: <div data-testid="drawer-content">Contenuto di Test</div>,
    title: 'Titolo',
  };

  const buttons = [{ title: 'button', dataTestId: 'button-test-id' }];

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
    expect(screen.getByText('Titolo')).toBeInTheDocument();
  });

  it('should not render the content when open prop is false', () => {
    render(
      <Wrapper>
        <DetailDrawer {...defaultProps} isOpen={false} />
      </Wrapper>
    );

    expect(screen.queryByText('Contenuto di Test')).not.toBeInTheDocument();
    expect(screen.queryByTestId('buttons-box')).not.toBeInTheDocument();
  });

  it('should call toggleDrawer(false) when the CloseIcon button is clicked', () => {
    render(
      <Wrapper>
        <DetailDrawer {...defaultProps} />
      </Wrapper>
    );

    const closeButton = screen.getByTestId('close-button');
    fireEvent.click(closeButton);

    expect(mockToggleDrawer).toHaveBeenCalledTimes(1);
  });

  it('should render buttons', () => {
    render(
      <Wrapper>
        <DetailDrawer {...defaultProps} buttons={buttons} />
      </Wrapper>
    );

    expect(screen.getByTestId('buttons-box')).toBeInTheDocument();
    expect(screen.getByTestId('button-test-id')).toBeInTheDocument();
  });

  it('should not render buttons when is an empty array', () => {
    render(
      <Wrapper>
        <DetailDrawer {...defaultProps} buttons={[]} />
      </Wrapper>
    );

    expect(screen.queryByTestId('buttons-box')).not.toBeInTheDocument();
  });
});

describe('getDetailValueText', () => {
  test('should resolve additionalProperties keys such as productGtin', () => {
    const itemValues = { additionalProperties: { productGtin: '12345678901234' } };

    expect(getDetailValueText(itemValues, 'additionalProperties.productGtin', TYPE_TEXT.Text)).toBe(
      '12345678901234'
    );
  });

  test('should show the placeholder when an additionalProperties key is missing', () => {
    expect(
      getDetailValueText(
        { additionalProperties: {} },
        'additionalProperties.productGtin',
        TYPE_TEXT.Text
      )
    ).toBe(MISSING_DATA_PLACEHOLDER);
  });
});
