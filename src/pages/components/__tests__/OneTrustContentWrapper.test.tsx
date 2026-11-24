import { renderWithContext } from '../../../utils/__tests__/test-utils';
import OneTrustContentWrapper from '../OneTrustContentWrapper';

describe('OneTrustContentWrapper', () => {
  it('renders the notice container and back link', () => {
    renderWithContext(<OneTrustContentWrapper idSelector="otnotice-test-id" isContentLoaded={true} />);

    expect(document.querySelector('#otnotice-test-id')).toHaveClass('otnotice');
    expect(document.querySelector('a')).toHaveAttribute('href', '/portale-esercenti');
  });

  it('renders the notice container', () => {
    renderWithContext(<OneTrustContentWrapper idSelector="otnotice-test-id" isContentLoaded={false} />);

    expect(document.querySelector('#otnotice-test-id')).toHaveClass('otnotice');
    expect(document.querySelector('a')).not.toBeInTheDocument();
  });
});
