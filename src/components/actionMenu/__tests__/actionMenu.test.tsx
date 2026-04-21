import { fireEvent, render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import ActionMenu from '../actionMenu';

type MerchantTransactionDTO = any;

const TransactionStatusEnum = {
  CREATED: 'CREATED',
  IDENTIFIED: 'IDENTIFIED',
  REJECTED: 'REJECTED',
  AUTHORIZED: 'AUTHORIZED',
} as const;

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
  status: TransactionStatusEnum.CREATED,
  data: {
    trxId: 'TRX_ID_456',
    status: TransactionStatusEnum.CREATED,
  } as any,
};

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider theme={createTheme()}>{children}</ThemeProvider>
);

const renderInTable = (ui: React.ReactElement) =>
  render(
    <Wrapper>
      <Table>
        <TableBody>
          <TableRow>{ui}</TableRow>
        </TableBody>
      </Table>
    </Wrapper>
  );

describe('ActionMenu', () => {
  it('should open menu and trigger onClose (covers handleCloseActionsMenu -> setAnchorEl(null))', () => {
    renderInTable(<ActionMenu {...mockBaseData} />);

    fireEvent.click(screen.getByTestId('actions_button'));
    expect(screen.getByTestId('menu-close-test')).toBeInTheDocument();

    fireEvent.keyDown(screen.getByTestId('menu-close-test'), { key: 'Escape', code: 'Escape' });

    expect(screen.getByTestId('menu-close-test')).toBeInTheDocument();
  });

  describe('RenderAuthorizeTransaction logic', () => {
    it.each([
      { status: TransactionStatusEnum.IDENTIFIED },
      { status: TransactionStatusEnum.CREATED },
    ])('should show Authorize button for status: $status', ({ status }) => {
      renderInTable(
        <ActionMenu
          {...mockBaseData}
          status={status}
          data={{ ...mockBaseData.data, status } as any}
        />
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

    it('should cover default branch and return null for REJECTED status', () => {
      renderInTable(
        <ActionMenu
          {...mockBaseData}
          status={TransactionStatusEnum.REJECTED}
          data={{ ...mockBaseData.data, status: TransactionStatusEnum.REJECTED } as any}
        />
      );

      fireEvent.click(screen.getByTestId('actions_button'));

      expect(screen.queryByTestId('authorize-trx-button')).not.toBeInTheDocument();
    });
  });

  describe('RenderCancelTransaction logic', () => {
    it('should render Cancel button and open cancel modal for AUTHORIZED status', () => {
      renderInTable(
        <ActionMenu
          {...mockBaseData}
          status={TransactionStatusEnum.AUTHORIZED as any}
          data={{ ...mockBaseData.data, status: TransactionStatusEnum.AUTHORIZED } as any}
        />
      );

      fireEvent.click(screen.getByTestId('actions_button'));

      const cancelButton = screen.getByTestId('cancel-trx-button');
      expect(cancelButton).toBeInTheDocument();
      expect(cancelButton).toHaveTextContent('pages.initiativeDiscounts.cancelDiscount');

      expect(screen.getByTestId('cancel-modal-mock')).toHaveTextContent('Cancel Modal Closed');
      fireEvent.click(cancelButton);
      expect(screen.getByTestId('cancel-modal-mock')).toHaveTextContent('Cancel Modal Open');
    });

    it('should return null (covers return null) for an unsupported status', () => {
      renderInTable(
        <ActionMenu
          {...mockBaseData}
          status={'SOME_UNSUPPORTED_STATUS' as any}
          data={{ ...mockBaseData.data, status: 'SOME_UNSUPPORTED_STATUS' } as any}
        />
      );

      fireEvent.click(screen.getByTestId('actions_button'));

      expect(screen.queryByTestId('cancel-trx-button')).not.toBeInTheDocument();
    });
  });
});
