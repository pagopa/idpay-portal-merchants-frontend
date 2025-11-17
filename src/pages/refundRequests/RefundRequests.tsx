import { useEffect, useState } from "react";
import { Box, Stack, Tooltip, Typography } from "@mui/material";
import Button from "@mui/material/Button";
import SendIcon from '@mui/icons-material/Send';
import { useTranslation } from "react-i18next";
import { TitleBox } from '@pagopa/selfcare-common-frontend';
import { GridSortModel } from "@mui/x-data-grid";
import { theme } from "@pagopa/mui-italia";
import DataTable from "../../components/dataTable/DataTable";
import CustomChip from "../../components/Chip/CustomChip";
import getStatus from '../../components/Transactions/useStatus';    
import CurrencyColumn from "../../components/Transactions/CurrencyColumn";

const RefundRequests = () => {

    const [selectedRows, setSelectedRows] = useState<Array<number>>([]);

    const mockData = [
        {
            id: 1,
            name: '001-20251125 223',
            tipology: 'FISICO',
            refundAmount: 10000,
            status: 'CREATED',
        },
        {
            id: 2,
            name: '002-20251125 224',
            tipology: 'ONLINE',
            refundAmount: 20000,
            status: 'APPROVED',
        },
        {
            id: 3,
            name: '003-20251125 225',
            tipology: 'ONLINE',
            refundAmount: 300000,
            status: 'EVALUATING',
        },
    ];

    const columns = [
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
            field: 'tipology',
            headerName: 'Tipologia',
            disableColumnMenu: true,
            flex: 2,
            sortable: false,
            renderCell: (params: any) => renderCellWithTooltip(params.value, 11),
        },
        {
            field: 'refundAmount',
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

    }, []);

    const infoStyles = {
        fontWeight: theme.typography.fontWeightRegular,
        fontSize: theme.typography.fontSize,
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
        console.log(rows);
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


    return (
        <Box p={1.5}>
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
                            onClick={() => { }}
                            startIcon={<SendIcon />}
                            sx={{ width: { xs: '100%', md: 'auto', alignSelf: 'start', whiteSpace: 'nowrap', fontWeight: 'bold' } }}
                        >
                            {t('pages.refundRequests.sendRequests')}{(selectedRows.length > 0) ? ` (${selectedRows.length})` : ''}
                        </Button>
                    )
                }
            </Stack>

            <Box sx={{ height: '400px' }}>
                <DataTable
                    columns={columns}
                    rows={mockData}
                    rowsPerPage={5}
                    checkable={true}
                    onSortModelChange={handleSortModelChange}
                    onPaginationPageChange={handlePaginationPageChange}
                    onRowSelectionChange={handleRowSelectionChange}
                    isRowSelectable={isRowSelectable}
                />
            </Box>
        </Box>
    );
};


export default RefundRequests;
