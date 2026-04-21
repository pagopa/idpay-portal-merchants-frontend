import { ENV } from '../utils/env';
import { BaseApiClient } from './BaseApiClient';
import {
  UserInstitutionInfoDTO,
  EmailMessageDTO,
} from './generated/email-notification/data-contracts';

/**
 * EmailNotificationApiClient
 *
 * ✅ Modern implementation
 * ✅ Uses BaseApiClient
 * ✅ No Redux coupling
 * ✅ No token handling here
 * ✅ No legacy client usage
 */
class EmailNotificationApiClient {
  private baseClient: BaseApiClient;

  constructor() {
    this.baseClient = new BaseApiClient({
      baseUrl: ENV.URL_API.EMAIL_NOTIFICATION,
    });
  }

  public async getInstitutionProductUserInfo(): Promise<UserInstitutionInfoDTO> {
    const response = await this.baseClient.safeRequest<UserInstitutionInfoDTO>({
      path: '/users',
      method: 'GET',
      secure: true,
      format: 'json',
    });

    return response.data;
  }

  public async sendEmail(data: EmailMessageDTO): Promise<void> {
    await this.baseClient.safeRequest<void>({
      path: '/notify',
      method: 'POST',
      body: data,
      secure: true,
      format: 'json',
    });
  }
}

const client = new EmailNotificationApiClient();

export const EmailNotificationApi = {
  getInstitutionProductUserInfo: () => client.getInstitutionProductUserInfo(),

  sendEmail: (data: EmailMessageDTO) => client.sendEmail(data),
};
