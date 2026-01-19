import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter, Route } from 'react-router-dom';
import RefundRequests from './RefundRequests';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

jest.mock('@pagopa/selfcare-common-frontend', () => ({
  TitleBox: ({ title, subTitle }: any) => (
    <div>
      <h4>{title}</h4>
      <p>{subTitle}</p>
    </div>
  ),
}));

jest.mock('@pagopa/selfcare-common-frontend/hooks/useErrorDispatcher', () => ({
  __esModule: true,
  default: () => jest.fn(),
}));

jest.mock('../../components/dataTable/DataTable', () => ({
  __esModule: true,
  default: ({
    columns,
    rows,
    onRowSelectionChange,
    onPaginationPageChange,
    isRowSelectable,
  }: any) => (
    <div data-testid="data-table">
      <table>
        <thead>
          <tr>
            {columns.map((col: any) => (
              <th key={col.field}>{col.headerName}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row: any) => (
            <tr key={row.id}>
              <td>
                {isRowSelectable({ row }) && (
                  <input
                    type="checkbox"
                    data-testid={`checkbox-${row.id}`}
                    onChange={() => onRowSelectionChange([row])}
                  />
                )}
              </td>
              {columns.slice(1).map((col: any) => (
                <td key={col.field}>
                  {col.renderCell ? col.renderCell({ value: row[col.field], row }) : row[col.field]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={() => onPaginationPageChange(2)}>Next Page</button>
    </div>
  ),
}));

jest.mock('../../components/Chip/CustomChip', () => ({
  __esModule: true,
  default: ({ label }: any) => <span data-testid="custom-chip">{label}</span>,
}));

jest.mock('../../components/Transactions/useStatus', () => ({
  __esModule: true,
  default: (status: string) => ({
    label: status,
    color: 'primary',
    textColor: 'white',
  }),
}));

jest.mock('../../components/Transactions/CurrencyColumn', () => ({
  __esModule: true,
  default: ({ value }: any) => <span>{value.toFixed(2)} €</span>,
}));

jest.mock('../reportedUsers/NoResultPaper', () => ({
  __esModule: true,
  default: ({ translationKey }: any) => <div data-testid="no-result-paper">{translationKey}</div>,
}));

jest.mock('../../redux/slices/initiativesSlice', () => ({
  intiativesListSelector: (state: any) => state.initiatives.initiativesList,
}));

jest.mock('./RefundRequestModal', () => ({
  RefundRequestsModal: ({
    isOpen,
    setIsOpen,
    title,
    description,
    warning,
    cancelBtn,
    confirmBtn,
  }: any) =>
    isOpen ? (
      <div data-testid="refund-modal">
        <h2>{title}</h2>
        <p>{description}</p>
        <p>{warning}</p>
        <button onClick={setIsOpen}>{cancelBtn}</button>
        <button onClick={confirmBtn.onConfirm} disabled={confirmBtn.loading}>
          {confirmBtn.text}
        </button>
      </div>
    ) : null,
}));

const mockGetRewardBatches = jest.fn();
const mockSendRewardBatch = jest.fn();

jest.mock('../../services/merchantService', () => ({
  getRewardBatches: (initiativeId: string) => mockGetRewardBatches(initiativeId),
  sendRewardBatch: (initiativeId: string, batchId: string) =>
    mockSendRewardBatch(initiativeId, batchId),
}));

const getPreviousMonth = () => {
  const date = new Date();
  date.setMonth(date.getMonth() - 1);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

const mockData = [
  {
    id: 1,
    name: '001-20251125 223',
    posType: 'PHYSICAL',
    initialAmountCents: 10000,
    status: 'CREATED',
    month: getPreviousMonth(),
  },
  {
    id: 2,
    name: '002-20251125 224',
    posType: 'ONLINE',
    initialAmountCents: 20000,
    status: 'SENT',
    month: getPreviousMonth(),
  },
  {
    id: 3,
    name: '003-20251125 225',
    posType: 'ONLINE',
    initialAmountCents: 300000,
    status: 'EVALUATING',
    month: getPreviousMonth(),
  },
];

const createMockStore = (initiatives = [{ initiativeId: 'test-initiative-id' }]) =>
  configureStore({
    reducer: {
      initiatives: () => ({ initiativesList: initiatives }),
    },
  });

const renderWithStore = (component: React.ReactElement, store = createMockStore()) =>
  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/refund-requests']}>
        <Route path="/refund-requests">{component}</Route>
      </MemoryRouter>
    </Provider>
  );

describe('RefundRequests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetRewardBatches.mockResolvedValue({ content: mockData });
    mockSendRewardBatch.mockResolvedValue({});
  });

  // ... rest of the tests unchanged ...
});
