import React from 'react';
import { cleanup, fireEvent, screen, waitFor } from '@testing-library/react';
import { renderWithContext } from '../../../utils/__tests__/test-utils';
import InitiativesList from '../initiativesList';
import userEvent from '@testing-library/user-event';
import { setInitiativesList } from '../../../redux/slices/initiativesSlice';
import { mockedInitiativesList } from '../../../api/__mocks__/MerchantsApiClient';
import { store } from '../../../redux/store';

beforeAll(() => {
  store.dispatch(setInitiativesList(mockedInitiativesList));
});

beforeEach(() => {
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

describe('Test suite for initiativeList page', () => {
  window.scrollTo = jest.fn();
  test('Render component', () => {
    renderWithContext(<InitiativesList />);
  });

  test('User searches an initiative by name', async () => {
    renderWithContext(<InitiativesList />);

    const user = userEvent.setup();
    const searchField = screen.getByTestId('search-initiatives') as HTMLInputElement;
    await user.type(searchField, '10');
  });
});
