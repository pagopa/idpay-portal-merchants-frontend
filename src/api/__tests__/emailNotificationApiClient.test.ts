import { extractResponse } from '@pagopa/selfcare-common-frontend/utils/api-utils';
import { createClient } from '../generated/email-notification/client';

jest.mock('@pagopa/selfcare-common-frontend/utils/storage', () => ({
  storageTokenOps: { read: jest.fn().mockReturnValue('mocked-token') },
}));

jest.mock('@pagopa/selfcare-common-frontend/redux/slices/appStateSlice', () => ({
  appStateActions: { addError: jest.fn((e) => e) },
}));

jest.mock('@pagopa/selfcare-common-frontend/utils/api-utils', () => ({
  buildFetchApi: jest.fn(),
  extractResponse: jest.fn(),
}));

jest.mock('../generated/email-notification/client', () => ({
  createClient: jest.fn(),
}));

let mockEmailNotificationClient: any;

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
    mockEmailNotificationClient.getInstitutionProductUserInfo.mockResolvedValue({ right: 'data' });

    let EmailNotificationApi: any;
    jest.isolateModules(() => {
      EmailNotificationApi = require('../EmailNotificationApiClient').EmailNotificationApi;
    });

    const result = await EmailNotificationApi.getInstitutionProductUserInfo();

    expect(mockEmailNotificationClient.getInstitutionProductUserInfo).toHaveBeenCalledWith({});
    expect(extractResponse).toHaveBeenCalledWith({ right: 'data' }, 200, expect.any(Function));
    expect(result).toBe('extracted');
  });

  it('sendEmail calls client with body and extractResponse', async () => {
    mockEmailNotificationClient.sendEmail.mockResolvedValue({ right: 'sent' });

    let EmailNotificationApi: any;
    jest.isolateModules(() => {
      EmailNotificationApi = require('../EmailNotificationApiClient').EmailNotificationApi;
    });

    const emailData = {
      subject: 'Test',
      content: 'Hello world',
      recipients: ['test@example.com'],
    };

    const result = await EmailNotificationApi.sendEmail(emailData);

    expect(mockEmailNotificationClient.sendEmail).toHaveBeenCalledWith({
      body: { ...emailData },
    });
    expect(extractResponse).toHaveBeenCalledWith({ right: 'sent' }, 204, expect.any(Function));
    expect(result).toBe('extracted');
  });
});
