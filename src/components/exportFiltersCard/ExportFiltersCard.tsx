import { Box, Button, Card, CardContent, Typography } from '@mui/material';
import { useFormik } from 'formik';
import { useRef, useMemo, useCallback } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/it';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import it from 'date-fns/locale/it';
import { useParams } from 'react-router-dom';
import DateRangePicker from '../dateRangePicker/DateRangePicker';
import { generateMerchantReport } from '../../services/merchantService';
import { ReportRequest } from '../../api/generated/merchants/data-contracts';

type ReportTypeEnum = ReportRequest['reportType'];
const MERCHANT_TRANSACTIONS: ReportTypeEnum = 'MERCHANT_TRANSACTIONS';
import { ReportDTO } from '../../api/generated/merchants/data-contracts';
import useScopedTranslation from '../../hooks/useScopedTranslation';
import { useUserPermissions, PERMISSION_KEYS } from '../../hooks/useUserPermissions';

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
  startDate: string;
  updateAlerts: (key: string, open: boolean) => void;
  onReportGenerated?: () => void;
};

const ExportFiltersCard = ({ updateAlerts, onReportGenerated, startDate }: Props) => {
  const { t } = useScopedTranslation();
  const { initiative_id } = useParams<RouteParams>();
  const requestIdRef = useRef<number>(0);
  const { isActionDisabled } = useUserPermissions();
  const isGenerateReportDisabled = isActionDisabled(PERMISSION_KEYS.REPORT_GENERATE);

  const minStartDate = dayjs(startDate).startOf('day');

  const yesterday = useMemo(() => dayjs().subtract(1, 'day').startOf('day'), []);

  const formik = useFormik<FormValues>({
    initialValues: {
      startDate: null,
      endDate: null,
    },
    validate: (values) => ({
      ...(!values.startDate && {
        startDate: t('validation.required'),
      }),
      ...(!values.endDate && {
        endDate: t('validation.required'),
      }),
      ...(values.startDate &&
        (dayjs(values.startDate).isBefore(minStartDate, 'day') ||
          dayjs(values.startDate).isAfter(yesterday, 'day')) && {
          startDate: t('validation.invalidRange'),
        }),
      ...(values.endDate &&
        (dayjs(values.endDate).isBefore(minStartDate, 'day') ||
          dayjs(values.endDate).isAfter(yesterday, 'day')) && {
          endDate: t('validation.invalidRange'),
        }),
      ...(values.startDate &&
        values.endDate &&
        dayjs(values.endDate).diff(dayjs(values.startDate), 'day') < 0 && {
          endDate: t('validation.invalidRange'),
        }),
      ...(values.startDate &&
        values.endDate &&
        dayjs(values.endDate).diff(dayjs(values.startDate), 'day') > 90 && {
          endDate: t('validation.maxRange'),
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
        onReportGenerated?.();
      } catch (error) {
        if (currentRequestId !== requestIdRef.current) {
          return;
        }

        updateAlerts(FAILED as string, true);
        setTimeout(() => updateAlerts(FAILED as string, false), 3000);
      } finally {
        if (currentRequestId === requestIdRef.current) {
          formik.resetForm();
        }
      }
    },
  });

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={it}>
      <Card sx={{ width: '100%' }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            {t('pages.reportExport.form.title')}
          </Typography>

          <Typography variant="body2" sx={{ mb: 3 }}>
            {t('pages.reportExport.form.subtitle')}
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', flexDirection: { xs: 'column', md: 'row' } }}>
            <DateRangePicker
              dateFrom={formik.values.startDate?.toDate() ?? null}
              dateTo={formik.values.endDate?.toDate() ?? null}
              dateFromError={formik.touched.startDate ? formik.errors.startDate : undefined}
              dateToError={formik.touched.endDate ? formik.errors.endDate : undefined}
              minDateFrom={minStartDate.toDate()}
              yesterday={yesterday.toDate()}
              onDateFromChange={(date) => {
                void formik.setValues({ startDate: date ? dayjs(date) : null, endDate: null });
              }}
              onDateToChange={(date) => void formik.setFieldValue('endDate', date ? dayjs(date) : null)}
              isDisabled={isGenerateReportDisabled}
            />

            <Box sx={{ flex: 1 }} />

            <Button
              variant="contained"
              disabled={formik.isSubmitting || isGenerateReportDisabled}
              onClick={useCallback(() => formik.handleSubmit(), [formik])}
            >
              {t('pages.reportExport.form.submit')}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </LocalizationProvider>
  );
};

export default ExportFiltersCard;
