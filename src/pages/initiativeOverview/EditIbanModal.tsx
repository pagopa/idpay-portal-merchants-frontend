import { Box, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import { MerchantDetailDTO, MerchantIbanPatchDTO } from "../../api/generated/merchants/data-contracts";
import { EditModal, EditModalProps } from "../../components/EditModal/EditModal";
import useScopedTranslation from "../../hooks/useScopedTranslation";
import { isValidRegex, spaceRemover } from "../../helpers";
import { useInitiativeConfig } from "../../hooks/useInitiativeConfig";

type Props = EditModalProps & {
  data?: MerchantDetailDTO & { onboardingDate: string }
  onUpdate: (data: MerchantIbanPatchDTO, key: keyof MerchantIbanPatchDTO) => void
}

export const EditIbanModal = ({ isOpen, setIsOpen, onUpdate, data }: Props) => {
  const { t } = useScopedTranslation();
  const [error, setError] = useState<MerchantIbanPatchDTO>({});
  const [merchantData, setMerchantData] = useState<MerchantIbanPatchDTO>({});
  const { defaultConfig } = useInitiativeConfig();
  const ibanRegex = new RegExp(defaultConfig.regex.iban);
  const ibanHolderRegex = new RegExp(defaultConfig.regex.ibanHolder, "u");

  useEffect(() => setMerchantData({
    iban: data?.iban,
    ibanHolder: data?.ibanHolder
  }), [data, isOpen]);

  const onIbanUpdate = async (merchantData: MerchantIbanPatchDTO) => {
    const isHolderEmpty = !merchantData?.ibanHolder;
    const isIbanEmpty = !merchantData?.iban;
    if (!isHolderEmpty && !isIbanEmpty && !error?.iban && !error?.ibanHolder) {
      const { iban, ibanHolder, ...rest } = error;
      setError(rest);
      onUpdate({ ...merchantData, ibanHolder: merchantData?.ibanHolder?.replace(/\s+/g, ' ')}, 'iban');
    } else {
      const ibanError = isIbanEmpty || error?.iban ? { iban: error?.iban || 'pages.initiativeOverview.ibanModal.requiredField' } : {};
      const ibanHolderError = isHolderEmpty || error?.ibanHolder ? { ibanHolder: error?.ibanHolder || 'pages.initiativeOverview.ibanModal.requiredField' } : {};
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
        value={merchantData?.ibanHolder}
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
          const normalizedValue = e.target.value.trim();
          setMerchantData({ ...merchantData, ibanHolder: normalizedValue });
          if (!isValidRegex(normalizedValue, ibanHolderRegex)) {
            setError(prev => ({ ...prev, ibanHolder: 'pages.initiativeOverview.ibanModal.notValidIbanHolder' }));
          } else {
            const { ibanHolder, ...rest } = error;
            setError(rest);
          }
        }}
        error={!!error?.ibanHolder}
        helperText={error?.ibanHolder && t(error?.ibanHolder)}
      />
      <TextField
        value={merchantData?.iban}
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
          const normalizedValue = spaceRemover(e.target.value);
          setMerchantData({ ...merchantData, iban: normalizedValue });
          if (!isValidRegex(normalizedValue, ibanRegex)) {
            setError(prev => ({ ...prev, iban: 'pages.initiativeOverview.ibanModal.notValidIban' }));
          } else {
            const { iban, ...rest } = error;
            setError(rest);
          }
        }}
        error={!!error?.iban}
        helperText={error?.iban && t(error?.iban)}
      />
    </Box>
  </EditModal>;
};