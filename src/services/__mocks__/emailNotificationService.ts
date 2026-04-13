import {
  EmailMessageDTO,
  UserInstitutionInfoDTO,
} from '../../api/generated/email-notification/data-contracts';
import { EmailNotificationApiMocked } from '../../api/__mocks__/emailNotificationApiClient';

export const mockedBody: EmailMessageDTO = {
  subject: '',
  content: '',
  senderEmail: '',
  recipientEmail: '',
};

export const mockedInstitutionInfo: UserInstitutionInfoDTO = {
  email: 'test@test.it',
};

export const getInstitutionProductUserInfo = () =>
  EmailNotificationApiMocked.getInstitutionProductUserInfo();

export const sendEmail = (_data: EmailMessageDTO) =>
  EmailNotificationApiMocked.sendEmail(mockedBody);
