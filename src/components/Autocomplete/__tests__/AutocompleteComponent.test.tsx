import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';

jest.mock('@mui/material/Autocomplete', () => (props: any) => {
  const {
    open,
    onOpen,
    onClose,
    options,
    getOptionLabel,
    onChange,
    onInputChange,
    loading,
    renderInput,
    isOptionEqualToValue,
    filterOptions,
    noOptionsText,
    loadingText,
  } = props;

  return (
    <div>
      <button type="button" data-testid="open" onClick={() => onOpen?.()}>
        open
      </button>
      <button type="button" data-testid="close" onClick={() => onClose?.()}>
        close
      </button>

      {renderInput({
        InputProps: {},
        inputProps: {},
      })}

      {loading ? <div role="progressbar">{loadingText}</div> : null}
      {!options.length ? <div>{noOptionsText}</div> : null}

      {open
        ? options.map((opt: any, i: number) => (
            <button
              type="button"
              key={i}
              onClick={() => {
                getOptionLabel?.(opt);
                onChange?.({}, opt);
                onClose?.();
              }}
            >
              {getOptionLabel?.(opt)}
            </button>
          ))
        : null}

      <button type="button" data-testid="type-abcde" onClick={() => onInputChange?.({}, 'abcde')}>
        type-abcde
      </button>
      <button type="button" data-testid="type-spaces" onClick={() => onInputChange?.({}, '     ')}>
        type-spaces
      </button>
      <button
        type="button"
        data-testid="select-undefined"
        onClick={() => {
          getOptionLabel?.(undefined);
          onChange?.({}, undefined);
        }}
      >
        select-undefined
      </button>
      <button
        type="button"
        data-testid="compare-options"
        onClick={() => isOptionEqualToValue?.({ address: 'same' }, { address: 'same' })}
      >
        compare-options
      </button>
      <button
        type="button"
        data-testid="filter-options"
        onClick={() => filterOptions?.(['one'])}
      >
        filter-options
      </button>
    </div>
  );
});

jest.mock('../../../hooks/useCurrentInitiativeId', () => ({
  useCurrentInitiativeId: () => 'initiative-1',
}));

jest.mock('../../../redux/slices/initiativesSlice', () => ({
  setInitiativesList: jest.fn(),
  intiativesListSelector: jest.fn(),
  initiativesReducer: jest.fn(),
}));

jest.mock('../../../redux/hooks', () => ({
  useAppSelector: jest.fn(),
}));

import AutocompleteComponent from '../AutocompleteComponent';
import { useAppSelector } from '../../../redux/hooks';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      if (key === 'pages.pointOfSales.noOptionsText') return 'Nessuna opzione';
      if (key === 'pages.pointOfSales.loadingText') return 'Caricamento...';
      return key;
    },
  }),
}));

jest.mock('../../../utils/constants', () => ({
  MANDATORY_FIELD: 'Campo obbligatorio',
}));

describe('AutocompleteComponent', () => {
  (useAppSelector as jest.Mock).mockReturnValue([{ initiativeId: 'initiative-1' }]);
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders correctly with label', () => {
    render(<AutocompleteComponent options={[]} label="Cerca indirizzo" />);
    expect(screen.getByLabelText('Cerca indirizzo')).toBeInTheDocument();
  });

  it('does not trigger onChangeDebounce for input shorter than 5 chars', () => {
    const onChangeDebounce = jest.fn();
    render(<AutocompleteComponent options={[]} onChangeDebounce={onChangeDebounce} label="Test" />);
    const input = screen.getByLabelText('Test');

    fireEvent.change(input, { target: { value: 'abcd' } });
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(onChangeDebounce).not.toHaveBeenCalled();
    expect(screen.queryByRole('progressbar')).toBeNull();
  });

  it('triggers onChangeDebounce after 800ms when input length >= 5 and trimmed', () => {
    const onChangeDebounce = jest.fn();
    render(<AutocompleteComponent options={[]} onChangeDebounce={onChangeDebounce} label="Test" />);

    fireEvent.click(screen.getByTestId('type-abcde'));
    expect(screen.getAllByRole('progressbar')).toHaveLength(2);
    expect(screen.getByText('Caricamento...')).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(799);
    });
    expect(onChangeDebounce).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(1);
    });
    expect(onChangeDebounce).toHaveBeenCalledWith('abcde');
  });

  it('does not trigger onChangeDebounce when the trimmed input is empty', () => {
    const onChangeDebounce = jest.fn();
    render(<AutocompleteComponent options={[]} onChangeDebounce={onChangeDebounce} label="Test" />);

    fireEvent.click(screen.getByTestId('type-spaces'));

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(onChangeDebounce).not.toHaveBeenCalled();
    expect(screen.queryByRole('progressbar')).toBeNull();
  });

  it('handles debounceable input even when no debounce callback is provided', () => {
    render(<AutocompleteComponent options={[]} label="Test" />);

    fireEvent.click(screen.getByTestId('type-abcde'));

    act(() => {
      jest.advanceTimersByTime(800);
    });

    expect(screen.getByText('Nessuna opzione')).toBeInTheDocument();
  });

  it('does not trigger onChangeDebounce when optionValue equals inputValue', () => {
    const onChangeDebounce = jest.fn();
    const options = [{ Address: { Label: 'Via Roma 1' } }];

    render(
      <AutocompleteComponent options={options} onChangeDebounce={onChangeDebounce} label="Test" />
    );

    fireEvent.click(screen.getByTestId('open'));
    fireEvent.click(screen.getByText('Via Roma 1'));

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(onChangeDebounce).not.toHaveBeenCalled();
  });

  it('calls onTextChange on every input change', () => {
    const onTextChange = jest.fn();
    render(<AutocompleteComponent options={[]} onTextChange={onTextChange} label="Test" />);

    fireEvent.click(screen.getByTestId('type-abcde'));
    expect(onTextChange).toHaveBeenCalledWith('abcde');
  });

  it('shows error message when inputError is true', () => {
    render(<AutocompleteComponent options={[]} inputError label="Campo" />);
    expect(screen.getByText('Campo obbligatorio')).toBeInTheDocument();
    expect(screen.getByTestId('input-error-icon')).toBeInTheDocument();
  });

  it('shows custom error message if errorText is provided', () => {
    render(
      <AutocompleteComponent options={[]} inputError errorText="Errore custom" label="Campo" />
    );
    expect(screen.getByText('Errore custom')).toBeInTheDocument();
  });

  it('calls onChange when an option is selected', () => {
    const onChange = jest.fn();
    const options = [{ Address: { Label: 'Via Roma 1' } }];

    render(<AutocompleteComponent options={options} onChange={onChange} label="Seleziona" />);

    fireEvent.click(screen.getByTestId('open'));
    fireEvent.click(screen.getByText('Via Roma 1'));

    expect(onChange).toHaveBeenCalledWith({ Address: { Label: 'Via Roma 1' } });
  });

  it('handles optional callbacks and empty option labels safely', () => {
    render(<AutocompleteComponent options={[]} required label="Seleziona" />);

    fireEvent.click(screen.getByTestId('select-undefined'));
    fireEvent.click(screen.getByTestId('compare-options'));
    fireEvent.click(screen.getByTestId('filter-options'));

    expect(screen.getByLabelText('Seleziona')).toBeInTheDocument();
  });
});
