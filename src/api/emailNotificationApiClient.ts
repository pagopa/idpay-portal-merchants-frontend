import { ENV } from '../utils/env';
import {
  UserInstitutionInfoDTO,
  EmailMessageDTO,
} from './generated/email-notification/data-contracts';
import { Users } from './generated/email-notification/Users';
import { Notify } from './generated/email-notification/Notify';
import { axiosFetchAdapter } from './axiosFetchAdapter';

class EmailNotificationApiClient {
  private usersClient: Users;
  private notifyClient: Notify;

  constructor() {
    const baseConfig = {
      baseUrl: ENV.URL_API.EMAIL_NOTIFICATION,
      customFetch: axiosFetchAdapter,
    };

    this.usersClient = new Users(baseConfig);
    this.notifyClient = new Notify(baseConfig);
  }

  public async getInstitutionProductUserInfo(): Promise<UserInstitutionInfoDTO> {
    const response = await this.usersClient.getInstitutionProductUserInfo();
    return response.data;
  }

  public async sendEmail(data: EmailMessageDTO): Promise<void> {
    const response = await this.notifyClient.sendEmail(data);
    return response.data;
  }
}

const client = new EmailNotificationApiClient();

export const EmailNotificationApi = {
  getInstitutionProductUserInfo: () =>
    client.getInstitutionProductUserInfo(),

  sendEmail: (data: EmailMessageDTO) => client.sendEmail(data),
};
