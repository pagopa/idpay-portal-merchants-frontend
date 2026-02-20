import { describe, it, expect, vi, beforeEach } from 'vitest';
import { extractResponse } from '@pagopa/selfcare-common-frontend/lib/utils/api-utils';
import { createClient } from '../generated/email-notification/client';

vi.mock('@pagopa/selfcare-common-frontend/lib/utils/storage', () => ({
  storageTokenOps: { read: vi.fn().mockReturnValue('mocked-token') },
}));

vi.mock('@pagopa/selfcare-common-frontend/lib/redux/slices/appStateSlice', () => ({
  appStateActions: { addError: vi.fn((e) => e) },
}));

vi.mock('@pagopa/selfcare-common-frontend/lib/utils/api-utils', () => ({
  buildFetchApi: vi.fn(),
  extractResponse: vi.fn(),
}));

vi.mock('../generated/email-notification/client', () => ({
  createClient: vi.fn(),
}));

let mockEmailNotificationClient: any;

describe('EmailNotificationApi (Vitest ESM)', () => {
  beforeEach(() => {
    vi.resetModules();

    mockEmailNotificationClient = {
      getInstitutionProductUserInfo: vi.fn(),
      sendEmail: vi.fn(),
    };

    (createClient as any).mockReturnValue(mockEmailNotificationClient);
    (extractResponse as any).mockReset().mockReturnValue('extracted');
  });

  const loadApi = async () => {
    const mod = await import('../emailNotificationApiClient');
    return mod.EmailNotificationApi;
  };

  it('getInstitutionProductUserInfo calls client and extractResponse', async () => {
    mockEmailNotificationClient.getInstitutionProductUserInfo.mockResolvedValue({
      right: 'data',
    });

    const EmailNotificationApi = await loadApi();
    const result =
      await EmailNotificationApi.getInstitutionProductUserInfo();

    expect(
      mockEmailNotificationClient.getInstitutionProductUserInfo
    ).toHaveBeenCalledWith({});
    expect(extractResponse).toHaveBeenCalledWith(
      { right: 'data' },
      200,
      expect.any(Function)
    );
    expect(result).toBe('extracted');
  });

  it('sendEmail calls client with body and extractResponse', async () => {
    mockEmailNotificationClient.sendEmail.mockResolvedValue({
      right: 'sent',
    });

    const EmailNotificationApi = await loadApi();

    const emailData = {
      subject: 'Test',
      content: 'Hello world',
      recipients: ['test@example.com'],
    };

    const result = await EmailNotificationApi.sendEmail(emailData);

    expect(mockEmailNotificationClient.sendEmail).toHaveBeenCalledWith({
      body: { ...emailData },
    });
    expect(extractResponse).toHaveBeenCalledWith(
      { right: 'sent' },
      204,
      expect.any(Function)
    );
    expect(result).toBe('extracted');
  });
});
