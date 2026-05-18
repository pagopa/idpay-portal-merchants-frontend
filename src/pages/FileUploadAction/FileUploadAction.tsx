import { Box, Typography, Link, Stack, Button, TextField } from '@mui/material';
import { Alert as MuiAlert } from '@mui/material';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import { SingleFileInput, theme } from '@pagopa/mui-italia';
import { TitleBox } from '@pagopa/selfcare-common-frontend/lib';
import { useState, useRef, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import BreadcrumbsBoxUpload from '../components/BreadcrumbsBoxUpload';
import { useAlert } from '../../hooks/useAlert';
import { useScopedTranslation } from '../../hooks/useScopedTranslation';

interface FileUploadActionProps {
  apiCall:
    | ((
        transactionId: string,
        file: File,
        docNumber: string
      ) => Promise<void | { code: string; message: string }>)
    | ((
        transactionId: string,
        file: File,
        pointOfSaleId: string,
        docNumber: string
      ) => Promise<void | { code: string; message: string }>);
  successStateKey: string;
  breadcrumbsLabel: string;
  manualLink: string;
  styleClass?: string;
  i18nBlockKey: string;
}

const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024;
const VALID_MIME_TYPES = ['application/pdf', 'application/xml', 'text/xml'];

const FileUploadAction: React.FC<FileUploadActionProps> = ({
  apiCall,
  breadcrumbsLabel,
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

  const { t } = useScopedTranslation();
  const { t: scopedT, isLoading } = useScopedTranslation();
  const history = useHistory();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const secondBreadcrumbLabel = scopedT(`${i18nBlockKey}.breadcrumbLabel`);

  const { trxId, fileDocNumber } = useParams<{
    id: string;
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

  useEffect(() => {
    if (!trxId) {
      return;
    }

    setFile(null);
    setDocNumber('');
    setRequiredFileError(false);
    setDocNumberError(false);
    setFileSizeError(false);
    setFileTypeError(false);
    setLoadingFile(false);
    setInputKey((prev) => prev + 1);
  }, [trxId]);

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
        const normalizedDocNumber = docNumber.trim();
        const response = await (apiCall as any)(trxId, file, normalizedDocNumber);

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
        setAlert({
          title: t('errors.genericTitle'),
          text: t('errors.genericDescription'),
          isOpen: true,
          severity: 'error',
        });
        setLoadingFile(false);
      }
    }
  };

  return (
    <>
      <Box p={4} maxWidth="75%" justifySelf="center">
        <BreadcrumbsBoxUpload
          backLabel={t('actions.exit')}
          items={[breadcrumbsLabel, secondBreadcrumbLabel]}
          active={true}
          onClickBackButton={handleBackNavigation}
        />

        <TitleBox
          title={scopedT(`${i18nBlockKey}.title`)}
          mtTitle={3}
          variantTitle="h4"
          subTitle={scopedT(`${i18nBlockKey}.invoiceSubtitle`)}
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
            {scopedT(`${i18nBlockKey}.invoiceTitle`)}
          </Typography>

          <Typography mt={2} variant="body2" fontWeight={theme.typography.fontWeightMedium}>
            {scopedT(`${i18nBlockKey}.insertInvoice`)}
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
            label={scopedT(`${i18nBlockKey}.invoiceLabel`)}
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
                ? t('validation.required')
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
            {scopedT(`${i18nBlockKey}.creditNote`)}
          </Typography>

          <Typography variant="body2" mt={4} mb={1} sx={{ marginTop: '32px !important' }}>
            {scopedT(`${i18nBlockKey}.creditNoteSubtitle`)}
          </Typography>

          <Link
            onClick={() => window.open(manualLink || '', '_blank')}
            sx={{ cursor: 'pointer', fontWeight: theme.typography.fontWeightMedium, fontSize: 14 }}
          >
            {scopedT(`${i18nBlockKey}.manualLink`)}
          </Link>

          {fileSizeError && (
            <Box mt={2}>
              <MuiAlert severity="error">
                <Typography variant="body2">
                  {scopedT(`${i18nBlockKey}.errors.fileSizeError`)}
                </Typography>
              </MuiAlert>
            </Box>
          )}

          {fileTypeError && (
            <Box mt={2}>
              <MuiAlert severity="error">
                <Typography variant="body2">
                  {scopedT(`${i18nBlockKey}.errors.fileNotSupported`)}
                </Typography>
              </MuiAlert>
            </Box>
          )}

          {requiredFileError && (
            <Box mt={2}>
              <MuiAlert severity="error">
                <Typography variant="body2">
                  {scopedT(`${i18nBlockKey}.errors.requiredFileError`)}
                </Typography>
              </MuiAlert>
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
              dropzoneLabel={scopedT(`${i18nBlockKey}.uploadFile`)}
              dropzoneButton={scopedT(`${i18nBlockKey}.uploadFileButton`)}
              rejectedLabel={scopedT(`${i18nBlockKey}.errors.fileNotSupported`)}
              loading={loadingFile || isLoading}
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
              {scopedT(`${i18nBlockKey}.replaceFile`)}
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
              {t('actions.back')}
            </Button>
            <Button variant="contained" onClick={handleAction}>
              {t('actions.continue')}
            </Button>
          </Stack>
        </Box>
      </Box>
    </>
  );
};

export default FileUploadAction;
