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
    (useAppSelector as jest.Mock).mockReturnValue([{initiativeId: 'initiative-1'}])
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Renders InitiativeOverviewInfo', async () => {
    render(<InitiativeOverviewInfo />);
    const openModalButton = screen.getByTestId('open-modal');

    // DO NOT renders description
    expect(screen.queryByText('pages.initiativeOverview.info.description')).not.toBeInTheDocument();

    // DO NOT renders exit button
    expect(screen.queryByText('actions.close')).not.toBeInTheDocument();

    openModalButton.click();

    // renders description
    expect(screen.getByText('pages.initiativeOverview.info.description')).toBeInTheDocument();

    //renders exit button
    expect(screen.getByText('actions.close')).toBeInTheDocument();
  });
});
