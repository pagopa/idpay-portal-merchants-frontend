import { Box, Button, Typography } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import {
  PointOfSaleDTO,
  PointOfSaleUpdateDTO,
  ValidationErrorDetail,
} from '../../api/generated/merchants/data-contracts';
import ModalComponent from '../../components/modal/ModalComponent';
import PointsOfSaleForm, {
  FormAlertMessages,
  FormErrors,
} from '../../components/pointsOfSaleForm/PointsOfSaleForm';
import useScopedTranslation from '../../hooks/useScopedTranslation';
import { updatePointOfSale } from '../../services/merchantService';
import { useAlert } from '../../hooks/useAlert';

interface Props {
  open: boolean;
  initiativeId: string;
  merchantId: string;
  pointOfSale: PointOfSaleDTO;
  onClose: () => void;
  onSuccess: () => void;
}

const EDITABLE_POS_FIELDS: Array<keyof PointOfSaleDTO> = [
  'type',
  'address',
  'streetNumber',
  'city',
  'zipCode',
  'region',
  'province',
  'website',
  'channelEmail',
  'channelPhone',
  'channelGeolink',
];

const FIELD_VALIDATION_CODES = new Set([
  'VALIDATION_ERROR',
  'POS_ALREADY_REGISTERED_OTHER_INITIATIVE',
  'PHYSICAL_POS_ALREADY_REGISTERED',
  'ONLINE_POS_ALREADY_REGISTERED',
]);

const getValidationMessage = (code?: string, fallback?: string) => {
  switch (code) {
    case 'POS_ALREADY_REGISTERED_OTHER_INITIATIVE':
      return 'Questo punto vendita è già registrato in un’altra iniziativa';
    case 'PHYSICAL_POS_ALREADY_REGISTERED':
    case 'ONLINE_POS_ALREADY_REGISTERED':
      return 'Questo punto vendita risulta già associato';
    default:
      return fallback ?? 'Verifica i dati inseriti';
  }
};

