import { Box, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import { MerchantDetailDTO, MerchantIbanPatchDTO } from "../../api/generated/merchants/data-contracts";
import { EditModal, EditModalProps } from "../../components/EditModal/EditModal";
import useScopedTranslation from "../../hooks/useScopedTranslation";

type Props = EditModalProps & {
  data?: MerchantDetailDTO & { onboardingDate: string }
  onUpdate: (data: MerchantIbanPatchDTO) => void
}

export const EditIbanModal = ({ isOpen, setIsOpen, onUpdate, data }: Props) => {
  const { t } = useScopedTranslation();
  const [error, setError] = useState<MerchantIbanPatchDTO>({});
  const [merchantData, setMerchantData] = useState<MerchantIbanPatchDTO>({});

  useEffect(() => setMerchantData({
    iban: data?.iban,
    ibanHolder: data?.ibanHolder
  }), [data]);

  const onIbanUpdate = async (merchantData: MerchantIbanPatchDTO) => {
    const isHolderEmpty = !merchantData?.ibanHolder;
    const isIbanEmpty = !merchantData?.iban;
    if (!isHolderEmpty && !isIbanEmpty) {
      const { iban, ibanHolder, ...rest } = error;
      setError(rest);
      onUpdate(merchantData);
    } else {
      const ibanError = isIbanEmpty ? { iban: 'pages.initiativeOverview.ibanModal.requiredField' } : {};
      const ibanHolderError = isHolderEmpty ? { ibanHolder: 'pages.initiativeOverview.ibanModal.requiredField' } : {};
      setError({ ...ibanError, ...ibanHolderError });
    }
  };

  return <EditModal
    isOpen={isOpen}
    setIsOpen={() => {
      setIsOpen(false);
      setError({});
    }}
    onSave={() => onIbanUpdate(merchantData)}
    title='pages.initiativeOverview.ibanModal.title'
    desciption='pages.initiativeOverview.ibanModal.description'
  >
    <Box display="flex" flexDirection="column" rowGap="1.5rem">
      <TextField
        defaultValue={data?.ibanHolder}
        label={t('pages.initiativeOverview.ibanModal.fieldHolder.placeholder')}
        variant='outlined'
        onBlur={() => {
          if (!merchantData?.ibanHolder) {
            const { ibanHolder, ...rest } = error;
            setError(rest);
          }
        }}
        onChange={(e) => {
          const { ibanHolder, ...rest } = error;
          setError(rest);
          setMerchantData({ ...merchantData, ibanHolder: e.target.value });
        }}
        error={!!error?.ibanHolder}
        helperText={error?.ibanHolder && t(error?.ibanHolder)}
      />
      <TextField
        defaultValue={data?.iban}
        label={t('pages.initiativeOverview.ibanModal.fieldIban.placeholder')}
        variant='outlined'
        onBlur={() => {
          if (!merchantData?.iban) {
            const { iban, ...rest } = error;
            setError(rest);
          }
        }}
        onChange={(e) => {
          const { iban, ...rest } = error;
          setError(rest);
          setMerchantData({ ...merchantData, iban: e.target.value });
        }}
        error={!!error?.iban}
        helperText={error?.iban && t(error?.iban)}
      />
    </Box>
  </EditModal>;
};