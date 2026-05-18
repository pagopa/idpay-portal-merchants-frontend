import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { InitiativeOverviewInfo } from '../initiativeOverviewInfo';
import { useAppSelector } from '../../../redux/hooks';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
  Trans: ({ i18nKey }: { i18nKey: string }) => <>{i18nKey}</>,
}));

jest.mock('../../../hooks/useCurrentInitiativeId', () => ({
  useCurrentInitiativeId: () => 'initiative-1',
}));

jest.mock('../../../redux/slices/initiativesSlice', () => ({
  setInitiativesList: jest.fn(),
  intiativesListSelector: jest.fn(),
  initiativesReducer: jest.fn(), 
}));

jest.mock('../../../redux/hooks', () => ({
  useAppSelector: jest.fn(),
}));

describe('InitiativeOverviewInfo', () => {
  const renderComponent = () => render(<InitiativeOverviewInfo />);

  beforeEach(() => {
    jest.clearAllMocks();
    (useAppSelector as jest.Mock).mockReturnValue([
      { initiativeId: 'initiative-1' },
    ]);
  });

  it('toggles modal content correctly', () => {
    renderComponent();

    const descriptionKey =
      'pages.initiativeOverview.info.description';
    const closeKey = 'actions.close';

    expect(screen.queryByText(descriptionKey)).not.toBeInTheDocument();
    expect(screen.queryByText(closeKey)).not.toBeInTheDocument();

    screen.getByTestId('open-modal').click();

    expect(screen.getByText(descriptionKey)).toBeInTheDocument();
    expect(screen.getByText(closeKey)).toBeInTheDocument();
  });
});
