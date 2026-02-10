import { Box, Typography, Link, Stack, Button, Alert, TextField } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { TitleBox } from '@pagopa/selfcare-common-frontend';
import { theme } from '@pagopa/mui-italia';
import { SingleFileInput } from '@pagopa/mui-italia';
import { useState, useRef, useEffect } from 'react';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import { useParams, useHistory } from 'react-router-dom';
import ROUTES from '../../routes';
import AlertComponent from '../../components/Alert/AlertComponent';
import BreadcrumbsBoxUpload from '../components/BreadcrumbsBoxUpload';

interface BreadcrumbsProps {
  label: string;
  path: string;
}

interface FileUploadActionProps {
  titleKey: string;
  subtitleKey: string;
  i18nBlockKey: string;
  apiCall: (trxId: string, file: File, docNumber: string) => Promise<unknown>;
  successStateKey: string;
  breadcrumbsLabelKey: string;
  breadcrumbsProp: BreadcrumbsProps;
  manualLink: string;
  styleClass?: string;
  docNumberTitle: string;
  docNumberInsert: string;
  docNumberLabel: string;
}

const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024;
const VALID_MIME_TYPES = ['application/pdf', 'application/xml', 'text/xml'];

const FileUploadAction: React.FC<FileUploadActionProps> = ({
  titleKey,
  subtitleKey,
  i18nBlockKey,
  apiCall,
  successStateKey,
  // breadcrumbsLabelKey,
  breadcrumbsProp,
  manualLink,
  docNumberTitle,
  docNumberInsert,
  docNumberLabel,
  styleClass,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [requiredFileError, setRequiredFileError] = useState<boolean>(false);
  const [docNumber, setDocNumber] = useState<string>('');
  const [docNumberError, setDocNumberError] = useState<boolean>(false);
  const [fileSizeError, setFileSizeError] = useState<boolean>(false);
  const [fileTypeError, setFileTypeError] = useState<boolean>(false);
  const [loadingFile, setLoadingFile] = useState<boolean>(false);
  const [errorAlert, setErrorAlert] = useState({ isOpen: false, message: '' });
  const [inputKey, setInputKey] = useState<number>(0);
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { trxId, fileDocNumber } = useParams<{
    trxId: string;
    fileDocNumber: string;
  }>();

  const history = useHistory();

  useEffect(() => {
    if (fileDocNumber) {
      setDocNumber(atob(fileDocNumber));
    }
  }, [fileDocNumber]);

  useEffect(() => {
    if (errorAlert.isOpen) {
      const timer = setTimeout(() => {
        setErrorAlert({ isOpen: false, message: '' });
      }, 5000);
      return () => clearTimeout(timer);
    }

    return undefined;
  }, [errorAlert.isOpen]);

  const handleFileSelect = (selectedFile: File) => {
    if (selectedFile) {
      setRequiredFileError(false);
    }
    if (!VALID_MIME_TYPES.includes(selectedFile.type)) {
      setFileTypeError(true);
      setFile(null);
      return;
    }
    if (selectedFile.size <= MAX_FILE_SIZE_BYTES) {
      setFile(selectedFile);
      setFileSizeError(false);
      setFileTypeError(false);
    } else {
      setFileSizeError(true);
      setFileTypeError(false);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      // eslint-disable-next-line functional/immutable-data
      fileInputRef.current.value = '';
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleAction = async (): Promise<void> => {
    if (!file) {
      setRequiredFileError(true);
      setFileSizeError(false);
      setFileTypeError(false);
      return;
    }
    if (!docNumber || docNumber === '' || docNumber.trim().length < 2) {
      setDocNumberError(true);
      return;
    }
    if (file && trxId && docNumber.trim() && docNumber.trim().length >= 2) {
      setLoadingFile(true);
      try {
        await apiCall(trxId, file, docNumber);
        setLoadingFile(false);
        history.push(breadcrumbsProp?.path, {
          [successStateKey]: true,
        });
      } catch (error: unknown) {
        let errorResponseCode: string | undefined;

        if (
          typeof error === 'object' &&
          error !== null &&
          'response' in error &&
          typeof (error as any).response === 'object'
        ) {
          errorResponseCode = (error as any).response?.data?.code;
        }

        let errorMessage = t('pages.reverse.errorAlert');

        if (errorResponseCode === 'REWARD_BATCH_STATUS_NOT_ALLOWED') {
          errorMessage = t('pages.reverse.deniedSentError');
        } else if (errorResponseCode === 'REWARD_BATCH_ALREADY_SENT') {
          errorMessage = t('pages.reverse.alreadySentError');
        }

        console.error('API Error:', error);
        setErrorAlert({ isOpen: true, message: errorMessage });
        setLoadingFile(false);
      }
    }
  };

  const handleBackNavigation = () => {
    // history.push(breadcrumbsProp?.path);
    history.push(ROUTES.REFUND_REQUESTS);
  };

  const handleDocNumberChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.value.length <= 100) {
      setDocNumber(event.target.value);
    }
  };

  return (
    <>
      <Box p={4} maxWidth="75%" justifySelf="center">
        <BreadcrumbsBoxUpload
          backLabel={t('commons.exitBtn')}
          /* items={[
            { label: breadcrumbsProp?.label, path: breadcrumbsProp?.path },
            { label: breadcrumbsLabelKey, path: ROUTES.REFUND_REQUESTS },
          ]}
            */
          items={[]}
          active={true}
          // onClickBackButton={() => history.push(breadcrumbsProp?.path)}
          onClickBackButton={() => history.push(ROUTES.REFUND_REQUESTS)}
        />
        <TitleBox
          title={t(titleKey)}
          mtTitle={3}
          variantTitle="h4"
          subTitle={t(subtitleKey)}
          variantSubTitle="body2"
        />
        <Box
          mt={3}
          py={3}
          px={4}
          sx={{ backgroundColor: theme.palette.background.paper }}
          borderRadius={'4px'}
        >
          <Box mb={3}>
            <Typography mt={2} variant="h6" fontWeight={theme.typography.fontWeightBold}>
              {docNumberTitle}
            </Typography>
          </Box>
          <Box mt={2}>
            <Typography variant="body2" fontWeight={theme.typography.fontWeightMedium}>
              {docNumberInsert}
            </Typography>
          </Box>
          <TextField
            variant="outlined"
            fullWidth
            value={docNumber}
            onChange={handleDocNumberChange}
            onBlur={() => {
              // eslint-disable-next-line @typescript-eslint/no-unused-expressions
              !docNumber || docNumber === '' || docNumber.trim().length < 2
                ? setDocNumberError(true)
                : setDocNumberError(false);
            }}
            label={docNumberLabel}
            size="small"
            sx={{
              mt: 2,
              '& .MuiFormLabel-root.Mui-error': {
                color: '#5C6E82 !important',
              },
            }}
            error={docNumberError}
            helperText={
              docNumberError && docNumber === ''
                ? t('validation.requiredField')
                : docNumberError && docNumber?.trim().length < 2
                ? 'Lunghezza minima 2 caratteri'
                : ''
            }
          />
        </Box>

        <Box
          sx={{
            backgroundColor: theme.palette.background.paper,
            borderRadius: '4px',
            minWidth: { lg: '1000px' },
          }}
          mt={4}
          p={3}
          className={styleClass}
        >
          <Typography variant="h6" fontWeight={theme.typography.fontWeightBold}>
            {t(`${i18nBlockKey}.creditNote`)}
          </Typography>
          <Typography variant="body2" mt={4} mb={1} sx={{ marginTop: '32px !important' }}>
            {t(`${i18nBlockKey}.creditNoteSubtitle`)}
          </Typography>
          <Link
            onClick={() => window.open(manualLink || '', '_blank')}
            sx={{
              cursor: 'pointer',
              fontWeight: theme.typography.fontWeightMedium,
              fontSize: '14px',
            }}
          >
            {t(`${i18nBlockKey}.manualLink`)}
          </Link>
          {fileSizeError && (
            <Box mt={2}>
              <Alert data-testid="alert" severity="error">
                {t(`commons.fileSizeError`)}
              </Alert>
            </Box>
          )}
          {fileTypeError && (
            <Box data-testid="alert" mt={2}>
              <Alert severity="error">{t(`${i18nBlockKey}.fileNotSupported`)}</Alert>
            </Box>
          )}
          {requiredFileError && (
            <Box data-testid="alert" mt={2}>
              <Alert severity="error">{t('errors.requiredFileError')}</Alert>
            </Box>
          )}
          <Box mt={1} mb={2}>
            <SingleFileInput
              onFileSelected={handleFileSelect}
              onFileRemoved={handleRemoveFile}
              value={file}
              dropzoneLabel={t(`${i18nBlockKey}.uploadFile`)}
              // dropzoneButton={t(`${i18nBlockKey}.uploadFileButton`)}
              rejectedLabel={t(`${i18nBlockKey}.fileNotSupported`)}
              loading={loadingFile}
            />
          </Box>
          <Box>
            <input
              key={inputKey}
              type="file"
              accept="application/pdf, application/xml"
              ref={fileInputRef}
              style={{ display: 'none' }}
              data-testid="upload-input-test"
              onChange={(e) => {
                const selectedFile = e.target.files?.[0];
                if (selectedFile) {
                  handleFileSelect(selectedFile);
                }
                setInputKey((prev) => prev + 1);
              }}
            />

            {file && (
              <Button
                data-testid="file-btn-test"
                variant="naked"
                startIcon={<FileUploadIcon />}
                onClick={handleButtonClick}
                sx={{ fontWeight: 'bold', fontSize: '14px' }}
              >
                {t(`${i18nBlockKey}.replaceFile`)}
              </Button>
            )}
          </Box>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            p={{ xs: 2, sm: 0 }}
            spacing={2}
            mt={3}
            justifyContent="space-between"
          >
            <Button data-testid="back-btn-test" variant="outlined" onClick={handleBackNavigation}>
              {t('commons.backBtn')}
            </Button>
            <Button data-testid="continue-btn-test" variant="contained" onClick={handleAction}>
              {t('commons.continueBtn')}
            </Button>
          </Stack>
        </Box>
      </Box>
      <AlertComponent
        isOpen={errorAlert.isOpen}
        data-testid="alert-component"
        severity="error"
        text={errorAlert.message}
        contentStyle={{ right: '20px' }}
      />
    </>
  );
};

export default FileUploadAction;
