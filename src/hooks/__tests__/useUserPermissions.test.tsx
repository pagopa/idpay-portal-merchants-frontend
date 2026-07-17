import { renderHook } from '@testing-library/react-hooks';
import { IDPayUser } from '../../model/IDPayUser';
import { PERMISSION_KEYS, useUserPermissions } from '../useUserPermissions';
import { useIDPayUser } from '../useIDPayUser';

jest.mock('../useIDPayUser', () => ({
  useIDPayUser: jest.fn(),
}));

const mockedUseIDPayUser = useIDPayUser as jest.MockedFunction<typeof useIDPayUser>;

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
  });

  test('should return no disabled actions and no logical role when user role is missing', () => {
    mockedUseIDPayUser.mockReturnValue(undefined as unknown as IDPayUser);

    const { result } = renderHook(() => useUserPermissions());

    expect(result.current.role).toBeUndefined();
    expect(result.current.logicalRoleName).toBeUndefined();
    expect(result.current.isSupportUser).toBe(false);
    expect(result.current.isActionDisabled(PERMISSION_KEYS.INITIATIVE_ADHERE)).toBe(false);
  });

  test('should resolve support permissions and logical role name case-insensitively', () => {
    mockedUseIDPayUser.mockReturnValue(buildUser('SUPPORT'));

    const { result } = renderHook(() => useUserPermissions());

    expect(result.current.role).toBe('SUPPORT');
    expect(result.current.logicalRoleName).toBe('Utenza di supporto (sola lettura)');
    expect(result.current.isSupportUser).toBe(true);
    expect(result.current.isActionDisabled(PERMISSION_KEYS.INITIATIVE_ADHERE)).toBe(true);
    expect(result.current.isActionDisabled(PERMISSION_KEYS.REPORT_GENERATE)).toBe(true);
  });

  test('should return enabled actions for roles without disabled permissions', () => {
    mockedUseIDPayUser.mockReturnValue(buildUser('ADMIN'));

    const { result } = renderHook(() => useUserPermissions());

    expect(result.current.logicalRoleName).toBe('Amministratore');
    expect(result.current.isSupportUser).toBe(false);
    expect(result.current.isActionDisabled(PERMISSION_KEYS.OVERVIEW_EDIT_EMAIL)).toBe(false);
  });
});
