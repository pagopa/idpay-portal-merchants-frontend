import { renderWithContext } from '../../../utils/__tests__/test-utils';
import OneTrustContentWrapper from '../OneTrustContentWrapper';

describe('OneTrustContentWrapper', () => {
  it('renders the notice container and back link', () => {
    renderWithContext(<OneTrustContentWrapper idSelector="otnotice-test-id" />);

    expect(document.querySelector('#otnotice-test-id')).toHaveClass('otnotice');
    expect(document.querySelector('a')).toHaveAttribute('href', '/portale-esercenti');
  });
});
