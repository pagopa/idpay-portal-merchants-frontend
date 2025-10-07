import { Chip, styled } from "@mui/material";

export interface Props {
  label:string;
  colorChip?: string;
  sizeChip?:"small" | "medium";
  variantChip?:"filled" | "outlined";
  textColorChip?: string;
}

export default function CustomChip({label, colorChip, sizeChip, variantChip,textColorChip}: Props) {
  
    const StyledChip = styled(Chip)({
    [`&.MuiChip-filled`]: {
      backgroundColor: colorChip,
      color: textColorChip,
    }
  });
  return (
    
    <StyledChip label={label} size={sizeChip} variant={variantChip} />
  );
}
