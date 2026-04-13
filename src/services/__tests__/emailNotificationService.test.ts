import { EmailNotificationApiNew } from '../../api/EmailNotificationApiClientNew';
import { getInstitutionProductUserInfo, sendEmail } from '../emailNotificationService';
import {
  EmailMessageDTO,
  UserInstitutionInfoDTO,
} from '../../api/generated/email-notification/data-contracts';

jest.mock('../../api/EmailNotificationApiClientNew', () => ({
  EmailNotificationApiNew: {
    getInstitutionProductUserInfo: jest.fn(),
    sendEmail: jest.fn(),
  },
}));

const mockedEmailNotificationApi =
  EmailNotificationApiNew as jest.Mocked<typeof EmailNotificationApiNew>;

describe('emailNotificationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getInstitutionProductUserInfo', () => {
    test('should call the API and return user info on success', async () => {
      const mockResponse = {
        email: 'mario.rossi@example.com',
      } as UserInstitutionInfoDTO;
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
