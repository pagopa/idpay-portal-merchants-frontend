import { EmailNotificationApi } from "../api/EmailNotificationApiClient";
import {
  EmailMessageDTO,
  UserInstitutionInfoDTO,
} from "../api/generated/email-notification/data-contracts";

export const getInstitutionProductUserInfo =
  (): Promise<UserInstitutionInfoDTO> =>
    EmailNotificationApi.getInstitutionProductUserInfo();

export const sendEmail = (data: EmailMessageDTO): Promise<void> =>
  EmailNotificationApi.sendEmail(data);
