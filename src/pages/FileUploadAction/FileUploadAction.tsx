import { Box, Typography, Link, Stack, Button, Alert, TextField } from '@mui/material';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import { SingleFileInput, theme } from '@pagopa/mui-italia';
import { TitleBox } from '@pagopa/selfcare-common-frontend';
import { useTranslation } from 'react-i18next';
import { useState, useRef, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';

import ROUTES from '../../routes';
import AlertComponent from '../../components/Alert/AlertComponent';
import BreadcrumbsBoxUpload from '../components/BreadcrumbsBoxUpload';

interface BreadcrumbsProps {
  label: string;
  path: string;
}

interface FileUploadActionProps {
  apiCall: (trxId: string, file: File, docNumber: string) => Promise<unknown>;
  successStateKey: string;
  breadcrumbsProp: BreadcrumbsProps;
  manualLink: string;
  styleClass?: string;
}

const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024;
const VALID_MIME_TYPES = ['application/pdf', 'application/xml', 'text/xml'];

const FileUploadAction: React.FC<FileUploadActionProps> = ({
  apiCall,
  successStateKey,
  breadcrumbsProp,
  manualLink,
  styleClass,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [docNumber, setDocNumber] = useState<string>('');

  const [requiredFileError, setRequiredFileError] = useState<boolean>(false);
  const [docNumberError, setDocNumberError] = useState<boolean>(false);
  const [fileSizeError, setFileSizeError] = useState<boolean>(false);
  const [fileTypeError, setFileTypeError] = useState<boolean>(false);

  const [loadingFile, setLoadingFile] = useState<boolean>(false);
  const [errorAlert, setErrorAlert] = useState({ isOpen: false, message: '' });

  const [inputKey, setInputKey] = useState<number>(0);

  const { t } = useTranslation();
  const history = useHistory();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { trxId, fileDocNumber } = useParams<{
    trxId: string;
    fileDocNumber: string;
  }>();

  useEffect(() => {
    if (fileDocNumber) {
      try {
        const decoded = atob(fileDocNumber);
        setDocNumber(decoded);
      } catch (e) {
        setDocNumber(fileDocNumber);
      }
    }
  }, [fileDocNumber]);

  useEffect(() => {
    if (!errorAlert.isOpen) {
      return undefined;
    }

    const timer = setTimeout(() => {
      setErrorAlert({ isOpen: false, message: '' });
    }, 5000);

    return () => clearTimeout(timer);
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

  const handleDocNumberChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.value.length <= 100) {
      setDocNumber(event.target.value);
    }
  };

  const handleBackNavigation = () => {
    // history.push(breadcrumbsProp?.path);
    history.push(ROUTES.REFUND_REQUESTS);
  };

  const handleAction = async (): Promise<void> => {
    if (!file) {
      setRequiredFileError(true);
      setFileSizeError(false);
      setFileTypeError(false);
      return;
    }

    if (!docNumber || docNumber.trim().length < 2) {
      setDocNumberError(true);
      return;
    }

    if (file && trxId && docNumber.trim().length >= 2) {
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

  return (
    <>
      <Box p={4} maxWidth="75%" justifySelf="center">
        <BreadcrumbsBoxUpload
          backLabel={t('commons.exitBtn')}
          /* items={[
            { label: breadcrumbsProp?.label, path: breadcrumbsProp?.path },
            { label: breadcrumbsLabelKey, path: ROUTES.REFUND_REQUESTS },
          ]} */
          items={[]}
          active={true}
          // onClickBackButton={() => history.push(breadcrumbsProp?.path)}
          onClickBackButton={() => history.push(ROUTES.REFUND_REQUESTS)}
        />

        <TitleBox
          title={t('modifyDocument.title')}
          mtTitle={3}
          variantTitle="h4"
          subTitle={t('modifyDocument.creditNoteSubtitle')}
          variantSubTitle="body2"
        />

        <Box
          mt={3}
          py={3}
          px={4}
          sx={{ backgroundColor: theme.palette.background.paper }}
          borderRadius="4px"
        >
          <Typography mt={2} variant="h6" fontWeight={theme.typography.fontWeightBold}>
            {t('modifyDocument.invoiceTitle')}
          </Typography>

          <Typography mt={2} variant="body2" fontWeight={theme.typography.fontWeightMedium}>
            {t('modifyDocument.insertInvoice')}
          </Typography>

          <TextField
            variant="outlined"
            fullWidth
            value={docNumber}
            onChange={handleDocNumberChange}
            onBlur={() =>
              !docNumber || docNumber.trim().length < 2
                ? setDocNumberError(true)
                : setDocNumberError(false)
            }
            label={t('modifyDocument.invoiceLabel')}
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
                : docNumberError && docNumber.trim().length < 2
                ? 'Lunghezza minima 2 caratteri'
                : ''
            }
          />
        </Box>

        <Box
          mt={4}
          p={3}
          className={styleClass}
          sx={{
            backgroundColor: theme.palette.background.paper,
            borderRadius: '4px',
            minWidth: { lg: '1000px' },
          }}
        >
          <Typography variant="h6" fontWeight={theme.typography.fontWeightBold}>
            {t('modifyDocument.creditNote')}
          </Typography>

          <Typography variant="body2" mt={4} mb={1} sx={{ marginTop: '32px !important' }}>
            {t('modifyDocument.creditNoteSubtitle')}
          </Typography>

          <Link
            onClick={() => window.open(manualLink || '', '_blank')}
            sx={{ cursor: 'pointer', fontWeight: theme.typography.fontWeightMedium, fontSize: 14 }}
          >
            {t('modifyDocument.manualLink')}
          </Link>

          {fileSizeError && (
            <Box mt={2}>
              <Alert severity="error">{t('commons.fileSizeError')}</Alert>
            </Box>
          )}

          {fileTypeError && (
            <Box mt={2}>
              <Alert severity="error">{t('modifyDocument.fileNotSupported')}</Alert>
            </Box>
          )}

          {requiredFileError && (
            <Box mt={2}>
              <Alert severity="error">{t('errors.requiredFileError')}</Alert>
            </Box>
          )}

          <Box mt={1} mb={2}>
            <SingleFileInput
              onFileSelected={handleFileSelect}
              onFileRemoved={handleRemoveFile}
              value={file}
              dropzoneLabel={t('modifyDocument.uploadFile')}
              rejectedLabel={t('modifyDocument.fileNotSupported')}
              loading={loadingFile}
            />
          </Box>

          <input
            key={inputKey}
            type="file"
            accept="application/pdf, application/xml"
            ref={fileInputRef}
            style={{ display: 'none' }}
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
              variant="naked"
              startIcon={<FileUploadIcon />}
              onClick={handleButtonClick}
              sx={{ fontWeight: 'bold', fontSize: 14 }}
            >
              {t('modifyDocument.replaceFile')}
            </Button>
          )}

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            p={{ xs: 2, sm: 0 }}
            spacing={2}
            mt={3}
            justifyContent="space-between"
          >
            <Button variant="outlined" onClick={handleBackNavigation}>
              {t('commons.backBtn')}
            </Button>
            <Button variant="contained" onClick={handleAction}>
              {t('commons.continueBtn')}
            </Button>
          </Stack>
        </Box>
      </Box>

      <AlertComponent
        isOpen={errorAlert.isOpen}
        severity="error"
        text={errorAlert.message}
        contentStyle={{ right: '20px' }}
      />
    </>
  );
};

export default FileUploadAction;
