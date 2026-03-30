import { extractResponse } from '@pagopa/selfcare-common-frontend/lib/utils/api-utils';
import { createClient } from '../generated/email-notification/client';

jest.mock('@pagopa/selfcare-common-frontend/lib/utils/storage', () => ({
  storageTokenOps: { read: jest.fn().mockReturnValue('mocked-token') },
}));

jest.mock('@pagopa/selfcare-common-frontend/lib/redux/slices/appStateSlice', () => ({
  appStateActions: { addError: jest.fn((e) => e) },
}));

jest.mock('@pagopa/selfcare-common-frontend/lib/utils/api-utils', () => ({
  buildFetchApi: jest.fn(),
  extractResponse: jest.fn(),
}));

jest.mock('@pagopa/selfcare-common-frontend/lib/locale/locale-utils', () => ({
  t: jest.fn((key) => key),
}));

jest.mock('../../redux/store', () => ({
  store: { dispatch: jest.fn() },
}));

jest.mock('../generated/email-notification/client', () => ({
  createClient: jest.fn(),
}));

let mockEmailNotificationClient: any;

const getEmailNotificationApi = () => {
  let EmailNotificationApi: any;
  jest.isolateModules(() => {
    EmailNotificationApi = require('../emailNotificationApiClient').EmailNotificationApi;
  });
  return EmailNotificationApi;
};

const setupMockAndCallApi = async (
  methodName: 'getInstitutionProductUserInfo' | 'sendEmail',
  mockResolvedValue: any,
  callArgs?: any
) => {
  mockEmailNotificationClient[methodName].mockResolvedValue(mockResolvedValue);
  const EmailNotificationApi = getEmailNotificationApi();
  const result = callArgs
    ? await EmailNotificationApi[methodName](callArgs)
    : await EmailNotificationApi[methodName]();
  return { result, EmailNotificationApi };
};

describe('EmailNotificationApi', () => {
  beforeEach(() => {
    mockEmailNotificationClient = {
      getInstitutionProductUserInfo: jest.fn(),
      sendEmail: jest.fn(),
    };

    (createClient as jest.Mock).mockReturnValue(mockEmailNotificationClient);
    (extractResponse as jest.Mock).mockReset().mockReturnValue('extracted');
  });

  it('getInstitutionProductUserInfo calls client and extractResponse', async () => {
    const { result } = await setupMockAndCallApi('getInstitutionProductUserInfo', { right: 'data' });

    expect(mockEmailNotificationClient.getInstitutionProductUserInfo).toHaveBeenCalledWith({});
    expect(extractResponse).toHaveBeenCalledWith({ right: 'data' }, 200, expect.any(Function));
    expect(result).toBe('extracted');
  });

  it('sendEmail calls client with body and extractResponse', async () => {
    const emailData = {
      subject: 'Test',
      content: 'Hello world',
      recipients: ['test@example.com'],
    };

    const { result } = await setupMockAndCallApi('sendEmail', { right: 'sent' }, emailData);

    expect(mockEmailNotificationClient.sendEmail).toHaveBeenCalledWith({
      body: { ...emailData },
    });
    expect(extractResponse).toHaveBeenCalledWith({ right: 'sent' }, 204, expect.any(Function));
    expect(result).toBe('extracted');
  });

  it('calls redirect callback when extractResponse triggers it', async () => {
    const { store } = require('../../redux/store');
    store.dispatch = jest.fn();

    (extractResponse as jest.Mock).mockImplementation(async (_res, _status, callback) => {
      callback();
      return 'extracted';
    });

    await setupMockAndCallApi('getInstitutionProductUserInfo', { right: 'data' });

    expect(store.dispatch).toHaveBeenCalled();
  });
});
