import { screen, fireEvent, waitFor } from '@testing-library/react';

/**
 * Standard valid CF used across tests
 */
export const VALID_CF = 'RSSMRA80A01F205X';

/**
 * Fill CF input field
 */
export const fillCfInput = (cf: string = VALID_CF) => {
  const input = screen.getByTestId('cf-input');
  fireEvent.change(input, { target: { value: cf } });
};

/**
 * Click confirm button (InsertReportedUser)
 */
export const clickConfirmReportedUser = () => {
  fireEvent.click(screen.getByTestId('confirm-reportedUsers-button'));
};

/**
 * Open confirmation modal flow (InsertReportedUser)
 */
export const openInsertReportedUserModal = async () => {
  fillCfInput();
  clickConfirmReportedUser();
  await waitFor(() =>
    expect(screen.getByTestId('modal-reported-user')).toBeInTheDocument()
  );
};

/**
 * Search CF in ReportedUsers page
 */
export const searchByCF = async (cf: string) => {
  const input = screen.getByTestId('cf-input');
  fireEvent.change(input, { target: { value: cf } });
  fireEvent.click(screen.getByTestId('search-button'));
};

/**
 * Perform search and wait for table render
 */
export const searchAndWaitForTable = async (cf: string) => {
  await searchByCF(cf);
  await waitFor(() =>
    expect(screen.getByTestId('data-table')).toBeInTheDocument()
  );
};

/**
 * Open delete modal in ReportedUsers
 */
export const openDeleteModal = async (cf: string) => {
  await searchAndWaitForTable(cf);
  fireEvent.click(screen.getByTestId(`delete-${cf}`));
  await waitFor(() =>
    expect(screen.getByTestId('modal-reported-user')).toBeInTheDocument()
  );
};
