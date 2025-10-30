import React, { useState } from 'react';
import { useFormik } from 'formik';
import { Box, Typography, Paper, Stack, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import ReportIcon from '@mui/icons-material/Report';
import { TitleBox } from '@pagopa/selfcare-common-frontend';
import { useHistory, useParams } from 'react-router-dom';
import DataTable from '../../components/dataTable/DataTable';
import { GetReportedUsersFilters } from '../../types/types';
import { MISSING_DATA_PLACEHOLDER } from '../../utils/constants';
import routes from '../../routes';
import MsgResult from './MsgResult';
import { isValidCF } from './helpers';
import SearchTaxCode from './SearchTaxCode';

const NoResultPaper: React.FC<{ translationKey: string }> = ({ translationKey }) => {
  const { t } = useTranslation();
  return (
    <Paper
      sx={{
        my: 4,
        p: 3,
        textAlign: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Stack spacing={0.5} direction="row">
        <Typography variant="body2">{t(translationKey)}</Typography>
      </Stack>
    </Paper>
  );
};

const initialValues: GetReportedUsersFilters = {
  cf: '',
  gtin: '',
  status: '',
  page: 0,
  size: 1,
  sort: 'asc',
};

const ReportedUsers: React.FC = () => {
  const [user, setUser] = useState<Array<{ cf: string; date: string }>>([]);
  const [lastSearchedCF, setLastSearchedCF] = useState<string | undefined>(undefined);
  const [showEmptyAlert, setShowEmptyAlert] = useState(false);
  const history = useHistory();
  const { id } = useParams<{ id: string }>();

  React.useEffect(() => {
    if (
      user.length === 0 &&
      lastSearchedCF &&
      isValidCF(lastSearchedCF) &&
      lastSearchedCF !== 'NRLDKF78A39M293E'
    ) {
      setShowEmptyAlert(true);
    } else {
      setShowEmptyAlert(false);
    }
  }, [user, lastSearchedCF]);

  const formik = useFormik<GetReportedUsersFilters>({
    initialValues,
    validate: (values) => {
      let errors: Partial<GetReportedUsersFilters> = {};
      if (values.cf && !isValidCF(values.cf)) {
        errors = { ...errors, cf: 'Codice fiscale non valido' };
      }
      return errors;
    },
    onSubmit: (values: GetReportedUsersFilters) => {
      setShowEmptyAlert(false);
      setLastSearchedCF(values.cf);
      if (values.cf && isValidCF(values.cf) && values.cf === 'NRLDKF78A39M293E') {
        setUser([
          {
            cf: 'NRLDKF78A39M293E',
            date: '24/03/2021 14:12',
          },
        ]);
      } else {
        setUser([]);
      }
    },
  });

  const columns = [
    {
      field: 'cf',
      headerName: 'Codice fiscale',
      flex: 1,
      editable: false,
      disableColumnMenu: true,
      renderCell: (params: any) => (
        <Typography>{params.value || MISSING_DATA_PLACEHOLDER}</Typography>
      ),
    },
    {
      field: 'date',
      headerName: 'Data e ora',
      flex: 1,
      editable: false,
      disableColumnMenu: true,
      renderCell: (params: any) => (
        <Typography>{params.value || MISSING_DATA_PLACEHOLDER}</Typography>
      ),
    },
  ];

  const rowsWithId = user.map((r, idx) => ({ id: r.cf ?? `row-${idx}`, ...r }));

  const handleFiltersApplied = () => {
    formik.handleSubmit();
  };
  const { t } = useTranslation();
  return (
    <>
      <Box sx={{ my: 2 }}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={{ xs: 2, md: 3 }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', md: 'center' }}
        >
          <TitleBox
            title={t('pages.reportedUsers.title')}
            subTitle={t('pages.reportedUsers.subtitle')}
            mbTitle={2}
            variantTitle="h4"
            variantSubTitle="body1"
          />
          <Button
            variant="contained"
            size="small"
            onClick={() => {
              history.push(routes.REPORTED_USERS_INSERT.replace(':id', id));
            }}
            startIcon={<ReportIcon />}
            sx={{ width: { xs: '100%', md: 'auto', alignSelf: 'start', minWidth: '174px' } }}
          >
            {t('pages.reportedUsers.reportUser')}
          </Button>
        </Stack>
        <SearchTaxCode formik={formik as any} onSearch={handleFiltersApplied} />
        <Box
          sx={{
            height: 'auto',
            width: '100%',
            mt: 2,
            '& .MuiDataGrid-footerContainer': { display: 'none' },
          }}
        >
          <DataTable rows={rowsWithId} columns={columns} pageSize={1} rowsPerPage={1} />
        </Box>
        {user.length === 0 && (
          <>
            {showEmptyAlert ? (
              <MsgResult
                severity="error"
                message={t('pages.reportedUsers.noResultUser')}
                bottom={170}
              />
            ) : (
              <NoResultPaper translationKey="pages.reportedUsers.noUsers" />
            )}
          </>
        )}
      </Box>
    </>
  );
};

export default ReportedUsers;
