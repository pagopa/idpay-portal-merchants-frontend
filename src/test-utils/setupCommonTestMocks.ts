import useErrorDispatcher from '@pagopa/selfcare-common-frontend/lib/hooks/useErrorDispatcher';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '../redux/hooks';

export const mockCommonHooks = () => {
  const mockAddError = jest.fn();

  (useAppSelector as jest.Mock).mockReturnValue([
    { initiativeId: 'initiative-1' },
  ]);

  (useErrorDispatcher as jest.Mock).mockReturnValue(mockAddError);

  (useTranslation as jest.Mock).mockReturnValue({
    t: (key: string) => key,
  });

  return {
    mockAddError,
  };
};
