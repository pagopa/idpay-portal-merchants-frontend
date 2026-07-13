import type React from 'react';
import { useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Typography,
} from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import useScopedTranslation from '../../hooks/useScopedTranslation';
import DialogComponent from '../../components/Dialog/DialogComponent';
import { Data, EnhancedTableProps } from './helpers';

type Props = {
  isLoading: boolean;
  isError: boolean;
  initiatives: Array<Data>;
  order: EnhancedTableProps['order'];
  orderBy: EnhancedTableProps['orderBy'];
  onRequestSort: EnhancedTableProps['onRequestSort'];
  onOpenInitiativeOverview: (initiativeId: string) => void;
  onAdhere: (initiative: { initiativeId: string; initiativeName: string }) => void;
};

function NewInitiativesTableHead(props: EnhancedTableProps) {
  const { order, orderBy, onRequestSort } = props;
  const { t } = useScopedTranslation();
  const createSortHandler = (property: keyof Data) => (event: React.MouseEvent<unknown>) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead sx={{ backgroundColor: '#E8EBF1' }}>
      <TableRow>
        <TableCell
          align="left"
          padding="normal"
          sortDirection={orderBy === 'initiativeName' ? order : false}
        >
          <TableSortLabel
            active={orderBy === 'initiativeName'}
            direction={orderBy === 'initiativeName' ? order : 'asc'}
            onClick={createSortHandler('initiativeName')}
          >
            {t('pages.initiativesList.initiativeName')}
            {orderBy === 'initiativeName' ? (
              <Box component="span" sx={{ ...visuallyHidden }}>
                {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
              </Box>
            ) : null}
          </TableSortLabel>
        </TableCell>
        <TableCell
          align="left"
          padding="normal"
          sortDirection={orderBy === 'organizationName' ? order : false}
        >
          <TableSortLabel
            active={orderBy === 'organizationName'}
            direction={orderBy === 'organizationName' ? order : 'asc'}
            onClick={createSortHandler('organizationName')}
          >
            {t('pages.initiativesList.organizationName')}
            {orderBy === 'organizationName' ? (
              <Box component="span" sx={{ ...visuallyHidden }}>
                {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
              </Box>
            ) : null}
          </TableSortLabel>
        </TableCell>
        <TableCell align="right" padding="normal" />
      </TableRow>
    </TableHead>
  );
}

const NewInitiativesTabContent = ({
  isLoading,
  isError,
  initiatives,
  order,
  orderBy,
  onRequestSort,
  onOpenInitiativeOverview,
  onAdhere,
}: Props) => {
  const { t } = useScopedTranslation();
  const [isNotOnboardableModalOpen, setIsNotOnboardableModalOpen] = useState(false);

  return (
    <Paper
      sx={{
        display: 'flex',
        p: 1,
        flexDirection: 'column',
        alignItems: 'flex-end',
        alignSelf: 'stretch',
        width: '100%',
        backgroundColor: '#E8EBF1',
      }}
    >
      {isLoading ? (
        <Box
          sx={{
            backgroundColor: 'white',
            border: '1px solid #D7DDE8',
            p: 3,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
            width: '100%',
          }}
        >
          <CircularProgress size={24} />
          <Typography variant="h6" color="text.secondary" sx={{ fontSize: '1rem !important' }}>
            {t('pages.initiativesList.newInitiativesLoadingTitle')}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            textAlign="center"
            sx={{ fontSize: '0.875rem' }}
          >
            {t('pages.initiativesList.newInitiativesLoadingSubtitle')}
          </Typography>
        </Box>
      ) : isError ? (
        <Paper
          sx={{
            my: 2,
            p: 3,
            width: '100%',
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'none',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <ErrorOutlineOutlinedIcon fontVariant="h5" color="disabled" />
            <Typography
              variant="body2"
              textAlign="center"
              sx={{ fontSize: '1rem !important', width: '100%' }}
            >
              {t('pages.initiativesList.newInitiativesErrorTitle')}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              textAlign="center"
              sx={{ fontSize: '0.875rem', width: '100%' }}
            >
              {t('pages.initiativesList.newInitiativesErrorSubtitle')}
            </Typography>
          </Box>
        </Paper>
      ) : (
        <TableContainer sx={{ backgroundColor: 'white' }}>
          {initiatives.length > 0 ? (
            <Table sx={{ minWidth: 750 }} aria-labelledby="tableTitle-new-initiatives">
              <NewInitiativesTableHead
                order={order}
                orderBy={orderBy}
                onRequestSort={onRequestSort}
              />
              <TableBody sx={{ backgroundColor: 'white' }}>
                {initiatives.map((row, index) => {
                  const labelId = `new-initiatives-row-${index}`;
                  return (
                    <TableRow tabIndex={-1} key={row.id}>
                      <TableCell id={labelId} scope="row">
                        <Box
                          component="button"
                          type="button"
                          sx={{
                            color: 'primary.main',
                            fontWeight: 600,
                            fontSize: '1em',
                            textAlign: 'left',
                            background: 'none',
                            border: 'none',
                            padding: 0,
                            cursor: 'pointer',
                          }}
                          onClick={() => onOpenInitiativeOverview(row.initiativeId)}
                        >
                          {row.initiativeName}
                        </Box>
                      </TableCell>
                      <TableCell>{row.organizationName}</TableCell>
                      <TableCell align="right">
                        {row.onboardStatus === 'ONBOARDABLE' ? (
                          <Box
                            component="button"
                            type="button"
                            sx={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 0.5,
                              color: 'primary.main',
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              fontWeight: 600,
                              fontSize: '1em',
                              p: 0,
                            }}
                            onClick={() =>
                              onAdhere({
                                initiativeId: row.initiativeId,
                                initiativeName: row.initiativeName,
                              })
                            }
                          >
                            {t('pages.initiativesList.actions.adhere')}
                          </Box>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setIsNotOnboardableModalOpen(true)}
                            data-testid="not-onboardable-info-btn"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              padding: 0,
                            }}
                          >
                            <InfoOutlinedIcon color="primary" sx={{ fontSize: '1.1rem' }} />
                          </button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <Paper
              sx={{
                my: 2,
                p: 3,
                textAlign: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'none',
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <ErrorOutlineOutlinedIcon fontVariant="h5" color="disabled" />
                <Typography variant="body2" sx={{ fontSize: '1rem !important' }}>
                  {t('pages.initiativesList.emptyList')}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  textAlign="center"
                  sx={{ fontSize: '0.875rem' }}
                >
                  {t('pages.initiativesList.newInitiativesEmptySubtitle')}
                </Typography>
              </Box>
            </Paper>
          )}
        </TableContainer>
      )}

      <DialogComponent
        open={isNotOnboardableModalOpen}
        titleId="not-onboardable-dialog-title"
        title={t('pages.initiativesList.notOnboardableModal.title')}
        description={t('pages.initiativesList.notOnboardableModal.description')}
        closeLabel={t('actions.okClose')}
        onClose={() => setIsNotOnboardableModalOpen(false)}
        dataTestId="not-onboardable-modal"
        actions={
          <Button
            variant="contained"
            onClick={() => setIsNotOnboardableModalOpen(false)}
            data-testid="not-onboardable-modal-close-btn"
          >
            {t('actions.okClose')}
          </Button>
        }
      />
    </Paper>
  );
};

export default NewInitiativesTabContent;
