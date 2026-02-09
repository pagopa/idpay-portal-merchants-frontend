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
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';

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

interface ExportFiltersCardProps {
  onGenerateReport?: (range: { from: string; to: string }) => void;
}

const ExportFiltersCard = ({ onGenerateReport }: ExportFiltersCardProps) => {
  const { t } = useTranslation();

  const yesterday = dayjs().subtract(1, 'day').startOf('day');

  const formik = useFormik<FormValues>({
    initialValues: {
      startDate: null,
      endDate: null,
    },
    onSubmit: (values) => {
      if (!values.startDate || !values.endDate || !isValidRange) {
        return;
      }

      onGenerateReport?.({
        from: values.startDate.format('DD-MM-YYYY'),
        to: values.endDate.format('DD-MM-YYYY'),
      });

    },
  });

  const isValidRange =
    formik.values.startDate &&
    formik.values.endDate &&
    formik.values.endDate.diff(formik.values.startDate, 'day') >= 1 &&
    formik.values.endDate.diff(formik.values.startDate, 'day') <= 90;


  return (
    <Card sx={{ width: '100%' }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>
          {t('pages.reportExport.form.title')}
        </Typography>

        <Typography variant="body2" sx={{ mb: 3 }}>
          {t('pages.reportExport.form.subtitle')}
        </Typography>

        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
              <DatePicker
                label="Dal"
                value={formik.values.startDate}
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