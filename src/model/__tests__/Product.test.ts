/**
 * Product model test to ensure module is included in coverage.
 * This file only contains TypeScript types.
 */

import * as ProductModule from "../Product";

describe("Product model", () => {
  it("should be defined", () => {
    expect(ProductModule).toBeDefined();
  });

  it("should allow creation of a Product object (type-level check)", () => {
    const product: ProductModule.Product = {
      id: "1",
      title: "Test Product",
      description: "Test description",
      urlBO: "http://backoffice.test",
      roles: [],
      status: "ACTIVE",
      imageUrl: "http://image.test",
      subProducts: [],
    };

    expect(product.id).toBe("1");
    expect(product.status).toBe("ACTIVE");
  });

  it("should allow creation of a SubProduct object", () => {
    const sub: ProductModule.SubProduct = {
      id: "sub-1",
      title: "Sub Product",
      status: "INACTIVE",
    };

    expect(sub.status).toBe("INACTIVE");
  });
});
