import React, { useState } from 'react';
import { useFormik } from 'formik';
import { Box, Stack, Button } from '@mui/material';
import { useTranslation, Trans } from 'react-i18next';
import ReportIcon from '@mui/icons-material/Report';
import { TitleBox } from '@pagopa/selfcare-common-frontend';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import { storageTokenOps } from '@pagopa/selfcare-common-frontend/utils/storage';
import DataTable from '../../components/dataTable/DataTable';
import { GetReportedUsersFilters } from '../../types/types';
import routes from '../../routes';
import { getReportedUser, deleteReportedUser } from '../../services/merchantService';
import { parseJwt } from '../../utils/jwt-utils';
import AlertComponent from '../../components/Alert/AlertComponent';
import { isValidCF, normalizeValue } from './helpersReportedUsers';
import SearchTaxCode from './SearchTaxCode';
import NoResultPaper from './NoResultPaper';
import { getReportedUsersColumns } from './columnsReportedUser';
import ModalReportedUser from './modalReportedUser';
interface RouteParams {
  id: string;
}

const initialValues: GetReportedUsersFilters = {
  cf: '',
  gtin: '',
  status: '',
  page: 0,
  size: 1,
  sort: 'asc',
};

const successAlertMap: Record<string, string> = {
  valid: 'pages.reportedUsers.cf.validCf',
  removed: 'pages.reportedUsers.cf.removedCf'
};

