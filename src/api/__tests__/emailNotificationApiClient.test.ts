/// <reference types="jest" />

import { axiosInstance } from '../axiosInstance';
import { EmailNotificationApi } from '../emailNotificationApiClient';

jest.mock('../axiosInstance', () => ({
  axiosInstance: {
    request: jest.fn(),
  },
}));

describe('EmailNotificationApiClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('getInstitutionProductUserInfo returns data', async () => {
    const mockInstitutionInfo = {
      email: 'test@example.com',
    };

    (axiosInstance.request as jest.Mock).mockResolvedValue({
      data: mockInstitutionInfo,
      status: 200,
      statusText: 'OK',
      headers: {},
    });

    const result = await EmailNotificationApi.getInstitutionProductUserInfo();

    expect(result).toEqual(mockInstitutionInfo);
    expect(axiosInstance.request).toHaveBeenCalled();
  });

  it('sendEmail resolves without error', async () => {
    const mockEmailMessage = {
      subject: 'Test',
      content: 'Hello',
      recipients: ['test@example.com'],
    };

    (axiosInstance.request as jest.Mock).mockResolvedValue({
      data: undefined,
      status: 200,
      statusText: 'OK',
      headers: {},
    });

    await EmailNotificationApi.sendEmail(mockEmailMessage as any);

    expect(axiosInstance.request).toHaveBeenCalled();
  });

  it('propagates axios error', async () => {
    const error = new Error('Network error');

    (axiosInstance.request as jest.Mock).mockRejectedValue(error);

    await expect(
      EmailNotificationApi.getInstitutionProductUserInfo()
    ).rejects.toThrow('Network error');
  });
});
