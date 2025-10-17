import { EmailNotificationApi } from '../../api/emailNotificationApiClient';
import { getInstitutionProductUserInfo, sendEmail } from '../emailNotificationService';
import { EmailMessageDTO } from '../../api/generated/email-notification/EmailMessageDTO';
import { UserInstitutionInfoDTO } from '../../api/generated/email-notification/UserInstitutionInfoDTO';

jest.mock('../../api/emailNotificationApiClient', () => ({
  EmailNotificationApi: {
    getInstitutionProductUserInfo: jest.fn(),
    sendEmail: jest.fn(),
  },
}));

const mockedEmailNotificationApi = EmailNotificationApi as jest.Mocked<typeof EmailNotificationApi>;

describe('emailNotificationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getInstitutionProductUserInfo', () => {
    test('should call the API and return user info on success', async () => {
      const mockResponse: UserInstitutionInfoDTO = {
        name: 'Mario',
        surname: 'Rossi',
        email: 'mario.rossi@example.com',
      };
      mockedEmailNotificationApi.getInstitutionProductUserInfo.mockResolvedValue(mockResponse);

      const result = await getInstitutionProductUserInfo();

      expect(mockedEmailNotificationApi.getInstitutionProductUserInfo).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockResponse);
    });

    test('should throw an error if the API call fails', async () => {
      const mockError = new Error('API Error');
      mockedEmailNotificationApi.getInstitutionProductUserInfo.mockRejectedValue(mockError);

      await expect(getInstitutionProductUserInfo()).rejects.toThrow(mockError);
    });
  });

  describe('sendEmail', () => {
    test('should call the API with the correct data', async () => {
      const emailData: EmailMessageDTO = {
        subject: 'Test Subject',
        content: '<p>Test Content</p>',
        senderEmail: 'noreply@example.com',
        recipientEmail: 'test@example.com',
      };
      mockedEmailNotificationApi.sendEmail.mockResolvedValue(undefined);

      await sendEmail(emailData);

      expect(mockedEmailNotificationApi.sendEmail).toHaveBeenCalledTimes(1);
      expect(mockedEmailNotificationApi.sendEmail).toHaveBeenCalledWith(emailData);
    });

    test('should throw an error if the API call fails', async () => {
      const emailData: EmailMessageDTO = {
        subject: 'Test Subject',
        content: '<p>Test Content</p>',
        senderEmail: 'noreply@example.com',
        recipientEmail: 'test@example.com',
      };
      const mockError = new Error('API Error');
      mockedEmailNotificationApi.sendEmail.mockRejectedValue(mockError);

      await expect(sendEmail(emailData)).rejects.toThrow(mockError);
    });
  });
});
