import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { InitiativeOverviewInfo } from '../initiativeOverviewInfo';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
  Trans: ({ i18nKey }: { i18nKey: string }) => <>{i18nKey}</>,
}));

describe('InitiativeOverviewInfo', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Renders InitiativeOverviewInfo', async () => {
    render(<InitiativeOverviewInfo />);
    const openModalButton = screen.getByTestId('open-modal');

    // DO NOT renders description
    expect(
      screen.queryByText('pages.initiativeOverview.info.description')
    ).not.toBeInTheDocument();

    // DO NOT renders exit button
    expect(screen.queryByText('commons.closeBtn')).not.toBeInTheDocument();

    openModalButton.click();

    // renders description
    expect(screen.getByText('pages.initiativeOverview.info.description')).toBeInTheDocument();

    //renders exit button
    expect(screen.getByText('commons.closeBtn')).toBeInTheDocument();
  });
});
