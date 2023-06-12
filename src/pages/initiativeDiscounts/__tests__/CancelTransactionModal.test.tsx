import React from 'react';
import { renderWithContext } from '../../../utils/__tests__/test-utils';
import CancelTransactionModal from '../CancelTransactionModal';
import { StatusEnum as TransactionStatusEnum } from '../../../api/generated/merchants/MerchantTransactionDTO';

beforeEach(() => {
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

describe('Test suite for CancelTransactionModal component', () => {
  window.scrollTo = jest.fn();
  test('Render component', () => {
    renderWithContext(
      <CancelTransactionModal
        openCancelTrxModal={false}
        setOpenCancelTrxModal={jest.fn()}
        initiativeId={'1234'}
        trxId={'123456789'}
        status={TransactionStatusEnum.IDENTIFIED}
      />
    );
  });
});
