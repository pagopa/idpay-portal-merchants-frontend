import { Box, Typography, Paper, FormControl, TextField, Divider, Button } from '@mui/material';
import { useTranslation, Trans } from 'react-i18next';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Fragment, useState, useEffect } from 'react';
import CheckIllustrationIcon from '@pagopa/selfcare-common-frontend/components/icons/CheckIllustrationIcon';
import useErrorDispatcher from '@pagopa/selfcare-common-frontend/hooks/useErrorDispatcher';
import useLoading from '@pagopa/selfcare-common-frontend/hooks/useLoading';
import { useHistory } from 'react-router-dom';
import ROUTES from '../../routes';
import { getInstitutionProductUserInfo, sendEmail } from '../../services/emailNotificationService';
import { ENV } from '../../utils/env';
import { EmailMessageDTO } from '../../api/generated/email-notification/EmailMessageDTO';
import ExitModal from '../../components/ExitModal/ExitModal';

const Assistance = () => {
  const { t } = useTranslation();
  const [openExitModal, setOpenExitModal] = useState(false);
  const handleOpenExitModal = () => setOpenExitModal(true);
  const handleCloseExitModal = () => setOpenExitModal(false);
  const [viewThxPage, setThxPage] = useState(false);
  const [senderEmail, setSenderEmail] = useState<string | undefined>('');
  const history = useHistory();
  const addError = useErrorDispatcher();
  const recipientEmail = ENV.ASSISTANCE.EMAIL;
  const setLoading = useLoading('GET_INSTITUTION_PROD_USER_INFO');

  useEffect(() => {
    setLoading(true);
    getInstitutionProductUserInfo()
      .then((res) => {
        setSenderEmail(res.email);
      })
      .catch((error) => {
        addError({
          id: 'GET_INSTITUTIONAL_USER_EMAIL',
          blocking: false,
          error,
          techDescription: 'An error occurred getting institutional user email',
          displayableTitle: t('errors.genericTitle'),
          displayableDescription: t('errors.genericDescription'),
          toNotify: true,
          component: 'Toast',
          showCloseIcon: true,
        });
      })
      .finally(() => setLoading(false));
  }, []);

  const validationSchema = Yup.object().shape({
    assistanceSubject: Yup.string().required(t('validation.required')),
    assistanceMessage: Yup.string()
      .required(t('validation.required'))
      .max(500, t('validation.maxChars', { x: 500 })),
  });

  const formik = useFormik({
    initialValues: {
      assistanceSubject: '',
      assistanceEmailFrom: senderEmail,
      assistanceMessage: '',
    },
    enableReinitialize: true,
    validationSchema,
    onSubmit: (values) => {
      const body: EmailMessageDTO = {
        subject: values.assistanceSubject,
        content: values.assistanceMessage,
        senderEmail: values.assistanceEmailFrom,
        recipientEmail,
      };
      setLoading(true);
      sendEmail(body)
        .then(() => setThxPage(true))
        .catch((error) => {
          addError({
            id: 'SEND_ASSISTENCE_EMAIL',
            blocking: false,
            error,
            techDescription: 'An error occurred sending assistance email',
            displayableTitle: t('errors.genericTitle'),
            displayableDescription: t('errors.genericDescription'),
            toNotify: true,
            component: 'Toast',
            showCloseIcon: true,
          });
        })
        .finally(() => setLoading(false));
    },
  });

  return (
    <Fragment>
      {!viewThxPage ? (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(12, 1fr)',
            gridTemplateRows: 'auto',
            width: '100%',
            minWidth: 700,
            alignContent: 'start',
            justifyContent: 'space-between',
            py: 2,
          }}
        >
          <Box sx={{ display: 'grid', gridColumn: 'span 12' }}>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(12, 1fr)',
                gap: 2,
              }}
            >
              <Box sx={{ display: 'grid', gridColumn: 'span 12' }}>
                <Typography variant="h4">{t('pages.assistance.title')}</Typography>
              </Box>
              <Box sx={{ display: 'grid', gridColumn: 'span 12' }}>
                <Typography variant="body1">{t('pages.assistance.subtitle')}</Typography>
              </Box>
            </Box>

            <Paper sx={{ display: 'grid', gridColumn: 'span 12', gap: 3, my: 4, p: 3 }}>
              <FormControl>
                <TextField
                  label={t('pages.assistance.form.subject')}
                  placeholder={t('pages.assistance.form.subject')}
                  name="assistanceSubject"
                  aria-label="assistanceSubject"
                  role="input"
                  required={true}
                  InputLabelProps={{ required: false }}
                  value={formik.values.assistanceSubject}
                  onChange={(e) => formik.handleChange(e)}
                  error={
                    formik.touched.assistanceSubject && Boolean(formik.errors.assistanceSubject)
                  }
                  helperText={
                    (formik.touched.assistanceSubject && formik.errors.assistanceSubject) ||
                    t('validation.assistanceSubject')
                  }
                  size="small"
                  data-testid="assistanceSubject-test"
                />
              </FormControl>
              <FormControl>
                <TextField
                  name="assistanceEmailFrom"
                  aria-label="assistanceEmailFrom"
                  role="input"
                  required={true}
                  disabled={true}
                  InputLabelProps={{ required: false }}
                  value={formik.values.assistanceEmailFrom}
                  size="small"
                  data-testid="assistanceEmailFrom-test"
                />
              </FormControl>
              <FormControl>
                <TextField
                  multiline
                  minRows={3}
                  maxRows={4}
                  label={t('pages.assistance.form.message')}
                  placeholder={t('pages.assistance.form.message')}
                  name="assistanceMessage"
                  aria-label="assistanceMessage"
                  data-testid="assistanceMessage-test"
                  role="input"
                  value={formik.values.assistanceMessage}
                  onChange={(e) => formik.handleChange(e)}
                  error={
                    formik.touched.assistanceMessage && Boolean(formik.errors.assistanceMessage)
                  }
                  helperText={
                    (formik.touched.assistanceMessage && formik.errors.assistanceMessage) ||
                    t('validation.maxChars', { x: 500 })
                  }
                  required={true}
                  InputLabelProps={{ required: false }}
                  size="small"
                />
              </FormControl>
              <Divider />
              <Box>
                <Button
                  variant="contained"
                  onClick={() => formik.handleSubmit()}
                  data-testid="sendAssistenceRequest-test"
                  disabled={!formik.dirty || !formik.isValid}
                >
                  {t('pages.assistance.form.sendBtn')}
                </Button>
              </Box>
            </Paper>
          </Box>
          <Box sx={{ display: 'grid', gridColumn: 'span 2' }}>
            <Button variant="outlined" onClick={handleOpenExitModal} data-testid="open-exit-test">
              {t('commons.backBtn')}
            </Button>
            <ExitModal
              title={t('pages.assistance.exitModal.title')}
              subtitle={t('pages.assistance.exitModal.body')}
              openExitModal={openExitModal}
              handleCloseExitModal={handleCloseExitModal}
            />
          </Box>
        </Box>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(12, 1fr)',
            gridTemplateRows: 'auto',
            width: '100%',
            minWidth: 700,
            alignContent: 'center',
            justifyContent: 'space-between',
            justifyItems: 'center',
            py: 2,
            gap: 3,
          }}
          data-testid="thx-page-test"
        >
          <Box sx={{ display: 'grid', gridColumn: 'span 12' }}>
            <CheckIllustrationIcon sx={{ width: '70px', height: '70px' }} />
          </Box>
          <Box sx={{ display: 'grid', gridColumn: 'span 12' }}>
            <Typography variant="h4" sx={{ textAlign: 'center' }}>
              {
                (
                  <Trans i18nKey="pages.thankyouPage.title">
                    Abbiamo ricevuto la tua <br /> richiesta
                  </Trans>
                ) as unknown as string
              }
            </Typography>
          </Box>
          <Box sx={{ display: 'grid', gridColumn: 'span 12' }}>
            <Typography variant="body1" sx={{ textAlign: 'center' }}>
              {t('pages.thankyouPage.description')}
            </Typography>
          </Box>
          <Box sx={{ display: 'grid', gridColumn: 'span 12' }}>
            <Button
              variant="contained"
              onClick={() => history.replace(ROUTES.HOME)}
              data-testid="thankyouPageBackBtn-test"
            >
              {t('pages.thankyouPage.buttonLabel')}
            </Button>
          </Box>
        </Box>
      )}
    </Fragment>
  );
};

export default Assistance;
