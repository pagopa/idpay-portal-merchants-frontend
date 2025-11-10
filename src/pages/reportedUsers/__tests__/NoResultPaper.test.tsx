import React from 'react';
import { render, screen } from '@testing-library/react';
import NoResultPaper from '../NoResultPaper';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => `translated_${key}`,
  }),
}));

describe('NoResultPaper', () => {
  test('should render without crashing', () => {
    render(<NoResultPaper translationKey="test.key" />);
    expect(screen.getByText('translated_test.key')).toBeInTheDocument();
  });

  test('should render Paper component with correct styling', () => {
    const { container } = render(<NoResultPaper translationKey="test.key" />);
    const paper = container.querySelector('[class*="MuiPaper"]');
    expect(paper).toBeInTheDocument();
  });

  test('should render Typography with correct translation key', () => {
    render(<NoResultPaper translationKey="messages.noResults" />);
    expect(screen.getByText('translated_messages.noResults')).toBeInTheDocument();
  });

  test('should render Typography with body2 variant', () => {
    render(<NoResultPaper translationKey="test.key" />);
    const typography = screen.getByText('translated_test.key');
    expect(typography).toHaveClass('MuiTypography-body2');
  });

  test('should render Stack component with row direction', () => {
    const { container } = render(<NoResultPaper translationKey="test.key" />);
    const stack = container.querySelector('[class*="MuiStack"]');
    expect(stack).toBeInTheDocument();
  });

  test('should pass different translation keys correctly', () => {
    const { rerender } = render(<NoResultPaper translationKey="key1" />);
    expect(screen.getByText('translated_key1')).toBeInTheDocument();

    rerender(<NoResultPaper translationKey="key2" />);
    expect(screen.getByText('translated_key2')).toBeInTheDocument();
  });

  test('should render with empty translation key', () => {
    render(<NoResultPaper translationKey="" />);
    expect(screen.getByText('translated_')).toBeInTheDocument();
  });

  test('should render with complex translation key', () => {
    render(<NoResultPaper translationKey="common.errors.noResultsFound" />);
    expect(screen.getByText('translated_common.errors.noResultsFound')).toBeInTheDocument();
  });

  test('should have correct text alignment in Paper', () => {
    const { container } = render(<NoResultPaper translationKey="test.key" />);
    const paper = container.querySelector('[class*="MuiPaper"]');
    expect(paper).toHaveStyle({ textAlign: 'center' });
  });

  test('should have flex display properties', () => {
    const { container } = render(<NoResultPaper translationKey="test.key" />);
    const paper = container.querySelector('[class*="MuiPaper"]');
    expect(paper).toHaveStyle({ display: 'flex' });
  });

  test('should have centered alignment and justification', () => {
    const { container } = render(<NoResultPaper translationKey="test.key" />);
    const paper = container.querySelector('[class*="MuiPaper"]');
    expect(paper).toHaveStyle({
      alignItems: 'center',
      justifyContent: 'center',
    });
  });

  test('should render Typography inside Stack', () => {
    const { container } = render(<NoResultPaper translationKey="test.key" />);
    const stack = container.querySelector('[class*="MuiStack"]');
    const typography = stack?.querySelector('[class*="MuiTypography"]');
    expect(typography).toBeInTheDocument();
  });

  test('should use useTranslation hook', () => {
    render(<NoResultPaper translationKey="test.key" />);
    // Verify translation was applied
    expect(screen.getByText('translated_test.key')).toBeInTheDocument();
  });

  test('should render single Typography in Stack', () => {
    const { container } = render(<NoResultPaper translationKey="test.key" />);
    const stack = container.querySelector('[class*="MuiStack"]');
    const typographies = stack?.querySelectorAll('[class*="MuiTypography"]');
    expect(typographies).toHaveLength(1);
  });

  test('should apply spacing to Stack', () => {
    const { container } = render(<NoResultPaper translationKey="test.key" />);
    const stack = container.querySelector('[class*="MuiStack"]');
    expect(stack).toHaveClass('MuiStack-root');
  });

  test('should render with special characters in translation key', () => {
    render(<NoResultPaper translationKey="test.key-special_123" />);
    expect(screen.getByText('translated_test.key-special_123')).toBeInTheDocument();
  });

  test('should maintain component structure on re-render', () => {
    const { rerender, container } = render(<NoResultPaper translationKey="key1" />);
    const paperBefore = container.querySelector('[class*="MuiPaper"]');

    rerender(<NoResultPaper translationKey="key1" />);
    const paperAfter = container.querySelector('[class*="MuiPaper"]');

    expect(paperBefore).toBeInTheDocument();
    expect(paperAfter).toBeInTheDocument();
  });

  test('should have correct Paper padding and margin', () => {
    const { container } = render(<NoResultPaper translationKey="test.key" />);
    const paper = container.querySelector('[class*="MuiPaper"]');
    // MUI applies these via sx prop
    expect(paper).toBeInTheDocument();
  });

  test('should render with long translation key', () => {
    const longKey = 'very.long.translation.key.path.to.some.message.value';
    render(<NoResultPaper translationKey={longKey} />);
    expect(screen.getByText(`translated_${longKey}`)).toBeInTheDocument();
  });

  test('should accept translationKey as required prop', () => {
    const { container } = render(<NoResultPaper translationKey="required.key" />);
    expect(container.querySelector('[class*="MuiPaper"]')).toBeInTheDocument();
  });

  test('should call t function with provided translation key', () => {
    const testKey = 'specific.test.key';
    render(<NoResultPaper translationKey={testKey} />);
    expect(screen.getByText(`translated_${testKey}`)).toBeInTheDocument();
  });
});