import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import InitiativeOverviewCard from '../initiativeOverviewCard';


jest.mock('@pagopa/selfcare-common-frontend', () => ({
  TitleBox: ({ title, subTitle, variantTitle, variantSubTitle, ...props }: any) => (
    <div data-testid="title-box" {...props}>
      <h1 data-testid="title" data-variant={variantTitle}>{title}</h1>
      {subTitle && <p data-testid="subtitle" data-variant={variantSubTitle}>{subTitle}</p>}
    </div>
  ),
}));

jest.mock('../../../styles', () => ({
  inititiveOverviewCardStyle: { backgroundColor: 'white' },
  inititiveOverviewCardContentStyle: { padding: '16px' },
}));

describe('InitiativeOverviewCard', () => {
  const defaultProps = {
    title: 'Test Title',
    children: <div data-testid="test-children">Test Content</div>,
  };

  test('renders with required props', () => {
    render(<InitiativeOverviewCard {...defaultProps} />);

    expect(screen.getByTestId('card')).toBeInTheDocument();
    expect(screen.getByTestId('card-content')).toBeInTheDocument();
    expect(screen.getByTestId('title-box')).toBeInTheDocument();
    expect(screen.getByTestId('title')).toHaveTextContent('Test Title');
    expect(screen.getByTestId('test-children')).toHaveTextContent('Test Content');
  });

  test('renders with title and subtitle', () => {
    render(
      <InitiativeOverviewCard
        {...defaultProps}
        subtitle="Test Subtitle"
      />
    );

    expect(screen.getByTestId('title')).toHaveTextContent('Test Title');
    expect(screen.getByTestId('subtitle')).toHaveTextContent('Test Subtitle');
  });

  test('renders without subtitle', () => {
    render(<InitiativeOverviewCard {...defaultProps} />);

    expect(screen.getByTestId('title')).toHaveTextContent('Test Title');
    expect(screen.queryByTestId('subtitle')).not.toBeInTheDocument();
  });

  test('applies default title variant (h5)', () => {
    render(<InitiativeOverviewCard {...defaultProps} />);

    expect(screen.getByTestId('title')).toHaveAttribute('data-variant', 'h5');
  });

  test('applies custom title variant', () => {
    render(
      <InitiativeOverviewCard
        {...defaultProps}
        titleVariant="h4"
      />
    );

    expect(screen.getByTestId('title')).toHaveAttribute('data-variant', 'h4');
  });

  test('applies default subtitle variant (caption)', () => {
    render(
      <InitiativeOverviewCard
        {...defaultProps}
        subtitle="Test Subtitle"
      />
    );

    expect(screen.getByTestId('subtitle')).toHaveAttribute('data-variant', 'caption');
  });

  test('applies custom subtitle variant', () => {
    render(
      <InitiativeOverviewCard
        {...defaultProps}
        subtitle="Test Subtitle"
        subtitleVariant="body1"
      />
    );

    expect(screen.getByTestId('subtitle')).toHaveAttribute('data-variant', 'body1');
  });

  test('renders multiple children correctly', () => {
    const multipleChildren = (
      <>
        <div data-testid="child-1">Child 1</div>
        <div data-testid="child-2">Child 2</div>
      </>
    );

    render(
      <InitiativeOverviewCard
        title="Test Title"
        children={multipleChildren}
      />
    );

    expect(screen.getByTestId('child-1')).toHaveTextContent('Child 1');
    expect(screen.getByTestId('child-2')).toHaveTextContent('Child 2');
  });

  test('applies correct structure and styling', () => {
    render(<InitiativeOverviewCard {...defaultProps} />);

    const card = screen.getByTestId('card');
    const cardContent = screen.getByTestId('card-content');
    const box = screen.getByTestId('box');

    expect(card).toBeInTheDocument();
    expect(cardContent).toBeInTheDocument();
    expect(box).toBeInTheDocument();
  });

  test('handles all titleVariant options', () => {
    const titleVariants: Array<'h4' | 'h5' | 'h6'> = ['h4', 'h5', 'h6'];

    titleVariants.forEach(variant => {
      const { unmount } = render(
        <InitiativeOverviewCard
          {...defaultProps}
          titleVariant={variant}
        />
      );

      expect(screen.getByTestId('title')).toHaveAttribute('data-variant', variant);
      unmount();
    });
  });

  test('handles all subtitleVariant options', () => {
    const subtitleVariants: Array<'body1' | 'body2' | 'caption'> = ['body1', 'body2', 'caption'];

    subtitleVariants.forEach(variant => {
      const { unmount } = render(
        <InitiativeOverviewCard
          {...defaultProps}
          subtitle="Test Subtitle"
          subtitleVariant={variant}
        />
      );

      expect(screen.getByTestId('subtitle')).toHaveAttribute('data-variant', variant);
      unmount();
    });
  });

  test('renders with complex children content', () => {
    const complexChildren = (
      <div data-testid="complex-content">
        <button>Click me</button>
        <p>Some text</p>
        <ul>
          <li>Item 1</li>
          <li>Item 2</li>
        </ul>
      </div>
    );

    render(
      <InitiativeOverviewCard
        title="Test Title"
        children={complexChildren}
      />
    );

    expect(screen.getByTestId('complex-content')).toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveTextContent('Click me');
    expect(screen.getByText('Some text')).toBeInTheDocument();
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
  });
});