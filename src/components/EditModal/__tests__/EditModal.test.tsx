import { screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import '../../../test-utils/mockEditModalDependencies';
import { renderWithMockStore } from '../../../test-utils/editModalTestUtils';

import { EditModal } from '../EditModal';

const onSaveMock = jest.fn()
const setIsOpenMock = jest.fn()

describe('EditModal', () => {
  it('should render EditModal component with right props', () => {
    renderWithMockStore(
      <EditModal isOpen={true} setIsOpen={setIsOpenMock} title='Title' desciption='Description' onSave={onSaveMock}>
        <div>Test children</div>
      </EditModal>
    )

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
