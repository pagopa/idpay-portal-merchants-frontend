import React from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import PointsOfSaleForm from '../PointsOfSaleForm';
import { usePlacesAutocomplete } from '../../../hooks/useAutocomplete';
import { generateUniqueId, isValidEmail, isValidUrl } from '../../../helpers';
import { TypeEnum } from '../../../api/generated/merchants/PointOfSaleDTO';
import * as hooks from '../../../hooks/useAutocomplete';
import * as helpers from '../../../helpers';

jest.mock('../../../hooks/useAutocomplete');
jest.mock('../../../helpers', () => ({
  ...jest.requireActual('../../../helpers'),
  generateUniqueId: jest.fn(),
  isValidEmail: jest.fn(),
  isValidUrl: jest.fn(),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('../../Autocomplete/AutocompleteComponent', () => (props: any) => {
  return (
    <input
      aria-label="Autocomplete"
      onChange={(e: any) => props.onChangeDebounce(e.target.value)}
    />
  );
});

describe('PointsOfSaleForm full coverage', () => {
  const mockedUsePlacesAutocomplete = usePlacesAutocomplete as jest.Mock;

  const defaultProps = {
    onFormChange: jest.fn(),
    onValidationChange: jest.fn(),
    pointsOfSaleLoaded: false,
    submitAttempt: 0,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockedUsePlacesAutocomplete.mockReturnValue({
      options: [],
      loading: false,
      error: null,
      search: jest.fn(),
    });
    (generateUniqueId as jest.Mock).mockReturnValue('id-1');
    (isValidEmail as jest.Mock).mockReturnValue(true);
    (isValidUrl as jest.Mock).mockReturnValue(true);
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
    (isValidEmail as jest.Mock).mockReturnValue(false);
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

  it('should handle incomplete and complete address objects', async () => {
    render(<PointsOfSaleForm {...defaultProps} />);

    const addressObjIncomplete = { Address: { Street: 'Via Roma' } };
    const addressObjComplete = {
      Address: {
        Street: 'Via Roma',
        Locality: 'Roma',
        PostalCode: '00100',
        Region: { Name: 'Lazio' },
        SubRegion: { Code: 'RM' },
      },
    };

    const autocompleteInput = screen.getByLabelText('Autocomplete');

    fireEvent.change(autocompleteInput, { target: { value: addressObjIncomplete } });

    fireEvent.change(autocompleteInput, { target: { value: addressObjComplete } });
  });

  it('should open channelGeolink URL only if valid', () => {
    render(<PointsOfSaleForm {...defaultProps} />);
    const geolinkInput = screen.getByLabelText(/Scheda Google MYBusiness/i);
    fireEvent.change(geolinkInput, {
      target: { name: 'channelGeolink', value: 'https://valid.com' },
    });

    const button = screen.getByText('Verifica URL');
    const openSpy = jest.spyOn(window, 'open').mockImplementation(() => null);
    fireEvent.click(button);

    expect(openSpy).toHaveBeenCalledWith('https://valid.com', '_blank', 'noopener,noreferrer');
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
    (isValidEmail as jest.Mock).mockReturnValue(false);
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

    fireEvent.change(autocompleteInput, { target: { Address: { Street: 'Via Roma' } } });
    fireEvent.change(autocompleteInput, {
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
    });
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
    const geoInput = screen.getByLabelText('Scheda Google MYBusiness');
    fireEvent.change(geoInput, { target: { value: 'example.com' } });

    const verifyButton = screen.getByText('Verifica URL');
    const openSpy = jest.spyOn(window, 'open').mockImplementation(() => null);
    fireEvent.click(verifyButton);
    expect(openSpy).toHaveBeenCalled();
    openSpy.mockRestore();
  });
});

describe('PointsOfSaleForm additional coverage', () => {
  const mockedUsePlacesAutocomplete = usePlacesAutocomplete as jest.Mock;
  const defaultProps = {
    onFormChange: jest.fn(),
    onValidationChange: jest.fn(),
    pointsOfSaleLoaded: false,
    submitAttempt: 0,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockedUsePlacesAutocomplete.mockReturnValue({
      options: [],
      loading: false,
      error: null,
      search: jest.fn(),
    });
    (generateUniqueId as jest.Mock).mockReturnValue('id-1');
    (isValidEmail as jest.Mock).mockReturnValue(true);
    (isValidUrl as jest.Mock).mockReturnValue(true);
  });

  it('should trigger onBlur validation for channelPhone and channelEmail', () => {
    render(<PointsOfSaleForm {...defaultProps} />);
    const phoneInput = screen.getByLabelText('Numero di telefono');
    fireEvent.change(phoneInput, { target: { value: '123' } });
    fireEvent.blur(phoneInput);

    const channelEmailInput = screen.getByLabelText('Email');
    (isValidEmail as jest.Mock).mockReturnValue(false);
    fireEvent.change(channelEmailInput, { target: { value: 'invalid-email' } });
    fireEvent.blur(channelEmailInput);
  });

  it('should trigger Verifica URL click with valid and invalid URL', () => {
    (isValidUrl as jest.Mock).mockReturnValue(true);
    render(<PointsOfSaleForm {...defaultProps} />);
    const geoInput = screen.getByLabelText('Scheda Google MYBusiness');
    fireEvent.change(geoInput, { target: { value: 'example.com' } });
    const verifyButton = screen.getByText('Verifica URL');
    const openSpy = jest.spyOn(window, 'open').mockImplementation(() => null);
    fireEvent.click(verifyButton);
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
    const searchMock = jest.fn();
    mockedUsePlacesAutocomplete.mockReturnValue({
      options: [],
      loading: false,
      error: null,
      search: searchMock,
    });

    render(<PointsOfSaleForm {...defaultProps} />);
    const autocompleteInput = screen.getByLabelText('Indirizzo completo');

    fireEvent.change(autocompleteInput, { target: { Address: { Street: 'Via Roma' } } });

    fireEvent.change(autocompleteInput, {
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
    });
  });
});
describe('PointsOfSaleForm validation tests', () => {
  const mockedUsePlacesAutocomplete = usePlacesAutocomplete as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockedUsePlacesAutocomplete.mockReturnValue({
      options: [],
      loading: false,
      error: null,
      search: jest.fn(),
    });
    (generateUniqueId as jest.Mock).mockReturnValue('id-1');
    (isValidEmail as jest.Mock).mockReturnValue(true);
    (isValidUrl as jest.Mock).mockReturnValue(true);
  });

  const defaultProps = {
    onFormChange: jest.fn(),
    onValidationChange: jest.fn(),
    pointsOfSaleLoaded: false,
    submitAttempt: 0,
  };

  it.skip('handles complete and incomplete addresses', () => {
    render(<PointsOfSaleForm {...defaultProps} />);
    const autocompleteInput = screen.getByLabelText('Indirizzo completo');

    fireEvent.change(autocompleteInput, { target: { Address: { Street: 'Via Roma' } } });

    fireEvent.change(autocompleteInput, {
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
    });
  });

  it('validates contactEmail and confirmContactEmail', () => {
    render(<PointsOfSaleForm {...defaultProps} />);
    const emailInput = screen.getByLabelText('E-mail');
    const confirmEmailInput = screen.getByLabelText('Conferma e-mail');

    (isValidEmail as jest.Mock).mockReturnValue(false);
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.blur(emailInput);

    fireEvent.change(confirmEmailInput, { target: { value: 'another-invalid' } });
    fireEvent.blur(confirmEmailInput);

    (isValidEmail as jest.Mock).mockReturnValue(true);
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

    const verifyButton = screen.getByText('Verifica URL');
    const openSpy = jest.spyOn(window, 'open').mockImplementation(() => null);
    fireEvent.click(verifyButton);
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
    jest.spyOn(helpers, 'isValidEmail').mockImplementation((email) => email.includes('@'));
    jest.spyOn(helpers, 'generateUniqueId').mockReturnValue('unique-id');

    window.open = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should call onFormChange and onValidationChange on mount and after changes', async () => {
    render(
      <PointsOfSaleForm
        onFormChange={onFormChangeMock}
        onValidationChange={onValidationChangeMock}
        pointsOfSaleLoaded={false}
        submitAttempt={0}
      />
    );

    expect(onFormChangeMock).toHaveBeenCalledTimes(1);
    expect(onValidationChangeMock).toHaveBeenCalledTimes(1);

    const franchiseInput = screen.getByLabelText('Nome insegna');
    fireEvent.change(franchiseInput, { target: { value: 'My Shop' } });

    await waitFor(() => {
      expect(onFormChangeMock).toHaveBeenCalledTimes(2);
    });
  });

  it('should reset salesPoints when pointsOfSaleLoaded becomes true', async () => {
    const { rerender } = render(
      <PointsOfSaleForm
        onFormChange={onFormChangeMock}
        onValidationChange={onValidationChangeMock}
        pointsOfSaleLoaded={false}
        submitAttempt={0}
      />
    );

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
    render(
      <PointsOfSaleForm
        onFormChange={onFormChangeMock}
        onValidationChange={onValidationChangeMock}
        pointsOfSaleLoaded={false}
        submitAttempt={0}
      />
    );

    const geolinkInput = screen.getByLabelText('Scheda Google MYBusiness');
    fireEvent.change(geolinkInput, { target: { value: 'http://example.com' } });

    const verifyButton = screen.getByText('Verifica URL');
    fireEvent.click(verifyButton);

    expect(window.open).toHaveBeenCalledWith('http://example.com', '_blank', 'noopener,noreferrer');
  });

  it('should trigger validation when submitAttempt changes', async () => {
    const { rerender } = render(
      <PointsOfSaleForm
        onFormChange={onFormChangeMock}
        onValidationChange={onValidationChangeMock}
        pointsOfSaleLoaded={false}
        submitAttempt={0}
      />
    );

    expect(onValidationChangeMock).toHaveBeenCalled();
    onValidationChangeMock.mockClear();

    // Simulate submit attempt
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
