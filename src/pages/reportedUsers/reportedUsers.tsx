import React, { useCallback, useState, useRef, useEffect } from 'react';
import { useFormik } from 'formik';
import { Box, Stack, Button } from '@mui/material';
import { useTranslation, Trans } from 'react-i18next';
import ReportIcon from '@mui/icons-material/Report';
import { TitleBox } from '@pagopa/selfcare-common-frontend/lib';
import { useHistory } from 'react-router-dom';
import { storageTokenOps } from '@pagopa/selfcare-common-frontend/lib/utils/storage';
import { useCurrentInitiativeId } from '../../hooks/useCurrentInitiativeId';
import DataTable from '../../components/dataTable/DataTable';
import { GetReportedUsersFilters } from '../../types/types';
import routes from '../../routes';
import { getReportedUser, deleteReportedUser } from '../../services/merchantService';
import { parseJwt } from '../../utils/jwt-utils';
import AlertListComponent, { AlertProps } from '../../components/Alert/AlertListComponent';
import { useAlert } from '../../hooks/useAlert';
import { isValidCF, normalizeValue } from './helpersReportedUsers';
import SearchTaxCode from './SearchTaxCode';
import NoResultPaper from './NoResultPaper';
import { getReportedUsersColumns } from './columnsReportedUser';
import ModalReportedUser from './modalReportedUser';

const initialValues: GetReportedUsersFilters = {
  cf: '',
  gtin: '',
  status: '',
  page: 0,
  size: 1,
  sort: 'asc',
};

const ReportedUsers: React.FC = () => {
  const { t } = useTranslation();
  const { setAlert } = useAlert();
  const history = useHistory();
  const { initiativeId } = useCurrentInitiativeId();

  const requestIdRef = useRef<number>(0);

  const userJwt = parseJwt(storageTokenOps.read());
  const merchantId = userJwt?.merchant_id;

  const [alerts, setAlerts] = useState<Record<string, AlertProps>>({
    valid: { text: t('pages.reportedUsers.cf.validCf'), isOpen: false, severity: 'success' },
    removed: { text: t('pages.reportedUsers.cf.removedCf'), isOpen: false, severity: 'success' },
    missing: { text: t('pages.reportedUsers.cf.noResultUser'), isOpen: false, severity: 'error' },
  });

  const [user, setUser] = useState<
    Array<{
      cf: string;
      reportedDate: string;
      transactionDate: string;
      transactionId: string;
    }>
  >([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedCf, setSelectedCf] = useState<string | null>(null);

  const updateAlerts = useCallback((key: string, open: boolean) => {
    setAlerts((prev) => ({ ...prev, [key]: { ...prev[key], isOpen: open } }));
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
      setError(null);
      setUser([]);

      if (!values.cf || !isValidCF(values.cf) || !initiativeId) {
        return;
      }

      const currentRequestId = requestIdRef.current + 1;
      // eslint-disable-next-line functional/immutable-data
      requestIdRef.current = currentRequestId;

      setLoading(true);

      try {
        const res = await getReportedUser(initiativeId, values.cf);

        if (currentRequestId !== requestIdRef.current) {
          return;
        }

        if (!Array.isArray(res) || res.length === 0) {
          setUser([]);
          updateAlerts('missing', true);
          setTimeout(() => updateAlerts('missing', false), 3000);
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
        if (currentRequestId !== requestIdRef.current) {
          return;
        }

        const status =
          e?.status ??
          (e instanceof Object && 'status' in e ? (e as any).status : undefined) ??
          e?.response?.status;

        if (status === 404) {
          console.error('Reported user not found (404):', e);
        } else {
          setUser([]);
          setError('Errore durante il recupero dell’utente segnalato');
          setAlert({
            title: t('errors.genericTitle'),
            text: t('errors.genericDescription'),
            isOpen: true,
            severity: 'error',
          });
          console.error('Error while fetching reported user:', e);
        }
      } finally {
        if (currentRequestId === requestIdRef.current) {
          setLoading(false);
        }
      }
    },
  });

  const handleDelete = useCallback(
    async (cf: string) => {
      if (!merchantId || !initiativeId || !cf) {
        return;
      }
      try {
        await deleteReportedUser(initiativeId, cf);
        setUser([]);
        updateAlerts('removed', true);
        setTimeout(() => updateAlerts('removed', false), 3000);
      } catch (e) {
        console.error('Error while deleting reported user:', e);
      }
    },
    [merchantId, initiativeId, updateAlerts]
  );

  const handleOpenDeleteModal = useCallback((cf: string) => {
    setSelectedCf(cf);
    setDeleteModalOpen(true);
  }, []);

  const handleCloseDeleteModal = useCallback(() => {
    setDeleteModalOpen(false);
    setSelectedCf(null);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (selectedCf) {
      await handleDelete(selectedCf);
    }
    handleCloseDeleteModal();
    void formik.setFieldValue('cf', '');
  }, [selectedCf, handleDelete, handleCloseDeleteModal, formik]);

  const rowsWithId = React.useMemo(
    () => user.map((r, idx) => ({ id: r.cf ?? `row-${idx}`, ...r })),
    [user]
  );

  const reportedUsersColumns = React.useMemo(
    () => getReportedUsersColumns(handleOpenDeleteModal),
    [handleOpenDeleteModal]
  );

  useEffect(() => {
    const state = history.location.state as { newCf?: string } | undefined;

    if (state?.newCf) {
      updateAlerts('valid', true);
      setTimeout(() => updateAlerts('valid', false), 3000);

      history.replace({ ...history.location, state: undefined });
    }
  }, [history, updateAlerts]);

  if (!initiativeId) {
    return null;
  }

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
              history.push(routes.REPORTED_USERS_INSERT.replace(':initiative_id', initiativeId), {
                merchantId,
                initiativeID: initiativeId,
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
          onSearch={() => formik.handleSubmit()}
          onReset={() => {
            setUser([]);
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
              columns={reportedUsersColumns}
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

      <AlertListComponent
        alertList={Object.entries(alerts).map(([key, value]) => ({
          ...value,
          onClose: () => updateAlerts(key, false),
        }))}
      />
    </>
  );
};

export default ReportedUsers;
