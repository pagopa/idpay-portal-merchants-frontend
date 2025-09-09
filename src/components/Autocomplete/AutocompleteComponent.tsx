import { useState, useEffect } from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import CircularProgress from '@mui/material/CircularProgress';
import { useTranslation } from "react-i18next";
import { MANDATORY_FIELD } from '../../utils/constants';


export default function AutocompleteComponent({
  options,
  onChangeDebounce,
  inputError,
  onChange,
  errorText,
  required,
}: Readonly<{
  options: Array<any>;
  onChangeDebounce?: (value: string) => void;
  inputError?: boolean;
  onChange?: (value: any) => void;
  errorText?: string;
  required?: boolean;
}>) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [optionValue, setOptionValue] = useState('');
  const { t } = useTranslation();

  useEffect(() => {
    if (inputValue.length < 5 || inputValue.trim().length === 0 || optionValue === inputValue) {
      setLoading(false);
      return;
    }

    setLoading(true);

    const timer = setTimeout(() => {
      if (onChangeDebounce) {
        onChangeDebounce(inputValue);
      }
    }, 800);
    return () => {
      clearTimeout(timer);
    };
  }, [inputValue]);

  useEffect(() => {
    setLoading(false);
  }, [options]);

  const getHelperText = () => {
    if (!inputError) {return '';}
    return errorText || MANDATORY_FIELD;
  };

  return (
    <Autocomplete
      id="server-side-autocomplete"
      sx={{
        width: 300,
        '& .MuiFormLabel-root.Mui-error': {
          color: '#5C6E82 !important',
        },
      }}
      open={open}
      onOpen={() => {
        setOpen(true);
      }}
      onClose={() => {
        setOpen(false);
      }}
      isOptionEqualToValue={(option, value) => option?.address === value?.address}
      getOptionLabel={(option) => {
        setOptionValue(option?.Address?.Label ?? '');
        return option?.Address?.Label ?? '';
      }}
      options={options}
      loading={loading}
      noOptionsText={t('pages.pointOfSales.noOptionsText')}
      loadingText={t('pages.pointOfSales.loadingText')}
      onChange={(_, optionValue) => {
        if (onChange) {
          onChange(optionValue);
        }
      }}
      onInputChange={(_, newInputValue) => {
        setInputValue(newInputValue);
      }}
      filterOptions={(x) => x}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Cerca"
          size="small"
          error={inputError}
          helperText={getHelperText()}
          required={required}
          sx={{ marginTop: 2 }}
          InputProps={{
            ...params.InputProps,
            endAdornment: <>{loading ? <CircularProgress color="inherit" size={20} /> : null}</>,
          }}
        />
      )}
      componentsProps={{
        popper: {
          sx: {
            '& .MuiAutocomplete-option': {
              '&:hover': {
                backgroundColor: '#0073E614 !important',
                color: '#0073E6 !important',
                fontWeight: '600 !important',
              },
            },
            '& .MuiAutocomplete-noOptions': {
              fontWeight: '600',
            },
            '& .MuiAutocomplete-listbox': {
              '&::-webkit-scrollbar': {
                width: '6px',
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: '#0073E6',
                borderRadius: '4px',
              },
              '&::-webkit-scrollbar-thumb:hover': {
                backgroundColor: '#005BB5',
              },
              '&::-webkit-scrollbar-track': {
                backgroundColor: '#f1f1f1',
                borderRadius: '4px',
              },
            },
          },
        },
      }}
    ></Autocomplete>
  );
}