/// <reference types="jest" />
import { EmailNotificationApi } from "../emailNotificationApiClient";
import { BaseApiClient } from "../BaseApiClient";

describe("EmailNotificationApiClient", () => {
  const mockInstitutionInfo = {
    email: "test@example.com",
  };

  const mockEmailMessage = {
    subject: "Test",
    content: "Hello",
    recipients: ["test@example.com"],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should call safeRequest with GET /users and return data", async () => {
    const safeRequestSpy = jest
      .spyOn(BaseApiClient.prototype, "safeRequest")
      .mockResolvedValue({
        data: mockInstitutionInfo,
      } as any);

    const result =
      await EmailNotificationApi.getInstitutionProductUserInfo();

    expect(safeRequestSpy).toHaveBeenCalledWith({
      path: "/users",
      method: "GET",
      secure: true,
      format: "json",
    });

    expect(result).toEqual(mockInstitutionInfo);
  });

  it("should call safeRequest with POST /notify", async () => {
    const safeRequestSpy = jest
      .spyOn(BaseApiClient.prototype, "safeRequest")
      .mockResolvedValue({} as any);

    await EmailNotificationApi.sendEmail(
      mockEmailMessage as any
    );

    expect(safeRequestSpy).toHaveBeenCalledWith({
      path: "/notify",
      method: "POST",
      body: mockEmailMessage,
      secure: true,
      format: "json",
    });
  });

  it("should propagate errors from safeRequest", async () => {
    const error = new Error("Network error");

    jest
      .spyOn(BaseApiClient.prototype, "safeRequest")
      .mockRejectedValue(error);

    await expect(
      EmailNotificationApi.getInstitutionProductUserInfo()
    ).rejects.toThrow("Network error");
  });
});
