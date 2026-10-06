import { useAppSelector } from '../redux/hooks';

/**
 * Centralized initiative + redux mock setup
 * Eliminates duplicated jest.mock blocks across tests
 */

jest.mock('../hooks/useCurrentInitiativeId', () => ({
  useCurrentInitiativeId: () => 'initiative-1',
}));

jest.mock('../redux/slices/initiativesSlice', () => ({
  setInitiativesList: jest.fn(),
  intiativesListSelector: jest.fn(),
  initiativesReducer: jest.fn(),
}));

jest.mock('../redux/hooks', () => ({
  useAppSelector: jest.fn(),
}));

export const setupInitiativeMocks = () => {
  (useAppSelector as jest.Mock).mockReturnValue([{ initiativeId: 'initiative-1' }]);
};
