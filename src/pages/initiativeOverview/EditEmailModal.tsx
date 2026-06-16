import { useState } from "react";
import { Box, TextField, Typography } from "@mui/material";
import { MerchantDetailDTO, MerchantIbanPatchDTO } from "../../api/generated/merchants/data-contracts";
import { EditModal, EditModalProps } from "../components/EditModal";
import useScopedTranslation from "../../hooks/useScopedTranslation";
import { isValidEmail } from "../../helpers";

type Props = EditModalProps & {
    data?: MerchantDetailDTO & { onboardingDate: string }
    onUpdate: () => void
    dataError: MerchantIbanPatchDTO & {draftEmail?: string}
    setDataError: (errors: MerchantIbanPatchDTO & {draftEmail?: string}) => void
    merchantData: MerchantIbanPatchDTO
    setMerchantData: (data: MerchantIbanPatchDTO) => void
}

export const EditEmailModal = ({isOpen, setIsOpen, dataError, setDataError, merchantData, setMerchantData, onUpdate, data}: Props) => {
  const [draftEmail, setDraftEmail] = useState<string | undefined>();
  const {t} = useScopedTranslation();

    const onEmailUpdate = async (merchantData: MerchantIbanPatchDTO) => {
      const isEqual = merchantData?.operativeEmail === draftEmail;
      const isEmpty = !merchantData?.operativeEmail;
      const isDraftEmpty = !draftEmail;
      if (isEqual && !isEmpty && !isDraftEmpty) {
        const { operativeEmail, draftEmail, ...rest } = dataError;
        setDataError(rest);
        onUpdate();
      } else {
        const dataError = isEmpty || !isEqual ? { operativeEmail: isEmpty ? 'pages.initiativeOverview.emailModal.requiredField' : 'pages.initiativeOverview.modal.notEqualEmail' } : {};
        const draftError = isDraftEmpty ? { draftEmail: 'pages.initiativeOverview.emailModal.requiredField' } : {};
        setDataError({ ...dataError, ...dataError, ...draftError });
      }
    };
    
    return <EditModal
        isOpen={isOpen}
        setIsOpen={() => {
          setIsOpen(false);
          setDataError({});
        }}
        onSave={() => onEmailUpdate(merchantData)}
        title='pages.initiativeOverview.emailModal.title'
        desciption='pages.initiativeOverview.emailModal.description'
      >
        <Box display="flex" flexDirection="column" rowGap="1.5rem">
          <Typography variant='h6'>
            {t('pages.initiativeOverview.emailModal.fieldInsert.label')}
          </Typography>
          <TextField
            defaultValue={data?.operativeEmail}
            label={t('pages.initiativeOverview.emailModal.fieldInsert.placeholder')}
            variant='outlined'
            error={!!dataError?.draftEmail}
            helperText={dataError?.draftEmail && t(dataError?.draftEmail)}
            onBlur={() => {
              if (!draftEmail) {
                const { draftEmail, ...rest } = dataError;
                setDataError(rest);
              }
            }}
            onChange={(e) => {
              setDraftEmail(e.target.value);
              if (!isValidEmail(e.target.value)) {
                setDataError({ ...dataError, draftEmail: 'pages.initiativeOverview.emailModal.notValidEmail' });
              } else {
                const { draftEmail, ...rest } = dataError;
                setDataError(rest);
              }
            }}
          />
          <Typography variant='h6'>
            {t('pages.initiativeOverview.emailModal.fieldConfirm.label')}
          </Typography>
          <TextField
            defaultValue={data?.operativeEmail}
            label={t('pages.initiativeOverview.emailModal.fieldConfirm.placeholder')}
            variant='outlined'
            onBlur={() => {
              if (!merchantData?.operativeEmail) {
                const { operativeEmail, ...rest } = dataError;
                setDataError(rest);
              }
            }}
            onChange={(e) => {
              setMerchantData({ ...merchantData, operativeEmail: e.target.value });
            }}
            error={!!dataError?.operativeEmail}
            helperText={dataError?.operativeEmail && t(dataError?.operativeEmail)}
          />
        </Box>
      </EditModal>;
};