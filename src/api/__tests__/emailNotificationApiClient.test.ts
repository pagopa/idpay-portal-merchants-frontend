var mockUsersInstance: any;
var mockNotifyInstance: any;

jest.mock('../generated/email-notification/Users', () => ({
  Users: jest.fn().mockImplementation(function (this: any) {
    this.getInstitutionProductUserInfo = jest.fn();
    mockUsersInstance = this;
  }),
}));

jest.mock('../generated/email-notification/Notify', () => ({
  Notify: jest.fn().mockImplementation(function (this: any) {
    this.sendEmail = jest.fn();
    mockNotifyInstance = this;
  }),
}));

import { EmailNotificationApi } from '../emailNotificationApiClient';

describe('EmailNotificationApiClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('getInstitutionProductUserInfo returns data', async () => {
    const mockInstitutionInfo = {
      email: 'test@example.com',
    };

    mockUsersInstance.getInstitutionProductUserInfo.mockResolvedValue({
      data: mockInstitutionInfo,
    });

    const result = await EmailNotificationApi.getInstitutionProductUserInfo();

    expect(result).toEqual(mockInstitutionInfo);
    expect(mockUsersInstance.getInstitutionProductUserInfo).toHaveBeenCalled();
  });

  it('sendEmail resolves without error', async () => {
    const mockEmailMessage = {
      subject: 'Test',
      content: 'Hello',
      recipients: ['test@example.com'],
    };

    mockNotifyInstance.sendEmail.mockResolvedValue({ data: undefined });

    await EmailNotificationApi.sendEmail(mockEmailMessage as any);

    expect(mockNotifyInstance.sendEmail).toHaveBeenCalled();
  });

  it('propagates axios error', async () => {
    const error = new Error('Network error');

    mockUsersInstance.getInstitutionProductUserInfo.mockRejectedValue(error);

    await expect(EmailNotificationApi.getInstitutionProductUserInfo()).rejects.toThrow(
      'Network error'
    );
  });
});
