import { Box, Button, Card, CardContent, Typography, Stack, TextField } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useFormik } from 'formik';
import { useRef, useMemo, useCallback } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/it';
import { useParams } from 'react-router-dom';
import { generateMerchantReport } from '../../services/merchantService';
import { ReportRequest } from '../../api/generated/merchants/data-contracts';

type ReportTypeEnum = ReportRequest['reportType'];
const MERCHANT_TRANSACTIONS: ReportTypeEnum = 'MERCHANT_TRANSACTIONS';
import { MIN_START_DATE } from '../../utils/constants';
import { ReportDTO } from '../../api/generated/merchants/data-contracts';

type ReportStatusEnum = ReportDTO['reportStatus'];
const FAILED: ReportStatusEnum = 'FAILED';

type FormValues = {
  startDate: Dayjs | null;
  endDate: Dayjs | null;
};

type RouteParams = {
  initiative_id: string;
};

type Props = {
  updateAlerts: (key: string, open: boolean) => void;
  onReportGenerated?: () => void;
};

const ExportFiltersCard = ({ updateAlerts, onReportGenerated }: Props) => {
  const { t } = useTranslation();
  const { initiative_id } = useParams<RouteParams>();
  const requestIdRef = useRef<number>(0);

  const yesterday = useMemo(() => dayjs().subtract(1, 'day').startOf('day'), []);
  const yesterdayStr = useMemo(() => yesterday.format('YYYY-MM-DD'), [yesterday]);

  const formik = useFormik<FormValues>({
    initialValues: {
      startDate: null,
      endDate: null,
    },
    validate: (values) => ({
      ...(!values.startDate && {
        startDate: t('pages.reportExport.form.validation.required'),
      }),
      ...(!values.endDate && {
        endDate: t('pages.reportExport.form.validation.required'),
      }),
      ...(values.startDate &&
        dayjs(values.startDate).isAfter(yesterday, 'day') && {
          startDate: t('pages.reportExport.form.validation.invalidRange'),
        }),
      ...(values.endDate &&
        dayjs(values.endDate).isAfter(yesterday, 'day') && {
          endDate: t('pages.reportExport.form.validation.invalidRange'),
        }),
      ...(values.startDate &&
        values.endDate &&
        dayjs(values.endDate).diff(dayjs(values.startDate), 'day') < 0 && {
          endDate: t('pages.reportExport.form.validation.invalidRange'),
        }),
      ...(values.startDate &&
        values.endDate &&
        dayjs(values.endDate).diff(dayjs(values.startDate), 'day') > 90 && {
          endDate: t('pages.reportExport.form.validation.maxRange'),
        }),
    }),
    onSubmit: async (values) => {
      if (!initiative_id) {
        return;
      }

      const currentRequestId = requestIdRef.current + 1;
      // eslint-disable-next-line functional/immutable-data
      requestIdRef.current = currentRequestId;

      try {
        const response = (await generateMerchantReport(initiative_id, {
          startPeriod: dayjs(values.startDate).startOf('day').format('YYYY-MM-DDTHH:mm:ss.SSS'),
          endPeriod: dayjs(values.endDate).endOf('day').format('YYYY-MM-DDTHH:mm:ss.SSS'),
          reportType: MERCHANT_TRANSACTIONS,
        })) as any;

        if (currentRequestId !== requestIdRef.current) {
          return;
        }

        const status: ReportStatusEnum = response?.reportStatus ?? FAILED;
        updateAlerts(status as string, true);
        setTimeout(() => updateAlerts(status as string, false), 3000);
      } catch (error) {
        if (currentRequestId !== requestIdRef.current) {
          return;
        }

        updateAlerts(FAILED as string, true);
        setTimeout(() => updateAlerts(FAILED as string, false), 3000);
      } finally {
        if (currentRequestId === requestIdRef.current) {
          formik.resetForm();
          onReportGenerated?.();
        }
        if (currentRequestId === requestIdRef.current) {
          formik.resetForm();
          onReportGenerated?.();
        }
      }
    },
  });

  const minEndDateStr = useMemo(
    () =>
      formik.values.startDate
        ? dayjs(formik.values.startDate).add(0, 'day').format('YYYY-MM-DD')
        : MIN_START_DATE,
    [formik.values.startDate]
  );

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
            onClick={useCallback(() => formik.handleSubmit(), [formik])}
          >
            {t('pages.reportExport.form.submit')}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ExportFiltersCard;
