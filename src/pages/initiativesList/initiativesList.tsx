import {
  Box,
  Chip,
  CircularProgress,
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
  Tabs,
  Tab,
  Typography,
} from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import { TitleBox } from '@pagopa/selfcare-common-frontend/lib';
import SearchIcon from '@mui/icons-material/Search';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { useEffect, useState } from 'react';
import { generatePath, useHistory } from 'react-router-dom';
import useScopedTranslation from '../../hooks/useScopedTranslation';
import { useAppSelector } from '../../redux/hooks';
import { intiativesListSelector } from '../../redux/slices/initiativesSlice';
import EmptyList from '../components/EmptyList';
import { InitiativeDTO } from '../../api/generated/merchants/data-contracts';

type StatusEnum = InitiativeDTO['status'];
const PUBLISHED: StatusEnum = 'PUBLISHED';
const CLOSED: StatusEnum = 'CLOSED';
import ROUTES from '../../routes';
import { getMerchantInitiativesAvailable } from '../../services/merchantService';
import { Data, EnhancedTableProps, HeadCell, Order, getComparator, stableSort } from './helpers';
import { NEW_INITIATIVES_TEMPORARY_MOCK } from './newInitiativesTemporaryMock';

const USE_NEW_INITIATIVES_TEMP_MOCK = true;

function SortableTableHead({
  order,
  orderBy,
  onRequestSort,
  headCells,
}: EnhancedTableProps & { headCells: ReadonlyArray<HeadCell> }) {
  const createSortHandler = (property: keyof Data) => (event: React.MouseEvent<unknown>) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead sx={{ backgroundColor: '#E8EBF1' }}>
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
                <Box component="span" sx={{ ...visuallyHidden }}>
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

function EnhancedTableHead(props: EnhancedTableProps) {
  const { t } = useScopedTranslation();

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
      label: `${t('pages.initiativesList.validityPeriod')}`,
    },
    {
      id: 'status',
      numeric: false,
      disablePadding: false,
      label: `${t('pages.initiativesList.initiativeStatus')}`,
    },
  ];

  return <SortableTableHead {...props} headCells={headCells} />;
}

