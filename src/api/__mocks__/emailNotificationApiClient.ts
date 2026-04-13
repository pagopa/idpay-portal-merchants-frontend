import { mockedInstitutionInfo } from '../../services/__mocks__/emailNotificationService';
import {
  EmailMessageDTO,
  UserInstitutionInfoDTO,
} from '../generated/email-notification/data-contracts';

export const EmailNotificationApiMocked = {
  getInstitutionProductUserInfo: async (): Promise<UserInstitutionInfoDTO> =>
    new Promise<UserInstitutionInfoDTO>((resolve) => resolve(mockedInstitutionInfo)),

  sendEmail: async (_data: EmailMessageDTO): Promise<void> =>
    new Promise<void>((resolve) => resolve()),
};
