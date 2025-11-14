import { useEffect, useState } from "react";
import { Box, Stack } from "@mui/material";
import Button from "@mui/material/Button";
import SendIcon from '@mui/icons-material/Send';
import { useTranslation } from "react-i18next";
import { TitleBox } from '@pagopa/selfcare-common-frontend';
import { GridSortModel } from "@mui/x-data-grid";
import DataTable from "../../components/dataTable/DataTable";
import { formatEuro } from "../../helpers";
import CustomChip from "../../components/Chip/CustomChip";
import getStatus from '../../components/Transactions/useStatus';    

const RefundRequests = () => {

    const [selectedRows, setSelectedRows] = useState<Array<number>>([]);

    const mockData = [
        {
            id: 1,
            name: '001-20251125 223',
            refundAmount: 10000,
            status: 'TO_SEND',
        },
        {
            id: 2,
            name: '002-20251125 224',
            refundAmount: 20000,
            status: 'TO_SEND',
        },
        {
            id: 3,
            name: '003-20251125 225',
            refundAmount: 300000,
            status: 'TO_SEND',
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
            flex: 2
        },
        {
            field: 'refundAmount',
            headerName: 'Importo',
            disableColumnMenu: true,
            flex: 2,
            renderCell: (params: any) => formatEuro(params.value),
        },
        {
            field: 'status',
            headerName: 'Stato',
            disableColumnMenu: true,
            flex: 2,
            renderCell: (params: any) => <StatusChip status={params.value} />
        },
    ];

    const { t } = useTranslation();
    useEffect(() => {

    }, []);

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
                />
            </Box>
        </Box>
    );
};


export default RefundRequests;
