import { fireEvent, screen } from '@testing-library/react';
import { renderWithContext } from '../../../utils/__tests__/test-utils';
import TOSWall from '../TOSWall';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
  Trans: () => null,
}));

describe('tests for TOSWall', () => {
  test('test render of TOSWall component with not already accepted tos', () => {
    const mockAcceptTos = jest.fn();

    renderWithContext(
      <TOSWall acceptTOS={mockAcceptTos} tosRoute="" privacyRoute="" firstAcceptance={true} />
    );

    const acceptTosBtn = screen.getByText('Accedi');
    fireEvent.click(acceptTosBtn);
    expect(mockAcceptTos).toHaveBeenCalledTimes(1);

    expect(screen.getByText(/pages\.tos\.termsDescription/)).toBeInTheDocument();
    expect(screen.getByText('pages.tos.linkTos')).toBeInTheDocument();
    expect(screen.getByText(/pages\.tos\.termsDescription2/)).toBeInTheDocument();
    expect(screen.getByText('pages.tos.linkPrivacy')).toBeInTheDocument();
  });

  test('test render of TOSWall component with tos already accepted (firstAcceptance = false)', () => {
    renderWithContext(
      <TOSWall
        acceptTOS={jest.fn()}
        tosRoute="/tos"
        privacyRoute="/privacy"
        firstAcceptance={false}
      />
    );

    expect(screen.getByText(/pages\.tos\.termsDescriptionChanged/)).toBeInTheDocument();
    expect(screen.getByText('pages.tos.linkTos')).toBeInTheDocument();
    expect(screen.getByText(/pages\.tos\.and/)).toBeInTheDocument();
    expect(screen.getByText('pages.tos.linkPrivacy')).toBeInTheDocument();
  });
});
