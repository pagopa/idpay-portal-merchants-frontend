import { fireEvent, render, screen } from '@testing-library/react';
import { useTranslation } from 'react-i18next';
import { ThemeProvider, createTheme } from '@mui/material';
import ActionMenu from '../actionMenu';
import {
  MerchantTransactionDTO,
  StatusEnum as TransactionStatusEnum,
} from '../../../api/generated/merchants/MerchantTransactionDTO';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

jest.mock('../../../pages/initiativeDiscounts/CancelTransactionModal', () => ({
  __esModule: true,
  default: ({
    openCancelTrxModal,
    setOpenCancelTrxModal,
  }: {
    openCancelTrxModal: boolean;
    setOpenCancelTrxModal: (open: boolean) => void;
  }) => (
    <div data-testid="cancel-modal-mock">
      {openCancelTrxModal ? 'Cancel Modal Open' : 'Cancel Modal Closed'}
      <button onClick={() => setOpenCancelTrxModal(false)}>Close Cancel</button>
    </div>
  ),
}));

jest.mock('../../../pages/initiativeDiscounts/AuthorizeTransactionModal', () => ({
  __esModule: true,
  default: ({
    openAuthorizeTrxModal,
    setOpenAuthorizeTrxModal,
  }: {
    openAuthorizeTrxModal: boolean;
    setOpenAuthorizeTrxModal: (open: boolean) => void;
  }) => (
    <div data-testid="authorize-modal-mock">
      {openAuthorizeTrxModal ? 'Authorize Modal Open' : 'Authorize Modal Closed'}
      <button onClick={() => setOpenAuthorizeTrxModal(false)}>Close Authorize</button>
    </div>
  ),
}));

const mockBaseData = {
  initiativeId: 'INITIATIVE_ID_123',
  trxId: 'TRX_ID_456',
  data: {
    trxId: 'TRX_ID_456',
    status: TransactionStatusEnum.CREATED,
  } as MerchantTransactionDTO,
};

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider theme={createTheme()}>{children}</ThemeProvider>
);

describe('ActionMenu', () => {
  it('should render the actions button and handle menu open/close', () => {
    render(
      <Wrapper>
        <ActionMenu status={mockBaseData.data.status} {...mockBaseData} />
      </Wrapper>
    );

    const actionsButton = screen.getByTestId('actions_button');
    expect(actionsButton).toBeInTheDocument();

    expect(screen.queryByRole('menu')).toBeNull();
  });

  describe('RenderAuthorizeTransaction logic', () => {
    it.each([
      { status: TransactionStatusEnum.IDENTIFIED },
      { status: TransactionStatusEnum.CREATED },
    ])('should show Authorize button for status: $status', ({ status }) => {
      render(
        <Wrapper>
          <ActionMenu {...mockBaseData} status={status} data={{ ...mockBaseData.data, status }} />
        </Wrapper>
      );
      fireEvent.click(screen.getByTestId('actions_button'));

      const authorizeButton = screen.getByTestId('authorize-trx-button');
      expect(authorizeButton).toBeInTheDocument();
      expect(authorizeButton).toHaveTextContent('pages.initiativeDiscounts.detailTitle');

      expect(screen.getByTestId('authorize-modal-mock')).toHaveTextContent(
        'Authorize Modal Closed'
      );
      fireEvent.click(authorizeButton);
      expect(screen.getByTestId('authorize-modal-mock')).toHaveTextContent('Authorize Modal Open');
    });

    it('should NOT show Authorize button for REJECTED status', () => {
      render(
        <Wrapper>
          <ActionMenu
            {...mockBaseData}
            status={TransactionStatusEnum.REJECTED}
            data={{ ...mockBaseData.data, status: TransactionStatusEnum.REJECTED }}
          />
        </Wrapper>
      );
      fireEvent.click(screen.getByTestId('actions_button'));

      expect(screen.queryByTestId('authorize-trx-button')).not.toBeInTheDocument();
    });
  });
});
