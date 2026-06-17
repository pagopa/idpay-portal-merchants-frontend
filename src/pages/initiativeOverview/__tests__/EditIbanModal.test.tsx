import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

import { EditIbanModal } from '../EditIbanModal';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { MerchantDetailDTO } from '../../../api/generated/merchants/data-contracts';

const onUpdateMock = jest.fn()
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
      <EditIbanModal
        isOpen={true}
        setIsOpen={setIsOpenMock}
        onUpdate={onUpdateMock}
        data={{ iban: 'IT123', ibanHolder: 'Test' } as MerchantDetailDTO & { onboardingDate: string }}
      />
    </Provider>)

    expect(screen.getByText('pages.initiativeOverview.ibanModal.title')).toBeInTheDocument()
    expect(screen.getByText('pages.initiativeOverview.ibanModal.description')).toBeInTheDocument()
    expect(screen.getByLabelText('pages.initiativeOverview.ibanModal.fieldHolder.placeholder')).toBeInTheDocument()
    expect(screen.getByLabelText('pages.initiativeOverview.ibanModal.fieldIban.placeholder')).toBeInTheDocument()

    const cancelBtn = screen.getByTestId('cancel-button-test')
    const saveBtn = screen.getByTestId('save-button-test')

    fireEvent.click(saveBtn)
    expect(onUpdateMock).toHaveBeenCalled()

    fireEvent.click(cancelBtn)
    expect(setIsOpenMock).toHaveBeenCalled()
  })

  it('should show error', () => {
    render(<Provider store={store}>
      <EditIbanModal
        isOpen={true}
        setIsOpen={setIsOpenMock}
        onUpdate={onUpdateMock}
        data={{ iban: '', ibanHolder: '' } as MerchantDetailDTO & { onboardingDate: string }}
      />
    </Provider>)

    const holder = screen.getByLabelText('pages.initiativeOverview.ibanModal.fieldHolder.placeholder')
    const iban = screen.getByLabelText('pages.initiativeOverview.ibanModal.fieldIban.placeholder')

    const saveBtn = screen.getByTestId('save-button-test')

    fireEvent.click(saveBtn)
    expect(onUpdateMock).not.toHaveBeenCalled()

    expect(screen.getAllByText('pages.initiativeOverview.ibanModal.requiredField')).toHaveLength(2)

    fireEvent.focus(holder)
    fireEvent.blur(holder)

    fireEvent.focus(iban)
    fireEvent.blur(iban)

    expect(screen.queryByText('pages.initiativeOverview.ibanModal.requiredField')).not.toBeInTheDocument()

    fireEvent.change(holder, { target: { value: 'TEST' } })
    fireEvent.change(iban, { target: { value: 'IT123' } })

    expect(screen.queryByText('pages.initiativeOverview.ibanModal.requiredField')).not.toBeInTheDocument()
  })
});
