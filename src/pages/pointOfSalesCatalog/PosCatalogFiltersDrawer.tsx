import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { theme } from '@pagopa/mui-italia/theme';
import {
  Box,
  Typography,
  CircularProgress,
} from '@mui/material';
import { FormikProps } from 'formik';
import DetailDrawer from '../../components/Drawer/DetailDrawer';
import PointOfSalesFilters from '../../components/pointsOfSale/PointOfSalesFilters';
import {
  PointOfSaleDTO,
  PointOfSaleInitiativeDTO,
  PointOfSaleOnboardingResultDTO,
} from '../../api/generated/merchants/data-contracts';
import { GetPointOfSalesFilters } from '../../types/types';
import { MISSING_DATA_PLACEHOLDER } from '../../utils/constants';
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
  merchantId,
}) => {
  const { t } = useScopedTranslation();
  const { setAlert } = useAlert();
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
    () => Object.fromEntries(initiativeOptions.map((initiative) => [initiative.value, initiative.label])),
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
      }),
    [setAlert, t]
  );

  const handleAlreadyAssociatedModalClose = useCallback(() => {
    setAlreadyAssociatedStores([]);

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
        setAssociationSuccessData({ associatedCount, initiativeName });
        setAlreadyAssociatedStores(alreadyAssociated);
        return;
      }

      setInitiativesRefreshKey((current) => current + 1);
      showAssociationSuccessAlert(associatedCount, initiativeName);
    },
    [handleAssociateModalClose, onClose, showAssociationSuccessAlert]
  );

  const handleAssociateConfirm = useCallback(async () => {
    const initiativeName =
      initiativeOptions.find((initiative) => initiative.value === selectedInitiativeId)?.label ??
      '';

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
    initiativeOptions,
    merchantId,
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
                      <Typography
                        variant="body1"
                        sx={{ fontWeight: theme.typography.fontWeightMedium }}
                      >
                        {initiative.initiativeId
                          ? initiativeNameById[initiative.initiativeId] || initiative.initiativeId
                          : MISSING_DATA_PLACEHOLDER}
                      </Typography>
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
            <Typography variant="body1" sx={{ fontWeight: theme.typography.fontWeightMedium }}>
              {selectedStore.id || MISSING_DATA_PLACEHOLDER}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">
              {selectedStore.type === 'PHYSICAL'
                ? t('pages.posCatalog.drawer.address')
                : t('pages.posCatalog.drawer.website')}
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: theme.typography.fontWeightMedium }}>
              {selectedStore.type === 'PHYSICAL' ? (
                [
                  [selectedStore.address, selectedStore.streetNumber].filter(Boolean).join(', '),
                  [selectedStore.zipCode, selectedStore.city, selectedStore.province]
                    .filter(Boolean)
                    .join(', '),
                ]
                  .filter(Boolean)
                  .join(' - ') || MISSING_DATA_PLACEHOLDER
              ) : (
                <a
                  href={`https://${(selectedStore.website || '').replace(/^https?:\/\//, '')}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {selectedStore.website || MISSING_DATA_PLACEHOLDER}
                </a>
              )}
            </Typography>
          </Box>
          {selectedStore.type === 'PHYSICAL' && (
            <Box>
              <Typography variant="body2" color="text.secondary">
                {t('pages.posCatalog.drawer.phone')}
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: theme.typography.fontWeightMedium }}>
                {selectedStore.channelPhone || MISSING_DATA_PLACEHOLDER}
              </Typography>
            </Box>
          )}

          <Typography variant="overline" color="text.secondary">
            {t('pages.posCatalog.drawer.referentData')}
          </Typography>
          <Box>
            <Typography variant="body2" color="text.secondary">
              {t('pages.posCatalog.drawer.name')}
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: theme.typography.fontWeightMedium }}>
              {selectedStore.contactName || MISSING_DATA_PLACEHOLDER}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">
              {t('pages.posCatalog.drawer.surname')}
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: theme.typography.fontWeightMedium }}>
              {selectedStore.contactSurname || MISSING_DATA_PLACEHOLDER}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">
              {t('pages.posCatalog.drawer.email')}
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: theme.typography.fontWeightMedium }}>
              {selectedStore.contactEmail || MISSING_DATA_PLACEHOLDER}
            </Typography>
          </Box>
          </>
        )}
      </DetailDrawer>
      <AssociateSelectedPosModal
        open={isAssociateModalOpen}
        initiativeOptions={initiativeOptions}
        selectedInitiativeId={selectedInitiativeId}
        isLoading={isAssociatingPos}
        onClose={handleAssociateModalClose}
        onInitiativeChange={setSelectedInitiativeId}
        onConfirm={handleAssociateConfirm}
      />
      <AlreadyAssociatedPosModal
        stores={alreadyAssociatedStores}
        onClose={handleAlreadyAssociatedModalClose}
      />
    </>
  );
};
