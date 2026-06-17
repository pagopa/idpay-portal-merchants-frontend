import { useState } from "react";
import { Box, TextField, Typography } from "@mui/material";
import { MerchantDetailDTO, MerchantIbanPatchDTO } from "../../api/generated/merchants/data-contracts";
import { EditModal, EditModalProps } from "../../components/EditModal/EditModal";
import useScopedTranslation from "../../hooks/useScopedTranslation";
import { isValidEmail } from "../../helpers";

type Props = EditModalProps & {
    data?: MerchantDetailDTO & { onboardingDate: string }
    onUpdate: (data: MerchantIbanPatchDTO) => void
}

export const EditEmailModal = ({isOpen, setIsOpen, onUpdate, data}: Props) => {
  const [draftEmail, setDraftEmail] = useState<string | undefined>(data?.operativeEmail);
  const [error, setError] = useState<MerchantIbanPatchDTO & { draftEmail?: string }>({});
  const [merchantData, setMerchantData] = useState<MerchantIbanPatchDTO>({operativeEmail: data?.operativeEmail});
  const {t} = useScopedTranslation();

    const onEmailUpdate = async (merchantData: MerchantIbanPatchDTO) => {
      const isEqual = merchantData?.operativeEmail === draftEmail;
      const isEmpty = !merchantData?.operativeEmail;
      const isDraftEmpty = !draftEmail;
      if (isEqual && !isEmpty && !isDraftEmpty && !error?.draftEmail) {
        const { operativeEmail, draftEmail, ...rest } = error;
        setError(rest);
        onUpdate(merchantData);
      } else {
        const dataError = isEmpty || !isEqual ? { operativeEmail: isEmpty ? 'pages.initiativeOverview.emailModal.requiredField' : 'pages.initiativeOverview.emailModal.notEqualEmail' } : {};
        const draftError = isDraftEmpty ? { draftEmail: 'pages.initiativeOverview.emailModal.requiredField' } : {};
        setError({ ...dataError, ...(!error?.draftEmail ? draftError : error) });
      }
    };
    
    return <EditModal
        isOpen={isOpen}
        setIsOpen={() => {
          setIsOpen(false);
          setError({});
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
            error={!!error?.draftEmail}
            helperText={error?.draftEmail && t(error?.draftEmail)}
            onBlur={() => {
              if (!draftEmail) {
                const { draftEmail, ...rest } = error;
                setError(rest);
              }
            }}
            onChange={(e) => {
              setDraftEmail(e.target.value);
              if (!isValidEmail(e.target.value)) {
                setError({ ...error, draftEmail: 'pages.initiativeOverview.emailModal.notValidEmail' });
              } else {
                const { draftEmail, ...rest } = error;
                setError(rest);
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
                const { operativeEmail, ...rest } = error;
                setError(rest);
              }
            }}
            onChange={(e) => {
              const { operativeEmail, ...rest } = error;
              setError(rest);
              setMerchantData({ ...merchantData, operativeEmail: e.target.value });
            }}
            error={!!error?.operativeEmail}
            helperText={error?.operativeEmail && t(error?.operativeEmail)}
          />
        </Box>
      </EditModal>;
};