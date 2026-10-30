import type { ComponentProps } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { addDays, endOfDay, startOfDay, subDays } from 'date-fns';
import DateRangePicker from '../DateRangePicker';

const mockDatePicker = jest.fn();
const mockInputMouseDown = jest.fn();
let mockIncludeInputMouseDown = true;

jest.mock('@mui/x-date-pickers/DatePicker', () => ({
  DatePicker: (props: any) => {
    mockDatePicker(props);
    const TextFieldSlot = props.slots?.textField;
    return (
      <div data-testid={`picker-${props.label}`}>
        {TextFieldSlot ? (
          <TextFieldSlot
            {...props.slotProps?.textField}
            label={props.label}
            value={props.value ? 'seed value' : ''}
            inputProps={{
              ...(props.slotProps?.textField?.inputProps ?? {}),
              value: 'seed value',
              ...(mockIncludeInputMouseDown ? { onMouseDown: mockInputMouseDown } : {}),
            }}
            InputProps={props.slotProps?.textField?.InputProps}
          />
        ) : null}
        <button data-testid={`open-${props.label}`} onClick={() => props.onOpen?.()}>
          open
        </button>
        <button data-testid={`close-${props.label}`} onClick={() => props.onClose?.()}>
          close
        </button>
        <button
          data-testid={`change-${props.label}`}
          onClick={() => props.onChange(new Date('2026-03-15T10:00:00.000Z'))}
        >
          change
        </button>
        <button data-testid={`accept-${props.label}`} onClick={() => props.onAccept?.()}>
          accept
        </button>
      </div>
    );
  },
}));

type PickerProps = ComponentProps<typeof DateRangePicker>;

const renderDateRangePicker = (overrides: Partial<PickerProps> = {}) => {
  const props: PickerProps = {
    dateFrom: null,
    dateTo: null,
    minDateFrom: new Date('2025-11-18T00:00:00.000Z'),
    yesterday: new Date('2026-03-20T23:59:59.999Z'),
    onDateFromChange: jest.fn(),
    onDateToChange: jest.fn(),
    ...overrides,
  };
  return render(<DateRangePicker {...props} />);
};

const getPickerProps = (label: 'Dal' | 'Al') =>
  mockDatePicker.mock.calls
    .map(([props]) => props)
    .filter((props) => props.label === label)
    .slice(-1)[0];

