import { useEffect, useState } from "react";
import { Box, Stack, Tooltip, Typography, CircularProgress } from "@mui/material";
import Button from "@mui/material/Button";
import SendIcon from '@mui/icons-material/Send';
import { useTranslation } from "react-i18next";
import { TitleBox } from '@pagopa/selfcare-common-frontend';
import { GridSortModel, GridColDef } from "@mui/x-data-grid";
import { theme } from "@pagopa/mui-italia";
import { useSelector } from "react-redux";
import DataTable from "../../components/dataTable/DataTable";
import CustomChip from "../../components/Chip/CustomChip";
import { getRewardBatches } from "../../services/merchantService";
import getStatus from '../../components/Transactions/useStatus';
import CurrencyColumn from "../../components/Transactions/CurrencyColumn";
import { intiativesListSelector } from "../../redux/slices/initiativesSlice";
import { RewardBatchDTO } from "../../api/generated/merchants/RewardBatchDTO";
import NoResultPaper from "../reportedUsers/NoResultPaper";
import { RefundRequestsModal } from "./RefundRequestModal";



const RefundRequests = () => {
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [selectedRows, setSelectedRows] = useState<Array<number>>([]);
    const [rewardBatches, setRewardBatches] = useState<Array<RewardBatchDTO>>([]);
    const [rewardBatchesLoading, setRewardBatchesLoading] = useState<boolean>(false);
    const initiativesList = useSelector(intiativesListSelector);

    // const mockData = [
    //     {
    //         id: 1,
    //         name: '001-20251125 223',
    //         posType: 'FISICO',
    //         totalAmountCents: 10000,
    //         status: 'CREATED',
    //     },
    //     {
    //         id: 2,
    //         name: '002-20251125 224',
    //         posType: 'ONLINE',
    //         totalAmountCents: 20000,
    //         status: 'APPROVED',
    //     },
    //     {
    //         id: 3,
    //         name: '003-20251125 225',
    //         posType: 'ONLINE',
    //         totalAmountCents: 300000,
    //         status: 'EVALUATING',
    //     },
    // ];

    const columns: Array<GridColDef> = [
        {
            field: 'spacer',
            headerName: '',
            width: 200,
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
            field: 'totalAmountCents',
            headerName: 'Importo',
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
        void fetchRewardBatches();
    }, []);

    const infoStyles = {
        fontWeight: theme.typography.fontWeightRegular,
        fontSize: theme.typography.fontSize,
    };

    const fetchRewardBatches = async (): Promise<void> => {
        setRewardBatchesLoading(true);
        try {
            // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
            const initiativeId = initiativesList?.[0]?.initiativeId!;
            const response = await getRewardBatches(initiativeId);
            if (response?.content) {
                setRewardBatches(response.content as Array<RewardBatchDTO>);
            }
        } catch (error) {
            console.error('Error fetching reward batches:', error);
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

    const handleSortModelChange = async (newSortModel: GridSortModel) => {
        console.log(newSortModel);
    };

    const handlePaginationPageChange = (page: number) => {
        console.log(page);
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

    const isRowSelectable = (params: any) => params?.row?.status === 'CREATED';

    const posTypeMapper = (posType: string) => {
        switch (posType) {
            case 'PHYSICAL': return 'Fisico';
            case 'ONLINE': return 'Online';
            default: return posType;
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
                confirmBtn={{ text: `Invia (${selectedRows.length})`, onConfirm: () => setIsModalOpen(false) }}
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
                            {t('pages.refundRequests.sendRequests')}{(selectedRows.length > 0) ? ` (${selectedRows.length})` : ''}
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
                        rowsPerPage={5}
                        checkable={true}
                        onSortModelChange={handleSortModelChange}
                        onPaginationPageChange={handlePaginationPageChange}
                        onRowSelectionChange={handleRowSelectionChange}
                        isRowSelectable={isRowSelectable}
                    />
                )}

                {!rewardBatchesLoading && (!rewardBatches || rewardBatches.length === 0) && (
                    <NoResultPaper translationKey="pages.refundRequests.noData" />
                )}
            </Box>
        </Box>
    );
};


export default RefundRequests;
