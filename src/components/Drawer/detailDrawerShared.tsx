import { ReceiptLong } from '@mui/icons-material';
import { Box, Button, CircularProgress, Tooltip, Typography } from '@mui/material';
import { theme } from '@pagopa/mui-italia/theme';
import { currencyFormatter, formatValues } from '../../utils/formatUtils';
import { MISSING_DATA_PLACEHOLDER, TYPE_TEXT } from '../../utils/constants';

type DrawerStyle = Record<string, any>;

export const drawerTruncatedTextSx: DrawerStyle = {
  display: 'block',
  maxWidth: '100%',
  minWidth: 0,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

export const getDrawerTooltipTitle = (value?: string) =>
  value?.trim() === '' || !value ? MISSING_DATA_PLACEHOLDER : value;

export const getDetailValueText = (
  itemValues: Record<string, any>,
  driver: string,
  type: TYPE_TEXT
) => {
  const index = Object.keys(itemValues).indexOf(driver);
  const val = Object.values(itemValues)[index] as string;

  if (driver === 'additionalProperties.productName') {
    return itemValues?.additionalProperties?.productName ?? MISSING_DATA_PLACEHOLDER;
  }

  if (type === TYPE_TEXT.Text) {
    return formatValues(val);
  }

  if (type === TYPE_TEXT.Currency) {
    return currencyFormatter(Number(val) / 100).toString();
  }

  return 'error on type';
};

type DrawerLabeledValueProps = {
  label: string;
  value?: string;
  boxSx?: DrawerStyle;
  valueSx?: DrawerStyle;
};

export function DrawerLabeledValue({
  label,
  value,
  boxSx,
  valueSx,
}: DrawerLabeledValueProps) {
  const mergedValueSx = { ...drawerTruncatedTextSx, ...valueSx } as const;

  return (
    <Box sx={boxSx as any}>
      <Typography
        variant="body2"
        fontWeight={theme.typography.fontWeightRegular}
        color={theme.palette.text.secondary}
      >
        {label}
      </Typography>
      <Tooltip title={getDrawerTooltipTitle(value)}>
        <Typography
          variant="body2"
          fontWeight={theme.typography.fontWeightMedium}
          sx={mergedValueSx as any}
        >
          {value ?? MISSING_DATA_PLACEHOLDER}
        </Typography>
      </Tooltip>
    </Box>
  );
}

type DrawerFileButtonProps = {
  label: string;
  filename?: string;
  isLoading: boolean;
  onClick: () => void;
  dataTestId?: string;
  contentSx?: DrawerStyle;
  iconSx?: DrawerStyle;
  fileNameSx?: DrawerStyle;
};

export function DrawerFileButton({
  label,
  filename,
  isLoading,
  onClick,
  dataTestId = 'btn-test',
  contentSx,
  iconSx,
  fileNameSx,
}: DrawerFileButtonProps) {
  const contentStyles = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '6px',
    width: '100%',
    mt: '2px',
    minWidth: 0,
    ...contentSx,
  } as const;

  const iconStyles = { flexShrink: 0, ...iconSx } as const;

  const fileNameStyles = {
    ...drawerTruncatedTextSx,
    flex: 1,
    ...fileNameSx,
  } as const;

  return (
    <Box>
      <Typography
        variant="body2"
        fontWeight={theme.typography.fontWeightRegular}
        color={theme.palette.text.secondary}
      >
        {label}
      </Typography>
      <Button
        data-testid={dataTestId}
        sx={{
          padding: 0,
          width: '100%',
          display: 'block',
          textAlign: 'left',
          minWidth: 0,
          maxWidth: '100%',
          minHeight: 'fit-content',
          height: 'auto',
          '&:hover': {
            backgroundColor: '#fff',
            color: '#0055AA',
          },
        }}
        onClick={onClick}
      >
        {isLoading ? (
          <CircularProgress color="inherit" size={20} data-testid="item-loader" />
        ) : (
          <Box sx={contentStyles as any}>
            <ReceiptLong sx={iconStyles as any} />
            <Tooltip title={getDrawerTooltipTitle(filename)}>
              <Typography
                component="span"
                variant="inherit"
                sx={fileNameStyles as any}
              >
                {filename ?? MISSING_DATA_PLACEHOLDER}
              </Typography>
            </Tooltip>
          </Box>
        )}
      </Button>
    </Box>
  );
}
