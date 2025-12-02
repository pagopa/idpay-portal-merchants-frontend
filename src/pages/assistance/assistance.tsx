import { Box, Typography, Paper, FormControl, TextField, Divider, Button } from '@mui/material';
import { useTranslation, Trans } from 'react-i18next';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Fragment, useState, useEffect } from 'react';
import CheckIllustrationIcon from '@pagopa/selfcare-common-frontend/components/icons/CheckIllustrationIcon';
import useLoading from '@pagopa/selfcare-common-frontend/hooks/useLoading';
import { useHistory } from 'react-router-dom';
import ROUTES from '../../routes';
import { getInstitutionProductUserInfo, sendEmail } from '../../services/emailNotificationService';
import { ENV } from '../../utils/env';
import { EmailMessageDTO } from '../../api/generated/email-notification/EmailMessageDTO';
import ExitModal from '../../components/ExitModal/ExitModal';
import { useAlert } from '../../hooks/useAlert';

const Assistance = () => {
  const {setAlert} = useAlert();
  const { t } = useTranslation();
  const [openExitModal, setOpenExitModal] = useState(false);
  const handleOpenExitModal = () => setOpenExitModal(true);
  const handleCloseExitModal = () => setOpenExitModal(false);
  const [viewThxPage, setThxPage] = useState(false);
  const [senderEmail, setSenderEmail] = useState<string | undefined>('');
  const history = useHistory();
  const recipientEmail = ENV.ASSISTANCE.EMAIL;
  const setLoading = useLoading('GET_INSTITUTION_PROD_USER_INFO');

  useEffect(() => {
    setLoading(true);
    getInstitutionProductUserInfo()
      .then((res) => {
        setSenderEmail(res.email);
      })
      .catch(() => {
        setAlert({title: t('errors.genericTitle'), text: t('errors.genericDescription'), isOpen: true, severity: 'error'});
      })
      .finally(() => setLoading(false));
  }, []);

  const validationSchema = Yup.object().shape({
    assistanceSubject: Yup.string().required(t('validation.requiredField')),
    assistanceMessage: Yup.string()
      .required(t('validation.requiredField'))
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
        .catch(() => {
          setAlert({title: t('errors.genericTitle'), text: t('errors.genericDescription'), isOpen: true, severity: 'error'});
        })
        .finally(() => setLoading(false));
    },
  });

  return (
    <Box maxWidth='75%' justifySelf='center'>
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
                <Typography variant="h4">{t('pages.assistanceRequest.title')}</Typography>
              </Box>
              <Box sx={{ display: 'grid', gridColumn: 'span 12' }}>
                <Typography variant="body1">{t('pages.assistanceRequest.subtitle')}</Typography>
              </Box>
            </Box>

            <Paper sx={{ display: 'grid', gridColumn: 'span 12', gap: 3, my: 4, p: 3 }}>
              <FormControl>
                <TextField
                  label={t('pages.assistanceRequest.subject')}
                  placeholder={t('pages.assistanceRequest.subject')}
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
                  label={t('pages.assistanceRequest.message')}
                  placeholder={t('pages.assistanceRequest.message')}
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
                  {t('commons.sendBtn')}
                </Button>
              </Box>
            </Paper>
          </Box>
          <Box sx={{ display: 'grid', gridColumn: 'span 2' }}>
            <Button variant="outlined" onClick={handleOpenExitModal} data-testid="open-exit-test">
              {t('commons.backBtn')}
            </Button>
            <ExitModal
              title={t('pages.assistanceRequest.exitModalTitle')}
              subtitle={t('pages.assistanceRequest.exitModalBody')}
              openExitModal={openExitModal}
              handleCloseExitModal={handleCloseExitModal}
              backRoute={ROUTES.HOME}
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
                  <Trans i18nKey="pages.assistanceRequest.thankYouTitle">
                    Abbiamo ricevuto la tua <br /> richiesta
                  </Trans>
                ) as unknown as string
              }
            </Typography>
          </Box>
          <Box sx={{ display: 'grid', gridColumn: 'span 12' }}>
            <Typography variant="body1" sx={{ textAlign: 'center' }}>
              {t('pages.assistanceRequest.thankYouDescription')}
            </Typography>
          </Box>
          <Box sx={{ display: 'grid', gridColumn: 'span 12' }}>
            <Button
              variant="contained"
              onClick={() => history.replace(ROUTES.HOME)}
              data-testid="thankyouPageBackBtn-test"
            >
              {t('commons.closeBtn')}
            </Button>
          </Box>
        </Box>
      )}
    </Fragment>
    </Box>
  );
};

export default Assistance;
