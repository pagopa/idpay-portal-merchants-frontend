import { Typography, Tooltip } from "@mui/material";
import { currencyFormatter } from "../../utils/formatUtils";
import { MISSING_DATA_PLACEHOLDER } from '../../utils/constants';

export interface Props {
  value: number;
  type?:"body1"|"body2";
  isValueVisible?: boolean;
}

export default function CurrencyColumn({ value, type="body1", isValueVisible }: Props) {
    return (
         <Tooltip
              title={isNaN(value) || (!isValueVisible && !value) ? MISSING_DATA_PLACEHOLDER : currencyFormatter(Number(value)).toString()}
            >
        <Typography variant={type} >
            {isNaN(value) || (!isValueVisible && !value) ? MISSING_DATA_PLACEHOLDER : currencyFormatter(Number(value)).toString()}
        </Typography>
        </Tooltip>
    );
}
