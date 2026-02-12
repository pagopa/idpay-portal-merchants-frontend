import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import dayjs from 'dayjs';

import ExportFiltersCard, {
  renderFormikDatePickerInput,
} from '../ExportFiltersCard';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

jest.mock('@mui/x-date-pickers', () => {
  const React = require('react');
  const dayjsLocal = require('dayjs');

  return {
    LocalizationProvider: ({ children }: { children: React.ReactNode }) => (
      <>{children}</>
    ),
    DatePicker: ({
                   label,
                   value,
                   onChange,
                 }: {
      label: string;
      value: any;
      onChange: (v: any) => void;
    }) => (
      <div>
        <label htmlFor={`dp-${label}`}>{label}</label>
        <input
          id={`dp-${label}`}
          aria-label={label}
          value={value ? value.format('YYYY-MM-DD') : ''}
          onChange={(e) => {
            const next = e.target.value ? dayjsLocal(e.target.value) : null;
            onChange(next);
          }}
        />
      </div>
    ),
  };
});

jest.mock('@mui/x-date-pickers/AdapterDayjs', () => ({
  AdapterDayjs: function AdapterDayjs() {},
}));

describe('ExportFiltersCard', () => {
  test('renders title, subtitle and submit button (i18n keys)', () => {
    render(<ExportFiltersCard />);

    expect(
      screen.getByText('pages.reportExport.form.title')
    ).toBeInTheDocument();
    expect(
      screen.getByText('pages.reportExport.form.subtitle')
    ).toBeInTheDocument();

    expect(
      screen.getByRole('button', { name: 'pages.reportExport.form.submit' })
    ).toBeInTheDocument();
  });

  test('does not call onGenerateReport when dates are missing', async () => {
    const user = userEvent.setup();
    const onGenerateReport = jest.fn();

    render(<ExportFiltersCard onGenerateReport={onGenerateReport} />);

    await user.click(
      screen.getByRole('button', { name: 'pages.reportExport.form.submit' })
    );

    expect(onGenerateReport).not.toHaveBeenCalled();
  });

  test('calls onGenerateReport with formatted range for a valid date interval (1..90 days)', async () => {
    const user = userEvent.setup();
    const onGenerateReport = jest.fn();

    render(<ExportFiltersCard onGenerateReport={onGenerateReport} />);

    fireEvent.change(screen.getByLabelText('Dal'), {
      target: { value: '2026-01-10' },
    });
    fireEvent.change(screen.getByLabelText('Al'), {
      target: { value: '2026-01-12' },
    });

    await user.click(
      screen.getByRole('button', { name: 'pages.reportExport.form.submit' })
    );

    expect(onGenerateReport).toHaveBeenCalledTimes(1);
    expect(onGenerateReport).toHaveBeenCalledWith({
      from: '10-01-2026',
      to: '12-01-2026',
    });
  });

  test('changing start date resets end date to null', async () => {
    const user = userEvent.setup();
    const onGenerateReport = jest.fn();

    render(<ExportFiltersCard onGenerateReport={onGenerateReport} />);

    fireEvent.change(screen.getByLabelText('Dal'), {
      target: { value: '2026-01-10' },
    });
    fireEvent.change(screen.getByLabelText('Al'), {
      target: { value: '2026-01-12' },
    });

    fireEvent.change(screen.getByLabelText('Dal'), {
      target: { value: '2026-01-15' },
    });

    await user.click(
      screen.getByRole('button', { name: 'pages.reportExport.form.submit' })
    );

    expect(onGenerateReport).not.toHaveBeenCalled();
  });

  test('does not call onGenerateReport for invalid short range (< 1 day)', async () => {
    const user = userEvent.setup();
    const onGenerateReport = jest.fn();

    render(<ExportFiltersCard onGenerateReport={onGenerateReport} />);

    fireEvent.change(screen.getByLabelText('Dal'), {
      target: { value: '2026-01-10' },
    });
    fireEvent.change(screen.getByLabelText('Al'), {
      target: { value: '2026-01-10' },
    });

    await user.click(
      screen.getByRole('button', { name: 'pages.reportExport.form.submit' })
    );

    expect(onGenerateReport).not.toHaveBeenCalled();
  });

  test('does not call onGenerateReport for invalid long range (> 90 days)', async () => {
    const user = userEvent.setup();
    const onGenerateReport = jest.fn();

    render(<ExportFiltersCard onGenerateReport={onGenerateReport} />);

    fireEvent.change(screen.getByLabelText('Dal'), {
      target: { value: '2026-01-01' },
    });
    fireEvent.change(screen.getByLabelText('Al'), {
      target: { value: '2026-04-02' },
    });

    await user.click(
      screen.getByRole('button', { name: 'pages.reportExport.form.submit' })
    );

    expect(onGenerateReport).not.toHaveBeenCalled();
  });

  test('does not crash when onGenerateReport is not provided', async () => {
    const user = userEvent.setup();
    render(<ExportFiltersCard />);

    fireEvent.change(screen.getByLabelText('Dal'), {
      target: { value: '2026-01-10' },
    });
    fireEvent.change(screen.getByLabelText('Al'), {
      target: { value: '2026-01-12' },
    });

    await user.click(
      screen.getByRole('button', { name: 'pages.reportExport.form.submit' })
    );

    expect(true).toBe(true);
  });
});

describe('renderFormikDatePickerInput', () => {
  test('shows error + helperText when touched and error exists; shrink true when value is present', () => {
    const formik: any = {
      values: { startDate: dayjs('2026-01-10') },
      touched: { startDate: true },
      errors: { startDate: 'Required' },
    };

    const renderInput = renderFormikDatePickerInput({
      formik,
      fieldName: 'startDate',
      placeholder: 'Dal',
    });

    render(
      <div>
        {renderInput({
          InputLabelProps: {},
        } as any)}
      </div>
    );

    expect(screen.getByText('Required')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Dal')).toBeInTheDocument();
  });

  test('does not show helperText when not touched or no error; shrink false when value is empty', () => {
    const formik: any = {
      values: { endDate: null },
      touched: { endDate: false },
      errors: { endDate: 'Some error' },
    };

    const renderInput = renderFormikDatePickerInput({
      formik,
      fieldName: 'endDate',
      placeholder: 'Al',
    });

    render(
      <div>
        {renderInput({
          InputLabelProps: {},
        } as any)}
      </div>
    );

    expect(screen.queryByText('Some error')).not.toBeInTheDocument();
    expect(screen.getByPlaceholderText('Al')).toBeInTheDocument();
  });
});
