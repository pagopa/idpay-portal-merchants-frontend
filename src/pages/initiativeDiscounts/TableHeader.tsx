import { TableCell, TableHead, TableRow } from '@mui/material';
import useScopedTranslation from '../../hooks/useScopedTranslation';

interface Props {
  data: Array<{ width: string; label: string }>;
}

const TableHeader = ({ data }: Props) => {
  const { t } = useScopedTranslation();
  return (
    <TableHead>
      <TableRow>
        {data.map((d, index) => (
          <TableCell key={index} width={d.width}>
            {d.label.length > 0 ? t(d.label) : d.label}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
};

export default TableHeader;
