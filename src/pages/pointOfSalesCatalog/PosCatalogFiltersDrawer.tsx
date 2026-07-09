import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { theme } from '@pagopa/mui-italia/theme';
import { Box, Typography, CircularProgress, Tooltip } from '@mui/material';
import { FormikProps } from 'formik';
import DetailDrawer from '../../components/Drawer/DetailDrawer';
import PointOfSalesFilters from '../../components/pointsOfSale/PointOfSalesFilters';
import {
  PointOfSaleDTO,
  PointOfSaleInitiativeDTO,
  PointOfSaleOnboardingResultDTO,
} from '../../api/generated/merchants/data-contracts';
import { GetPointOfSalesFilters } from '../../types/types';
import { ASSOCIATION_SUCCESS_ALERT_TIMEOUT, MISSING_DATA_PLACEHOLDER } from '../../utils/constants';
import { formatCatalogDrawerAddress } from '../../utils/addressUtils';
import { associatePos, getPointOfSaleInitiatives } from '../../services/merchantService';
import { safeFormatDate } from '../../utils/formatUtils';
import useScopedTranslation from '../../hooks/useScopedTranslation';
import { useAlert } from '../../hooks/useAlert';
import AssociateSelectedPosModal from './AssociateSelectedPosModal';
import AlreadyAssociatedPosModal, {
  AlreadyAssociatedPointOfSale,
} from './AlreadyAssociatedPosModal';

type InitiativeOption = {
  value: string;
  label: string;
};
const ASSOCIATION_SUCCESS_ALERT_TIMEOUT_FALLBACK = 5000;

type PosCatalogFiltersProps = {
  formik: FormikProps<GetPointOfSalesFilters>;
  filtersAppliedOnce: boolean;
  onFiltersApplied: (values: GetPointOfSalesFilters) => void;
  onFiltersReset: () => void;
  initiativeOptions: Array<InitiativeOption>;
  t: (key: string) => string;
};

type PosCatalogDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  selectedStore: PointOfSaleDTO | null;
  initiativeOptions: Array<InitiativeOption>;
  publishedInitiativeOptions: Array<InitiativeOption>;
  merchantId: string;
};

export const PosCatalogFilters: React.FC<PosCatalogFiltersProps> = ({
  formik,
  filtersAppliedOnce,
  onFiltersApplied,
  onFiltersReset,
  initiativeOptions,
  t,
}) => (
  <PointOfSalesFilters
    formik={formik}
    filtersAppliedOnce={filtersAppliedOnce}
    onFiltersApplied={onFiltersApplied}
    onFiltersReset={onFiltersReset}
    t={t}
    fields={['initiative', 'type', 'city', 'address', 'contactName']}
    initiativeOptions={initiativeOptions}
  />
);

