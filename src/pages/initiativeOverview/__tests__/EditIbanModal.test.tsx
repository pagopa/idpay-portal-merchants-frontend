import { screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import '../../../test-utils/mockEditModalDependencies';
import { renderWithMockStore } from '../../../test-utils/editModalTestUtils';

import { EditIbanModal } from '../EditIbanModal';
import { MerchantDetailDTO } from '../../../api/generated/merchants/data-contracts';

const onUpdateMock = jest.fn()
const setIsOpenMock = jest.fn()

describe('EditIbanModal', () => {
  it('should render EditIbanModal component with right props', () => {
    renderWithMockStore(
      <EditIbanModal
        isOpen={true}
        setIsOpen={setIsOpenMock}
        onUpdate={onUpdateMock}
        data={{ iban: 'IT123', ibanHolder: 'Test' } as MerchantDetailDTO & { onboardingDate: string }}
      />
    )

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
    renderWithMockStore(
      <EditIbanModal
        isOpen={true}
        setIsOpen={setIsOpenMock}
        onUpdate={onUpdateMock}
        data={{ iban: '', ibanHolder: '' } as MerchantDetailDTO & { onboardingDate: string }}
      />
    )

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
