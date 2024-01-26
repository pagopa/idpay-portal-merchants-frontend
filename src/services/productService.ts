import { Product /* ,productResource2Product */ } from '../model/Product';
// import { mockedPartyProducts } from './__mocks__/productService';

export const fetchProducts = (_partyId: string): Promise<Array<Product>> => new Promise((resolve) => resolve([]));
    // TODO Implementation of call to selfcare to populate products list
    // return PortalApi.getProducts(partyId).then((productResources) =>
    //   productResources ? productResources.map(productResource2Product) : []
    // );
  // }

