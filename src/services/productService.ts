import { Product /* ,productResource2Product */ } from '../model/Product';
import { mockedPartyProducts } from './__mocks__/productService';

export const fetchProducts = (_partyId: string): Promise<Array<Product>> => {
  /* istanbul ignore if */
  if (process.env.REACT_APP_API_MOCK_PRODUCTS === 'true') {
    return new Promise((resolve) => resolve(mockedPartyProducts));
  } else {
    // TODO Implementation of call to selfcare to populate products list
    return new Promise((resolve) => resolve([]));
    // return PortalApi.getProducts(partyId).then((productResources) =>
    //   productResources ? productResources.map(productResource2Product) : []
    // );
  }
};
