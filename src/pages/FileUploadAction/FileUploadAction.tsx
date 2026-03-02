import { Box, Typography, Link, Stack, Button, Alert, TextField } from '@mui/material';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import { SingleFileInput, theme } from '@pagopa/mui-italia';
import { TitleBox } from '@pagopa/selfcare-common-frontend';
import { useTranslation } from 'react-i18next';
import { useState, useRef, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import BreadcrumbsBoxUpload from '../components/BreadcrumbsBoxUpload';
import { useAlert } from '../../hooks/useAlert';
import { useScopedTranslation } from '../../hooks/useScopedTranslation';

interface BreadcrumbsProps {
  label: string;
  path: string;
}

interface FileUploadActionProps {
  apiCall: (
    trxId: string,
    file: File,
    pointOfSaleId: string,
    docNumber?: string
  ) => Promise<unknown>;
  successStateKey: string;
  breadcrumbsProp: BreadcrumbsProps;
  manualLink: string;
  styleClass?: string;
  i18nBlockKey: string;
}

const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024;
const VALID_MIME_TYPES = ['application/pdf', 'application/xml', 'text/xml'];

const FileUploadAction: React.FC<FileUploadActionProps> = ({
  apiCall,
  breadcrumbsProp,
  manualLink,
  styleClass,
  i18nBlockKey,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [docNumber, setDocNumber] = useState<string>('');

  const { setAlert } = useAlert();

  const [requiredFileError, setRequiredFileError] = useState<boolean>(false);
  const [docNumberError, setDocNumberError] = useState<boolean>(false);
  const [fileSizeError, setFileSizeError] = useState<boolean>(false);
  const [fileTypeError, setFileTypeError] = useState<boolean>(false);

  const [loadingFile, setLoadingFile] = useState<boolean>(false);

  const [inputKey, setInputKey] = useState<number>(0);

  const { t } = useTranslation();
  const scopedT = useScopedTranslation(i18nBlockKey);
  const history = useHistory();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const secondBreadcrumbLabel = scopedT('breadcrumbLabel');

  const { pointOfSaleId, trxId, fileDocNumber } = useParams<{
    id: string;
    pointOfSaleId: string;
    trxId: string;
    fileDocNumber: string;
  }>();

  useEffect(() => {
    if (fileDocNumber) {
      try {
        const decoded = decodeURIComponent(escape(window.atob(fileDocNumber)));
        setDocNumber(decoded);
      } catch (e) {
        setDocNumber(fileDocNumber);
      }
    }
  }, [fileDocNumber]);

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
    history.goBack();
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
        const response = (await apiCall(trxId, file, pointOfSaleId, docNumber)) as any;

        if (response?.code) {
          if (response.code === 'REWARD_BATCH_STATUS_NOT_ALLOWED') {
            setAlert({
              text: t('modifyDocument.errors.deniedSentError'),
              isOpen: true,
              severity: 'error',
            });
          } else if (response.code === 'REWARD_BATCH_ALREADY_SENT') {
            setAlert({
              text: t('modifyDocument.errors.alreadySentError'),
              isOpen: true,
              severity: 'error',
            });
          } else {
            setAlert({
              text: t('modifyDocument.errors.errorAlert'),
              isOpen: true,
              severity: 'error',
            });
          }

          setLoadingFile(false);
          return;
        }

        setLoadingFile(false);

        history.replace({
          ...history.location,
          state: {
            ...(history.location.state || {}),
            refundUploadSuccess: true,
          },
        });

        setAlert({
          text: t('modifyDocument.refundSuccessUpload'),
          isOpen: true,
          severity: 'success',
        });
        history.goBack();
      } catch (error: unknown) {
        console.error('Unexpected API Error:', error);
        setAlert({ text: t('modifyDocument.errors.errorAlert'), isOpen: true, severity: 'error' });
        setLoadingFile(false);
      }
    }
  };

  return (
    <>
      <Box p={4} maxWidth="75%" justifySelf="center">
        <BreadcrumbsBoxUpload
          backLabel={t('commons.exitBtn')}
          items={[breadcrumbsProp?.label, secondBreadcrumbLabel]}
          active={true}
          onClickBackButton={handleBackNavigation}
        />

        <TitleBox
          title={scopedT('title')}
          mtTitle={3}
          variantTitle="h4"
          subTitle={scopedT('invoiceSubtitle')}
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
            {scopedT('invoiceTitle')}
          </Typography>

          <Typography mt={2} variant="body2" fontWeight={theme.typography.fontWeightMedium}>
            {scopedT('insertInvoice')}
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
            label={scopedT('invoiceLabel')}
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
            {scopedT('creditNote')}
          </Typography>

          <Typography variant="body2" mt={4} mb={1} sx={{ marginTop: '32px !important' }}>
            {scopedT('creditNoteSubtitle')}
          </Typography>

          <Link
            onClick={() => window.open(manualLink || '', '_blank')}
            sx={{ cursor: 'pointer', fontWeight: theme.typography.fontWeightMedium, fontSize: 14 }}
          >
            {scopedT('manualLink')}
          </Link>

          {fileSizeError && (
            <Box mt={2}>
              <Alert severity="error">{scopedT('errors.fileSizeError')}</Alert>
            </Box>
          )}

          {fileTypeError && (
            <Box mt={2}>
              <Alert severity="error">{scopedT('errors.fileNotSupported')}</Alert>
            </Box>
          )}

          {requiredFileError && (
            <Box mt={2}>
              <Alert severity="error">{scopedT('errors.requiredFileError')}</Alert>
            </Box>
          )}

          <Box
            mt={1}
            mb={2}
            sx={{
              '& .MuiButton-root': {
                backgroundColor: 'transparent',
                boxShadow: 'none',
                padding: 0,
                minWidth: 'auto',
                textTransform: 'none',
                fontWeight: 'bold',
                color: '#0073E6 !important',
                '&:hover': {
                  backgroundColor: 'transparent',
                },
              },
            }}
          >
            <SingleFileInput
              onFileSelected={handleFileSelect}
              onFileRemoved={handleRemoveFile}
              value={file}
              dropzoneLabel={scopedT('uploadFile')}
              dropzoneButton={scopedT('uploadFileButton')}
              rejectedLabel={scopedT('errors.fileNotSupported')}
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
              {scopedT('replaceFile')}
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
    </>
  );
};

export default FileUploadAction;
