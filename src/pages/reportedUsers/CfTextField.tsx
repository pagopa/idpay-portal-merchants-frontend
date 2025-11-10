import { TextField } from '@mui/material';
import { FormikProps } from 'formik';

interface CfTextFieldProps<T> {
  formik: FormikProps<T>;
  showErrors: boolean;
  setShowErrors: (value: boolean) => void;
  label: string;
  name?: string;
}

function CfTextField<T extends { cf: string }>({
  formik,
  showErrors,
  setShowErrors,
  label,
  name = 'cf',
}: CfTextFieldProps<T>) {
  return (
    <TextField
      fullWidth
      size="small"
      label={label}
      name={name}
      value={formik.values[name as keyof T]}
      onChange={(e) => {
        const raw = e.target.value || '';
        const cleaned = raw
          .replace(/[^A-Za-z0-9]/g, '')
          .toUpperCase()
          .slice(0, 16);
        formik.setFieldValue(name, cleaned, false);
        if (cleaned === '') {
          setShowErrors(false);
          formik.setFieldError(name, '');
        }
      }}
      error={showErrors && Boolean(formik.errors[name as keyof T])}
      helperText={showErrors ? formik.errors[name as keyof T] : ''}
      FormHelperTextProps={{ sx: { minHeight: '20px' } }}
    />
  );
}

export default CfTextField;
