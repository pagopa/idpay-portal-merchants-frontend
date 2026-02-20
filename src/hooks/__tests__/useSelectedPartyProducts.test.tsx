import { renderHook } from '@testing-library/react-hooks';
import useReduxCachedValue from '@pagopa/selfcare-common-frontend/lib/hooks/useReduxCachedValue';
import { useSelectedPartyProducts } from '../useSelectedPartyProducts';
import { useAppSelector } from '../../redux/hooks';
import { partiesActions, partiesSelectors } from '../../redux/slices/partiesSlice';
import * as productService from '../../services/productService';
import { Party } from '../../model/Party';

vi.mock('@pagopa/selfcare-common-frontend/lib/hooks/useReduxCachedValue');
const mockedUseReduxCachedValue = useReduxCachedValue as vi.Mock;

vi.mock('../../redux/hooks');

describe('useSelectedPartyProducts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call useReduxCachedValue with correct parameters when a party is selected', () => {
    const mockParty: Party = {
      partyId: 'test-party-id',
      externalId: 'externalId',
      originId: 'originId',
      origin: 'IPA',
      description: 'Test Party',
      digitalAddress: 'test@test.com',
      status: 'ACTIVE',
      roles: [],
    };

    (useAppSelector as vi.Mock).mockImplementation((selector) => {
      if (selector === partiesSelectors.selectPartySelected) {
        return mockParty;
      }
      return undefined;
    });

    const mockReturnValue = vi.fn();
    mockedUseReduxCachedValue.mockReturnValue(mockReturnValue);

    const { result } = renderHook(() => useSelectedPartyProducts());

    expect(mockedUseReduxCachedValue).toHaveBeenCalledTimes(1);
    const [cacheKey, fetcher, selector, action] = mockedUseReduxCachedValue.mock.calls[0];

    expect(cacheKey).toBe('PARTIES');
    expect(selector).toBe(partiesSelectors.selectPartySelectedProducts);
    expect(action).toBe(partiesActions.setPartySelectedProducts);

    fetcher();

    expect(result.current).toBe(mockReturnValue);
  });

  it('should throw an error if no party is selected', () => {
    (useAppSelector as vi.Mock).mockReturnValue(null);

    const { result } = renderHook(() => useSelectedPartyProducts(), {
      wrapper: ({ children }) => <>{children}</>,
    });

    expect(result.error).toEqual(new Error('No party selected!'));
  });
});
