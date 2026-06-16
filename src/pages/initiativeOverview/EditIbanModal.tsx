import { Box, TextField } from "@mui/material";
import { MerchantDetailDTO, MerchantIbanPatchDTO } from "../../api/generated/merchants/data-contracts";
import { EditModal, EditModalProps } from "../components/EditModal";
import useScopedTranslation from "../../hooks/useScopedTranslation";

type Props = EditModalProps & {
    data?: MerchantDetailDTO & { onboardingDate: string }
    onUpdate: () => void
    dataError: MerchantIbanPatchDTO
    setDataError: (errors: MerchantIbanPatchDTO) => void
    merchantData: MerchantIbanPatchDTO
    setMerchantData: (data: MerchantIbanPatchDTO) => void
}

export const EditIbanModal = ({isOpen, setIsOpen, dataError, setDataError, merchantData, setMerchantData, onUpdate, data}: Props) => {
  const {t} = useScopedTranslation();

    const onIbanUpdate = async (merchantData: MerchantIbanPatchDTO) => {
      const isHolderEmpty = !merchantData?.ibanHolder;
      const isIbanEmpty = !merchantData?.iban;
      if (!isHolderEmpty && !isIbanEmpty) {
        const { iban, ibanHolder, ...rest } = dataError;
        setDataError(rest);
        onUpdate();
      } else {
        const ibanError = isIbanEmpty ? { iban: 'pages.initiativeOverview.ibanModal.requiredField' } : {};
        const ibanHolderError = isHolderEmpty ? { ibanHolder: 'pages.initiativeOverview.ibanModal.requiredField' } : {};
        setDataError({ ...ibanError, ...ibanHolderError });
      }
    };
    
    return <EditModal
        isOpen={isOpen}
        setIsOpen={() => {
          setIsOpen(false);
          setDataError({});
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
                const { ibanHolder, ...rest } = dataError;
                setDataError(rest);
              }
            }}
            onChange={(e) => {
              setMerchantData({ ...merchantData, ibanHolder: e.target.value });
            }}
            error={!!dataError?.ibanHolder}
            helperText={dataError?.ibanHolder && t(dataError?.ibanHolder)}
          />
          <TextField
            defaultValue={data?.iban}
            label={t('pages.initiativeOverview.ibanModal.fieldIban.placeholder')}
            variant='outlined'
            onBlur={() => {
              if (!merchantData?.iban) {
                const { iban, ...rest } = dataError;
                setDataError(rest);
              }
            }}
            onChange={(e) => {
              setMerchantData({ ...merchantData, iban: e.target.value });
            }}
            error={!!dataError?.iban}
            helperText={dataError?.iban && t(dataError?.iban)}
          />
        </Box>
      </EditModal>;
};