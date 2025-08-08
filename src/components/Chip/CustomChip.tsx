import { Chip, styled } from "@mui/material";

export interface Props {
  label:string;
  colorChip?: string;
  sizeChip?:"small" | "medium";
  variantChip?:"filled" | "outlined";
}



export default function CustomChip({label, colorChip, sizeChip, variantChip}: Props) {
  
    const StyledChip = styled(Chip)({
    [`&.MuiChip-filled`]: {
      backgroundColor: colorChip
    }
  });
  return (
    
    <StyledChip label={label} size={sizeChip} variant={variantChip} />
  );
}
