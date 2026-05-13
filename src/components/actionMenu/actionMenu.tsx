import { useState } from 'react';
import { IconButton, Menu, MenuItem, TableCell } from '@mui/material';
import MoreIcon from '@mui/icons-material/MoreVert';
import CancelTransactionModal from '../../pages/initiativeDiscounts/CancelTransactionModal';
import { MerchantTransactionDTO } from '../../api/generated/merchants/data-contracts';

type TransactionStatusEnum = MerchantTransactionDTO['status'];
import AuthorizeTransactionModal from '../../pages/initiativeDiscounts/AuthorizeTransactionModal';
import useScopedTranslation from '../../hooks/useScopedTranslation';

type ActionsMenuProps = {
  initiativeId: string;
  status: TransactionStatusEnum;
  trxId: string;
  data: MerchantTransactionDTO;
};

const ActionMenu = ({ initiativeId, status, trxId, data }: ActionsMenuProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [openCancelTrxModal, setOpenCancelTrxModal] = useState<boolean>(false);
  const [openAuthorizeTrxModal, setOpenAuthorizeTrxModal] = useState<boolean>(false);
  const open = Boolean(anchorEl);
  const { t } = useScopedTranslation();

  const handleClickActionsMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleCloseActionsMenu = () => {
    setAnchorEl(null);
  };

  type RenderCancelTrxProps = {
    initiativeId: string;
    status: TransactionStatusEnum;
    trxId: string;
  };

  type RenderAuthorizeTrxProps = {
    data: MerchantTransactionDTO;
  };

  const RenderAuthorizeTransaction = ({ data }: RenderAuthorizeTrxProps) => {
    switch (data.status) {
      case 'IDENTIFIED' as TransactionStatusEnum:
      case 'CREATED' as TransactionStatusEnum:
        return (
          <>
            <MenuItem
              data-testid="authorize-trx-button"
              onClick={() => setOpenAuthorizeTrxModal(true)}
            >
              {t('pages.initiativeDiscounts.detailTitle')}
            </MenuItem>
            <AuthorizeTransactionModal
              openAuthorizeTrxModal={openAuthorizeTrxModal}
              setOpenAuthorizeTrxModal={setOpenAuthorizeTrxModal}
              data={data}
            />
          </>
        );
      case 'REJECTED' as TransactionStatusEnum:
      default:
        return null;
    }
  };

  const RenderCancelTransaction = ({ initiativeId, status, trxId }: RenderCancelTrxProps) => {
    switch (status) {
      case 'AUTHORIZED' as TransactionStatusEnum:
      case 'AUTHORIZATION_REQUESTED' as TransactionStatusEnum:
      case 'IDENTIFIED' as TransactionStatusEnum:
      case 'CREATED' as TransactionStatusEnum:
      case 'REWARDED' as TransactionStatusEnum:
      case 'REJECTED' as TransactionStatusEnum:
      case 'CANCELLED' as TransactionStatusEnum:
      case 'REFUNDED' as TransactionStatusEnum:
      case 'INVOICED' as TransactionStatusEnum:
        return (
          <>
            <MenuItem data-testid="cancel-trx-button" onClick={() => setOpenCancelTrxModal(true)}>
              {t('pages.initiativeDiscounts.cancelDiscount')}
            </MenuItem>
            <CancelTransactionModal
              openCancelTrxModal={openCancelTrxModal}
              setOpenCancelTrxModal={setOpenCancelTrxModal}
              initiativeId={initiativeId}
              trxId={trxId}
              status={status}
            />
          </>
        );
    }
    return null;
  };

  return (
    <TableCell align="right" data-testid="tablecell-actions-menu">
      <IconButton
        id={`actions_button-${trxId}`}
        aria-controls={open ? `actions-menu_${trxId}` : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClickActionsMenu}
        data-testid="actions_button"
      >
        <MoreIcon color="primary" />
      </IconButton>
      <Menu
        id={`actions-menu_${trxId}`}
        anchorEl={anchorEl}
        open={open}
        onClose={handleCloseActionsMenu}
        MenuListProps={{
          'aria-labelledby': `actions_button-${trxId}`,
        }}
        data-testid="menu-close-test"
      >
        <RenderAuthorizeTransaction data={data} />
        <RenderCancelTransaction initiativeId={initiativeId} trxId={trxId} status={status} />
      </Menu>
    </TableCell>
  );
};

export default ActionMenu;