describe('DateRangePicker', () => {
  test('never allows an end date before the initiative starts', () => {
    const startDate = new Date('2026-03-10T00:00:00');
    renderDateRangePicker({ minDateFrom: startDate, yesterday: new Date('2026-03-20T00:00:00') });
    expect(mockDatePicker.mock.calls[0][0].minDate).toEqual(startDate);
    expect(mockDatePicker.mock.calls[1][0].minDate).toEqual(startDate);
  });
  beforeEach(() => {
    jest.clearAllMocks();
    mockIncludeInputMouseDown = true;
  });

  test('sets min/max date for "to" picker when dateFrom is empty and not users', () => {
    const yesterday = new Date('2026-03-20T23:59:59.999Z');
    const minDateFrom = new Date('2025-11-18T00:00:00.000Z');

    renderDateRangePicker({ minDateFrom, yesterday });

    const toPickerProps = mockDatePicker.mock.calls[1][0];
    expect(toPickerProps.minDate.getTime()).toBe(startOfDay(subDays(yesterday, 90)).getTime());
    expect(toPickerProps.maxDate).toEqual(yesterday);
  });

  const initiativeStart = new Date('2025-11-18T00:00:00.000Z');
  const recentStart = new Date('2026-03-15T00:00:00.000Z');
  const earlierStart = new Date('2026-03-01T00:00:00.000Z');
  const marchYesterday = new Date('2026-03-20T23:59:59.999Z');

  test.each([
    {
      name: 'users without a start date',
      isUsers: true,
      dateFrom: null,
      yesterday: marchYesterday,
      minDate: startOfDay(initiativeStart),
      maxDate: marchYesterday,
    },
    {
      name: 'users with a start date',
      isUsers: true,
      dateFrom: recentStart,
      yesterday: marchYesterday,
      minDate: startOfDay(recentStart),
      maxDate: marchYesterday,
    },
    {
      name: 'merchants capped at yesterday',
      isUsers: false,
      dateFrom: recentStart,
      yesterday: marchYesterday,
      minDate: startOfDay(recentStart),
      maxDate: marchYesterday,
    },
    {
      name: 'merchants capped at 90 days',
      isUsers: false,
      dateFrom: earlierStart,
      yesterday: new Date('2026-07-31T23:59:59.999Z'),
      minDate: startOfDay(earlierStart),
      maxDate: endOfDay(addDays(earlierStart, 90)),
    },
  ])('sets end date limits for $name', ({ dateFrom, yesterday, isUsers, minDate, maxDate }) => {
    renderDateRangePicker({ dateFrom, yesterday, isUsers });
    const picker = getPickerProps('Al');
    expect(picker.minDate).toEqual(minDate);
    expect(picker.maxDate).toEqual(maxDate);
  });

  test('passes validation state to both pickers', () => {
    const yesterday = new Date('2026-03-20T23:59:59.999Z');
    const minDateFrom = new Date('2025-11-18T00:00:00.000Z');

    renderDateRangePicker({
      dateFromError: 'validation.required',
      dateToError: 'validation.required',
      minDateFrom,
      yesterday,
    });

    const fromPickerProps = getPickerProps('Dal');
    const toPickerProps = getPickerProps('Al');

    expect(fromPickerProps?.slotProps?.textField?.error).toBe(true);
    expect(fromPickerProps?.slotProps?.textField?.helperText).toBe('validation.required');
    expect(toPickerProps?.slotProps?.textField?.error).toBe(true);
    expect(toPickerProps?.slotProps?.textField?.helperText).toBe('validation.required');
  });

  test('renders read-only text fields and wires picker open/close handlers', async () => {
    const onDateFromChange = jest.fn();
    const onDateToChange = jest.fn();
    const yesterday = new Date('2026-03-20T23:59:59.999Z');
    const minDateFrom = new Date('2025-11-18T00:00:00.000Z');

    renderDateRangePicker({
      dateTo: new Date('2026-03-11T00:00:00.000Z'),
      minDateFrom,
      yesterday,
      onDateFromChange,
      onDateToChange,
    });

    const [fromInput, toInput] = screen.getAllByRole('textbox');

    expect(fromInput).toHaveValue('');
    expect(toInput).toHaveValue('seed value');

    fireEvent.mouseDown(fromInput);
    expect(mockInputMouseDown).toHaveBeenCalled();
    fireEvent.click(screen.getByTestId('open-Dal'));
    fireEvent.click(screen.getByTestId('close-Dal'));
    fireEvent.click(screen.getByTestId('accept-Dal'));
    fireEvent.click(screen.getByTestId('accept-Al'));

    await waitFor(() => {
      const latestFromPickerCall = getPickerProps('Dal');
      const latestToPickerCall = getPickerProps('Al');

      expect(latestFromPickerCall?.open).toBe(false);
      expect(latestToPickerCall?.open).toBe(false);
    });
  });

  test('opens "to" picker after accepting "from" picker and forwards date change callbacks', async () => {
    const onDateFromChange = jest.fn();
    const onDateToChange = jest.fn();
    const yesterday = new Date('2026-03-20T23:59:59.999Z');
    const minDateFrom = new Date('2025-11-18T00:00:00.000Z');

    const { getByTestId } = renderDateRangePicker({
      dateFrom: new Date('2026-03-01T00:00:00.000Z'),
      minDateFrom,
      yesterday,
      onDateFromChange,
      onDateToChange,
    });

    fireEvent.click(getByTestId('change-Dal'));
    fireEvent.click(getByTestId('change-Al'));
    expect(onDateFromChange).toHaveBeenCalled();
    expect(onDateToChange).toHaveBeenCalled();

    fireEvent.click(getByTestId('accept-Dal'));

    await waitFor(() => {
      const latestToPickerCall = mockDatePicker.mock.calls[mockDatePicker.mock.calls.length - 1][0];
      expect(latestToPickerCall.label).toBe('Al');
      expect(latestToPickerCall.open).toBe(true);
    });
  });

  test('does not require an input mouseDown handler to prevent default', () => {
    mockIncludeInputMouseDown = false;

    renderDateRangePicker({
      minDateFrom: new Date('2025-11-18T00:00:00.000Z'),
      yesterday: new Date('2026-03-20T23:59:59.999Z'),
    });

    fireEvent.mouseDown(screen.getAllByRole('textbox')[0]);
    expect(mockInputMouseDown).not.toHaveBeenCalled();
  });
});
