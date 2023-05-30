import {
  Box,
  Chip,
  // Button,
  InputAdornment,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TextField,
} from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import { TitleBox } from '@pagopa/selfcare-common-frontend';
// import { useTranslation } from 'react-i18next';
import SearchIcon from '@mui/icons-material/Search';
import { grey } from '@mui/material/colors';
import { ButtonNaked } from '@pagopa/mui-italia';
import { useEffect, useState } from 'react';
import { useInitiativesList } from '../../hooks/useInitiativesList';
import { useAppSelector } from '../../redux/hooks';
import { intiativesListSelector } from '../../redux/slices/initiativesSlice';
import EmptyList from '../components/EmptyList';
import { Data, EnhancedTableProps, HeadCell, Order, getComparator, stableSort } from './helpers';

function EnhancedTableHead(props: EnhancedTableProps) {
  const { order, orderBy, onRequestSort } = props;
  const createSortHandler = (property: keyof Data) => (event: React.MouseEvent<unknown>) => {
    onRequestSort(event, property);
  };
  // const { t } = useTranslation();

  const headCells: ReadonlyArray<HeadCell> = [
    {
      id: 'initiativeName',
      numeric: false,
      disablePadding: false,
      label: 'Nome',
    },
    {
      id: 'organizationName',
      numeric: false,
      disablePadding: false,
      label: 'Creata da',
    },
    {
      id: 'spendingPeriod',
      numeric: false,
      disablePadding: false,
      label: 'Periodo di spesa',
    },
    {
      id: 'serviceId',
      numeric: false,
      disablePadding: true,
      label: 'Codice identificativo',
    },
    {
      id: 'status',
      numeric: false,
      disablePadding: false,
      label: 'Stato',
    },
  ];

  return (
    <TableHead sx={{ backgroundColor: grey.A100 }}>
      <TableRow>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align="left"
            padding="normal"
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <Box component="span" sx={visuallyHidden}>
                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                </Box>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

const Home = () => {
  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<keyof Data>('initiativeName');
  const [initiativeList, setInitiativeList] = useState<Array<Data>>([]);
  const [initiativeListFiltered, setInitiativeListFiltered] = useState<Array<Data>>([]);
  useInitiativesList();

  const initiativesList = useAppSelector(intiativesListSelector);

  useEffect(() => {
    if (Array.isArray(initiativesList)) {
      const mappedInitativeList = initiativesList?.map((item, index) => ({
        initiativeName: item.initiativeName || '',
        organizationName: item.organizationName || '',
        spendingPeriod:
          `${item.startDate?.toLocaleDateString('fr-FR')} - ${item.endDate?.toLocaleDateString(
            'fr-FR'
          )}` || '',
        serviceId: item.serviceId || '',
        status: item.status || '',
        id: index,
      }));
      setInitiativeList(mappedInitativeList);
      setInitiativeListFiltered(mappedInitativeList);
    }
  }, [initiativesList]);

  const handleSearchInitiatives = (s: string) => {
    const search = s.toLocaleLowerCase();
    if (search.length > 0) {
      const listFiltered: Array<Data> = [];
      initiativeList?.forEach((record) => {
        if (record?.initiativeName?.toLowerCase().includes(search)) {
          // eslint-disable-next-line functional/immutable-data
          listFiltered.push(record);
        }
      });
      setInitiativeListFiltered([...listFiltered]);
    } else {
      if (Array.isArray(initiativeList)) {
        setInitiativeListFiltered([...initiativeList]);
      }
    }
  };

  const handleRequestSort = (_event: React.MouseEvent<unknown>, property: keyof Data) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const renderInitiativeStatus = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return <Chip sx={{ fontSize: '14px' }} label="In corso" color="success" />;
      case 'CLOSED':
        return <Chip sx={{ fontSize: '14px' }} label="Terminata" color="default" />;
      default:
        return null;
    }
  };

  return (
    <Box width="100%" px={2}>
      <TitleBox
        title="Portale esercente"
        subTitle="Pagine disponibili"
        mbTitle={2}
        mtTitle={2}
        mbSubTitle={5}
        variantTitle="h4"
        variantSubTitle="body1"
        data-testid="title"
      />

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(12, 1fr)',
          columnGap: 2,
          justifyContent: 'center',
          width: '100%',
          mb: 5,
        }}
      >
        <Box sx={{ display: 'grid', gridColumn: 'span 12' }}>
          <TextField
            id="search-initiative"
            placeholder="Cerca per nome dell'iniziativa"
            variant="outlined"
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            onChange={(e) => {
              handleSearchInitiatives(e.target.value);
            }}
            inputProps={{ 'data-testid': 'search-initiative-no-permission-test' }}
          />
        </Box>
      </Box>

      <Paper
        sx={{
          width: '100%',
          mb: 2,
          pb: 3,
          backgroundColor: grey.A100,
        }}
      >
        <TableContainer >
          {initiativeListFiltered.length > 0 ? (
            <Table sx={{ minWidth: 750 }} aria-labelledby="tableTitle">
              <EnhancedTableHead
                order={order}
                orderBy={orderBy}
                onRequestSort={handleRequestSort}
              />
              <TableBody sx={{ backgroundColor: 'white' }}>
                {stableSort(initiativeListFiltered, getComparator(order, orderBy)).map(
                  (row, index) => {
                    const labelId = `enhanced-table-row-${index}`;
                    return (
                      <TableRow tabIndex={-1} key={row.id} sx={{}}>
                        <TableCell id={labelId} scope="row">
                          <ButtonNaked
                            component="button"
                            sx={{
                              color: 'primary.main',
                              fontWeight: 600,
                              fontSize: '1em',
                              textAlign: 'left',
                            }}
                            // onClick={() =>   history.replace(   `${BASE_ROUTE}/panoramica-iniziativa/${row.initiativeId}` )   }
                            data-testid="initiative-btn-test"
                          >
                            {row.initiativeName}
                          </ButtonNaked>
                        </TableCell>
                        <TableCell>{row.organizationName}</TableCell>
                        <TableCell>{row.spendingPeriod}</TableCell>
                        <TableCell>{row.serviceId}</TableCell>
                        <TableCell>{renderInitiativeStatus(row.status)}</TableCell>
                      </TableRow>
                    );
                  }
                )}
              </TableBody>
            </Table>
          ) : (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(12, 1fr)',
                justifyContent: 'center',
                width: '100%',
                backgroundColor: 'white',
                p: 2,
              }}
            >
              <Box
                sx={{
                  display: 'inline',
                  gridColumn: 'span 12',
                  justifyContent: 'center',
                  textAlign: 'center',
                }}
              >
                <EmptyList message="Nessun risultato disponibile" />
              </Box>
            </Box>
          )}
        </TableContainer>
      </Paper>
    </Box>
  );
};
export default Home;
