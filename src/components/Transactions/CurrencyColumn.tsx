import { Typography, Tooltip } from "@mui/material";
import { currencyFormatter } from "../../utils/formatUtils";
import { MISSING_DATA_PLACEHOLDER } from '../../utils/constants';

export interface Props {
  value:string|number;
  type?:"body1"|"body2";
}

export default function CurrencyColumn({ value, type="body1" }: Props) {
    return (
         <Tooltip
              title={value ? currencyFormatter(Number(value)).toString() : MISSING_DATA_PLACEHOLDER}
              placement="top"
            >
        <Typography variant={type} >
            {value ? currencyFormatter(Number(value)).toString() : MISSING_DATA_PLACEHOLDER}
        </Typography>
        </Tooltip>
    );
}
