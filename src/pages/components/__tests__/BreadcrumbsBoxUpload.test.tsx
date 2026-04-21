import { render, screen, fireEvent } from '@testing-library/react';
import BreadcrumbsBox from '../BreadcrumbsBoxUpload';

const mockPush = jest.fn();
const mockGoBack = jest.fn();

jest.mock('react-router-dom', () => ({
  useHistory: () => ({
    push: mockPush,
    goBack: mockGoBack,
  }),
}));

jest.mock('@pagopa/mui-italia', () => ({
  ButtonNaked: ({ children, onClick, ...rest }: any) => (
    <button onClick={onClick} {...rest}>
      {children}
    </button>
  ),
}));

describe('BreadcrumbsBoxUpload', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders back label and breadcrumb items', () => {
    render(<BreadcrumbsBox backLabel="Back" items={['Item1', 'Item2']} active={true} />);

    expect(screen.getByText('Back')).toBeInTheDocument();
    expect(screen.getByText('Item1')).toBeInTheDocument();
    expect(screen.getByText('Item2')).toBeInTheDocument();
  });

  it('calls onClickBackButton if provided', () => {
    const onClick = jest.fn();

    render(
      <BreadcrumbsBox backLabel="Back" items={[]} active={true} onClickBackButton={onClick} />
    );

    fireEvent.click(screen.getByTestId('back-btn-test'));

    expect(onClick).toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
    expect(mockGoBack).not.toHaveBeenCalled();
  });

  it('pushes to backButtonPath if provided', () => {
    render(<BreadcrumbsBox backLabel="Back" items={[]} active={true} backButtonPath="/home" />);

    fireEvent.click(screen.getByTestId('back-btn-test'));

    expect(mockPush).toHaveBeenCalledWith('/home');
  });

  it('calls history.goBack if no path and no custom handler', () => {
    render(<BreadcrumbsBox backLabel="Back" items={[]} active={true} />);

    fireEvent.click(screen.getByTestId('back-btn-test'));

    expect(mockGoBack).toHaveBeenCalled();
  });

  it('does not trigger back if inactive', () => {
    render(<BreadcrumbsBox backLabel="Back" items={[]} active={false} />);

    fireEvent.click(screen.getByTestId('back-btn-test'));

    expect(mockPush).not.toHaveBeenCalled();
    expect(mockGoBack).not.toHaveBeenCalled();
  });
});
