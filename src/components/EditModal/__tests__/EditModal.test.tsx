import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

import { EditModal } from '../EditModal';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';

const onSaveMock = jest.fn()
const setIsOpenMock = jest.fn()

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ initiative_id: 'test-id' }),
}));

jest.mock('../../../redux/hooks', () => ({
  useAppSelector: jest.fn(),
}));

jest.mock('../../../redux/slices/initiativesSlice', () => ({
  setInitiativesList: jest.fn(),
  intiativesListSelector: jest.fn(),
  initiativesReducer: jest.fn(),
}));

const createMockStore = (initialState?: any) => {
  return configureStore({
    reducer: () => initialState,
  });
};
const store = createMockStore();

describe('EditModal', () => {
  it('should render EditModal component with right props', () => {
    render(<Provider store={store}>
      <EditModal isOpen={true} setIsOpen={setIsOpenMock} title='Title' desciption='Description' onSave={onSaveMock}>
        <div>Test children</div>
      </EditModal></Provider>)

    expect(screen.getByText('Title')).toBeInTheDocument()
    expect(screen.getByText('Description')).toBeInTheDocument()
    expect(screen.getByText('Test children')).toBeInTheDocument()

    const cancelBtn = screen.getByTestId('cancel-button-test')
    const saveBtn = screen.getByTestId('save-button-test')

    fireEvent.click(saveBtn)
    expect(onSaveMock).toHaveBeenCalled()

    fireEvent.click(cancelBtn)
    expect(setIsOpenMock).toHaveBeenCalled()
  })
});