const EditPointOfSaleModal = ({
  open,
  merchantId,
  pointOfSale,
  onClose,
  onSuccess,
}: Props) => {
  const { t } = useScopedTranslation();
  const { setAlert } = useAlert();
  const editablePointOfSale = useMemo(
    () => ({
      ...pointOfSale,
      franchiseName: pointOfSale.franchiseName ?? '',
      address: pointOfSale.address ?? '',
      streetNumber: pointOfSale.streetNumber ?? '',
      city: pointOfSale.city ?? '',
      zipCode: pointOfSale.zipCode ?? '',
      region: pointOfSale.region ?? '',
      province: pointOfSale.province ?? '',
      website: pointOfSale.website ?? '',
      channelGeolink: pointOfSale.channelGeolink ?? '',
      channelPhone: pointOfSale.channelPhone ?? '',
      channelEmail: pointOfSale.channelEmail ?? '',
      contactName: pointOfSale.contactName ?? '',
      contactSurname: pointOfSale.contactSurname ?? '',
      contactEmail: pointOfSale.contactEmail ?? '',
    }),
    [pointOfSale]
  );
  const initialSalesPoints = useMemo(() => [editablePointOfSale], [editablePointOfSale]);
  const [salesPoints, setSalesPoints] = useState<Array<PointOfSaleDTO>>(initialSalesPoints);
  const [isFormValid, setIsFormValid] = useState(false);
  const [isFormDirty, setIsFormDirty] = useState(false);
  const [submitAttempt, setSubmitAttempt] = useState(0);
  const [errors, setErrors] = useState<FormErrors>({});
  const [alertMessages, setAlertMessages] = useState<FormAlertMessages>({});

  const hasFormChanges = (updatedPoint?: PointOfSaleDTO) => {
    if (!updatedPoint) {
      return false;
    }

    return EDITABLE_POS_FIELDS.some((field) => (updatedPoint[field] ?? '') !== (editablePointOfSale[field] ?? ''));
  };

  useEffect(() => {
    if (open) {
      setSalesPoints(initialSalesPoints);
      setIsFormDirty(false);
      setSubmitAttempt(0);
      setErrors({});
      setAlertMessages({});
    }
  }, [open, initialSalesPoints]);

  const handleClose = () => {
    setErrors({});
    setAlertMessages({});
    onClose();
  };

  const handleFormChange = (values: Array<PointOfSaleDTO>) => {
    const changedPoint = values[0];
    const nextPoint = {
      ...editablePointOfSale,
      ...changedPoint,
      address: changedPoint?.address || editablePointOfSale.address,
      streetNumber: changedPoint?.streetNumber || editablePointOfSale.streetNumber,
    };

    setSalesPoints([nextPoint]);
    setIsFormDirty(hasFormChanges(nextPoint));
    setErrors({});
    setAlertMessages({});
  };

  const handleSubmit = async () => {
    setSubmitAttempt((attempt) => attempt + 1);
    await new Promise((resolve) => setTimeout(resolve, 50));
    if (!isFormValid || !salesPoints[0]) {
      return;
    }

    let result: Awaited<ReturnType<typeof updatePointOfSale>>;
    try {
      const updatedPoint = salesPoints[0];
      if (!updatedPoint.id) {
        throw new Error('Point of sale id missing');
      }

      const updatePayload: PointOfSaleUpdateDTO =
        updatedPoint.type === 'ONLINE'
          ? { website: updatedPoint.website ?? '' }
          : {
              region: updatedPoint.region ?? '',
              province: updatedPoint.province ?? '',
              city: updatedPoint.city ?? '',
              zipCode: updatedPoint.zipCode ?? '',
              address: updatedPoint.address ?? '',
              streetNumber: updatedPoint.streetNumber ?? '',
              website: updatedPoint.website ?? '',
              channelEmail: updatedPoint.channelEmail ?? '',
              channelPhone: updatedPoint.channelPhone ?? '',
              channelGeolink: updatedPoint.channelGeolink ?? '',
            };

      result = await updatePointOfSale(merchantId, updatedPoint.id, updatePayload);
    } catch {
      setAlert({
        title: t('errors.genericTitle'),
        text: t('errors.genericDescription'),
        isOpen: true,
        severity: 'error',
      });
      return;
    }
    if (result && 'code' in result) {
      const validationResult = result as {
        errors?: Array<ValidationErrorDetail>;
        details?: Array<ValidationErrorDetail>;
        code?: string;
        message?: string;
      };
      const details = validationResult.errors ?? validationResult.details ?? [];
      const isFieldValidationError =
        details.length > 0 ||
        (validationResult.code !== undefined && FIELD_VALIDATION_CODES.has(validationResult.code));

      if (!isFieldValidationError) {
        setAlert({
          title: t('errors.genericTitle'),
          text: t('errors.genericDescription'),
          isOpen: true,
          severity: 'error',
        });
        return;
      }

      const nextErrors = details.reduce<FormErrors>((acc, detail) => {
        const field = detail.field ?? (salesPoints[0].type === 'ONLINE' ? 'website' : 'address');
        return {
          ...acc,
          0: { ...acc[0], [field]: getValidationMessage(detail.code) },
        };
      }, {});
      setErrors(nextErrors);
      setAlertMessages({
        0: getValidationMessage(validationResult.code, validationResult.message),
      });
      return;
    }

    handleClose();
    setAlert({
      text: t('pages.initiativeStores.pointOfSaleChangeSuccess'),
      isOpen: true,
      severity: 'success',
    });
    onSuccess();
  };

  return (
    <ModalComponent
      open={open}
      onClose={handleClose}
      className="point-of-sale-modal"
      style={{
        width: 'min(60vw, calc(100vw - 48px))',
        height: 'auto',
        maxHeight: 'calc(100vh - 48px)',
        overflow: 'hidden',
        overflowX: 'hidden',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
        p: 3,
      }}
    >
      <Typography variant="h6">Modifica dati punto vendita</Typography>
      <Typography variant="body1" my={0.5}>
        {t('pages.initiativeStores.modalUpdatePosDescription')}
      </Typography>
      <Box
        sx={{
          minWidth: 0,
          minHeight: 0,
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          pr: 0.5,
          '& .MuiTextField-root': {
            marginTop: '6px !important',
            marginBottom: '4px !important',
          },
          '& .MuiAutocomplete-root .MuiFormControl-root': {
            marginTop: '6px !important',
          },
        }}
      >
        <PointsOfSaleForm
          pointsOfSaleLoaded={open}
          initialSalesPoints={initialSalesPoints}
          editMode
          submitAttempt={submitAttempt}
          externalErrors={errors}
          externalAlertMessages={alertMessages}
          onFormChange={handleFormChange}
          onValidationChange={setIsFormValid}
        />
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, mt: 1 }}>
        <Button variant="outlined" onClick={handleClose}>
          {t('actions.cancel')}
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          data-testid="update-point-of-sale-button"
          disabled={!isFormDirty}
        >
          {t('actions.modify')}
        </Button>
      </Box>
    </ModalComponent>
  );
};

export default EditPointOfSaleModal;