const ReportedUsers: React.FC = () => {
  const [success, setSuccess] = useState({variant: '', isOpen: false});
  const location = useLocation<{ newCf?: string; showSuccessAlert?: boolean }>();
  const [user, setUser] = useState<
    Array<{
      cf: string;
      reportedDate: string;
      transactionDate: string;
      transactionId: string;
    }>
  >([]);
  const [lastSearchedCF, setLastSearchedCF] = useState<string | undefined>(undefined);
  const [showEmptyAlert, setShowEmptyAlert] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedCf, setSelectedCf] = useState<string | null>(null);
  const history = useHistory();

  const { id } = useParams<RouteParams>();

  const userJwt = parseJwt(storageTokenOps.read());
  const merchantId = userJwt?.merchant_id;

  React.useEffect(() => {
    if (user.length === 0 && lastSearchedCF && isValidCF(lastSearchedCF)) {
      setShowEmptyAlert(true);
      setTimeout(() => setShowEmptyAlert(false), 3000);
    } else {
      setShowEmptyAlert(false);
    }
  }, [user, lastSearchedCF]);

  React.useEffect(() => {
    if (location.state && location.state.newCf) {
      void formik.setFieldValue('cf', location.state.newCf);
      if (location.state.showSuccessAlert) {
        setSuccess({variant: 'valid', isOpen: true});
        setTimeout(() => setSuccess(prev => ({ ...prev, isOpen: false})), 3000);
      }
      setTimeout(() => {
        void formik.handleSubmit();
      }, 0);
      history.replace({ ...location, state: {} });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formik = useFormik<GetReportedUsersFilters>({
    initialValues,
    validate: (values) => {
      let errors: Partial<GetReportedUsersFilters> = {};
      if (values.cf && !isValidCF(values.cf)) {
        errors = { ...errors, cf: t('validation.cf.invalid') };
      }
      return errors;
    },
    onSubmit: async (values: GetReportedUsersFilters) => {
      setShowEmptyAlert(false);
      setLastSearchedCF(values.cf);
      setError(null);
      setUser([]);
      if (values.cf && isValidCF(values.cf)) {
        setLoading(true);
        try {
          const res = await getReportedUser(id, values.cf);
          if (!Array.isArray(res) || res.length === 0) {
            setUser([]);
          } else {
            setUser(
              res.map((item) => ({
                cf: normalizeValue(item.fiscalCode),
                reportedDate: normalizeValue(item.reportedDate),
                transactionDate: normalizeValue(item.trxChargeDate),
                transactionId: normalizeValue(item.transactionId),
              }))
            );
          }
        } catch (e: any) {
          if (e?.status === 404 || e?.response?.status === 404) {
            console.error('Reported user not found (404):', e);
          } else {
            setUser([]);
            setError('Errore durante il recupero dell’utente segnalato');
            console.error('Error while fetching reported user:', e);
          }
        } finally {
          setLoading(false);
        }
      } else {
        setUser([]);
      }
    },
  });

  const handleDelete = async (cf: string) => {
    if (!merchantId || !id || !cf) {
      return;
    }
    try {
      await deleteReportedUser(id, cf);
      setUser([]);
      setLastSearchedCF(undefined);
      setSuccess({variant: 'removed', isOpen: true});
      setTimeout(() => setSuccess(prev => ({ ...prev, isOpen: false})), 3000);
    } catch (e) {
      console.error('Error while deleting reported user:', e);
    }
  };

  const handleOpenDeleteModal = (cf: string) => {
    setSelectedCf(cf);
    setDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false);
    setSelectedCf(null);
  };

  const handleConfirmDelete = async () => {
    if (selectedCf) {
      await handleDelete(selectedCf);
    }
    handleCloseDeleteModal();
    void formik.setFieldValue('cf', '');
  };

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
              history.push(routes.REPORTED_USERS_INSERT.replace(':id', id), {
                merchantId,
                initiativeID: id,
              });
            }}
            startIcon={<ReportIcon />}
            sx={{ width: { xs: '100%', md: 'auto', alignSelf: 'start', minWidth: '174px' } }}
          >
            {t('pages.reportedUsers.reportUser')}
          </Button>
        </Stack>
        <SearchTaxCode
          formik={formik as any}
          onSearch={handleFiltersApplied}
          onReset={() => {
            setUser([]);
            setLastSearchedCF(undefined);
            void formik.setFieldValue('cf', '');
          }}
        />
        {user.length > 0 && (
          <Box
            sx={{
              height: 'auto',
              width: '100%',
              mt: 2,
              '& .MuiDataGrid-footerContainer': { display: 'none' },
            }}
          >
            <DataTable
              rows={rowsWithId}
              columns={getReportedUsersColumns(handleOpenDeleteModal)}
              rowsPerPage={1}
              paginationModel={{
                pageNo: 0,
                pageSize: 1,
                totalElements: user.length,
              }}
            />
          </Box>
        )}
        <ModalReportedUser
          open={deleteModalOpen}
          title={t('pages.reportedUsers.ModalReportedUser.title')}
          description={
            selectedCf ? (
              <Trans
                i18nKey="pages.reportedUsers.ModalReportedUser.description"
                values={{ cf: selectedCf }}
                components={{ strong: <strong /> }}
              />
            ) : (
              ''
            )
          }
          descriptionTwo={t('pages.reportedUsers.ModalReportedUser.descriptionTwo')}
          cancelText={t('pages.reportedUsers.ModalReportedUser.cancelText')}
          confirmText={t('pages.reportedUsers.ModalReportedUser.confirmText')}
          onCancel={handleCloseDeleteModal}
          onConfirm={handleConfirmDelete}
          cfModal={undefined}
        />

        {user.length === 0 && !loading && !error && (
          <NoResultPaper translationKey="pages.reportedUsers.noUsers" />
        )}
      </Box>
      {user.length === 0 && !loading && !error && !location.state?.newCf && (
        <AlertComponent
          data-testid='msg-error'
          isOpen={showEmptyAlert}
          severity="error"
          text={t('pages.reportedUsers.cf.noResultUser')}
          onClose={() => setShowEmptyAlert(false)}
        />)}
      <AlertComponent
        data-testid='msg-success'
        severity="success"
        text={t(successAlertMap[success.variant])}
        isOpen={success.isOpen}
        onClose={() => setSuccess(prev => ({ ...prev, isOpen: false}))}
      />
    </>
  );
};

export default ReportedUsers;
