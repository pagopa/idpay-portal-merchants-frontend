/// <reference types="jest" />
import { MerchantsApi } from "../MerchantsApiClient";
import { BaseApiClient } from "../BaseApiClient";

jest.mock("../BaseApiClient");

describe("MerchantsApi (modern implementation)", () => {
  let mockSafeRequest: jest.Mock;

  beforeEach(() => {
    mockSafeRequest = jest.fn().mockResolvedValue({ data: "mocked" });

    (BaseApiClient as jest.Mock).mockImplementation(() => ({
      safeRequest: mockSafeRequest,
    }));
  });

  it("getMerchantInitiativeList calls safeRequest correctly", async () => {
    await MerchantsApi.getMerchantInitiativeList();

    expect(mockSafeRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        path: expect.any(String),
        method: "GET",
        secure: true,
      })
    );
  });

  it("getMerchantTransactions calls safeRequest correctly", async () => {
    await MerchantsApi.getMerchantTransactions("init1", 1);

    expect(mockSafeRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "GET",
        secure: true,
      })
    );
  });

  it("createTransaction calls safeRequest with POST", async () => {
    await MerchantsApi.createTransaction({
      amountCents: 100,
      idTrxAcquirer: "trx1",
      initiativeId: "init1",
      mcc: "mcc1",
    });

    expect(mockSafeRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "POST",
        secure: true,
        body: expect.any(Object),
      })
    );
  });

  it("deleteTransaction calls safeRequest with DELETE", async () => {
    await MerchantsApi.deleteTransaction("trx1");

    expect(mockSafeRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "DELETE",
        secure: true,
      })
    );
  });

  it("getRewardBatches propagates error", async () => {
    mockSafeRequest.mockRejectedValueOnce(new Error("boom"));

    await expect(
      MerchantsApi.getRewardBatches("init1", 0, 10)
    ).rejects.toThrow("boom");
  });
});
