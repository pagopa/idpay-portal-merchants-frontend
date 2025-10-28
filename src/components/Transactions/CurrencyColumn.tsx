import { Typography, Tooltip } from "@mui/material";
import { currencyFormatter } from "../../utils/formatUtils";

export interface Props {
  value:string|number;
  type?:"body1"|"body2";
}

export default function CurrencyColumn({ value, type="body1" }: Props) {
    return (
         <Tooltip
              title={value ? currencyFormatter(Number(value)).toString() : ''}
              placement="top"
              arrow={true}
            >
        <Typography variant={type} >
            {currencyFormatter(Number(value)).toString()}
        </Typography>
        </Tooltip>
    );
}
