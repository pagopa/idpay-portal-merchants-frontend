import { renderHook, act } from '@testing-library/react-hooks';
import { Provider } from 'react-redux';
import { store } from '../../redux/store';
import { storageTokenOps } from '@pagopa/selfcare-common-frontend/utils/storage';
import { trackEvent } from '@pagopa/selfcare-common-frontend/services/analyticsService';
import { useSelectedParty, retrieveSelectedPartyIdConfig } from '../useSelectedParty';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import * as partyService from '../../services/partyService';
import { Party } from '../../model/Party';
import { partiesActions } from '../../redux/slices/partiesSlice';
import { JWTUser } from '../../model/JwtUser';
import { ENV } from '../../utils/env';

// --- Mocks ---

jest.mock('../../redux/hooks');
const mockedUseAppDispatch = useAppDispatch as jest.Mock;
const mockedUseAppSelector = useAppSelector as jest.Mock;

jest.mock('@pagopa/selfcare-common-frontend/utils/storage');
const mockedStorageTokenOps = storageTokenOps as jest.Mocked<typeof storageTokenOps>;

jest.mock('@pagopa/selfcare-common-frontend/services/analyticsService');
const mockedTrackEvent = trackEvent as jest.Mock;

jest.mock('../../services/partyService');

jest.mock('../../utils/jwt-utils', () => ({
  parseJwt: (token: string): Partial<JWTUser> | null => {
    if (token === 'valid_token') {
      return {
        org_id: 'party-1',
        org_name: 'Test Party',
        org_vat: '12345678901',
        org_party_role: 'MANAGER',
        org_role: 'admin',
      };
    }
    if (token === 'invalid_token') {
      return { org_name: 'Incomplete Party' };
    }
    return null;
  },
}));

const mockDispatch = jest.fn();

const mockParty: Party = {
  partyId: 'party-1',
  externalId: 'ext-1',
  originId: 'orig-1',
  origin: 'IPA',
  description: 'Test Party from API',
  digitalAddress: 'test@test.com',
  status: 'ACTIVE',
  roles: [],
  fiscalCode: '12345678901',
  registeredOffice: 'Via Roma 1',
  typology: 'AGENCY',
};

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <Provider store={store}>{children}</Provider>
);

// --- Test Suite ---

