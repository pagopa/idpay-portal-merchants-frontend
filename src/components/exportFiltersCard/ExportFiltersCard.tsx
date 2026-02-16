import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  TextFieldProps,
  Stack, TextField,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { FormikProps, useFormik } from 'formik';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/it';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { useParams } from 'react-router-dom';
import { generateMerchantReport } from '../../services/merchantService';
import { ReportTypeEnum } from '../../api/generated/merchants/ReportRequest';

type DatePickerRenderInputProps<T> = {
  formik: FormikProps<T>;
  fieldName: keyof T;
  placeholder: string;
};

export const renderFormikDatePickerInput =
  <T,>({ formik, fieldName, placeholder }: DatePickerRenderInputProps<T>) =>
    (params: TextFieldProps) => (
      <TextField
        {...params}
        size="small"
        placeholder={placeholder}
        error={Boolean(formik.touched[fieldName] && formik.errors[fieldName])}
        helperText={
          formik.touched[fieldName] && formik.errors[fieldName]
            ? String(formik.errors[fieldName])
            : undefined
        }
        InputLabelProps={{
          ...params.InputLabelProps,
          shrink: Boolean(formik.values[fieldName]),
        }}
      />
    );

type FormValues = {
  startDate: Dayjs | null;
  endDate: Dayjs | null;
};

type RouteParams = {
  id: string;
};

type Props = {
  updateAlerts: (key: string, open: boolean) => void;
  onReportGenerated?: () => void;
};

const ExportFiltersCard = ({ updateAlerts, onReportGenerated }: Props) => {
  const { t } = useTranslation();

  const yesterday = dayjs().subtract(1, 'day').startOf('day');
  const { id } = useParams<RouteParams>();

  const formik = useFormik<FormValues>({
    initialValues: {
      startDate: null,
      endDate: null,
    },
    validate: (values) => ({
      ...( !values.startDate && {
        startDate: t('pages.reportExport.form.validation.required'),
      }),
      ...( !values.endDate && {
        endDate: t('pages.reportExport.form.validation.required'),
      }),
      ...( values.startDate && values.endDate && values.endDate.diff(values.startDate, 'day') < 1 && {
        endDate: t('pages.reportExport.form.validation.invalidRange'),
      }),
      ...( values.startDate && values.endDate && values.endDate.diff(values.startDate, 'day') > 90 && {
        endDate: t('pages.reportExport.form.validation.maxRange'),
      }),
    }),
    onSubmit: async (values) => {
      if (!id) {
        return;
      }

      try {
        const response = await generateMerchantReport(id, {
          startPeriod: values?.startDate!.startOf('day').toDate(),
          endPeriod: values?.endDate!.endOf('day').toDate(),
          reportType: ReportTypeEnum.MERCHANT_TRANSACTIONS,
        }) as any;

        const status = response?.reportStatus;

        if (status === 'INSERTED') {
          updateAlerts('inserted', true);
          setTimeout(() => updateAlerts('inserted', false), 3000);
        } else if (status === 'GENERATED') {
          updateAlerts('generated', true);
          setTimeout(() => updateAlerts('generated', false), 3000);
        } else if (status === 'FAILED') {
          updateAlerts('failed', true);
          setTimeout(() => updateAlerts('failed', false), 3000);
        }
      } catch (error) {
        updateAlerts('failed', true);
        setTimeout(() => updateAlerts('failed', false), 3000);
      } finally {
        if (typeof formik.resetForm === 'function') {
          formik.resetForm();
        }
        onReportGenerated?.();
      }
    },
  });


  return (
    <Card sx={{ width: '100%' }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>
          {t('pages.reportExport.form.title')}
        </Typography>

        <Typography variant="body2" sx={{ mb: 3 }}>
          {t('pages.reportExport.form.subtitle')}
        </Typography>

        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="it">
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
              <DatePicker
                label="Dal"
                value={formik.values.startDate}
                inputFormat="DD/MM/YYYY"
                maxDate={yesterday}
                onChange={(value) => {
                  void formik.setFieldValue('startDate', value);
                  void formik.setFieldValue('endDate', null);
                }}
                renderInput={renderFormikDatePickerInput({
                  formik,
                  fieldName: 'startDate',
                  placeholder: 'Dal',
                })}

              />

              <DatePicker
                label="Al"
                value={formik.values.endDate}
                inputFormat="DD/MM/YYYY"
                minDate={
                  formik.values.startDate
                    ? formik.values.startDate.add(1, 'day')
                    : undefined
                }
                maxDate={yesterday}
                onChange={(value) =>
                  formik.setFieldValue('endDate', value)
                }
                renderInput={renderFormikDatePickerInput({
                  formik,
                  fieldName: 'endDate',
                  placeholder: 'Al',
                })}
              />
            </Stack>

            <Box sx={{ flex: 1 }} />

            <Button
              variant="contained"
              disabled={formik.isSubmitting}
              onClick={() => formik.handleSubmit()}
            >
              {t('pages.reportExport.form.submit')}
            </Button>
          </Box>
        </LocalizationProvider>
      </CardContent>
    </Card>
  );
};

export default ExportFiltersCard;
