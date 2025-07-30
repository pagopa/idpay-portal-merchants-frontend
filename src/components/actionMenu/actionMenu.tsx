import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { IconButton, Menu, MenuItem, TableCell } from '@mui/material';
import MoreIcon from '@mui/icons-material/MoreVert';
import CancelTransactionModal from '../../pages/initiativeDiscounts/CancelTransactionModal';
import {
  MerchantTransactionDTO,
  StatusEnum as TransactionStatusEnum,
} from '../../api/generated/merchants/MerchantTransactionDTO';
import AuthorizeTransactionModal from '../../pages/initiativeDiscounts/AuthorizeTransactionModal';

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
  const { t } = useTranslation();

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
      case TransactionStatusEnum.IDENTIFIED:
      case TransactionStatusEnum.CREATED:
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
      case TransactionStatusEnum.REJECTED:
      default:
        return null;
    }
  };

  const RenderCancelTransaction = ({ initiativeId, status, trxId }: RenderCancelTrxProps) => {
    switch (status) {
      case TransactionStatusEnum.AUTHORIZED:
      case TransactionStatusEnum.AUTHORIZATION_REQUESTED:
      case TransactionStatusEnum.IDENTIFIED:
      case TransactionStatusEnum.CREATED:
      case TransactionStatusEnum.REJECTED:
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