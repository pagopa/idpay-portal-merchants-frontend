import { buildRoute } from "../routeBuilder";

describe("buildRoute", () => {
  const originalWarn = console.warn;

  beforeEach(() => {
    console.warn = jest.fn();
  });

  afterEach(() => {
    console.warn = originalWarn;
    jest.clearAllMocks();
  });

  it("replaces all params in the template", () => {
    const result = buildRoute("/:id/:pointOfSaleId/modifica/:trxId", {
      id: "123",
      pointOfSaleId: "456",
      trxId: "789",
    });

    expect(result).toBe("/123/456/modifica/789");
    expect(console.warn).not.toHaveBeenCalled();
  });

  it("encodes parameter values", () => {
    const result = buildRoute("/user/:name", {
      name: "Mario Rossi",
    });

    expect(result).toBe("/user/Mario%20Rossi");
  });

  it("warns and skips undefined or null params", () => {
    const result = buildRoute("/user/:id/:section", {
      id: undefined,
      section: null as unknown as string,
    });

    expect(console.warn).toHaveBeenCalledTimes(3);
    expect((console.warn as jest.Mock).mock.calls[0][0]).toContain(
      'Param "id" is undefined'
    );
    expect((console.warn as jest.Mock).mock.calls[1][0]).toContain(
      'Param "section" is null'
    );
    expect((console.warn as jest.Mock).mock.calls[2][0]).toContain(
      "Unresolved params"
    );

    // unresolved params remain in path
    expect(result).toBe("/user/:id/:section");
  });

  it("warns if some params remain unresolved", () => {
    const result = buildRoute("/user/:id/:section", {
      id: "123",
      section: undefined,
    });

    expect(result).toBe("/user/123/:section");
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining('Param "section" is undefined')
    );
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining("Unresolved params :section")
    );
  });
});
