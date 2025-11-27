import { useEffect, useState } from "react";
import { Box, Stack, Tooltip, Typography, CircularProgress, Alert, Slide } from "@mui/material";
import Button from "@mui/material/Button";
import SendIcon from '@mui/icons-material/Send';
import CheckCircleOutline from '@mui/icons-material/CheckCircleOutline';
import { useTranslation } from "react-i18next";
import { TitleBox } from '@pagopa/selfcare-common-frontend';
import { GridColDef } from "@mui/x-data-grid";
import { theme } from "@pagopa/mui-italia";
import { useSelector } from 'react-redux';
import DataTable from "../../components/dataTable/DataTable";
import CustomChip from "../../components/Chip/CustomChip";
import { getRewardBatches, sendRewardBatch } from "../../services/merchantService";
import getStatus from '../../components/Transactions/useStatus';
import CurrencyColumn from "../../components/Transactions/CurrencyColumn";
import { RewardBatchDTO } from "../../api/generated/merchants/RewardBatchDTO";
import NoResultPaper from "../reportedUsers/NoResultPaper";
import { intiativesListSelector } from '../../redux/slices/initiativesSlice';
import { useAlert } from "../../hooks/useAlert";
import { RefundRequestsModal } from "./RefundRequestModal";



const RefundRequests = () => {
    const { setAlert } = useAlert();
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [selectedRows, setSelectedRows] = useState<Array<RewardBatchDTO>>([]);
    const [rewardBatches, setRewardBatches] = useState<Array<RewardBatchDTO>>([]);
    const [rewardBatchesLoading, setRewardBatchesLoading] = useState<boolean>(false);
    const [sendBatchIsLoading, setSendBatchIsLoading] = useState<boolean>(false);
    const [showSuccessAlert, setShowSuccessAlert] = useState<boolean>(false);
    // const [currentPagination, setCurrentPagination] = useState({ pageNo: 0, pageSize: 10, totalElements: 0 });
    const initiativesList = useSelector(intiativesListSelector);

    const columns: Array<GridColDef> = [
        {
            field: 'spacer',
            headerName: '',
            width: 150,
            sortable: false,
            disableColumnMenu: true,
            renderCell: () => '',
        },
        {
            field: 'name',
            headerName: 'Lotto',
            disableColumnMenu: true,
            flex: 2,
            sortable: false,
            renderCell: (params: any) => renderCellWithTooltip(params.value, 11),
        },
        {
            field: 'posType',
            headerName: 'Tipologia',
            disableColumnMenu: true,
            flex: 2,
            sortable: false,
            renderCell: (params: any) => renderCellWithTooltip(posTypeMapper(params.value), 11),
        },
        {
            field: 'initialAmountCents',
            headerName: 'Rimborso richiesto',
            disableColumnMenu: true,
            flex: 2,
            sortable: false,
            renderCell: (params: any) => <CurrencyColumn value={params.value / 100} />,
        },
        {
            field: 'status',
            headerName: 'Stato',
            disableColumnMenu: true,
            flex: 2,
            sortable: false,
            renderCell: (params: any) => <StatusChip status={params.value} />
        },
    ];

    const { t } = useTranslation();

    useEffect(() => {
        if (initiativesList && initiativesList.length > 0) {
            void fetchRewardBatches(initiativesList[0].initiativeId!);
        }
    }, [initiativesList]);

    useEffect(() => {
        if (showSuccessAlert) {
            setTimeout(() => setShowSuccessAlert(false), 3000);
        }
    }, [showSuccessAlert]);

    const infoStyles = {
        fontWeight: theme.typography.fontWeightRegular,
        fontSize: theme.typography.fontSize,
    };

    const fetchRewardBatches = async (initiativeId: string): Promise<void> => {
        setRewardBatchesLoading(true);
        try {
            const response = await getRewardBatches(initiativeId);
            if (response?.content) {
                setRewardBatches(response.content as Array<RewardBatchDTO>);
                setSelectedRows([]);


            }
        } catch (error: any) {
            setAlert({title: t('errors.genericTitle'), text: t('errors.genericDescription'), isOpen: true, severity: 'error'});
        } finally {
            setRewardBatchesLoading(false);
        }
    };

    const renderCellWithTooltip = (value: string, tooltipThreshold: number) => (
        <Tooltip
            title={value && value.length >= tooltipThreshold ? value : ''}
            placement="top"
            arrow={true}
        >
            <Typography sx={{ ...infoStyles, maxWidth: '100% !important' }} className="ShowDots">
                {value && value !== '' ? value : '-'}
            </Typography>
        </Tooltip>
    );

    const handlePaginationPageChange = (page: number) => {
        console.log('Page changed:', page);
        // const updatedPagination = { ...storesPagination, pageNo: page, initiativeId: id, sort: currentSort };
        // setStoresPagination(updatedPagination);
        // sessionStorage.setItem('storesPagination', JSON.stringify(updatedPagination));
        // void fetchStores({
        //   ...appliedFilters,
        //   page,
        //   sort: currentSort,
        // });
    };

    const handleRowSelectionChange = (rows: Array<number>) => {
        setSelectedRows(rows);
    };

    const StatusChip = ({ status }: any) => {
        const chipItem = getStatus(status);
        return (
            <CustomChip
                label={chipItem?.label}
                colorChip={chipItem?.color}
                sizeChip="small"
                textColorChip={chipItem?.textColor}
            />
        );
    };

  const isRowSelectable = (params: any) => {
        if (params?.row?.status !== 'CREATED') {
            return false;
        }

        const yearMonth = new Date().toISOString().slice(0, 7);
        const currentMonth = Number(yearMonth.split('-')[1]);
        const currentYear = Number(yearMonth.split('-')[0]);
        const batchMonth = Number(params?.row?.month?.split("-")[1]);
        const batchYear = Number(params?.row?.month?.split("-")[0]);

        if (batchYear < currentYear) {
            return true;
        }
        
        if (batchYear === currentYear && batchMonth < currentMonth) {return true;};

        return false;
    };

    const posTypeMapper = (posType: string) => {
        switch (posType) {
            case 'PHYSICAL': return 'Fisico';
            case 'ONLINE': return 'Online';
            default: return posType;
        }
    };

    const handleSentBatches = async () => {
        setSendBatchIsLoading(true);
        const initiativeId = initiativesList && initiativesList.length > 0 ? initiativesList[0].initiativeId : '';
        try {
            const batchId = selectedRows && selectedRows?.length > 0 ? selectedRows[0]?.id : '';
            if (!initiativeId || !batchId) {
                console.error('Missing initiativeId or batchId');
                return;
            }
            await sendRewardBatch(initiativeId, batchId.toString());
            setTimeout(() => setShowSuccessAlert(true), 1000);
            setTimeout(() => setShowSuccessAlert(true), 1000);
            await fetchRewardBatches(initiativeId);

        } catch (e: any) {
            setAlert({title: t('errors.genericTitle'), text: t('errors.genericDescription'), isOpen: true, severity: 'error'});
            if (initiativeId) {
                await fetchRewardBatches(initiativeId.toString());
            }
        } finally {
            setSendBatchIsLoading(false);
            setIsModalOpen(false);
        }
    };

    return (
        <Box p={1.5}>
            <RefundRequestsModal
                isOpen={isModalOpen}
                setIsOpen={() => setIsModalOpen(false)}
                title={t("pages.refundRequests.ModalRefundRequests.title")}
                description={t("pages.refundRequests.ModalRefundRequests.description")}
                warning={t("pages.refundRequests.ModalRefundRequests.warning")}
                cancelBtn="Indietro"
                confirmBtn={{ text: `Invia`, onConfirm: handleSentBatches, loading: sendBatchIsLoading }}
            />
            <Stack
                direction={{ xs: 'column', md: 'row' }}
                spacing={{ xs: 2, md: 3 }}
                justifyContent="space-between"
                alignItems={{ xs: 'flex-start', md: 'center' }}
            >
                <TitleBox
                    title={t('pages.refundRequests.title')}
                    subTitle={t('pages.refundRequests.subtitle')}
                    mbTitle={2}
                    variantTitle="h4"
                    variantSubTitle="body1"
                />
                {
                    selectedRows.length > 0 && (
                        <Button
                            variant="contained"
                            size="small"
                            onClick={() => setIsModalOpen(true)}
                            startIcon={<SendIcon />}
                            sx={{ width: { xs: '100%', md: 'auto', alignSelf: 'start', whiteSpace: 'nowrap', fontWeight: 'bold' } }}
                        >
                            {t('pages.refundRequests.sendRequests')}
                        </Button>
                    )
                }
            </Stack>

            <Box>
                {rewardBatchesLoading && (
                    <Box display="flex" justifyContent="center" alignItems="center" height="200px">
                        <CircularProgress />
                    </Box>
                )}

                {!rewardBatchesLoading && rewardBatches && rewardBatches.length > 0 && (
                    <DataTable
                        columns={columns}
                        rows={rewardBatches}
                        rowsPerPage={1}
                        checkable={true}
                        // paginationModel={{ page: currentPagination.pageNo, pageSize: currentPagination.pageSize, totalElements:  }}
                        onPaginationPageChange={handlePaginationPageChange}
                        onRowSelectionChange={handleRowSelectionChange}
                        isRowSelectable={isRowSelectable}
                        singleSelect
                    />
                )}
                  <Slide direction="left" in={showSuccessAlert} mountOnEnter unmountOnExit>
                        <Alert
                          severity="success"
                          icon={<CheckCircleOutline />}
                          sx={{
                            position: 'fixed',
                            bottom: 40,
                            right: 20,
                            backgroundColor: 'white',
                            width: 'auto',
                            maxWidth: '400px',
                            minWidth: '300px',
                            zIndex: 1300,
                            boxShadow: 3,
                            borderRadius: 1,
                            '& .MuiAlert-icon': {
                              color: '#6CC66A',
                            },
                          }}
                        >
                          {t('pages.refundRequests.rewardBatchSentSuccess')}
                        </Alert>
                      </Slide>
                  <Slide direction="left" in={showSuccessAlert} mountOnEnter unmountOnExit>
                        <Alert
                          severity="success"
                          icon={<CheckCircleOutline />}
                          sx={{
                            position: 'fixed',
                            bottom: 40,
                            right: 20,
                            backgroundColor: 'white',
                            width: 'auto',
                            maxWidth: '400px',
                            minWidth: '300px',
                            zIndex: 1300,
                            boxShadow: 3,
                            borderRadius: 1,
                            '& .MuiAlert-icon': {
                              color: '#6CC66A',
                            },
                          }}
                        >
                          {t('pages.refundRequests.rewardBatchSentSuccess')}
                        </Alert>
                      </Slide>

                {!rewardBatchesLoading && (!rewardBatches || rewardBatches.length === 0) && (
                    <NoResultPaper translationKey="pages.refundRequests.noData" />
                )}
            </Box>
        </Box>
    );
};


export default RefundRequests;
