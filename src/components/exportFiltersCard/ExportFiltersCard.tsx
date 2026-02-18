import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Stack,
  TextField,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useFormik } from 'formik';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/it';
import { useParams } from 'react-router-dom';
import { generateMerchantReport } from '../../services/merchantService';
import { ReportTypeEnum } from '../../api/generated/merchants/ReportRequest';
import { MIN_START_DATE } from '../../utils/constants';

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
  const { id } = useParams<RouteParams>();

  const yesterday = dayjs().subtract(1, 'day').startOf('day');
  const yesterdayStr = yesterday.format('YYYY-MM-DD');

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
      ...( values.startDate && dayjs(values.startDate).isAfter(yesterday, 'day') && {
        startDate: t('pages.reportExport.form.validation.invalidRange'),
      }),
      ...( values.endDate && dayjs(values.endDate).isAfter(yesterday, 'day') && {
        endDate: t('pages.reportExport.form.validation.invalidRange'),
      }),
      ...( values.startDate && values.endDate && dayjs(values.endDate).diff(dayjs(values.startDate), 'day') < 1 && {
        endDate: t('pages.reportExport.form.validation.invalidRange'),
      }),
      ...( values.startDate && values.endDate && dayjs(values.endDate).diff(dayjs(values.startDate), 'day') > 90 && {
        endDate: t('pages.reportExport.form.validation.maxRange'),
      }),
    }),
    onSubmit: async (values) => {
      if (!id) {
        return;
      }

      try {
        const response = await generateMerchantReport(id, {
          startPeriod: dayjs(values.startDate).startOf('day').format('YYYY-MM-DDTHH:mm:ss.SSS') as unknown as Date,
          endPeriod: dayjs(values.endDate).endOf('day').format('YYYY-MM-DDTHH:mm:ss.SSS') as unknown as Date,
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
        formik.resetForm();
        onReportGenerated?.();
      }
    },
  });

  const minEndDateStr =
    formik.values.startDate
      ? dayjs(formik.values.startDate).add(1, 'day').format('YYYY-MM-DD')
      : MIN_START_DATE;

  return (
    <Card sx={{ width: '100%' }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>
          {t('pages.reportExport.form.title')}
        </Typography>

        <Typography variant="body2" sx={{ mb: 3 }}>
          {t('pages.reportExport.form.subtitle')}
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
            <TextField
              label="Dal"
              type="date"
              size="medium"
              value={formik.values.startDate ?? ''}
              onChange={(e) => {
                void formik.setFieldValue('startDate', e.target.value);
                void formik.setFieldValue('endDate', '');
              }}
              onBlur={formik.handleBlur}
              inputProps={{ min: MIN_START_DATE, max: yesterdayStr, placeholder: '' }}
              InputLabelProps={{ shrink: true }}
              error={Boolean(formik.touched.startDate && formik.errors.startDate)}
              helperText={
                formik.touched.startDate && formik.errors.startDate
                  ? String(formik.errors.startDate)
                  : undefined
              }
            />

            <TextField
              label="Al"
              type="date"
              size="medium"
              value={formik.values.endDate ?? ''}
              onChange={(e) => void formik.setFieldValue('endDate', e.target.value)}
              onBlur={formik.handleBlur}
              inputProps={{
                min: minEndDateStr || undefined,
                max: yesterdayStr,
                placeholder: '',
              }}
              InputLabelProps={{ shrink: true }}
              error={Boolean(formik.touched.endDate && formik.errors.endDate)}
              helperText={
                formik.touched.endDate && formik.errors.endDate
                  ? String(formik.errors.endDate)
                  : undefined
              }
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
      </CardContent>
    </Card>
  );
};

export default ExportFiltersCard;
