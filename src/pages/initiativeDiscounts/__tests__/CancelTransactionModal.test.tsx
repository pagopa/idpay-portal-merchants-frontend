import { fireEvent, screen } from '@testing-library/react';
import React from 'react';
import { StatusEnum as TransactionStatusEnum } from '../../../api/generated/merchants/MerchantTransactionDTO';
import { renderWithContext } from '../../../utils/__tests__/test-utils';
import CancelTransactionModal from '../CancelTransactionModal';

beforeEach(() => {
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

describe('Test suite for CancelTransactionModal component', () => {
  window.scrollTo = jest.fn();
  test('Render component with status enum IDENTIFIED and onClose with escape button', async () => {
    renderWithContext(
      <CancelTransactionModal
        openCancelTrxModal={true}
        setOpenCancelTrxModal={jest.fn()}
        initiativeId={'1234'}
        trxId={'123456789'}
        status={TransactionStatusEnum.IDENTIFIED}
      />
    );

    const modal = await screen.findByTestId('confirm-modal-cancel-trx');

    fireEvent.keyDown(modal, {
      key: 'Escape',
      code: 'Escape',
      keyCode: 27,
      charCode: 27,
    });
  });

  test('Render component with status enum AUTHORIZED and onClick of back button', async () => {
    renderWithContext(
      <CancelTransactionModal
        openCancelTrxModal={true}
        setOpenCancelTrxModal={jest.fn()}
        initiativeId={'1234'}
        trxId={'123456789'}
        status={TransactionStatusEnum.AUTHORIZED}
      />
    );

    const modalBackButton = await screen.findByTestId('modal-cancel-back-button-test');
    fireEvent.click(modalBackButton);
  });

  test('Render component and cancel transaction', () => {
    renderWithContext(
      <CancelTransactionModal
        openCancelTrxModal={true}
        setOpenCancelTrxModal={jest.fn()}
        initiativeId={'1234'}
        trxId={'123456789'}
        status={TransactionStatusEnum.AUTHORIZED}
      />
    );

    const btn = screen.getByTestId('modal-cancel-button-test');
    fireEvent.click(btn);
  });
});