function NewInitiativesTableHead(props: EnhancedTableProps) {
  const { order, orderBy, onRequestSort } = props;
  const { t } = useScopedTranslation();
  const createSortHandler = (property: keyof Data) => (event: React.MouseEvent<unknown>) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead sx={{ backgroundColor: '#E8EBF1' }}>
      <TableRow>
        <TableCell
          align="left"
          padding="normal"
          sortDirection={orderBy === 'initiativeName' ? order : false}
        >
          <TableSortLabel
            active={orderBy === 'initiativeName'}
            direction={orderBy === 'initiativeName' ? order : 'asc'}
            onClick={createSortHandler('initiativeName')}
          >
            {t('pages.initiativesList.initiativeName')}
          </TableSortLabel>
        </TableCell>
        <TableCell
          align="left"
          padding="normal"
          sortDirection={orderBy === 'organizationName' ? order : false}
        >
          <TableSortLabel
            active={orderBy === 'organizationName'}
            direction={orderBy === 'organizationName' ? order : 'asc'}
            onClick={createSortHandler('organizationName')}
          >
            {t('pages.initiativesList.organizationName')}
          </TableSortLabel>
        </TableCell>
        <TableCell align="right" padding="normal" />
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
  const { t } = useScopedTranslation();
  const [value, setValue] = useState(0);
  const [newInitiativesLoading, setNewInitiativesLoading] = useState(false);
  const [newInitiativesLoaded, setNewInitiativesLoaded] = useState(false);
  const [newInitiativesList, setNewInitiativesList] = useState<Array<Data>>([]);
  const initiativesListSel = useAppSelector(intiativesListSelector);

  const initiativesTablePaperSx = {
    display: 'flex',
    pb: 1,
    pl: 1,
    pr: 1,
    flexDirection: 'column',
    alignItems: 'flex-end',
    alignSelf: 'stretch',
    width: '100%',
    backgroundColor: '#E8EBF1',
  } as const;

  interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
  }

  const TabPanel = (props: TabPanelProps) => {
    const { children, value, index, ...other } = props;

    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`tabpanel-${index}`}
        aria-labelledby={`tab-${index}`}
        {...other}
      >
        {value === index && (
          <Box>
            <Box>{children}</Box>
          </Box>
        )}
      </div>
    );
  };

  const a11yProps = (index: number) => ({
    id: `tab-${index}`,
    'aria-controls': `tabpanel-${index}`,
  });

  const loadNewInitiatives = async () => {
    if (newInitiativesLoading) {
      return;
    }

    if (USE_NEW_INITIATIVES_TEMP_MOCK) {
      setNewInitiativesList(NEW_INITIATIVES_TEMPORARY_MOCK);
      setNewInitiativesLoaded(true);
      return;
    }

    setNewInitiativesLoading(true);

    try {
      const response = await getMerchantInitiativesAvailable({
        page: 0,
        size: 1000,
      });

      const mappedInitiativeList: Array<Data> = response
        .flatMap((page) => page.content ?? [])
        .map((item, index) => ({
          initiativeId: item.initiativeId || '',
          initiativeName: item.initiativeName || '',
          organizationName: item.organizationName || '',
          status: item.status ?? '',
          onboardStatus: item.onboardStatus ?? '',
          id: index,
        }));

      setNewInitiativesList(mappedInitiativeList);
    } catch {
      // Keep UI fallback (empty state) without surfacing runtime overlay.
      setNewInitiativesList([]);
    } finally {
      setNewInitiativesLoaded(true);
      setNewInitiativesLoading(false);
    }
  };

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);

    if (newValue === 1 && !newInitiativesLoaded) {
      void loadNewInitiatives();
    }
  };

  useEffect(() => {
    if (Array.isArray(initiativesListSel)) {
      const mappedInitativeList = initiativesListSel?.map((item, index) => {
        const creationDate = (item as InitiativeDTO & { creationDate?: string }).creationDate;

        return {
          initiativeId: item.initiativeId || '',
          initiativeName: item.initiativeName || '',
          organizationName: item.organizationName || '',
          spendingPeriod: creationDate ? new Date(creationDate).toLocaleDateString('fr-FR') : '',
          serviceId: item.serviceId || '',
          status: (item.status as StatusEnum) ?? '',
          onboardStatus: '',
          id: index,
        };
      });
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

  const renderInitiativeStatus = (status?: StatusEnum) => {
    switch (status) {
      case PUBLISHED:
        return (
          <Chip
            sx={{ fontSize: '14px' }}
            label={t('enums.initiativeStatus.published')}
            color="success"
          />
        );
      case CLOSED:
        return (
          <Chip
            sx={{ fontSize: '14px' }}
            label={t('enums.initiativeStatus.closed')}
            color="default"
          />
        );
      default:
        return null;
    }
  };

  const openInitiativeOverview = (initiativeId: string) => {
    history.push(
      generatePath(ROUTES.OVERVIEW, {
        initiative_id: initiativeId,
      })
    );
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

      <Box sx={{ display: 'grid', gridColumn: 'span 12', height: 'auto', alignItems: 'start' }}>
        <Box sx={{ width: '100%', borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={value}
            onChange={handleChange}
            aria-label="merchant initiatives tabs"
            variant="fullWidth"
          >
            <Tab
              label={t('pages.initiativesList.myInitiativesTab')}
              {...a11yProps(0)}
              data-testid="merchant-initiatives-1"
            />
            <Tab
              label={t('pages.initiativesList.newInitiativesTab')}
              {...a11yProps(1)}
              data-testid="merchant-initiatives-2"
            />
          </Tabs>
        </Box>
        <Box sx={{ width: '100%' }}>
          {/* <TabPanel value={value} index={0}>
            <MerchantTransactions id={id} />
          </TabPanel> */}
          <TabPanel value={value} index={0}>
            <Paper sx={initiativesTablePaperSx}>
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
                                <Box
                                  component="button"
                                  type="button"
                                  sx={{
                                    color: 'primary.main',
                                    fontWeight: 600,
                                    fontSize: '1em',
                                    textAlign: 'left',
                                    background: 'none',
                                    border: 'none',
                                    padding: 0,
                                    cursor: 'pointer',
                                  }}
                                  onClick={() => openInitiativeOverview(row.initiativeId)}
                                  data-testid="initiative-btn-test"
                                >
                                  {row.initiativeName}
                                </Box>
                              </TableCell>
                              <TableCell>{row.organizationName}</TableCell>
                              <TableCell>{row.spendingPeriod}</TableCell>
                              <TableCell>
                                {renderInitiativeStatus(row.status as StatusEnum)}
                              </TableCell>
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
          </TabPanel>
          <TabPanel value={value} index={1}>
            <Paper sx={initiativesTablePaperSx}>
              {newInitiativesLoading ? (
                <Box
                  sx={{
                    backgroundColor: 'white',
                    border: '1px solid #D7DDE8',
                    p: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1,
                  }}
                >
                  <CircularProgress size={24} />
                  <Typography
                    variant="h6"
                    color="text.secondary"
                    sx={{ fontSize: '1rem !important' }}
                  >
                    {t('pages.initiativesList.newInitiativesLoadingTitle')}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    textAlign="center"
                    sx={{ fontSize: '0.875rem' }}
                  >
                    {t('pages.initiativesList.newInitiativesLoadingSubtitle')}
                  </Typography>
                </Box>
              ) : (
                <TableContainer sx={{ backgroundColor: 'white' }}>
                  {newInitiativesList.length > 0 ? (
                    <Table sx={{ minWidth: 750 }} aria-labelledby="tableTitle-new-initiatives">
                      <NewInitiativesTableHead
                        order={order}
                        orderBy={orderBy}
                        onRequestSort={handleRequestSort}
                      />
                      <TableBody sx={{ backgroundColor: 'white' }}>
                        {stableSort(newInitiativesList, getComparator(order, orderBy)).map(
                          (row, index) => {
                            const labelId = `new-initiatives-row-${index}`;
                            return (
                              <TableRow tabIndex={-1} key={row.id}>
                                <TableCell id={labelId} scope="row">
                                  <Box
                                    component="button"
                                    type="button"
                                    sx={{
                                      color: 'primary.main',
                                      fontWeight: 600,
                                      fontSize: '1em',
                                      textAlign: 'left',
                                      background: 'none',
                                      border: 'none',
                                      padding: 0,
                                      cursor: 'pointer',
                                    }}
                                    onClick={() => openInitiativeOverview(row.initiativeId)}
                                  >
                                    {row.initiativeName}
                                  </Box>
                                </TableCell>
                                <TableCell>{row.organizationName}</TableCell>
                                <TableCell align="right">
                                  {row.onboardStatus === 'ONBOARDABLE' ? (
                                    <Box
                                      component="button"
                                      type="button"
                                      sx={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: 0.5,
                                        color: 'primary.main',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        fontWeight: 600,
                                        fontSize: '1em',
                                        p: 0,
                                      }}
                                      onClick={() => openInitiativeOverview(row.initiativeId)}
                                    >
                                      Aderisci
                                      <ArrowForwardIcon sx={{ fontSize: '1rem' }} />
                                    </Box>
                                  ) : (
                                    <InfoOutlinedIcon color="primary" sx={{ fontSize: '1.1rem' }} />
                                  )}
                                </TableCell>
                              </TableRow>
                            );
                          }
                        )}
                      </TableBody>
                    </Table>
                  ) : (
                    <Paper
                      sx={{
                        my: 2,
                        p: 3,
                        textAlign: 'center',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: 'none',
                      }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: 1,
                        }}
                      >
                        <ErrorOutlineOutlinedIcon fontVariant="h5" color="disabled" />
                        <Typography variant="body2" sx={{ fontSize: '1rem !important' }}>
                          {t('pages.initiativesList.emptyList')}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          textAlign="center"
                          sx={{ fontSize: '0.875rem' }}
                        >
                          {t('pages.initiativesList.newInitiativesEmptySubtitle')}
                        </Typography>
                      </Box>
                    </Paper>
                  )}
                </TableContainer>
              )}
            </Paper>
          </TabPanel>
        </Box>
      </Box>
    </Box>
  );
};
export default InitiativesList;
