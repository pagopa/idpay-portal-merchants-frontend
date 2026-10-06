import { Box, Typography } from '@mui/material';
import { useMemo, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { theme } from '@pagopa/mui-italia/theme';
import routes from '../../routes';
import CustomChip from '../Chip/CustomChip';
import { downloadInvoiceFile } from '../../services/merchantService';
import { useStore } from '../../pages/initiativeStores/StoreContext';
import { useAlert } from '../../hooks/useAlert';
import { useUserPermissions, PERMISSION_KEYS } from '../../hooks/useUserPermissions';
import DetailDrawer, { DetailDrawerProps } from '../Drawer/DetailDrawer';
import {
  DrawerFileButton,
  DrawerLabeledValue,
  getDetailValueText,
} from '../Drawer/detailDrawerShared';
import { isReversableOrEditable } from '../../helpers';
import getStatus from './useStatus';

type Props = DetailDrawerProps & {
  itemValues: any;
  listItem: Array<any>;
};

export default function TransactionDetail({ itemValues, listItem, ...rest }: Props) {
  const { setAlert } = useAlert();
  const { storeId } = useStore();
  const history = useHistory();

  const { initiative_id: merchantId } = useParams<{ initiative_id: string }>();
  const [isLoading, setIsLoading] = useState(false);
  const { isActionDisabled } = useUserPermissions();
  const isModifyDocDisabled = isActionDisabled(PERMISSION_KEYS.TRANSACTION_MODIFY_DOC);
  const isReverseDisabled = isActionDisabled(PERMISSION_KEYS.TRANSACTION_REVERSE);

  const editButton: DetailDrawerProps['buttons'] = useMemo(
    () =>
      isReversableOrEditable(itemValues)
        ? [
            {
              variant: 'contained',
              title: 'Modifica documento',
              dataTestId: 'change-file-btn',
              disabled: isModifyDocDisabled,
              onClick: () => {
                const docNumber = itemValues?.invoiceFile?.docNumber;
                const path = routes.MODIFY_DOCUMENT.replace(':initiative_id', merchantId)
                  .replace(':pointOfSaleId', storeId)
                  .replace(':trxId', itemValues.id)
                  .replace(':fileDocNumber', docNumber ? window.btoa(docNumber) : '-');

                history.push(path, { fromLocation: history.location });
              },
            },
          ]
        : [],
    [
      isReversableOrEditable,
      itemValues?.id,
      itemValues?.invoiceFile?.docNumber,
      history,
      isModifyDocDisabled,
    ]
  );

  const reverseButton: DetailDrawerProps['buttons'] = useMemo(
    () =>
      isReversableOrEditable(itemValues)
        ? [
            {
              title: 'Storna',
              dataTestId: 'reverse-btn',
              disabled: isReverseDisabled,
              onClick: () => {
                const path = routes.REVERSE.replace(':initiative_id', merchantId)
                  .replace(':pointOfSaleId', storeId)
                  .replace(':trxId', itemValues.id);
                history.push(path, { fromLocation: history.location });
              },
            },
          ]
        : [],
    [
      isReversableOrEditable,
      itemValues?.id,
      itemValues?.invoiceFile?.docNumber,
      history,
      isReverseDisabled,
    ]
  );

  const getStatusChip = () => {
    const chipItem = getStatus(itemValues.status);
    return <CustomChip label={chipItem?.label} colorChip={chipItem?.color} sizeChip="small" />;
  };
  const downloadFile = async (selectedTransaction: any, pointOfSaleId: string) => {
    setIsLoading(true);
    try {
      const response = await downloadInvoiceFile(
        merchantId,
        selectedTransaction?.id,
        pointOfSaleId
      );
      const { invoiceUrl } = response;
      const filename = selectedTransaction?.invoiceFile?.filename || 'fattura.pdf';

      const link = document.createElement('a');
      // eslint-disable-next-line functional/immutable-data
      link.href = invoiceUrl;
      // eslint-disable-next-line functional/immutable-data
      link.download = filename;
      link.click();
      setIsLoading(false);
    } catch (error) {
      setAlert({
        title: 'Errore download file',
        text: 'Non è stato possibile scaricare il file',
        isOpen: true,
        severity: 'error',
        containerStyle: {
          height: 'fit-content',
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: '1300',
        },
        contentStyle: { position: 'unset', bottom: '0', right: '0' },
      });
      setIsLoading(false);
    }
  };

  return (
    <DetailDrawer
      {...rest}
      data-testid="transaction-detail"
      buttons={[...editButton, ...reverseButton]}
    >
      {listItem.map((item, index) => {
        const displayValue = getDetailValueText(itemValues, item?.id, item?.type);

        return (
          <DrawerLabeledValue
            key={`${item?.id}-${index}`}
            label={item?.label}
            value={displayValue}
            boxSx={{ minWidth: 0 }}
          />
        );
      })}
      <Box>
        <Typography
          variant="body2"
          fontWeight={theme.typography.fontWeightRegular}
          color={theme.palette.text.secondary}
        >
          Stato
        </Typography>
        {getStatusChip()}
      </Box>
      {itemValues.status !== 'CANCELLED' && (
        <>
          <DrawerLabeledValue
            label={itemValues.status === 'REFUNDED' ? 'Numero nota di credito' : 'Numero fattura'}
            value={itemValues?.invoiceFile?.docNumber}
          />
          <DrawerFileButton
            label={itemValues.status === 'REFUNDED' ? 'Nota di credito' : 'Fattura'}
            filename={itemValues?.invoiceFile?.filename}
            isLoading={isLoading}
            onClick={() => downloadFile(itemValues, storeId)}
            contentSx={{ textAlign: 'left' }}
            iconSx={{ mt: 2 }}
            fileNameSx={{ marginTop: 2 }}
          />
        </>
      )}
    </DetailDrawer>
  );
}
