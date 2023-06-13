import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
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
    const { store } = renderWithContext(<InitiativesList />);
    store.dispatch(setInitiativesList(mockedInitiativesList));
  });

  test('User searches an initiative by name that shows results', async () => {
    const setStateMock = jest.fn();
    const useStateMock: any = (useState: any) => [useState, setStateMock];
    jest.spyOn(React, 'useState').mockImplementation(useStateMock);
    const { store } = renderWithContext(<InitiativesList />);
    store.dispatch(setInitiativesList(mockedInitiativesList));
    const searchField = screen.getByTestId('search-initiatives') as HTMLInputElement;
    fireEvent.change(searchField, { target: { value: 'Iniziativa mock 1234' } });
    expect(searchField.value).toBe('Iniziativa mock 1234');
  });

  test("User searches an initiative by name that doesn't show results", async () => {
    const setStateMock = jest.fn();
    const useStateMock: any = (useState: any) => [useState, setStateMock];
    jest.spyOn(React, 'useState').mockImplementation(useStateMock);
    const { store } = renderWithContext(<InitiativesList />);
    store.dispatch(setInitiativesList(mockedInitiativesList));
    const searchField = screen.getByTestId('search-initiatives') as HTMLInputElement;
    fireEvent.change(searchField, { target: { value: 'not present' } });
    expect(searchField.value).toBe('not present');
  });

  test('User resets previous search', async () => {
    const setStateMock = jest.fn();
    const useStateMock: any = (useState: any) => [useState, setStateMock];
    jest.spyOn(React, 'useState').mockImplementation(useStateMock);
    const { store } = renderWithContext(<InitiativesList />);
    store.dispatch(setInitiativesList(mockedInitiativesList));
    const searchField = screen.getByTestId('search-initiatives') as HTMLInputElement;
    fireEvent.change(searchField, { target: { value: '' } });
    expect(searchField.value).toBe('');
  });

  // test('User sorts initiatives by name', async () => {
  //   const { store } = renderWithContext(<InitiativesList />);
  //   store.dispatch(setInitiativesList(mockedInitiativesList));
  //   const sortByName = screen.getByText('pages.initiativesList.initiativeName');

  //   fireEvent.click(sortByName);
  // });
});
