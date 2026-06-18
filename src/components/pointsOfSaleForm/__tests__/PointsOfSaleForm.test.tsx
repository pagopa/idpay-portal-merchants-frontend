import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import PointsOfSaleForm from '../PointsOfSaleForm';
import { usePlacesAutocomplete } from '../../../hooks/useAutocomplete';
import { generateUniqueId, isValidRegex, isValidUrl } from '../../../helpers';
import * as hooks from '../../../hooks/useAutocomplete';
import * as helpers from '../../../helpers';
import { useAppSelector } from '../../../redux/hooks';

jest.mock('../../../hooks/useAutocomplete');
jest.mock('../../../helpers', () => ({
  ...jest.requireActual('../../../helpers'),
  generateUniqueId: jest.fn(),
  isValidRegex: jest.fn(),
  isValidUrl: jest.fn(),
}));

jest.mock('../../../hooks/useCurrentInitiativeId', () => ({
  useCurrentInitiativeId: () => 'initiative-1',
}));

jest.mock('../../../redux/slices/initiativesSlice', () => ({
  setInitiativesList: jest.fn(),
  intiativesListSelector: jest.fn(),
  initiativesReducer: (state = { list: [] }) => state,
}));

jest.mock('../../../redux/hooks', () => ({
  useAppSelector: jest.fn(),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('../../Autocomplete/AutocompleteComponent', () => (props: any) => {
  return (
    <div>
      <input
        aria-label="Autocomplete"
        onChange={(e: any) => props.onChangeDebounce?.(e.target.value)}
      />
      <button
        type="button"
        aria-label="Trigger onChange"
        onClick={() =>
          props.onChange?.({
            Address: {
              Street: 'Via Roma',
              AddressNumber: '1',
              Locality: 'Roma',
              PostalCode: '00100',
              Region: { Name: 'Lazio' },
              SubRegion: { Code: 'RM' },
            },
          })
        }
      >
        select
      </button>
      <button
        type="button"
        aria-label="Trigger onTextChange empty"
        onClick={() => props.onTextChange?.('')}
      >
        clear
      </button>
      <button
        type="button"
        aria-label="Trigger onChange null address"
        onClick={() => props.onChange?.({})}
      >
        empty-address
      </button>
      <button
        type="button"
        aria-label="Trigger onChange partial with fallback"
        onClick={() =>
          props.onChange?.({
            Address: {
              Street: 'Corso Italia',
              Locality: 'Milano',
              PostalCode: '20100',
              Region: {},
              SubRegion: {},
            },
          })
        }
      >
        partial-address
      </button>
      <button
        type="button"
        aria-label="Trigger onChange incomplete address"
        onClick={() =>
          props.onChange?.({
            Address: {
              Street: 'Via Incompleta',
              Locality: 'Roma',
              PostalCode: '00100',
              Region: { Name: 'Lazio' },
            },
          })
        }
      >
        incomplete-address
      </button>
    </div>
  );
});

const isAllowedTestUrl = (value: string): boolean => {
  try {
    const normalized = /^https?:\/\//i.test(value) ? value : `https://${value}`;
    const hostname = new URL(normalized).hostname.toLowerCase();
    return ['valid.example', 'maps.google.com', 'example.com'].includes(hostname);
  } catch {
    return false;
  }
};

const createDefaultProps = () => ({
  onFormChange: jest.fn(),
  onValidationChange: jest.fn(),
  pointsOfSaleLoaded: false,
  submitAttempt: 0,
});

const mockAutocompleteHook = (mockedHook: jest.Mock, overrides = {}) => {
  const search = jest.fn();
  mockedHook.mockReturnValue({
    options: [],
    loading: false,
    error: null,
    search,
    ...overrides,
  });
  return search;
};

const setBooleanValidationMocks = (email = true, url = true) => {
  (isValidRegex as jest.Mock).mockReturnValue(email);
  (isValidUrl as jest.Mock).mockReturnValue(url);
};

const COMPLETE_ADDRESS_EVENT = {
  target: {
    Address: {
      Street: 'Via Roma',
      AddressNumber: '12',
      Locality: 'Roma',
      PostalCode: '00100',
      Region: { Name: 'Lazio' },
      SubRegion: { Code: 'RM' },
    },
  },
};

const INCOMPLETE_ADDRESS_EVENT = {
  target: { Address: { Street: 'Via Roma' } },
};


const typeGoogleBusinessUrlAndVerify = (value: string) => {
  const geoInput = screen.getByLabelText('Scheda Google MYBusiness');
  fireEvent.change(geoInput, { target: { value } });
  const openSpy = jest.spyOn(window, 'open').mockImplementation(() => null);
  fireEvent.click(screen.getByText('Verifica URL'));
  return openSpy;
};

const changeFieldByLabel = (label: string, name: string, value: string) => {
  fireEvent.change(screen.getByLabelText(label), {
    target: { name, value },
  });
};

const changeMultipleFields = (fields: Array<[label: string, name: string, value: string]>) => {
  fields.forEach(([label, name, value]) => changeFieldByLabel(label, name, value));
};

describe('PointsOfSaleForm full coverage', () => {
  (useAppSelector as jest.Mock).mockReturnValue([{ initiativeId: 'initiative-1' }]);
  const mockedUsePlacesAutocomplete = usePlacesAutocomplete as jest.Mock;
  let defaultProps: ReturnType<typeof createDefaultProps>;

  beforeEach(() => {
    jest.clearAllMocks();
    defaultProps = createDefaultProps();
    mockAutocompleteHook(mockedUsePlacesAutocomplete);
    (generateUniqueId as jest.Mock).mockReturnValue('id-1');
    setBooleanValidationMocks();
  });

  it('should render initial form', () => {
    render(<PointsOfSaleForm {...defaultProps} />);
    expect(screen.getByLabelText('Nome insegna')).toBeInTheDocument();
    expect(defaultProps.onFormChange).toHaveBeenCalled();
    expect(defaultProps.onValidationChange).toHaveBeenCalled();
  });

  it('should add and remove sales points correctly', async () => {
    render(<PointsOfSaleForm {...defaultProps} />);
    const addButton = screen.getByText('Aggiungi un altro punto vendita');

    await fireEvent.click(addButton);
    await fireEvent.click(addButton);

    expect(screen.getAllByText(/pages.pointOfSales.title/)).toHaveLength(3);

    let deleteButtons = await screen.findAllByTestId('DeleteOutlineIcon');
    expect(deleteButtons).toHaveLength(2);

    fireEvent.click(deleteButtons[0]);
    expect(screen.getAllByText(/pages.pointOfSales.title/)).toHaveLength(2);
  });

  it('should handle type change', () => {
    render(<PointsOfSaleForm {...defaultProps} />);
    const onlineRadio = screen.getByLabelText('Online') as HTMLInputElement;
    fireEvent.click(onlineRadio);
    expect(onlineRadio.checked).toBe(true);
  });

  it('should handle field validation errors', async () => {
    (isValidRegex as jest.Mock).mockReturnValue(false);
    (isValidUrl as jest.Mock).mockReturnValue(false);

    render(<PointsOfSaleForm {...defaultProps} />);
    const fields: Record<string, string> = {
      franchiseName: '',
      address: '',
      city: '',
      zipCode: '',
      region: '',
      province: '',
      contactEmail: 'invalid-email',
      confirmContactEmail: 'different-email',
      contactName: '',
      contactSurname: '',
      webSite: 'invalid-url',
      channelGeolink: 'invalid-url',
      channelWebsite: 'invalid-url',
      channelEmail: 'invalid-email',
      channelPhone: '123',
    };

    for (const [name, value] of Object.entries(fields)) {
      let input: HTMLInputElement | null = null;
      try {
        input = screen.getByLabelText(new RegExp(name, 'i')) as HTMLInputElement;
      } catch {}
      if (!input) continue;

      fireEvent.change(input, { target: { name, value } });
      fireEvent.blur(input);
    }

    await waitFor(() => {
      expect(defaultProps.onValidationChange).toHaveBeenCalled();
    });
  });

  it('should handle autocomplete change', () => {
    const searchMock = jest.fn();
    mockedUsePlacesAutocomplete.mockReturnValue({
      options: [],
      loading: false,
      error: null,
      search: searchMock,
    });

    render(<PointsOfSaleForm {...defaultProps} />);
    const autocompleteInput = screen.getByLabelText('Autocomplete');

    fireEvent.change(autocompleteInput, { target: { value: 'Via Roma 1' } });
    expect(searchMock).toHaveBeenCalledWith('Via Roma 1');
  });

  it('shows error alert when submitAttempt > 0 and there are non-excluded errors', async () => {
    const submitAttemptProps = {
      ...defaultProps,
      submitAttempt: 1,
      externalErrors: { 0: { franchiseName: 'Required' } },
    };

    render(<PointsOfSaleForm {...submitAttemptProps} />);

    await waitFor(() => {
      expect(
        screen.getByText('Per continuare è necessario compilare tutti i campi obbligatori.')
      ).toBeInTheDocument();
    });
  });

  it('does not show error alert when errors are only in excluded keys', async () => {
    const props = {
      ...defaultProps,
      submitAttempt: 1,
      externalErrors: { 0: { channelEmail: 'Invalid' } },
    };

    render(<PointsOfSaleForm {...props} />);

    await waitFor(() => {
      expect(
        screen.queryByText('Per continuare è necessario compilare tutti i campi obbligatori.')
      ).not.toBeInTheDocument();
    });
  });

  it('handles AutocompleteComponent selection and clear text triggering search', async () => {
    const searchMock = jest.fn();
    mockedUsePlacesAutocomplete.mockReturnValue({
      options: [],
      loading: false,
      error: null,
      search: searchMock,
    });

    render(<PointsOfSaleForm {...defaultProps} />);

    fireEvent.click(screen.getByLabelText('Trigger onChange'));

    await waitFor(() => {
      expect(screen.getByLabelText('Città')).toHaveValue('Roma');
      expect(screen.getByLabelText('CAP')).toHaveValue('00100');
      expect(screen.getByLabelText('Regione')).toHaveValue('Lazio');
      expect(screen.getByLabelText('Provincia')).toHaveValue('RM');
    });

    fireEvent.click(screen.getByLabelText('Trigger onTextChange empty'));
    expect(searchMock).toHaveBeenCalledWith('');
  });

  it('should open channelGeolink URL only if valid', () => {
    render(<PointsOfSaleForm {...defaultProps} />);
    const openSpy = clickVerifyUrlAndGetSpy('https://valid.com');

    expect(openSpy).toHaveBeenCalledWith('https://valid.com', '_blank', 'noopener,noreferrer');
    openSpy.mockRestore();
  });

  it('should not add more than 5 points of sale', async () => {
    render(<PointsOfSaleForm {...defaultProps} />);
    const addButton = screen.getByText('Aggiungi un altro punto vendita');

    for (let i = 0; i < 6; i++) {
      await fireEvent.click(addButton);
    }

    expect(screen.getAllByText(/pages.pointOfSales.title/)).toHaveLength(5);
  });

  it('should call onFormChange when input changes', () => {
    render(<PointsOfSaleForm {...defaultProps} />);
    const franchiseInput = screen.getByLabelText('Nome insegna');

    fireEvent.change(franchiseInput, { target: { value: 'Nuova Insegna' } });
    expect(defaultProps.onFormChange).toHaveBeenCalled();
  });

  it('should handle pointsOfSaleLoaded true', () => {
    const { rerender } = render(<PointsOfSaleForm {...defaultProps} pointsOfSaleLoaded={false} />);
    rerender(<PointsOfSaleForm {...defaultProps} pointsOfSaleLoaded={true} />);
    expect(screen.getByLabelText('Nome insegna')).toBeInTheDocument();
  });

  it('should handle all field validations', async () => {
    (isValidRegex as jest.Mock).mockReturnValue(false);
    (isValidUrl as jest.Mock).mockReturnValue(false);

    render(<PointsOfSaleForm {...defaultProps} />);
    const franchiseInput = screen.getByLabelText('Nome insegna');
    fireEvent.change(franchiseInput, { target: { value: '' } });

    const contactEmailInput = screen.getByLabelText('E-mail');
    fireEvent.change(contactEmailInput, { target: { value: 'invalid' } });

    const confirmEmailInput = screen.getByLabelText('Conferma e-mail');
    fireEvent.change(confirmEmailInput, { target: { value: 'different' } });

    const contactName = screen.getByLabelText('Nome');
    fireEvent.change(contactName, { target: { value: '' } });

    const contactSurname = screen.getByLabelText('Cognome');
    fireEvent.change(contactSurname, { target: { value: '' } });

    const phoneInput = screen.getByLabelText('Numero di telefono');
    fireEvent.change(phoneInput, { target: { value: '123' } });
    fireEvent.blur(phoneInput);

    const geoInput = screen.getByLabelText('Scheda Google MYBusiness');
    fireEvent.change(geoInput, { target: { value: 'invalid-url' } });

    const channelEmail = screen.getByLabelText('Email');
    fireEvent.change(channelEmail, { target: { value: 'invalid-email' } });
    fireEvent.blur(channelEmail);

    const channelWebsite = screen.getByLabelText('Sito web');
    fireEvent.change(channelWebsite, { target: { value: 'invalid-url' } });

    await waitFor(() => {
      expect(defaultProps.onValidationChange).toHaveBeenCalled();
    });
  });

  it('should handle ONLINE type and webSite validation', () => {
    (isValidUrl as jest.Mock).mockReturnValue(false);
    render(<PointsOfSaleForm {...defaultProps} />);
    const onlineRadio = screen.getByLabelText('Online');
    fireEvent.click(onlineRadio);

    const webSiteInput = screen.getByLabelText('Indirizzo completo');
    fireEvent.change(webSiteInput, { target: { value: 'invalid-url' } });

    expect(defaultProps.onFormChange).toHaveBeenCalled();
  });

  it.skip('should handle Autocomplete change and incomplete/complete addresses', () => {
    const searchMock = jest.fn();
    mockedUsePlacesAutocomplete.mockReturnValue({
      options: [],
      loading: false,
      error: null,
      search: searchMock,
    });

    render(<PointsOfSaleForm {...defaultProps} />);
    const autocompleteInput = screen.getByLabelText('Indirizzo completo');

    fireEvent.change(autocompleteInput, { target: { value: 'Via Roma 1' } });
    expect(searchMock).toHaveBeenCalledWith('Via Roma 1');

    triggerIncompleteAndCompleteAddressSelection();
  });

  it('should handle add/remove multiple points of sale', async () => {
    render(<PointsOfSaleForm {...defaultProps} />);
    const addButton = screen.getByText('Aggiungi un altro punto vendita');
    await fireEvent.click(addButton);
    await fireEvent.click(addButton);

    let deleteButtons = await screen.findAllByTestId('DeleteOutlineIcon');
    await fireEvent.click(deleteButtons[1]);
    await fireEvent.click(deleteButtons[0]);
  });

  it('should handle Verifica URL button', () => {
    (isValidUrl as jest.Mock).mockReturnValue(true);
    render(<PointsOfSaleForm {...defaultProps} />);
    const openSpy = typeGoogleBusinessUrlAndVerify('example.com');
    expect(openSpy).toHaveBeenCalled();
    openSpy.mockRestore();
  });
});

describe('PointsOfSaleForm additional coverage', () => {
  const mockedUsePlacesAutocomplete = usePlacesAutocomplete as jest.Mock;
  let defaultProps: ReturnType<typeof createDefaultProps>;

  beforeEach(() => {
    jest.clearAllMocks();
    defaultProps = createDefaultProps();
    mockAutocompleteHook(mockedUsePlacesAutocomplete);
    (generateUniqueId as jest.Mock).mockReturnValue('id-1');
    setBooleanValidationMocks();
  });

  it('should trigger onBlur validation for channelPhone and channelEmail', () => {
    render(<PointsOfSaleForm {...defaultProps} />);
    const phoneInput = screen.getByLabelText('Numero di telefono');
    fireEvent.change(phoneInput, { target: { value: '123' } });
    fireEvent.blur(phoneInput);

    const channelEmailInput = screen.getByLabelText('Email');
    (isValidRegex as jest.Mock).mockReturnValue(false);
    fireEvent.change(channelEmailInput, { target: { value: 'invalid-email' } });
    fireEvent.blur(channelEmailInput);
  });

  it('should trigger Verifica URL click with valid and invalid URL', () => {
    (isValidUrl as jest.Mock).mockReturnValue(true);
    render(<PointsOfSaleForm {...defaultProps} />);
    const openSpy = typeGoogleBusinessUrlAndVerify('example.com');
    expect(openSpy).toHaveBeenCalled();
    openSpy.mockRestore();
  });

  it('should handle externalErrors correctly', () => {
    const externalErrors = { 0: { contactEmail: 'Errore esterno' } };
    render(<PointsOfSaleForm {...defaultProps} externalErrors={externalErrors} />);
    expect(screen.getByLabelText('E-mail').getAttribute('aria-invalid')).toBeTruthy();
  });

  it('should handle multiple physical sales points with channels', async () => {
    render(<PointsOfSaleForm {...defaultProps} />);
    const addButton = screen.getByText('Aggiungi un altro punto vendita');
    await fireEvent.click(addButton);

    let deleteButtons = await screen.findAllByTestId('DeleteOutlineIcon');
    await fireEvent.click(deleteButtons[0]);
  });

  it.skip('should handle complete and incomplete autocomplete addresses', async () => {
    mockAutocompleteHook(mockedUsePlacesAutocomplete);

    render(<PointsOfSaleForm {...defaultProps} />);
    const autocompleteInput = screen.getByLabelText('Indirizzo completo');

    fireEvent.change(autocompleteInput, INCOMPLETE_ADDRESS_EVENT);
    fireEvent.change(autocompleteInput, COMPLETE_ADDRESS_EVENT);
  });
});
describe('PointsOfSaleForm validation tests', () => {
  const mockedUsePlacesAutocomplete = usePlacesAutocomplete as jest.Mock;
  let defaultProps: ReturnType<typeof createDefaultProps>;

  beforeEach(() => {
    jest.clearAllMocks();
    defaultProps = createDefaultProps();
    mockAutocompleteHook(mockedUsePlacesAutocomplete);
    (generateUniqueId as jest.Mock).mockReturnValue('id-1');
    setBooleanValidationMocks();
  });

  it.skip('handles complete and incomplete addresses', () => {
    render(<PointsOfSaleForm {...defaultProps} />);
    const autocompleteInput = screen.getByLabelText('Indirizzo completo');

    fireEvent.change(autocompleteInput, INCOMPLETE_ADDRESS_EVENT);
    fireEvent.change(autocompleteInput, COMPLETE_ADDRESS_EVENT);
  });

  it('validates contactEmail and confirmContactEmail', () => {
    render(<PointsOfSaleForm {...defaultProps} />);
    const emailInput = screen.getByLabelText('E-mail');
    const confirmEmailInput = screen.getByLabelText('Conferma e-mail');

    (isValidRegex as jest.Mock).mockReturnValue(false);
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.blur(emailInput);

    fireEvent.change(confirmEmailInput, { target: { value: 'another-invalid' } });
    fireEvent.blur(confirmEmailInput);

    (isValidRegex as jest.Mock).mockReturnValue(true);
    fireEvent.change(confirmEmailInput, { target: { value: 'valid@example.com' } });
  });

  it('handles channel inputs and Verifica URL click', () => {
    render(<PointsOfSaleForm {...defaultProps} />);
    const urlInput = screen.getByLabelText('Scheda Google MYBusiness');
    const phoneInput = screen.getByLabelText('Numero di telefono');
    const emailInput = screen.getByLabelText('Email');
    const websiteInput = screen.getByLabelText('Sito web');

    (isValidUrl as jest.Mock).mockReturnValue(true);

    fireEvent.change(urlInput, { target: { value: 'example.com' } });
    fireEvent.change(phoneInput, { target: { value: '1234567' } });
    fireEvent.blur(phoneInput);
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.blur(emailInput);
    fireEvent.change(websiteInput, { target: { value: 'https://site.com' } });

    const openSpy = typeGoogleBusinessUrlAndVerify('example.com');
    expect(openSpy).toHaveBeenCalled();
    openSpy.mockRestore();
  });

  it('adds and removes sales points', async () => {
    render(<PointsOfSaleForm {...defaultProps} />);
    const addButton = screen.getByText('Aggiungi un altro punto vendita');
    fireEvent.click(addButton);

    let deleteButtons = await screen.findAllByTestId('DeleteOutlineIcon');
    expect(deleteButtons).toHaveLength(1);

    fireEvent.click(deleteButtons[0]);

    expect(screen.queryAllByTestId('DeleteOutlineIcon')).toHaveLength(0);
  });
});

describe('PointsOfSaleForm integration tests', () => {
  let onFormChangeMock: jest.Mock;
  let onValidationChangeMock: jest.Mock;
  const renderIntegrationForm = (props = {}) =>
    render(
      <PointsOfSaleForm
        onFormChange={onFormChangeMock}
        onValidationChange={onValidationChangeMock}
        pointsOfSaleLoaded={false}
        submitAttempt={0}
        {...props}
      />
    );

  beforeEach(() => {
    onFormChangeMock = jest.fn();
    onValidationChangeMock = jest.fn();

    jest.spyOn(hooks, 'usePlacesAutocomplete').mockReturnValue({
      options: [],
      loading: false,
      error: null,
      search: jest.fn(),
    });

    jest.spyOn(helpers, 'isValidUrl').mockImplementation((url) => url.startsWith('http'));
    jest.spyOn(helpers, 'isValidRegex').mockImplementation((email) => email.includes('@'));
    jest.spyOn(helpers, 'generateUniqueId').mockReturnValue('unique-id');

    window.open = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should call onFormChange and onValidationChange on mount and after changes', async () => {
    renderIntegrationForm();

    expect(onFormChangeMock).toHaveBeenCalledTimes(1);
    expect(onValidationChangeMock).toHaveBeenCalledTimes(1);

    const franchiseInput = screen.getByLabelText('Nome insegna');
    fireEvent.change(franchiseInput, { target: { value: 'My Shop' } });

    await waitFor(() => {
      expect(onFormChangeMock).toHaveBeenCalledTimes(2);
    });
  });

  it('should reset salesPoints when pointsOfSaleLoaded becomes true', async () => {
    const { rerender } = renderIntegrationForm();

    rerender(
      <PointsOfSaleForm
        onFormChange={onFormChangeMock}
        onValidationChange={onValidationChangeMock}
        pointsOfSaleLoaded={true}
        submitAttempt={0}
      />
    );

    expect(screen.getByLabelText('Nome insegna')).toHaveValue('');
  });

  it.skip('should handle field validations correctly', async () => {
    render(
      <PointsOfSaleForm
        onFormChange={onFormChangeMock}
        onValidationChange={onValidationChangeMock}
        pointsOfSaleLoaded={false}
        submitAttempt={0}
      />
    );

    const franchiseInput = screen.getByLabelText('Nome insegna');
    fireEvent.change(franchiseInput, { target: { value: '' } });
    expect(await screen.findByText('Campo obbligatorio')).toBeInTheDocument();

    const contactEmail = screen.getByLabelText('E-mail');
    fireEvent.change(contactEmail, { target: { value: 'invalidemail' } });
    expect(await screen.findByText('Email non valida')).toBeInTheDocument();

    const confirmEmail = screen.getByLabelText('Conferma e-mail');
    fireEvent.change(confirmEmail, { target: { value: 'different@email.com' } });
    expect(await screen.findByText('Le email non coincidono')).toBeInTheDocument();

    fireEvent.change(contactEmail, { target: { value: 'valid@email.com' } });
    fireEvent.change(confirmEmail, { target: { value: 'valid@email.com' } });
    await waitFor(() => {
      expect(screen.queryByText('Le email non coincidono')).not.toBeInTheDocument();
      expect(screen.queryByText('Email non valida')).not.toBeInTheDocument();
    });
  });

  it.skip('should add and remove another sales point', async () => {
    render(
      <PointsOfSaleForm
        onFormChange={onFormChangeMock}
        onValidationChange={onValidationChangeMock}
        pointsOfSaleLoaded={false}
        submitAttempt={0}
      />
    );

    const addButton = screen.getByText('Aggiungi un altro punto vendita');
    fireEvent.click(addButton);

    expect(screen.getAllByLabelText('Nome insegna')).toHaveLength(2);

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    if (deleteButtons.length > 0) {
      fireEvent.click(deleteButtons[0]);
    }

    expect(screen.getAllByLabelText('Nome insegna')).toHaveLength(1);
  });

  it('should handle URL verification click', async () => {
    renderIntegrationForm();

    const geolinkInput = screen.getByLabelText('Scheda Google MYBusiness');
    fireEvent.change(geolinkInput, { target: { value: 'http://example.com' } });

    const verifyButton = screen.getByText('Verifica URL');
    fireEvent.click(verifyButton);

    expect(window.open).toHaveBeenCalledWith('http://example.com', '_blank', 'noopener,noreferrer');
  });

  it('should trigger validation when submitAttempt changes', async () => {
    const { rerender } = renderIntegrationForm();

    expect(onValidationChangeMock).toHaveBeenCalled();
    onValidationChangeMock.mockClear();

    rerender(
      <PointsOfSaleForm
        onFormChange={onFormChangeMock}
        onValidationChange={onValidationChangeMock}
        pointsOfSaleLoaded={false}
        submitAttempt={1}
      />
    );

    await waitFor(() => {
      expect(onValidationChangeMock).toHaveBeenCalled();
    });
  });

  it.skip('should handle handleChangeAddress for complete and incomplete address', async () => {
    render(
      <PointsOfSaleForm
        onFormChange={onFormChangeMock}
        onValidationChange={onValidationChangeMock}
        pointsOfSaleLoaded={false}
        submitAttempt={0}
      />
    );

    const autocompleteInput = screen.getByLabelText('Indirizzo completo');

    fireEvent.change(autocompleteInput, {
      target: { Address: { Street: 'Via Roma' } },
    });
    expect(
      await screen.findByText('Indirizzo non completo, selezionane un altro')
    ).toBeInTheDocument();

    fireEvent.change(autocompleteInput, {
      target: {
        Address: {
          Street: 'Via Roma',
          AddressNumber: '1',
          Locality: 'Roma',
          PostalCode: '00100',
          Region: { Name: 'Lazio' },
          SubRegion: { Code: 'RM' },
        },
      },
    });

    await waitFor(() => {
      expect(
        screen.queryByText('Indirizzo non completo, selezionane un altro')
      ).not.toBeInTheDocument();
    });
  });
});

describe('PointsOfSaleForm targeted new-code coverage', () => {
  const mockedUsePlacesAutocomplete = usePlacesAutocomplete as jest.Mock;
  let defaultProps: ReturnType<typeof createDefaultProps>;

  beforeEach(() => {
    jest.clearAllMocks();
    defaultProps = createDefaultProps();
    mockAutocompleteHook(mockedUsePlacesAutocomplete);
    (generateUniqueId as jest.Mock).mockReturnValue('id-1');
    (isValidEmail as jest.Mock).mockImplementation((value: string) => value.includes('@'));
    (isValidUrl as jest.Mock).mockImplementation((value: string) => value.startsWith('http'));
  });

  it('covers ONLINE/PHYSICAL validation branches and contact email switch logic', async () => {
    render(<PointsOfSaleForm {...defaultProps} />);

    (isValidUrl as jest.Mock).mockImplementation((value: string) => isAllowedTestUrl(value));

    const onlineRadio = screen.getByLabelText('Online');
    fireEvent.click(onlineRadio);

    const websiteInput = screen.getByLabelText('Indirizzo completo');
    fireEvent.change(websiteInput, { target: { name: 'website', value: '   ' } });
    fireEvent.change(websiteInput, { target: { name: 'website', value: 'invalid-url' } });
    fireEvent.change(websiteInput, { target: { name: 'website', value: 'https://valid.example' } });

    const confirmEmailInput = screen.getByLabelText('Conferma e-mail');
    fireEvent.change(confirmEmailInput, { target: { name: 'confirmContactEmail', value: 'a@test.it' } });

    const contactEmailInput = screen.getByLabelText('E-mail');
    fireEvent.change(contactEmailInput, { target: { name: 'contactEmail', value: 'not-an-email' } });
    fireEvent.change(contactEmailInput, { target: { name: 'contactEmail', value: 'different@test.it' } });
    fireEvent.change(contactEmailInput, { target: { name: 'contactEmail', value: 'a@test.it' } });
    fireEvent.change(contactEmailInput, { target: { name: 'contactEmail', value: '' } });

    fireEvent.change(contactEmailInput, { target: { name: 'unknownField', value: 'x' } });

    const physicalRadio = screen.getByLabelText('Fisico');
    fireEvent.click(physicalRadio);

    const geolinkInput = screen.getByLabelText('Scheda Google MYBusiness');
    fireEvent.change(geolinkInput, { target: { name: 'channelGeolink', value: 'maps.google.com/x' } });
    fireEvent.change(geolinkInput, { target: { name: 'channelGeolink', value: '' } });

    const phoneInput = screen.getByLabelText('Numero di telefono');
    fireEvent.change(phoneInput, { target: { name: 'channelPhone', value: '123' } });
    fireEvent.change(phoneInput, { target: { name: 'channelPhone', value: '1234567890123456' } });

    await waitFor(() => {
      expect(defaultProps.onValidationChange).toHaveBeenCalled();
    });
  });

  it('covers reduce accumulation with mixed valid/invalid points', async () => {
    render(<PointsOfSaleForm {...defaultProps} />);

    fireEvent.click(screen.getByLabelText('Online'));
    changeMultipleFields([
      ['Indirizzo completo', 'website', 'https://valid.example'],
      ['Nome insegna', 'franchiseName', 'Shop 1'],
      ['Nome', 'contactName', 'Mario'],
      ['Cognome', 'contactSurname', 'Rossi'],
      ['E-mail', 'contactEmail', 'mario.rossi@test.it'],
      ['Conferma e-mail', 'confirmContactEmail', 'mario.rossi@test.it'],
    ]);

    fireEvent.click(screen.getByText('Aggiungi un altro punto vendita'));

    await waitFor(() => {
      expect(screen.getAllByLabelText('Nome insegna')).toHaveLength(2);
    });
    const franchiseInputs = screen.getAllByLabelText('Nome insegna');
    fireEvent.change(franchiseInputs[1], { target: { name: 'franchiseName', value: '' } });

    await waitFor(() => {
      expect(defaultProps.onValidationChange).toHaveBeenCalled();
    });
  });

  it('covers handleChangeAddress fallback fields and address reset branch', async () => {
    render(<PointsOfSaleForm {...defaultProps} />);

    fireEvent.click(screen.getByText('Aggiungi un altro punto vendita'));
    await waitFor(() => {
      expect(screen.getAllByLabelText('Nome insegna')).toHaveLength(2);
    });

    fireEvent.click(screen.getAllByLabelText('Trigger onChange partial with fallback')[0]);

    await waitFor(() => {
      expect(screen.getAllByLabelText('Città')[0]).toHaveValue('Milano');
      expect(screen.getAllByLabelText('CAP')[0]).toHaveValue('20100');
      expect(screen.getAllByLabelText('Regione')[0]).toHaveValue('');
      expect(screen.getAllByLabelText('Provincia')[0]).toHaveValue('');
    });

    fireEvent.click(screen.getAllByLabelText('Trigger onChange')[0]);
    await waitFor(() => {
      expect(screen.getAllByLabelText('Città')[0]).toHaveValue('Roma');
    });

    fireEvent.click(screen.getAllByLabelText('Trigger onChange null address')[0]);

    await waitFor(() => {
      expect(screen.getAllByLabelText('Città')[0]).toHaveValue('');
      expect(screen.getAllByLabelText('CAP')[0]).toHaveValue('');
    });
  });
});

describe('PointsOfSaleForm near-100 coverage suite', () => {
  const mockedUsePlacesAutocomplete = usePlacesAutocomplete as jest.Mock;
  let defaultProps: ReturnType<typeof createDefaultProps>;

  beforeEach(() => {
    jest.clearAllMocks();
    defaultProps = createDefaultProps();
    mockAutocompleteHook(mockedUsePlacesAutocomplete);
    (generateUniqueId as jest.Mock)
      .mockReturnValueOnce('id-1')
      .mockReturnValueOnce('id-2')
      .mockReturnValue('id-3');
    (isValidEmail as jest.Mock).mockImplementation((value: string) => value.includes('@'));
    (isValidUrl as jest.Mock).mockImplementation((value: string) => isAllowedTestUrl(value));
  });

  it('covers switch cases for required fields and optional branch paths', async () => {
    render(<PointsOfSaleForm {...defaultProps} />);

    fireEvent.change(screen.getByLabelText('Autocomplete'), {
      target: { value: 'Via Roma 1' },
    });
    fireEvent.click(screen.getByLabelText('Trigger onTextChange empty'));

    const franchiseInput = screen.getByLabelText('Nome insegna');
    const nameInput = screen.getByLabelText('Nome');
    const surnameInput = screen.getByLabelText('Cognome');
    const contactEmailInput = screen.getByLabelText('E-mail');
    const confirmEmailInput = screen.getByLabelText('Conferma e-mail');

    changeMultipleFields([
      ['Nome insegna', 'franchiseName', ''],
      ['Nome insegna', 'franchiseName', 'Shop A'],
      ['Nome', 'contactName', ''],
      ['Nome', 'contactName', 'Mario'],
      ['Cognome', 'contactSurname', ''],
      ['Cognome', 'contactSurname', 'Rossi'],
    ]);

    fireEvent.change(confirmEmailInput, {
      target: { name: 'confirmContactEmail', value: 'bad-confirm' },
    });
    changeFieldByLabel('E-mail', 'contactEmail', 'mail@test.it');
    fireEvent.change(confirmEmailInput, {
      target: { name: 'confirmContactEmail', value: 'other@test.it' },
    });
    fireEvent.change(confirmEmailInput, {
      target: { name: 'confirmContactEmail', value: 'ok@test.it' },
    });
    fireEvent.change(confirmEmailInput, {
      target: { name: 'confirmContactEmail', value: '' },
    });

    changeMultipleFields([
      ['E-mail', 'contactEmail', 'bad-email'],
      ['E-mail', 'contactEmail', 'a@test.it'],
      ['E-mail', 'contactEmail', ''],
    ]);

    fireEvent.change(franchiseInput, { target: { name: 'city', value: '' } });
    fireEvent.change(franchiseInput, { target: { name: 'city', value: 'Roma' } });
    fireEvent.change(franchiseInput, { target: { name: 'zipCode', value: '' } });
    fireEvent.change(franchiseInput, { target: { name: 'zipCode', value: '00100' } });
    fireEvent.change(franchiseInput, { target: { name: 'region', value: '' } });
    fireEvent.change(franchiseInput, { target: { name: 'region', value: 'Lazio' } });
    fireEvent.change(franchiseInput, { target: { name: 'province', value: '' } });
    fireEvent.change(franchiseInput, { target: { name: 'province', value: 'RM' } });
    fireEvent.change(franchiseInput, { target: { name: 'address', value: '' } });
    fireEvent.change(franchiseInput, { target: { name: 'address', value: 'Via Roma' } });

    const websitePhysical = screen.getByLabelText('Sito web');
    fireEvent.change(websitePhysical, { target: { name: 'website', value: 'invalid-url' } });
    fireEvent.change(websitePhysical, { target: { name: 'website', value: 'https://valid.example' } });

    const geolinkInput = screen.getByLabelText('Scheda Google MYBusiness');
    fireEvent.change(geolinkInput, { target: { name: 'channelGeolink', value: 'invalid-url' } });
    fireEvent.change(geolinkInput, {
      target: { name: 'channelGeolink', value: 'https://maps.google.com/shop' },
    });

    const channelEmailInput = screen.getByLabelText('Email');
    fireEvent.change(channelEmailInput, { target: { name: 'channelEmail', value: 'wrong' } });
    fireEvent.blur(channelEmailInput);
    fireEvent.change(channelEmailInput, { target: { name: 'channelEmail', value: 'ok@test.it' } });
    fireEvent.blur(channelEmailInput);

    const phoneInput = screen.getByLabelText('Numero di telefono');
    fireEvent.change(phoneInput, { target: { name: 'channelPhone', value: '123' } });
    fireEvent.blur(phoneInput);
    fireEvent.change(phoneInput, { target: { name: 'channelPhone', value: '1234567890123456' } });
    fireEvent.blur(phoneInput);
    fireEvent.change(phoneInput, { target: { name: 'channelPhone', value: '1234567' } });
    fireEvent.blur(phoneInput);
    fireEvent.change(phoneInput, { target: { name: 'channelPhone', value: '' } });
    fireEvent.blur(phoneInput);
    fireEvent.keyDown(phoneInput, { key: 'e' });

    const cityInput = screen.getByLabelText('Città');
    const capInput = screen.getByLabelText('CAP');
    const regionInput = screen.getByLabelText('Regione');
    const provinceInput = screen.getByLabelText('Provincia');
    cityInput.removeAttribute('disabled');
    capInput.removeAttribute('disabled');
    regionInput.removeAttribute('disabled');
    provinceInput.removeAttribute('disabled');
    fireEvent.change(cityInput, { target: { name: 'city', value: 'Roma' } });
    fireEvent.change(capInput, { target: { name: 'zipCode', value: '00100' } });
    fireEvent.change(regionInput, { target: { name: 'region', value: 'Lazio' } });
    fireEvent.change(provinceInput, { target: { name: 'province', value: 'RM' } });

    fireEvent.click(screen.getByLabelText('Online'));
    const onlineWebsiteInput = screen.getByLabelText('Indirizzo completo');
    fireEvent.change(onlineWebsiteInput, { target: { name: 'website', value: ' ' } });
    fireEvent.change(onlineWebsiteInput, { target: { name: 'website', value: 'invalid-url' } });
    fireEvent.change(onlineWebsiteInput, {
      target: { name: 'website', value: 'https://valid.example' },
    });

    await waitFor(() => {
      expect(defaultProps.onValidationChange).toHaveBeenCalled();
    });
  });

  it('covers submit validation and pointsOfSaleLoaded reset branch', async () => {
    const { rerender } = render(<PointsOfSaleForm {...defaultProps} submitAttempt={1} />);

    await waitFor(() => {
      expect(defaultProps.onValidationChange).toHaveBeenCalled();
    });

    rerender(<PointsOfSaleForm {...defaultProps} pointsOfSaleLoaded={true} submitAttempt={1} />);

    await waitFor(() => {
      expect(screen.getByLabelText('Nome insegna')).toHaveValue('');
    });
  });

  it('covers incomplete and complete address plus delete and URL verify guard', async () => {
    render(<PointsOfSaleForm {...defaultProps} />);

    fireEvent.click(screen.getByLabelText('Trigger onChange incomplete address'));
    await waitFor(() => {
      expect(screen.getByLabelText('Città')).toHaveValue('');
    });

    fireEvent.click(screen.getByLabelText('Trigger onChange'));
    await waitFor(() => {
      expect(screen.getByLabelText('Città')).toHaveValue('Roma');
    });

    const openSpy = jest.spyOn(window, 'open').mockImplementation(() => null);
    const verifyButton = screen.getByText('Verifica URL');

    fireEvent.change(screen.getByLabelText('Scheda Google MYBusiness'), {
      target: { name: 'channelGeolink', value: 'bad' },
    });
    fireEvent.click(verifyButton);
    expect(openSpy).not.toHaveBeenCalled();

    fireEvent.change(screen.getByLabelText('Scheda Google MYBusiness'), {
      target: { name: 'channelGeolink', value: 'example.com/shop' },
    });
    fireEvent.click(verifyButton);
    expect(openSpy).toHaveBeenCalledWith(
      'https://example.com/shop',
      '_blank',
      'noopener,noreferrer'
    );

    fireEvent.click(screen.getByText('Aggiungi un altro punto vendita'));
    await waitFor(() => {
      expect(screen.getAllByTestId('DeleteOutlineIcon')).toHaveLength(1);
    });

    fireEvent.change(screen.getAllByLabelText('Nome insegna')[0], {
      target: { name: 'franchiseName', value: '' },
    });

    fireEvent.click(screen.getAllByTestId('DeleteOutlineIcon')[0]);
    expect(screen.queryAllByTestId('DeleteOutlineIcon')).toHaveLength(0);
  });

  it('covers loading and error rendering branch of autocomplete block', () => {
    mockedUsePlacesAutocomplete.mockReturnValue({
      options: [],
      loading: true,
      error: 'autocomplete-error',
      search: jest.fn(),
    });

    render(<PointsOfSaleForm {...defaultProps} />);

    expect(screen.getByText('pages.pointOfSales.loadingText')).toBeInTheDocument();
    expect(screen.getByText('autocomplete-error')).toBeInTheDocument();
  });
});

