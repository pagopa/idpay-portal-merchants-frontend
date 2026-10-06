import React from 'react';
import { render, screen } from '@testing-library/react';
import {
  renderTransactionCreatedStatus,
  renderTrasactionProcessedStatus,
  mapDatesFromPeriod,
  userCanCreateDiscount,
  resetForm,
} from '../helpers';
const StatusEnum = {
  AUTHORIZED: 'AUTHORIZED',
  AUTHORIZATION_REQUESTED: 'AUTHORIZATION_REQUESTED',
  CREATED: 'CREATED',
  IDENTIFIED: 'IDENTIFIED',
  REJECTED: 'REJECTED',
  REWARDED: 'REWARDED',
  CANCELLED: 'CANCELLED',
} as const;

import { FormikProps } from 'formik';

jest.mock('@pagopa/selfcare-common-frontend/lib/locale/locale-utils', () => ({
  t: (key: string) => key,
}));

describe('initiativeDiscounts/helpers', () => {
  describe('renderTransactionCreatedStatus', () => {
    it('should render AUTHORIZED status chip', () => {
      render(renderTransactionCreatedStatus(StatusEnum.AUTHORIZED) as React.ReactElement);
      expect(screen.getByText('enums.discountStatus.authorized')).toBeInTheDocument();
    });

    it('should render AUTHORIZATION_REQUESTED status chip', () => {
      render(
        renderTransactionCreatedStatus(StatusEnum.AUTHORIZATION_REQUESTED) as React.ReactElement
      );
      expect(screen.getByText('enums.discountStatus.authorizationRequested')).toBeInTheDocument();
    });

    it('should render CREATED status as identified', () => {
      render(renderTransactionCreatedStatus(StatusEnum.CREATED) as React.ReactElement);
      expect(screen.getByText('enums.discountStatus.identified')).toBeInTheDocument();
    });

    it('should render IDENTIFIED status chip', () => {
      render(renderTransactionCreatedStatus(StatusEnum.IDENTIFIED) as React.ReactElement);
      expect(screen.getByText('enums.discountStatus.identified')).toBeInTheDocument();
    });

    it('should render REJECTED status chip', () => {
      render(renderTransactionCreatedStatus(StatusEnum.REJECTED) as React.ReactElement);
      expect(screen.getByText('enums.discountStatus.invalidated')).toBeInTheDocument();
    });
  });

  describe('renderTrasactionProcessedStatus', () => {
    it('should render REWARDED status chip', () => {
      render(renderTrasactionProcessedStatus(StatusEnum.REWARDED) as React.ReactElement);
      expect(screen.getByText('enums.discountStatus.rewarded')).toBeInTheDocument();
    });

    it('should render CANCELLED status chip', () => {
      render(renderTrasactionProcessedStatus(StatusEnum.CANCELLED) as React.ReactElement);
      expect(screen.getByText('enums.discountStatus.cancelled')).toBeInTheDocument();
    });
  });

  describe('mapDatesFromPeriod', () => {
    it('should return start and end dates from a valid period string', () => {
      const period = '01/01/2023 - 31/12/2023';
      const result = mapDatesFromPeriod(period);
      expect(result?.startDate).toEqual(new Date('2023-01-01 00:00:00'));
      expect(result?.endDate).toEqual(new Date('2023-12-31 23:59:59'));
    });

    it('should return undefined if period is undefined', () => {
      const result = mapDatesFromPeriod(undefined);
      expect(result).toBeUndefined();
    });
  });

  describe('userCanCreateDiscount', () => {
    const startDate = new Date('2023-01-01T00:00:00.000Z');
    const endDate = new Date('2023-01-31T23:59:59.999Z');

    beforeAll(() => {
      jest.useFakeTimers();
    });

    afterAll(() => {
      jest.useRealTimers();
    });

    it('should return true if current date is within the period', () => {
      jest.setSystemTime(new Date('2023-01-15T12:00:00.000Z'));
      expect(userCanCreateDiscount(startDate, endDate)).toBe(true);
    });

    it('should return false if current date is before the start date', () => {
      jest.setSystemTime(new Date('2022-12-31T23:59:59.999Z'));
      expect(userCanCreateDiscount(startDate, endDate)).toBe(false);
    });

    it('should return false if current date is after the end date', () => {
      jest.setSystemTime(new Date('2023-02-01T00:00:00.000Z'));
      expect(userCanCreateDiscount(startDate, endDate)).toBe(false);
    });

    it('should return true if dates are undefined', () => {
      expect(userCanCreateDiscount(undefined, undefined)).toBe(true);
    });
  });

  describe('resetForm', () => {
    it('should reset form and fetch data', () => {
      const mockResetForm = jest.fn();
      const mockFormik = {
        resetForm: mockResetForm,
      } as unknown as FormikProps<{ searchUser: string; filterStatus: string }>;

      const mockSetFilterByUser = jest.fn();
      const mockSetFilterByStatus = jest.fn();
      const mockSetRows = jest.fn();
      const mockGetTableData = jest.fn();

      resetForm(
        'initiative-123',
        mockFormik,
        mockSetFilterByUser,
        mockSetFilterByStatus,
        mockSetRows,
        mockGetTableData
      );

      expect(mockResetForm).toHaveBeenCalledWith({
        values: { searchUser: '', filterStatus: '' },
      });
      expect(mockSetFilterByUser).toHaveBeenCalledWith(undefined);
      expect(mockSetFilterByStatus).toHaveBeenCalledWith(undefined);
      expect(mockSetRows).toHaveBeenCalledWith([]);
      expect(mockGetTableData).toHaveBeenCalledWith('initiative-123', 0, undefined, undefined);
    });
  });
});
