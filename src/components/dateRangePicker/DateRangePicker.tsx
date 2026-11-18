import { Box, TextField, InputAdornment } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useState, forwardRef } from 'react';
import type { CSSProperties, InputHTMLAttributes, MouseEvent } from 'react';

import { addDays, startOfDay, endOfDay, subDays } from 'date-fns';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

interface DateRangePickerProps {
  dateFrom: Date | null;
  dateTo: Date | null;
  dateFromError?: string;
  dateToError?: string;
  minDateFrom: Date;
  yesterday: Date;
  onDateFromChange: (date: Date | null) => void;
  onDateToChange: (date: Date | null) => void;
  isUsers?: boolean;
  isDisabled?: boolean;
}

const fieldSx = {
  width: { xs: '100%', md: '200px' },
  minWidth: 180,
  cursor: 'pointer',
  '& .MuiInputBase-root': { cursor: 'pointer' },
  '& .MuiInputBase-input, & input': {
    cursor: 'pointer',
    caretColor: 'transparent',
    userSelect: 'none',
  },
} as const;

type ReadOnlyTextFieldProps = {
  hasValue?: boolean;
  [key: string]: unknown;
};

const ReadOnlyTextField = forwardRef<HTMLDivElement, ReadOnlyTextFieldProps>(
  ({ hasValue = false, ...params }, ref) => {
    const textFieldParams = params as {
      inputProps?: InputHTMLAttributes<HTMLInputElement> & {
        style?: CSSProperties;
        value?: string;
      };
      InputProps?: Record<string, unknown>;
    };

    const rawInputProps = textFieldParams.inputProps ?? {};

    const htmlInputStyle: CSSProperties = {
      ...rawInputProps.style,
      cursor: 'pointer',
      caretColor: 'transparent',
      userSelect: 'none',
    };

    const htmlInputProps: InputHTMLAttributes<HTMLInputElement> & {
      style: CSSProperties;
      value?: string;
    } = {
      ...rawInputProps,
      readOnly: true,
      placeholder: '',
      onMouseDown: (event: MouseEvent<HTMLInputElement>) => {
        rawInputProps.onMouseDown?.(event);
        event.preventDefault();
      },
      style: htmlInputStyle,
      ...(!hasValue ? { value: '' } : {}),
    };

return (
      <TextField
        {...(params as object)}
        ref={ref}
        InputProps={{
          ...(textFieldParams.InputProps ?? {}),
          readOnly: true,
          endAdornment: (
            <InputAdornment position="end">
              <ArrowDropDownIcon />
            </InputAdornment>
          ),
        }}
        inputProps={htmlInputProps}
      />
    );
  }
);

const DateRangePicker = ({
  dateFrom,
  dateTo,
  dateFromError,
  dateToError,
  minDateFrom,
  yesterday,
  onDateFromChange,
  onDateToChange,
  isUsers = false,
  isDisabled = false,
}: DateRangePickerProps) => {

  const [openFrom, setOpenFrom] = useState(false);
  const [openTo, setOpenTo] = useState(false);

  const getMinDateTo = () => {
    if (dateFrom) { return startOfDay(dateFrom); }
    if (isUsers) { return startOfDay(minDateFrom); }
    const rangeStart = startOfDay(subDays(yesterday, 90));
    return rangeStart < minDateFrom ? startOfDay(minDateFrom) : rangeStart;
  };

  const getMaxDateTo = () => {
    if (isUsers) { return yesterday; }
    if (!dateFrom) { return yesterday; }
    const maxAllowed = endOfDay(addDays(dateFrom, 90));
    return maxAllowed > yesterday ? yesterday : maxAllowed;
  };

  const makeSlotProps = (error: string | undefined, hasValue: boolean, onClickOpen: () => void) => ({
    field: {
      readOnly: true,
    },
    textField: {
      hasValue,
      required: true,
      error: Boolean(error),
      helperText: error,
      onClick: isDisabled ? undefined : onClickOpen,
      sx: fieldSx,
    },
  });

  const commonPickerProps = {
    format: 'dd/MM/yyyy',
    views: ['year', 'month', 'day'] as const,

    slots: {
      textField: ReadOnlyTextField as never,
      openPickerIcon: ArrowDropDownIcon,
    },
  };

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 2,
        flexShrink: 0,
        width: { xs: '100%', md: 'auto' },
      }}
    >
      <DatePicker
        label={'Dal'}
        value={dateFrom}
        disabled={isDisabled}
        onChange={onDateFromChange}
        minDate={minDateFrom}
        maxDate={yesterday}
        {...commonPickerProps}
        referenceDate={dateFrom ?? yesterday}
        open={openFrom}
        onOpen={() => setOpenFrom(true)}
        onClose={() => setOpenFrom(false)}
        onAccept={() => {
          setOpenFrom(false);
          setOpenTo(true);
        }}
        slotProps={makeSlotProps(dateFromError, Boolean(dateFrom), () => setOpenFrom(true))}
      />

      <DatePicker
        label={'Al'}
        value={dateTo}
        onChange={onDateToChange}
        disabled={isDisabled}
        minDate={getMinDateTo()}
        maxDate={getMaxDateTo()}
        {...commonPickerProps}
        referenceDate={dateFrom ? startOfDay(dateFrom) : yesterday}
        open={openTo}
        onOpen={() => setOpenTo(true)}
        onClose={() => setOpenTo(false)}
        onAccept={() => setOpenTo(false)}
        slotProps={makeSlotProps(dateToError, Boolean(dateTo), () => setOpenTo(true))}
      />
    </Box>
  );
};

export default DateRangePicker;