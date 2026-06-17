import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

import { EditEmailModal } from '../EditEmailModal';
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

describe('EditEmailModal', () => {
  it('should render EditEmailModal component with right props', () => {
    render(<Provider store={store}>
      <EditEmailModal
        isOpen={true}
        setIsOpen={setIsOpenMock}
        onUpdate={onUpdateMock}
        data={{ operativeEmail: 'test@mail.it' } as MerchantDetailDTO & { onboardingDate: string }}
      />
    </Provider>)

    expect(screen.getByText('pages.initiativeOverview.emailModal.title')).toBeInTheDocument()
    expect(screen.getByText('pages.initiativeOverview.emailModal.description')).toBeInTheDocument()
    expect(screen.getByText('pages.initiativeOverview.emailModal.fieldInsert.label')).toBeInTheDocument()
    expect(screen.getByText('pages.initiativeOverview.emailModal.fieldConfirm.label')).toBeInTheDocument()
    expect(screen.getByLabelText('pages.initiativeOverview.emailModal.fieldInsert.placeholder')).toBeInTheDocument()
    expect(screen.getByLabelText('pages.initiativeOverview.emailModal.fieldConfirm.placeholder')).toBeInTheDocument()

    const cancelBtn = screen.getByTestId('cancel-button-test')
    const saveBtn = screen.getByTestId('save-button-test')

    const confirm = screen.getByLabelText('pages.initiativeOverview.emailModal.fieldConfirm.placeholder')
    fireEvent.change(confirm, { target: { value: 'test@mail.it' } })

    fireEvent.click(saveBtn)
    expect(onUpdateMock).toHaveBeenCalled()

    fireEvent.click(cancelBtn)
    expect(setIsOpenMock).toHaveBeenCalled()
  })

  it('should show error', () => {
    render(<Provider store={store}>
      <EditEmailModal
        isOpen={true}
        setIsOpen={setIsOpenMock}
        onUpdate={onUpdateMock}
        data={{ operativeEmail: '' } as MerchantDetailDTO & { onboardingDate: string }}
      />
    </Provider>)

    const insert = screen.getByLabelText('pages.initiativeOverview.emailModal.fieldInsert.placeholder')
    const confirm = screen.getByLabelText('pages.initiativeOverview.emailModal.fieldConfirm.placeholder')

    const saveBtn = screen.getByTestId('save-button-test')

    fireEvent.click(saveBtn)
    expect(onUpdateMock).not.toHaveBeenCalled()

    expect(screen.getAllByText('pages.initiativeOverview.emailModal.requiredField')).toHaveLength(2)

    fireEvent.focus(insert)
    fireEvent.blur(insert)

    fireEvent.focus(confirm)
    fireEvent.blur(confirm)

    expect(screen.queryByText('pages.initiativeOverview.emailModal.requiredField')).not.toBeInTheDocument()

    fireEvent.change(insert, { target: { value: 'email-test' } })
    fireEvent.change(confirm, { target: { value: 'email-test' } })

    expect(screen.queryByText('pages.initiativeOverview.emailModal.requiredField')).not.toBeInTheDocument()

    expect(screen.getByText('pages.initiativeOverview.emailModal.notValidEmail')).toBeInTheDocument()

    fireEvent.change(insert, { target: { value: 'test@mail.it' } })
    expect(screen.queryByText('pages.initiativeOverview.emailModal.notValidEmail')).not.toBeInTheDocument()
  })

  it('should show different errors', () => {
    render(<Provider store={store}>
      <EditEmailModal
        isOpen={true}
        setIsOpen={setIsOpenMock}
        onUpdate={onUpdateMock}
        data={{ operativeEmail: 'test@mail.it' } as MerchantDetailDTO & { onboardingDate: string }}
      />
    </Provider>)

    const insert = screen.getByLabelText('pages.initiativeOverview.emailModal.fieldInsert.placeholder')
    const confirm = screen.getByLabelText('pages.initiativeOverview.emailModal.fieldConfirm.placeholder')

    fireEvent.change(confirm, { target: { value: 'email' } })
    
    const saveBtn = screen.getByTestId('save-button-test')

    fireEvent.click(saveBtn)
    expect(onUpdateMock).not.toHaveBeenCalled()

    expect(screen.getByText('pages.initiativeOverview.emailModal.notEqualEmail')).toBeInTheDocument()
  })
});
