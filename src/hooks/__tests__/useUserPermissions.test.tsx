import { renderHook } from '@testing-library/react-hooks';
import { IDPayUser } from '../../model/IDPayUser';
import { PERMISSION_KEYS, useUserPermissions } from '../useUserPermissions';
import { useCurrentInitiative } from '../useCurrentInitiative';
import { useIDPayUser } from '../useIDPayUser';

jest.mock('../useIDPayUser', () => ({
  useIDPayUser: jest.fn(),
}));

jest.mock('../useCurrentInitiative', () => ({
  useCurrentInitiative: jest.fn(),
}));

const mockedUseIDPayUser = useIDPayUser as jest.MockedFunction<typeof useIDPayUser>;
const mockedUseCurrentInitiative =
  useCurrentInitiative as jest.MockedFunction<typeof useCurrentInitiative>;

const buildUser = (orgRole: string): IDPayUser =>
  ({
    uid: '1',
    taxCode: 'RSSMRA80A01H501U',
    name: 'Mario',
    surname: 'Rossi',
    email: 'mario.rossi@email.it',
    org_name: 'Acme',
    org_party_role: 'MANAGER',
    org_role: orgRole,
  }) as IDPayUser;

describe('useUserPermissions', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    mockedUseCurrentInitiative.mockReturnValue(undefined);
  });

  test('should disable initiative scoped actions when current initiative has ended', () => {
    mockedUseIDPayUser.mockReturnValue(buildUser('ADMIN'));
    mockedUseCurrentInitiative.mockReturnValue({
      endDate: '2000-01-01T00:00:00.000Z',
    } as never);

    const { result } = renderHook(() => useUserPermissions());

    expect(result.current.isActionDisabled(PERMISSION_KEYS.OVERVIEW_EDIT_EMAIL)).toBe(true);
    expect(result.current.isActionDisabled(PERMISSION_KEYS.POS_CATALOG_ASSOCIATE)).toBe(true);
    expect(result.current.isActionDisabled(PERMISSION_KEYS.INITIATIVE_ADHERE)).toBe(false);
    expect(result.current.isActionDisabled(PERMISSION_KEYS.REPORT_GENERATE)).toBe(true);
  });

  test('should keep initiative scoped actions enabled when current initiative has not ended', () => {
    mockedUseIDPayUser.mockReturnValue(buildUser('ADMIN'));
    mockedUseCurrentInitiative.mockReturnValue({
      endDate: '2999-01-01T00:00:00.000Z',
    } as never);

    const { result } = renderHook(() => useUserPermissions());

    expect(result.current.isActionDisabled(PERMISSION_KEYS.OVERVIEW_EDIT_EMAIL)).toBe(false);
    expect(result.current.isActionDisabled(PERMISSION_KEYS.POS_CATALOG_ASSOCIATE)).toBe(false);
  });
});