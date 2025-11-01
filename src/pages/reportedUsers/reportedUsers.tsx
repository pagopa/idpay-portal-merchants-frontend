import React, { useState } from 'react';
import { useFormik } from 'formik';
import { Box, Stack, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import ReportIcon from '@mui/icons-material/Report';
import { TitleBox } from '@pagopa/selfcare-common-frontend';
import { matchPath, useHistory, useLocation } from 'react-router-dom';
import { storageTokenOps } from '@pagopa/selfcare-common-frontend/utils/storage';
import DataTable from '../../components/dataTable/DataTable';
import { GetReportedUsersFilters } from '../../types/types';
import { MISSING_DATA_PLACEHOLDER } from '../../utils/constants';
import routes from '../../routes';
import { getReportedUser, deleteReportedUser } from '../../services/merchantService';
import ROUTES from '../../routes';
import { parseJwt } from '../../utils/jwt-utils';
import MsgResult from './MsgResult';
import { isValidCF, normalizeValue } from './helpersReportedUsers';
import SearchTaxCode from './SearchTaxCode';
import NoResultPaper from './NoResultPaper';
import { getReportedUsersColumns } from './columnsReportedUser';
import ModalReportedUser from './modalReportedUser';
interface MatchParams {
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

const ReportedUsers: React.FC = () => {
  const location = useLocation<{ newCf?: string }>();
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
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Stato per il modale di conferma cancellazione
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedCf, setSelectedCf] = useState<string | null>(null);
  // Stato per mostrare il messaggio di successo dopo la cancellazione
  const [showDeleteSuccessAlert, setShowDeleteSuccessAlert] = useState(false);
  const history = useHistory();
  const match = matchPath(location.pathname, {
    path: [ROUTES.OVERVIEW],
    exact: true,
    strict: false,
  });
  // initiativeID
  const { id } = (match?.params as MatchParams) || {};
  const userJwt = parseJwt(storageTokenOps.read());
  const merchantId = userJwt?.merchant_id;

  React.useEffect(() => {
    if (user.length === 0 && lastSearchedCF && isValidCF(lastSearchedCF)) {
      setShowEmptyAlert(true);
    } else {
      setShowEmptyAlert(false);
    }
  }, [user, lastSearchedCF]);

  // Ricerca automatica e messaggio successo se arrivo da insert
  React.useEffect(() => {
    if (location.state && location.state.newCf) {
      void formik.setFieldValue('cf', location.state.newCf);
      setShowSuccessAlert(true);
      setTimeout(() => setShowSuccessAlert(false), 3000);
      setTimeout(() => {
        void formik.handleSubmit();
      }, 0);
      // Pulizia dello state per evitare ripetizioni se si torna indietro
      history.replace({ ...location, state: {} });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formik = useFormik<GetReportedUsersFilters>({
    initialValues,
    validate: (values) => {
      let errors: Partial<GetReportedUsersFilters> = {};
      if (values.cf && !isValidCF(values.cf)) {
        errors = { ...errors, cf: 'Codice fiscale non valido' };
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
          const res = await getReportedUser(id, merchantId, values.cf);
          // normalizeValue moved to helpers
          if (!res) {
            setUser([]);
          } else {
            setUser([
              {
                cf: normalizeValue(res.fiscalCode),
                reportedDate: normalizeValue(res.reportedDate),
                transactionDate: normalizeValue(res.transactionDate),
                transactionId: normalizeValue(res.transactionId),
              },
            ]);
          }
        } catch (e: any) {
          setUser([
            {
              cf: MISSING_DATA_PLACEHOLDER,
              reportedDate: MISSING_DATA_PLACEHOLDER,
              transactionDate: MISSING_DATA_PLACEHOLDER,
              transactionId: MISSING_DATA_PLACEHOLDER,
            },
          ]);
          setError('Errore durante il recupero dell’utente segnalato');
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
      await deleteReportedUser(merchantId, id, cf);
      setUser([]);
      setShowDeleteSuccessAlert(true);
      setTimeout(() => setShowDeleteSuccessAlert(false), 3000);
    } catch (e) {
      alert('Errore durante la cancellazione');
    }
  };

  // Funzione per aprire il modale di conferma cancellazione
  const handleOpenDeleteModal = (cf: string) => {
    setSelectedCf(cf);
    setDeleteModalOpen(true);
  };

  // Funzione per chiudere il modale
  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false);
    setSelectedCf(null);
  };

  // Funzione chiamata su conferma nel modale
  const handleConfirmDelete = async () => {
    if (selectedCf) {
      await handleDelete(selectedCf);
    }
    handleCloseDeleteModal();
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
              history.push(routes.REPORTED_USERS_INSERT.replace(':id', id));
            }}
            startIcon={<ReportIcon />}
            sx={{ width: { xs: '100%', md: 'auto', alignSelf: 'start', minWidth: '174px' } }}
          >
            {t('pages.reportedUsers.reportUser')}
          </Button>
        </Stack>
        <SearchTaxCode formik={formik as any} onSearch={handleFiltersApplied} />
        {showSuccessAlert && (
          <MsgResult severity="success" message="La segnalazione è stata registrata" bottom={170} />
        )}
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
              pageSize={1}
              rowsPerPage={1}
            />
          </Box>
        )}
        {/* Modale di conferma cancellazione */}
        <ModalReportedUser
          open={deleteModalOpen}
          title="Vuoi procedere con la cancellazione?"
          description={
            selectedCf
              ? `Stai per cancellare il soggetto ${selectedCf} dalla lista degli utenti segnalati.`
              : ''
          }
          descriptionTwo="Questa operazione non comporta il blocco della relativa richiesta di rimborso."
          cancelText="Annulla"
          confirmText="Conferma"
          onCancel={handleCloseDeleteModal}
          onConfirm={handleConfirmDelete}
          cfModal={undefined}
        />
        {showDeleteSuccessAlert && (
          <MsgResult severity="success" message="La segnalazione è stata rimossa" bottom={170} />
        )}
        {loading && (
          <MsgResult severity="info" message={t('pages.reportedUsers.loading')} bottom={170} />
        )}
        {error && <MsgResult severity="error" message={error} bottom={170} />}
        {user.length === 0 && !loading && !error && (
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
