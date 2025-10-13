import {
  Box,
  Chip,
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
import { useTranslation } from 'react-i18next';
import SearchIcon from '@mui/icons-material/Search';
import { grey } from '@mui/material/colors';
import { ButtonNaked } from '@pagopa/mui-italia';
import { useEffect, useState } from 'react';
import { generatePath, useHistory } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { intiativesListSelector, setSelectedInitative } from '../../redux/slices/initiativesSlice';
import EmptyList from '../components/EmptyList';
import { StatusEnum } from '../../api/generated/merchants/InitiativeDTO';
import ROUTES from '../../routes';
import { Data, EnhancedTableProps, HeadCell, Order, getComparator, stableSort } from './helpers';

function EnhancedTableHead(props: EnhancedTableProps) {
  const { order, orderBy, onRequestSort } = props;
  const createSortHandler = (property: keyof Data) => (event: React.MouseEvent<unknown>) => {
    onRequestSort(event, property);
  };
  const { t } = useTranslation();

  const headCells: ReadonlyArray<HeadCell> = [
    {
      id: 'initiativeName',
      numeric: false,
      disablePadding: false,
      label: `${t('pages.initiativesList.initiativeName')}`,
    },
    {
      id: 'organizationName',
      numeric: false,
      disablePadding: false,
      label: `${t('pages.initiativesList.organizationName')}`,
    },
    {
      id: 'spendingPeriod',
      numeric: false,
      disablePadding: false,
      label: `${t('pages.initiativesList.spendingPeriod')}`,
    },
    {
      id: 'serviceId',
      numeric: false,
      disablePadding: true,
      label: `${t('pages.initiativesList.serviceId')}`,
    },
    {
      id: 'status',
      numeric: false,
      disablePadding: false,
      label: `${t('pages.initiativesList.initiativeStatus')}`,
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
              active={orderBy === headCell.id && headCell.id !== 'spendingPeriod'}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={createSortHandler(headCell.id)}
              hideSortIcon={headCell.id === 'spendingPeriod'}
              disabled={headCell.id === 'spendingPeriod'}
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

const InitiativesList = () => {
  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<keyof Data>('initiativeName');
  const [initiativeList, setInitiativeList] = useState<Array<Data>>([]);
  const [initiativeListFiltered, setInitiativeListFiltered] = useState<Array<Data>>([]);
  const history = useHistory();
  const { t } = useTranslation();
  const initiativesListSel = useAppSelector(intiativesListSelector);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (Array.isArray(initiativesListSel)) {
      const mappedInitativeList = initiativesListSel?.map((item, index) => ({
        initiativeId: item.initiativeId || '',
        initiativeName: item.initiativeName || '',
        organizationName: item.organizationName || '',
        spendingPeriod: `${item.startDate?.toLocaleDateString(
          'fr-FR'
        )} - ${item.endDate?.toLocaleDateString('fr-FR')}`,
        serviceId: item.serviceId || '',
        status: item.status || '',
        id: index,
      }));
      setInitiativeList(mappedInitativeList);
      setInitiativeListFiltered(mappedInitativeList);
    }
  }, [initiativesListSel]);

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
      case StatusEnum.PUBLISHED:
        return (
          <Chip
            sx={{ fontSize: '14px' }}
            label={t('commons.initiativeStatusEnum.published')}
            color="success"
          />
        );
      case StatusEnum.CLOSED:
        return (
          <Chip
            sx={{ fontSize: '14px' }}
            label={t('commons.initiativeStatusEnum.closed')}
            color="default"
          />
        );
      default:
        return null;
    }
  };

  return (
    <Box width="100%" px={2}>
      <TitleBox
        title={t('pages.initiativesList.title')}
        subTitle={t('pages.initiativesList.subtitle')}
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
            placeholder={t('pages.initiativesList.searchByInitiativeName')}
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
            inputProps={{ 'data-testid': 'search-initiatives' }}
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
        <TableContainer>
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
                            onClick={() => {
                              dispatch(
                                setSelectedInitative({
                                  spendingPeriod: row.spendingPeriod,
                                  initiativeName: row.initiativeName,
                                })
                              );
                              history.push(generatePath(ROUTES.OVERVIEW, { id: row.initiativeId }));
                            }}
                            data-testid="initiative-btn-test"
                          >
                            {row.initiativeName}
                          </ButtonNaked>
                        </TableCell>
                        <TableCell>{row.organizationName}</TableCell>
                        <TableCell>{row.spendingPeriod}</TableCell>
                        <TableCell>{row.serviceId}</TableCell>
                        <TableCell>{renderInitiativeStatus(row.status as StatusEnum)}</TableCell>
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
                <EmptyList message={t('pages.initiativesList.emptyList')} />
              </Box>
            </Box>
          )}
        </TableContainer>
      </Paper>
    </Box>
  );
};
export default InitiativesList;