describe('useSelectedParty', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseAppDispatch.mockReturnValue(mockDispatch);
    mockedStorageTokenOps.read.mockReturnValue('valid_token');
    // Mock window.location.assign
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { assign: jest.fn() },
    });
  });

  describe('retrieveSelectedPartyIdConfig', () => {
    it('should return party config if token is valid', () => {
      mockedStorageTokenOps.read.mockReturnValue('valid_token');
      const config = retrieveSelectedPartyIdConfig();
      expect(config).toEqual({
        partyId: 'party-1',
        partyName: 'Test Party',
        partyVat: '12345678901',
        roles: [{ partyRole: 'MANAGER', roleKey: 'admin' }],
      });
    });

    it('should return null if token is invalid or incomplete', () => {
      mockedStorageTokenOps.read.mockReturnValue('invalid_token');
      const config = retrieveSelectedPartyIdConfig();
      expect(config).toBeNull();
    });

    it('should return null if no token is present', () => {
      mockedStorageTokenOps.read.mockReturnValue(null);
      const config = retrieveSelectedPartyIdConfig();
      expect(config).toBeNull();
    });
  });

  describe('useSelectedParty hook', () => {
    it('should redirect to logout if no party is in token', async () => {
      mockedStorageTokenOps.read.mockReturnValue(null);
      const { result } = renderHook(() => useSelectedParty(), { wrapper });
      await expect(result.current()).rejects.toBeUndefined();
      expect(mockedTrackEvent).toHaveBeenCalledWith('PARTY_ID_NOT_IN_TOKEN');
      expect(window.location.assign).toHaveBeenCalledWith(ENV.URL_FE.LOGOUT);
    });

    it('should return selected party from Redux if it matches JWT', async () => {
      mockedUseAppSelector.mockImplementation((selector) =>
        selector.name === 'selectPartySelected' ? mockParty : []
      );
      const { result } = renderHook(() => useSelectedParty(), { wrapper });
      const party = await result.current();
      expect(party).toEqual(mockParty);
    });

    it('should fetch party details if not in Redux and save to store on success', async () => {
      mockedUseAppSelector.mockReturnValue(undefined); // No party in redux
      jest.spyOn(partyService, 'fetchPartyDetails').mockResolvedValue(mockParty);

      const { result } = renderHook(() => useSelectedParty(), { wrapper });
      await act(async () => {
        await result.current();
      });

      expect(partyService.fetchPartyDetails).toHaveBeenCalledWith('party-1', undefined);
      expect(mockDispatch).toHaveBeenCalledWith(
        partiesActions.setPartySelected(
          expect.objectContaining({
            partyId: 'party-1',
            roles: [{ partyRole: 'MANAGER', roleKey: 'admin' }],
          })
        )
      );
    });

    it('should create a fallback party if API returns no data', async () => {
      mockedUseAppSelector.mockReturnValue(undefined);
      jest.spyOn(partyService, 'fetchPartyDetails').mockResolvedValue(null); // API finds nothing

      const { result } = renderHook(() => useSelectedParty(), { wrapper });
      await act(async () => {
        await result.current();
      });

      expect(mockedTrackEvent).toHaveBeenCalledWith('PARTY_ID_NOT_FOUND', { partyId: 'party-1' });
      expect(mockDispatch).toHaveBeenCalledWith(
        partiesActions.setPartySelected(
          expect.objectContaining({
            partyId: 'party-1',
            description: 'Test Party',
            fiscalCode: '12345678901',
            status: 'ACTIVE',
          })
        )
      );
    });

    it('should throw an error if fetched party is not ACTIVE', async () => {
      mockedUseAppSelector.mockReturnValue(undefined);
      jest.spyOn(partyService, 'fetchPartyDetails').mockResolvedValue({
        ...mockParty,
        status: 'INACTIVE',
      });

      const { result } = renderHook(() => useSelectedParty(), { wrapper });
      await expect(result.current()).rejects.toThrow('INVALID_PARTY_STATE_INACTIVE');
      expect(mockDispatch).toHaveBeenCalledWith(partiesActions.setPartySelected(undefined));
    });

    it('should handle API fetch rejection', async () => {
      mockedUseAppSelector.mockReturnValue(undefined);
      const error = new Error('API Failure');
      jest.spyOn(partyService, 'fetchPartyDetails').mockRejectedValue(error);

      const { result } = renderHook(() => useSelectedParty(), { wrapper });
      await expect(result.current()).rejects.toThrow('API Failure');
      expect(mockDispatch).toHaveBeenCalledWith(partiesActions.setPartySelected(undefined));
    });

    it('should fetch party if partyId in Redux is different from JWT', async () => {
      const oldParty = { ...mockParty, partyId: 'old-party-id' };
      mockedUseAppSelector.mockImplementation((selector) =>
        selector.name === 'selectPartySelected' ? oldParty : []
      );
      jest.spyOn(partyService, 'fetchPartyDetails').mockResolvedValue(mockParty);

      const { result } = renderHook(() => useSelectedParty(), { wrapper });
      await act(async () => {
        await result.current();
      });

      expect(partyService.fetchPartyDetails).toHaveBeenCalledWith('party-1', []);
      expect(mockDispatch).toHaveBeenCalledWith(
        partiesActions.setPartySelected(expect.objectContaining({ partyId: 'party-1' }))
      );
    });

    it('should create a fallback party if API returns no data and JWT is valid', async () => {
      mockedUseAppSelector.mockReturnValue(undefined);
      jest.spyOn(partyService, 'fetchPartyDetails').mockResolvedValue(null);

      const { result } = renderHook(() => useSelectedParty(), { wrapper });
      const party = await result.current();

      expect(mockedTrackEvent).toHaveBeenCalledWith('PARTY_ID_NOT_FOUND', { partyId: 'party-1' });
      expect(party).toEqual(
        expect.objectContaining({
          partyId: 'party-1',
          description: 'Test Party',
          fiscalCode: '12345678901',
          status: 'ACTIVE',
          roles: [{ partyRole: 'MANAGER', roleKey: 'admin' }],
        })
      );
      expect(mockDispatch).toHaveBeenCalledWith(partiesActions.setPartySelected(party));
    });
  });
});
