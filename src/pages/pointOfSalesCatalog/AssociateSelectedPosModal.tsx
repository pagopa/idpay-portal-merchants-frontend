import React from 'react';
import { theme } from '@pagopa/mui-italia/theme';
import {
  Box,
  Button,
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
}) => {
  const { t } = useScopedTranslation();

  return (
    <DialogComponent
      open={open}
      titleId="associate-selected-pos-modal-title"
      dataTestId="associate-selected-pos-modal"
      onClose={onClose}
      closeLabel={t('actions.close')}
      title={t('pages.posCatalog.associateModal.title', { count: selectedStoresCount })}
      description={t('pages.posCatalog.associateModal.description', {
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
            onClick={onConfirm}
            disabled={!selectedInitiativeId || isLoading}
          >
            {t('actions.confirm')}
          </Button>
        </>
      }
    >
      <DialogContent sx={{ p: 3.5, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <FormControl fullWidth size="small" sx={{ mt: 2.5 }}>
          <InputLabel id="associate-initiative-label">
            {t('pages.posCatalog.associateModal.initiativeLabel')}{' '}
            <Box component="span" sx={{ color: theme.palette.error.main }}>
              *
            </Box>
          </InputLabel>
          <Select
            labelId="associate-initiative-label"
            value={selectedInitiativeId}
            label={t('pages.posCatalog.associateModal.initiativeLabel')}
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

        <MIAlert severity="info" description={t('pages.posCatalog.associateModal.infoBanner')} />
      </DialogContent>
    </DialogComponent>
  );
};

export default AssociateSelectedPosModal;
