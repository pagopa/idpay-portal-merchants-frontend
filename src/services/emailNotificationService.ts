import { EmailNotificationApi } from '../api/emailNotificationApiClient';
import { EmailMessageDTO } from '../api/generated/email-notification/EmailMessageDTO';
import { UserInstitutionInfoDTO } from '../api/generated/email-notification/UserInstitutionInfoDTO';
// import { EmailNotificationApiMocked } from '../api/__mocks__/emailNotificationApiClient';
// import { mockedBody } from './__mocks__/emailNotificationService';

export const getInstitutionProductUserInfo = (): Promise<UserInstitutionInfoDTO> => EmailNotificationApi.getInstitutionProductUserInfo().then((res) => res);


export const sendEmail = (data: EmailMessageDTO): Promise<void> => EmailNotificationApi.sendEmail(data).then((res) => res);

