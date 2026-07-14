import { jest, describe, test, expect } from '@jest/globals';
import '@testing-library/jest-dom';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { renderWithContext } from '../../../utils/__tests__/test-utils';
import { Data } from '../helpers';
import NewInitiativesTabContent from '../NewInitiativesTabContent';

const buildProps = (
  overrides?: Partial<React.ComponentProps<typeof NewInitiativesTabContent>>
) => ({
  isLoading: false,
  isError: false,
  initiatives: [] as Array<Data>,
  order: 'asc' as const,
  orderBy: 'initiativeName',
  onRequestSort: jest.fn(),
  onAdhere: jest.fn(),
  ...overrides,
});

describe('NewInitiativesTabContent', () => {
  test('shows loading state', () => {
    const props = buildProps({ isLoading: true });

    renderWithContext(<NewInitiativesTabContent {...props} />);

    expect(
      screen.getByText('pages.initiativesList.newInitiativesLoadingTitle')
    ).toBeInTheDocument();
    expect(
      screen.getByText('pages.initiativesList.newInitiativesLoadingSubtitle')
    ).toBeInTheDocument();
  });

  test('shows error state', () => {
    const props = buildProps({ isError: true });

    renderWithContext(<NewInitiativesTabContent {...props} />);

    expect(screen.getByText('pages.initiativesList.newInitiativesErrorTitle')).toBeInTheDocument();
    expect(
      screen.getByText('pages.initiativesList.newInitiativesErrorSubtitle')
    ).toBeInTheDocument();
  });

  test('shows empty state', () => {
    const props = buildProps({ initiatives: [] });

    renderWithContext(<NewInitiativesTabContent {...props} />);

    expect(screen.getByText('pages.initiativesList.emptyList')).toBeInTheDocument();
    expect(
      screen.getByText('pages.initiativesList.newInitiativesEmptySubtitle')
    ).toBeInTheDocument();
  });

  test('calls sort callback when user clicks sortable headers', () => {
    const onRequestSort = jest.fn();
    const props = buildProps({
      initiatives: [
        {
          id: 0,
          initiativeId: 'initiative-1',
          initiativeName: 'Bonus Decoder',
          organizationName: 'MIMIT',
          status: '',
          onboardStatus: 'ONBOARDABLE',
        },
      ],
      onRequestSort,
    });

    renderWithContext(<NewInitiativesTabContent {...props} />);

    fireEvent.click(screen.getByText('pages.initiativesList.initiativeName'));
    fireEvent.click(screen.getByText('pages.initiativesList.organizationName'));

    expect(onRequestSort).toHaveBeenCalledTimes(2);
    expect(onRequestSort.mock.calls[0][1]).toBe('initiativeName');
    expect(onRequestSort.mock.calls[1][1]).toBe('organizationName');
  });

  test('shows active sort state for initiative name in ascending order', () => {
    const props = buildProps({
      initiatives: [
        {
          id: 0,
          initiativeId: 'initiative-1',
          initiativeName: 'Bonus Decoder',
          organizationName: 'MIMIT',
          status: '',
          onboardStatus: 'ONBOARDABLE',
        },
      ],
      order: 'asc',
      orderBy: 'initiativeName',
    });

    renderWithContext(<NewInitiativesTabContent {...props} />);

    expect(screen.getByText('sorted ascending')).toBeInTheDocument();
    expect(screen.queryByText('sorted descending')).not.toBeInTheDocument();
  });

  test('shows active sort state for organization name in descending order', () => {
    const props = buildProps({
      initiatives: [
        {
          id: 0,
          initiativeId: 'initiative-1',
          initiativeName: 'Bonus Decoder',
          organizationName: 'MIMIT',
          status: '',
          onboardStatus: 'ONBOARDABLE',
        },
      ],
      order: 'desc',
      orderBy: 'organizationName',
    });

    renderWithContext(<NewInitiativesTabContent {...props} />);

    expect(screen.getByText('sorted descending')).toBeInTheDocument();
    expect(screen.queryByText('sorted ascending')).not.toBeInTheDocument();
  });

  test('handles ONBOARDABLE row actions', () => {
    const onAdhere = jest.fn();

    const props = buildProps({
      initiatives: [
        {
          id: 0,
          initiativeId: 'initiative-1',
          initiativeName: 'Bonus Decoder',
          organizationName: 'MIMIT',
          status: '',
          onboardStatus: 'ONBOARDABLE',
        },
      ],
      onAdhere,
    });

    renderWithContext(<NewInitiativesTabContent {...props} />);

    fireEvent.click(screen.getByRole('button', { name: 'pages.initiativesList.actions.adhere' }));
    expect(onAdhere).toHaveBeenCalledWith({
      initiativeId: 'initiative-1',
      initiativeName: 'Bonus Decoder',
    });
  });

  test('shows and closes not-onboardable modal for NOT_ONBOARDABLE row', async () => {
    const props = buildProps({
      initiatives: [
        {
          id: 0,
          initiativeId: 'initiative-2',
          initiativeName: 'Bonus Prova',
          organizationName: 'MIMIT',
          status: '',
          onboardStatus: 'NOT_ONBOARDABLE',
        },
      ],
    });

    renderWithContext(<NewInitiativesTabContent {...props} />);

    fireEvent.click(screen.getByTestId('not-onboardable-info-btn'));
    expect(screen.getByTestId('not-onboardable-modal')).toBeInTheDocument();
    expect(screen.getByText('pages.initiativesList.notOnboardableModal.title')).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('actions.okClose'));

    await waitFor(() => {
      expect(screen.queryByTestId('not-onboardable-modal')).not.toBeInTheDocument();
    });
  });

  test('closes not-onboardable modal from footer action button', async () => {
    const props = buildProps({
      initiatives: [
        {
          id: 0,
          initiativeId: 'initiative-2',
          initiativeName: 'Bonus Prova',
          organizationName: 'MIMIT',
          status: '',
          onboardStatus: 'NOT_ONBOARDABLE',
        },
      ],
    });

    renderWithContext(<NewInitiativesTabContent {...props} />);

    fireEvent.click(screen.getByTestId('not-onboardable-info-btn'));
    fireEvent.click(screen.getByTestId('not-onboardable-modal-close-btn'));

    await waitFor(() => {
      expect(screen.queryByTestId('not-onboardable-modal')).not.toBeInTheDocument();
    });
  });
});
