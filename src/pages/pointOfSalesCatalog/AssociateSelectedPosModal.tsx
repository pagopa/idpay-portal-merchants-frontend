import React from 'react';
import { theme } from '@pagopa/mui-italia/theme';
import {
  Box,
  Button,
  ButtonProps,
  DialogContent,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from '@mui/material';
import { MIAlert } from '@pagopa/mui-italia';
import useScopedTranslation from '../../hooks/useScopedTranslation';
import DialogComponent from '../../components/Dialog/DialogComponent';

type InitiativeOption = {
  value: string;
  label: string;
};

type Props = {
  open: boolean;
  initiativeOptions: Array<InitiativeOption>;
  selectedInitiativeId: string;
  selectedStoresCount: number;
  isLoading: boolean;
  onClose: () => void;
  onInitiativeChange: (initiativeId: string) => void;
  onConfirm: () => void;
  copyKey?: 'associateModal' | 'excludeModal';
  confirmLabelKey?: string;
  confirmColor?: ButtonProps['color'];
  dataTestId?: string;
  titleId?: string;
};

const AssociateSelectedPosModal: React.FC<Props> = ({
  open,
  initiativeOptions,
  selectedInitiativeId,
  selectedStoresCount,
  isLoading,
  onClose,
  onInitiativeChange,
  onConfirm,
  copyKey = 'associateModal',
  confirmLabelKey = 'actions.confirm',
  confirmColor = 'primary',
  dataTestId = 'associate-selected-pos-modal',
  titleId = 'associate-selected-pos-modal-title',
}) => {
  const { t } = useScopedTranslation();
  const initiativeLabel = t(`pages.posCatalog.${copyKey}.initiativeLabel`);
  const selectLabelId = `${dataTestId}-initiative-label`;
  const errorConfirmSx =
    confirmColor === 'error'
      ? {
          '&.MuiButton-contained': {
            color: `${theme.palette.common.white} !important`,
            backgroundColor: `${theme.palette.error.main} !important`,
          },
          '&.MuiButton-contained:hover': {
            color: `${theme.palette.common.white} !important`,
            backgroundColor: `${theme.palette.error.dark} !important`,
          },
          '&.MuiButton-contained.Mui-disabled': {
            color: `${theme.palette.action.disabled} !important`,
            backgroundColor: `${theme.palette.action.disabledBackground} !important`,
          },
          '&:hover': {
            color: `${theme.palette.common.white} !important`,
            backgroundColor: `${theme.palette.error.dark} !important`,
          },
        }
      : undefined;

  return (
    <DialogComponent
      open={open}
      titleId={titleId}
      dataTestId={dataTestId}
      onClose={onClose}
      closeLabel={t('actions.close')}
      title={t(`pages.posCatalog.${copyKey}.title`, { count: selectedStoresCount })}
      description={t(`pages.posCatalog.${copyKey}.description`, {
        count: selectedStoresCount,
      })}
      paperSx={{
        width: { xs: 'calc(100% - 32px)', sm: 608 },
      }}
      actionsSx={{ px: 3.5, pb: 3.5, pt: 0 }}
      actions={
        <>
          <Button size="small" onClick={onClose}>
            {t('actions.cancel')}
          </Button>
          <Button
            size="small"
            variant="contained"
            color={confirmColor}
            sx={errorConfirmSx}
            onClick={onConfirm}
            disabled={!selectedInitiativeId || isLoading}
          >
            {t(confirmLabelKey, { count: selectedStoresCount })}
          </Button>
        </>
      }
    >
      <DialogContent sx={{ p: 3.5, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <FormControl fullWidth size="small" sx={{ mt: 2.5 }}>
          <InputLabel id={selectLabelId}>
            {initiativeLabel}{' '}
            <Box component="span" sx={{ color: theme.palette.error.main }}>
              *
            </Box>
          </InputLabel>
          <Select
            labelId={selectLabelId}
            value={selectedInitiativeId}
            label={initiativeLabel}
            onChange={(event) => onInitiativeChange(event.target.value)}
            sx={{
              '& .MuiSelect-select': {
                py: 1.25,
              },
            }}
          >
            {initiativeOptions.map((initiative) => (
              <MenuItem key={initiative.value} value={initiative.value}>
                {initiative.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <MIAlert severity="info" description={t(`pages.posCatalog.${copyKey}.infoBanner`)} />
      </DialogContent>
    </DialogComponent>
  );
};

export default AssociateSelectedPosModal;