export const PosCatalogDrawer: React.FC<PosCatalogDrawerProps> = ({
  isOpen,
  onClose,
  selectedStore,
  initiativeOptions,
  publishedInitiativeOptions,
  merchantId,
}) => {
  const { t } = useScopedTranslation();
  const { setAlert } = useAlert();
  const getDisplayValue = (value?: string) =>
    value?.trim() === '' || !value ? MISSING_DATA_PLACEHOLDER : value;
  const ellipsisSx = {
    display: 'block',
    maxWidth: '100%',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  };
  const selectedStoreAddress = selectedStore ? formatCatalogDrawerAddress(selectedStore) : '';
  const [initiatives, setInitiatives] = useState<Array<PointOfSaleInitiativeDTO>>([]);
  const [isLoadingInitiatives, setIsLoadingInitiatives] = useState(false);
  const [isAssociateModalOpen, setIsAssociateModalOpen] = useState(false);
  const [selectedInitiativeId, setSelectedInitiativeId] = useState('');
  const [isAssociatingPos, setIsAssociatingPos] = useState(false);
  const [alreadyAssociatedStores, setAlreadyAssociatedStores] = useState<
    Array<AlreadyAssociatedPointOfSale>
  >([]);
  const [associationSuccessData, setAssociationSuccessData] = useState<{
    associatedCount: number;
    initiativeName: string;
  } | null>(null);
  const [alreadyAssociatedInitiativeName, setAlreadyAssociatedInitiativeName] = useState('');
  const [shouldShowAlreadyAssociatedStores, setShouldShowAlreadyAssociatedStores] = useState(true);
  const [initiativesRefreshKey, setInitiativesRefreshKey] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const fetchInitiatives = async () => {
      if (!isOpen || !selectedStore?.id || !merchantId) {
        if (isMounted) {
          setInitiatives([]);
          setIsLoadingInitiatives(false);
        }
        return;
      }

      setIsLoadingInitiatives(true);

      try {
        const response = await getPointOfSaleInitiatives(merchantId, selectedStore.id);

        if (isMounted) {
          setInitiatives(Array.isArray(response) ? response : []);
        }
      } catch {
        if (isMounted) {
          setInitiatives([]);
        }
      } finally {
        if (isMounted) {
          setIsLoadingInitiatives(false);
        }
      }
    };

    void fetchInitiatives();

    return () => {
      isMounted = false;
    };
  }, [initiativesRefreshKey, isOpen, merchantId, selectedStore]);

  const initiativeNameById = useMemo(
    () =>
      Object.fromEntries(
        initiativeOptions.map((initiative) => [initiative.value, initiative.label])
      ),
    [initiativeOptions]
  );

  const sortedInitiatives = useMemo(
    () =>
      [...initiatives].sort(
        (a, b) => new Date(b.updatedAt ?? 0).getTime() - new Date(a.updatedAt ?? 0).getTime()
      ),
    [initiatives]
  );

  const handleAssociateModalClose = useCallback(() => {
    setIsAssociateModalOpen(false);
    setSelectedInitiativeId('');
  }, []);

  const handleFetchError = useCallback(
    () =>
      setAlert({
        title: t('errors.genericTitle'),
        text: t('errors.genericDescription'),
        isOpen: true,
        severity: 'error',
      }),
    [setAlert, t]
  );

  const showAssociationSuccessAlert = useCallback(
    (associatedCount: number, initiativeName: string) =>
      setAlert({
        text: t('pages.posCatalog.associateSuccess', {
          count: associatedCount,
          initiativeName,
        }),
        isOpen: true,
        severity: 'success',
        timeout: ASSOCIATION_SUCCESS_ALERT_TIMEOUT ?? ASSOCIATION_SUCCESS_ALERT_TIMEOUT_FALLBACK,
      }),
    [setAlert, t]
  );

  const handleAlreadyAssociatedModalClose = useCallback(() => {
    setAlreadyAssociatedStores([]);
    setAlreadyAssociatedInitiativeName('');
    setShouldShowAlreadyAssociatedStores(true);

    if (associationSuccessData) {
      showAssociationSuccessAlert(
        associationSuccessData.associatedCount,
        associationSuccessData.initiativeName
      );
      setAssociationSuccessData(null);
    }

    setInitiativesRefreshKey((current) => current + 1);
  }, [associationSuccessData, showAssociationSuccessAlert]);

  const handleAssociationResult = useCallback(
    (result: PointOfSaleOnboardingResultDTO, initiativeName: string) => {
      const alreadyAssociated = (result.notAssociated ?? []).filter(
        (pointOfSale) => pointOfSale.reason === 'ALREADY_ASSOCIATED'
      );
      const associatedCount = result.associated?.length ?? 0;

      handleAssociateModalClose();
      onClose();

      if (alreadyAssociated.length > 0) {
        setAssociationSuccessData(associatedCount > 0 ? { associatedCount, initiativeName } : null);
        setAlreadyAssociatedInitiativeName(initiativeName);
        setShouldShowAlreadyAssociatedStores(associatedCount > 0);
        setAlreadyAssociatedStores(alreadyAssociated);
        return;
      }

      setInitiativesRefreshKey((current) => current + 1);
      if (associatedCount > 0) {
        showAssociationSuccessAlert(associatedCount, initiativeName);
      }
    },
    [handleAssociateModalClose, onClose, showAssociationSuccessAlert]
  );

  const handleAssociateConfirm = useCallback(async () => {
    const initiativeName =
      publishedInitiativeOptions.find((initiative) => initiative.value === selectedInitiativeId)
        ?.label ?? '';

    if (!merchantId || !selectedStore?.id || !selectedInitiativeId) {
      handleFetchError();
      return;
    }

    setIsAssociatingPos(true);

    try {
      const result = await associatePos(selectedInitiativeId, merchantId, [selectedStore.id]);
      handleAssociationResult(result, initiativeName);
    } catch (_error) {
      handleFetchError();
    } finally {
      setIsAssociatingPos(false);
    }
  }, [
    handleAssociationResult,
    handleFetchError,
    merchantId,
    publishedInitiativeOptions,
    selectedInitiativeId,
    selectedStore?.id,
  ]);

  return (
    <>
      <DetailDrawer
        isOpen={isOpen}
        setIsOpen={onClose}
        title={selectedStore?.franchiseName}
        buttonsLayout="row"
        buttons={[
          {
            title: t('pages.posCatalog.actions.exclude'),
            dataTestId: 'exclude-store-button',
            variant: 'outlined',
            color: 'error',
          },
          {
            title: t('pages.posCatalog.actions.associate'),
            dataTestId: 'associate-store-button',
            variant: 'contained',
            onClick: () => setIsAssociateModalOpen(true),
          },
        ]}
      >
        {selectedStore && (
          <>
            {(isLoadingInitiatives || sortedInitiatives.length > 0) && (
              <>
                <Typography variant="overline" color="text.secondary">
                  {t('pages.posCatalog.drawer.associatedTo')}
                </Typography>
                {isLoadingInitiatives ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                    <CircularProgress size={24} />
                  </Box>
                ) : (
                  sortedInitiatives.map((initiative) => (
                    <Box key={`${initiative.initiativeId}-${initiative.updatedAt}`}>
                      <Typography variant="body2" color="text.secondary">
                        {safeFormatDate(initiative.updatedAt, false)}
                      </Typography>
                      <Tooltip
                        title={getDisplayValue(
                          initiative.initiativeId
                            ? initiativeNameById[initiative.initiativeId] || initiative.initiativeId
                            : MISSING_DATA_PLACEHOLDER
                        )}
                      >
                        <Typography
                          variant="body1"
                          sx={{ ...ellipsisSx, fontWeight: theme.typography.fontWeightMedium }}
                        >
                          {getDisplayValue(
                            initiative.initiativeId
                              ? initiativeNameById[initiative.initiativeId] ||
                                  initiative.initiativeId
                              : MISSING_DATA_PLACEHOLDER
                          )}
                        </Typography>
                      </Tooltip>
                    </Box>
                  ))
                )}
              </>
            )}

            <Typography variant="overline" color="text.secondary">
              {t('pages.posCatalog.drawer.storeData')}
            </Typography>
            <Box>
              <Typography variant="body2" color="text.secondary">
                {t('pages.posCatalog.drawer.id')}
              </Typography>
              <Tooltip title={getDisplayValue(selectedStore.id)}>
                <Typography
                  variant="body1"
                  sx={{ ...ellipsisSx, fontWeight: theme.typography.fontWeightMedium }}
                >
                  {getDisplayValue(selectedStore.id)}
                </Typography>
              </Tooltip>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                {selectedStore.type === 'PHYSICAL'
                  ? t('pages.posCatalog.drawer.address')
                  : t('pages.posCatalog.drawer.website')}
              </Typography>
              <Tooltip
                title={
                  selectedStore.type === 'PHYSICAL'
                    ? getDisplayValue(selectedStoreAddress)
                    : getDisplayValue(selectedStore.website)
                }
              >
                <Typography
                  variant="body1"
                  sx={{ ...ellipsisSx, fontWeight: theme.typography.fontWeightMedium }}
                >
                  {selectedStore.type === 'PHYSICAL' ? (
                    getDisplayValue(selectedStoreAddress)
                  ) : (
                    <a
                      href={`https://${(selectedStore.website || '').replace(/^https?:\/\//, '')}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {getDisplayValue(selectedStore.website)}
                    </a>
                  )}
                </Typography>
              </Tooltip>
            </Box>
            {selectedStore.type === 'PHYSICAL' && (
              <Box>
                <Typography variant="body2" color="text.secondary">
                  {t('pages.posCatalog.drawer.phone')}
                </Typography>
                <Tooltip title={getDisplayValue(selectedStore.channelPhone)}>
                  <Typography
                    variant="body1"
                    sx={{ ...ellipsisSx, fontWeight: theme.typography.fontWeightMedium }}
                  >
                    {getDisplayValue(selectedStore.channelPhone)}
                  </Typography>
                </Tooltip>
              </Box>
            )}

            <Typography variant="overline" color="text.secondary">
              {t('pages.posCatalog.drawer.referentData')}
            </Typography>
            <Box>
              <Typography variant="body2" color="text.secondary">
                {t('pages.posCatalog.drawer.name')}
              </Typography>
              <Tooltip title={getDisplayValue(selectedStore.contactName)}>
                <Typography
                  variant="body1"
                  sx={{ ...ellipsisSx, fontWeight: theme.typography.fontWeightMedium }}
                >
                  {getDisplayValue(selectedStore.contactName)}
                </Typography>
              </Tooltip>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                {t('pages.posCatalog.drawer.surname')}
              </Typography>
              <Tooltip title={getDisplayValue(selectedStore.contactSurname)}>
                <Typography
                  variant="body1"
                  sx={{ ...ellipsisSx, fontWeight: theme.typography.fontWeightMedium }}
                >
                  {getDisplayValue(selectedStore.contactSurname)}
                </Typography>
              </Tooltip>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                {t('pages.posCatalog.drawer.email')}
              </Typography>
              <Tooltip title={getDisplayValue(selectedStore.contactEmail)}>
                <Typography
                  variant="body1"
                  sx={{ ...ellipsisSx, fontWeight: theme.typography.fontWeightMedium }}
                >
                  {getDisplayValue(selectedStore.contactEmail)}
                </Typography>
              </Tooltip>
            </Box>
          </>
        )}
      </DetailDrawer>
      <AssociateSelectedPosModal
        open={isAssociateModalOpen}
        initiativeOptions={publishedInitiativeOptions}
        selectedInitiativeId={selectedInitiativeId}
        selectedStoresCount={1}
        isLoading={isAssociatingPos}
        onClose={handleAssociateModalClose}
        onInitiativeChange={setSelectedInitiativeId}
        onConfirm={handleAssociateConfirm}
      />
      <AlreadyAssociatedPosModal
        stores={alreadyAssociatedStores}
        initiativeName={alreadyAssociatedInitiativeName}
        showStores={shouldShowAlreadyAssociatedStores}
        onClose={handleAlreadyAssociatedModalClose}
      />
    </>
  );
};
