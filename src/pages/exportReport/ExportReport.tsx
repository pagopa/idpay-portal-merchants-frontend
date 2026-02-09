import React from 'react';
import { Box, Paper, Stack, TextFieldProps, Typography } from '@mui/material';
import { TitleBox } from '@pagopa/selfcare-common-frontend';
import { useTranslation } from 'react-i18next';
import { useFormik } from 'formik';
import dayjs, { Dayjs } from 'dayjs';
import * as Yup from 'yup';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

const ExportReport: React.FC = () => {
  const { t } = useTranslation();

  const today = dayjs().startOf('day');
  const yesterday = today.subtract(1, 'day');

  const initialValues = React.useMemo(
    () => ({
      startDate: yesterday,
      endDate: yesterday,
    }),
    [yesterday]
  );

  const validationSchema = React.useMemo(
    () =>
      Yup.object({
        startDate: Yup.mixed<Dayjs>()
          .required(t('validation.required'))
          .test('valid-date', t('validation.invalidDate'), (value) =>
            dayjs.isDayjs(value) && value.isValid()
          )
          .test(
            'no-future',
            t('validation.noFutureDates'),
            (value) => !!value && value.isSameOrBefore(yesterday, 'day')
          ),
        endDate: Yup.mixed<Dayjs>()
          .required(t('validation.required'))
          .test('valid-date', t('validation.invalidDate'), (value) =>
            dayjs.isDayjs(value) && value.isValid()
          )
          .test(
            'no-future',
            t('validation.noFutureDates'),
            (value) => !!value && value.isSameOrBefore(yesterday, 'day')
          )
          .test(
            'min-range',
            t('validation.minRangeOneDay'),
            function (endDate) {
              const { startDate } = this.parent;
              return (
                dayjs.isDayjs(startDate) &&
                dayjs.isDayjs(endDate) &&
                endDate.diff(startDate, 'day') >= 1
              );
            }
          )
          .test(
            'max-range',
            t('validation.maxRange90Days'),
            function (endDate) {
              const { startDate } = this.parent;
              return (
                dayjs.isDayjs(startDate) &&
                dayjs.isDayjs(endDate) &&
                endDate.diff(startDate, 'day') <= 90
              );
            }
          ),
      }),
    [t, yesterday]
  );

  const formik = useFormik({
    initialValues,
    validationSchema,
    validateOnMount: true,
    onSubmit: (values) => {
      console.log({
        startDate: values.startDate.format('YYYY-MM-DD'),
        endDate: values.endDate.format('YYYY-MM-DD'),
      });
    },
  });

  return (
    <Box sx={{ my: 2 }}>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={{ xs: 2, md: 3 }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', md: 'center' }}
      >
        <TitleBox
          title={t('pages.reportExport.title')}
          subTitle={t('pages.reportExport.subtitle')}
          mbTitle={2}
          variantTitle="h4"
          variantSubTitle="body1"
        />
      </Stack>

      <Paper sx={{ my: 4, p: 3 }}>
        <Typography variant="h6" pb={2}>
          {t('pages.reportExport.formTitle')}
        </Typography>
        <Typography variant="body2" pb={3}>
          {t('pages.reportExport.formSubtitle')}
        </Typography>

        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
            {/* FROM */}
            <DatePicker
              label="Dal"
              value={formik.values.startDate}
              maxDate={yesterday}
              onChange={(value) => formik.setFieldValue('startDate', value)}
              format="DD/MM/YYYY"
              slotProps={{
                textField: {
                  size: 'small',
                  error: formik.touched.startDate && Boolean(formik.errors.startDate),
                  helperText: formik.touched.startDate && formik.errors.startDate,
                } as TextFieldProps,
              }}
            />

            {/* TO */}
            <DatePicker
              label="Al"
              value={formik.values.endDate}
              minDate={formik.values.startDate}
              maxDate={yesterday}
              onChange={(value) => formik.setFieldValue('endDate', value)}
              format="DD/MM/YYYY"
              slotProps={{
                textField: {
                  size: 'small',
                  error: formik.touched.endDate && Boolean(formik.errors.endDate),
                  helperText: formik.touched.endDate && formik.errors.endDate,
                } as TextFieldProps,
              }}
            />
          </Stack>
        </LocalizationProvider>
      </Paper>

      <Paper
        sx={{
          my: 4,
          p: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      />
    </Box>
  );
};

export default ExportReport;
