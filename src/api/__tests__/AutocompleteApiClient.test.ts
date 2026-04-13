/// <reference types="jest" />
import { AutocompleteApi } from "../AutocompleteApiClient";
import { storageTokenOps } from "@pagopa/selfcare-common-frontend/lib/utils/storage";

jest.mock("@pagopa/selfcare-common-frontend/lib/utils/storage", () => ({
  storageTokenOps: {
    read: jest.fn(),
  },
}));

describe("AutocompleteApiClient", () => {
  const mockResponse = {
    ResultItems: [],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return response.data when API call succeeds", async () => {
    (storageTokenOps.read as jest.Mock).mockReturnValue("mocked-token");

    const safeRequestSpy = jest
      .spyOn(
        require("../BaseApiClient").BaseApiClient.prototype,
        "safeRequest"
      )
      .mockResolvedValue({
        data: mockResponse,
      });

    const result = await AutocompleteApi.getAddresses({
      QueryText: "via roma",
    } as any);

    expect(safeRequestSpy).toHaveBeenCalled();
    expect(result).toEqual(mockResponse);
  });

  it("should throw when API call rejects", async () => {
    (storageTokenOps.read as jest.Mock).mockReturnValue("mocked-token");

    const error = { status: 400 };

    jest
      .spyOn(
        require("../BaseApiClient").BaseApiClient.prototype,
        "safeRequest"
      )
      .mockRejectedValue(error);

    await expect(
      AutocompleteApi.getAddresses({
        QueryText: "invalid",
      } as any)
    ).rejects.toEqual(error);
  });

  it("should work even if token is missing", async () => {
    (storageTokenOps.read as jest.Mock).mockReturnValue("");

    const safeRequestSpy = jest
      .spyOn(
        require("../BaseApiClient").BaseApiClient.prototype,
        "safeRequest"
      )
      .mockResolvedValue({
        data: mockResponse,
      });

    await AutocompleteApi.getAddresses({
      QueryText: "via milano",
    } as any);

    expect(safeRequestSpy).toHaveBeenCalled();
  });
});
